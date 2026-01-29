// src/config/axiosConfig.js
import axios from 'axios';

// متغير لتخزين token الحالي
let currentToken = localStorage.getItem('adminToken') || null;

// دالة لتحديث token
export const setAuthToken = (token) => {
  currentToken = token;
};

const axiosInstance = axios.create({
  baseURL: 'https://low-hayley-totasheco-426426a6.koyeb.app/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // استخدام token من المتغير الحالي (يتم تحديثه من Context)
    const token = currentToken || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // للتأكد من أن Token يُرسل (يمكن حذف هذا السطر لاحقاً)
      if (config.data instanceof FormData) {
        console.log('🔐 Token sent with FormData request:', config.url, '✅');
      } else {
        console.log('🔐 Token sent with request:', config.url, '✅');
      }
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }
    // لا نضيف Content-Type تلقائياً لـ multipart/form-data
    // axios سيقوم بإضافته تلقائياً مع boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

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

    if (error.response?.status === 401) {
      // مسح token من المتغير والـ localStorage
      currentToken = null;
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRole');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
