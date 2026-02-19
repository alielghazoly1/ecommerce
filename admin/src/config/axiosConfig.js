// src/config/axiosConfig.js - HttpOnly Cookie Version 🍪
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://back-7cc728syx-alielghazoly1s-projects.vercel.app/api',
  // baseURL: 'http://localhost:4000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ هذا هو المفتاح الأساسي - إرسال الـ Cookie تلقائياً
  withCredentials: true,
});

// ─── Request Interceptor ─────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ لا نضيف Authorization header - الـ Cookie سيُرسل تلقائياً
    
    // لا نضيف Content-Type تلقائياً لـ multipart/form-data
    // axios سيقوم بإضافته تلقائياً مع boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // تسجيل تفاصيل الخطأ للتشخيص
    if (error.response) {
      console.error('❌ API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
      });
    }

    // ✅ في حالة 401 - الـ Cookie انتهت صلاحيته أو غير موجود
    if (error.response?.status === 401) {
      // إعادة التوجيه لصفحة تسجيل الدخول فقط إذا لم نكن فيها بالفعل
      const currentPath = window.location.pathname;
      if (currentPath !== '/admin/login' && !currentPath.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;