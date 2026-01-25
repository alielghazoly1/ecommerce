// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../config/axiosConfig';
import { setAuthToken } from '../config/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || null);

  // تحديث token في axios عند تغييره
  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem('adminToken', token);
    } else {
      localStorage.removeItem('adminToken');
    }
  }, [token]);

  const handleLogout = useCallback((shouldRedirect = true) => {
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      window.location.href = '/admin/login';
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    const storedToken = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole');

    if (!storedToken || !role) {
      setLoading(false);
      return;
    }

    // تحديث token في state
    setToken(storedToken);

    try {
      const response = await axios.get('/admin/verify');

      if (response.data.success) {
        setUser({
          name: response.data.user?.name || 'Admin',
          email: response.data.user?.email || '',
          role: response.data.user?.role || role
        });
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      handleLogout(false);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/admin/login', {
        email,
        password
      });

      if (data.success) {
        // تحديث token في state (سيتم حفظه في localStorage تلقائياً عبر useEffect)
        setToken(data.token);
        localStorage.setItem('adminRole', data.role || 'admin');
        
        setUser({
          name: data.user?.name || 'Admin',
          email: data.user?.email || email,
          role: data.role || 'admin'
        });
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || 'فشل تسجيل الدخول' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول'
      };
    }
  };

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    token,
    login,
    logout: handleLogout,
    updateUser,
    checkAuthStatus,
    setToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;