import axios from 'axios';

export const BASE_URL = 'https://back-alielghazoly1-alielghazoly1s-projects.vercel.app';
// export const BASE_URL = 'http://localhost:4000';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const saveToken = (token) => {
  if (token) localStorage.setItem('auth_token', token);
};

export const getToken = () => localStorage.getItem('auth_token');

export const removeToken = () => localStorage.removeItem('auth_token');

// ─── Axios instance ───────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // لازم يفضل موجود للـ browsers العادية
});

// ─── Request interceptor: حط الـ token في كل request تلقائياً ───────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);