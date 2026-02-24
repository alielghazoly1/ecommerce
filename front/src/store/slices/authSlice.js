import { api } from '../../config/api';

export const createAuthSlice = (set, get) => ({
  // ─── State ──────────────────────────────────────────────────────
  user: null,
  isAuthenticated: false,
  authLoading: true,

  // ─── Actions ─────────────────────────────────────────────────────

  login: async (email, password) => {
    try {
      const res = await api.post('/api/users/login', { email, password });
      if (res.data.success) {
        set({ user: res.data.user, isAuthenticated: true });
        await get().loadCartData(true);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'فشل تسجيل الدخول' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'فشل تسجيل الدخول' };
    }
  },

  register: async (name, email, password, phone) => {
    try {
      const res = await api.post('/api/users/register', { name, email, password, phone });
      if (res.data.success) {
        set({ user: res.data.user, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, message: res.data.message || 'فشل إنشاء الحساب' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'فشل إنشاء الحساب' };
    }
  },

  logout: async () => {
    try {
      await api.post('/api/users/logout');
    } catch {
      // نكمل حتى لو الـ request فشل
    } finally {
      set({ user: null, isAuthenticated: false, cartItems: {} });
      localStorage.removeItem('tota-store');
    }
    return { success: true };
  },

  checkAuth: async () => {
    try {
      const res = await api.get('/api/users/profile');
      if (res.data.success && res.data.user) {
        set({ user: res.data.user, isAuthenticated: true });
        return true;
      }
      set({ isAuthenticated: false, user: null });
      return false;
    } catch {
      set({ isAuthenticated: false, user: null });
      return false;
    }
  },
});
