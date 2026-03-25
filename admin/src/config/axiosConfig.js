// src/config/axiosConfig.js ✅ FINAL
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://back-alielghazoly1-alielghazoly1s-projects.vercel.app/api',
  // baseURL: 'http://localhost:4000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials مش ضروري لأننا بنبعت Bearer token
  // بس خليناه عشان الـ Cookie تتبعت كـ fallback لو الباك دعمها
  withCredentials: true,
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ بنضيف الـ token من localStorage في كل request
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // لا نضيف Content-Type لـ FormData — axios بيضيفه تلقائياً مع الـ boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('❌ API Error:', {
        status:     error.response.status,
        statusText: error.response.statusText,
        url:        error.config?.url,
        method:     error.config?.method,
        data:       error.response.data,
      });
    }

    // ✅ 401 → امسح الـ token وارجع للـ login
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');

      const currentPath = window.location.pathname;
      if (!currentPath.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;