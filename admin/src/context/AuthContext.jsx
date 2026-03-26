// src/context/AuthContext.jsx ✅ FINAL - Works on all devices & browsers
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import axios from '../config/axiosConfig';

const AuthContext = createContext(null);

// ✅ Helper — قراءة وكتابة localStorage بأمان (Safari Private Mode)
const storage = {
  get: (key) => {
    try { return localStorage.getItem(key); }
    catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); }
    catch { /* Safari private mode — نتجاهل */ }
  },
  remove: (key) => {
    try { localStorage.removeItem(key); }
    catch { /* تجاهل */ }
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const verifyInProgress                      = useRef(false); // منع التكرار

  // ─── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(async (shouldRedirect = true) => {
    try {
      await axios.post('/admin/logout');
    } catch {
      // نمسح البيانات حتى لو فشل الـ request
    } finally {
      storage.remove('adminToken');
      storage.remove('adminUser');
      setUser(null);
      setIsAuthenticated(false);
      if (shouldRedirect && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
  }, []);

  // ─── Check Auth ─────────────────────────────────────────────────────────────
  const checkAuthStatus = useCallback(async () => {
    // منع أكثر من verify في نفس الوقت
    if (verifyInProgress.current) return;
    verifyInProgress.current = true;

    setLoading(true);

    const savedToken = storage.get('adminToken');

    // ✅ مفيش token → مش محتاجين نكلم السيرفر
    if (!savedToken) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      verifyInProgress.current = false;
      return;
    }

    try {
      const response = await axios.get('/admin/verify');

      if (response.data.success) {
        // السيرفر بيرجع البيانات في admin أو user
        const raw = response.data.user || response.data.admin || {};
        const userData = {
          name:  raw.name  || 'Admin',
          email: raw.email || '',
          role:  raw.role  || 'admin',
        };
        setUser(userData);
        setIsAuthenticated(true);
        storage.set('adminUser', JSON.stringify(userData));
      } else {
        handleLogout(false);
      }
    } catch (err) {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        // ✅ Token منتهي أو غير صالح → logout بدون redirect لو على صفحة login
        storage.remove('adminToken');
        storage.remove('adminUser');
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // ✅ مشكلة شبكة أو سيرفر مش متاح → نستخدم البيانات المحفوظة
        //    عشان المستخدم ميتلوجاوتش بسبب ضعف النت على الموبايل
        const savedUser = storage.get('adminUser');
        if (savedUser && savedToken) {
          try {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
          } catch {
            storage.remove('adminToken');
            storage.remove('adminUser');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          storage.remove('adminToken');
          storage.remove('adminUser');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } finally {
      setLoading(false);
      verifyInProgress.current = false;
    }
  }, [handleLogout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // ─── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/admin/login', { email, password });

      if (data.success) {
        // ✅ احفظ الـ token في localStorage
        if (data.token) {
          storage.set('adminToken', data.token);
        }

        const userData = {
          name:  data.user?.name  || 'Admin',
          email: data.user?.email || email,
          role:  data.user?.role  || 'admin',
        };
        storage.set('adminUser', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, message: data.message || 'فشل تسجيل الدخول' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول',
      };
    }
  };

  // ─── Update User ────────────────────────────────────────────────────────────
  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      storage.set('adminUser', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      logout: handleLogout,
      updateUser,
      checkAuthStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;