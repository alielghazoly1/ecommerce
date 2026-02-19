// src/context/AuthContext.jsx — HttpOnly Cookie version 🍪
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ لا يوجد token state أو localStorage — الـ Cookie بتتحكم في كل حاجة

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = useCallback(async (shouldRedirect = true) => {
    try {
      // السيرفر بيمسح الـ Cookie
      await axios.post('/admin/logout');
    } catch {
      // حتى لو فشل الـ request، نمسح الـ state
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      if (shouldRedirect) {
        window.location.href = '/admin/login';
      }
    }
  }, []);

  // ─── Check Auth ────────────────────────────────────────────────────────────
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    try {
      // withCredentials في axiosInstance بيبعت الـ Cookie تلقائياً
      const response = await axios.get('/admin/verify');

      if (response.data.success) {
        setUser({
          name: response.data.user?.name || 'Admin',
          email: response.data.user?.email || '',
          role: response.data.user?.role || 'admin',
        });
        setIsAuthenticated(true);
      } else {
        handleLogout(false);
      }
    } catch {
      // 401 → interceptor بيعمل redirect، مش محتاجين نعمل حاجة هنا
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/admin/login', { email, password });

      if (data.success) {
        // ✅ السيرفر بيحط HttpOnly Cookie تلقائياً — مش بنحفظ token هنا
        setUser({
          name: data.user?.name || 'Admin',
          email: data.user?.email || email,
          role: data.role || 'admin',
        });
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

  // ─── Update user ───────────────────────────────────────────────────────────
  const updateUser = useCallback((userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    // ✅ token مش موجود هنا خالص — الـ Cookie بتتبعت تلقائياً
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
