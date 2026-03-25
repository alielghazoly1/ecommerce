// src/context/AuthContext.jsx ✅ FINAL
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import axios from '../config/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ─── Logout ──────────────────────────────────────────────────────────────
  const handleLogout = useCallback(async (shouldRedirect = true) => {
    try {
      await axios.post('/admin/logout');
    } catch {
      // حتى لو فشل الـ request، نمسح البيانات المحلية
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setUser(null);
      setIsAuthenticated(false);
      if (shouldRedirect) {
        window.location.href = '/admin/login';
      }
    }
  }, []);

  // ─── Check Auth ───────────────────────────────────────────────────────────
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);

    const savedToken = localStorage.getItem('adminToken');

    // ✅ لو مفيش token خالص → مش محتاجين نكلم السيرفر
    if (!savedToken) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // ✅ في token → نتحقق منه مع السيرفر
    try {
      const response = await axios.get('/admin/verify');

      if (response.data.success) {
        const userData = {
          name:  response.data.user?.name  || response.data.admin?.name  || 'Admin',
          email: response.data.user?.email || response.data.admin?.email || '',
          role:  response.data.user?.role  || response.data.admin?.role  || 'admin',
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('adminUser', JSON.stringify(userData));
      } else {
        handleLogout(false);
      }
    } catch (err) {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        // Token منتهي أو غير صالح → logout
        handleLogout(false);
      } else {
        // مشكلة شبكة أو سيرفر → نستخدم البيانات المحفوظة مؤقتاً
        const savedUser = localStorage.getItem('adminUser');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
          } catch {
            handleLogout(false);
          }
        } else {
          handleLogout(false);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/admin/login', { email, password });

      if (data.success) {
        // ✅ احفظ الـ token — السيرفر بيبعته في data.token
        const token = data.token;
        if (token) {
          localStorage.setItem('adminToken', token);
        }

        const userData = {
          name:  data.user?.name  || 'Admin',
          email: data.user?.email || email,
          role:  data.user?.role  || 'admin',
        };
        localStorage.setItem('adminUser', JSON.stringify(userData));

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

  // ─── Update user ──────────────────────────────────────────────────────────
  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('adminUser', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout: handleLogout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;