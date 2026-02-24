import { api } from '../../config/api';

export const createCartSlice = (set, get) => ({
  // ─── State ──────────────────────────────────────────────────────
  cartItems: {},

  // ─── Actions ─────────────────────────────────────────────────────

  loadCartData: async (authenticated) => {
    const isAuth = authenticated ?? get().isAuthenticated;
    if (!isAuth) return;
    try {
      const res = await api.post('/api/cart/get');
      if (res.data.success && res.data.cartData) {
        set({ cartItems: res.data.cartData });
        localStorage.removeItem('tota-store');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        set({ isAuthenticated: false, user: null });
      }
    }
  },

  addToCart: async (id, quantity = 1) => {
    if (!id) return { success: false, message: 'Invalid id' };
    const { isAuthenticated, cartItems } = get();

    // Guest → حفظ محلياً فقط
    if (!isAuthenticated) {
      set((state) => ({
        cartItems: { ...state.cartItems, [id]: (state.cartItems[id] || 0) + quantity },
      }));
      return { success: false, local: true };
    }

    // Optimistic update مع Rollback عند الفشل
    const previous = { ...cartItems };
    set((state) => ({
      cartItems: { ...state.cartItems, [id]: (state.cartItems[id] || 0) + quantity },
    }));

    try {
      const res = await api.post('/api/cart/add', { id, quantity });
      if (res.data?.success && res.data.cartData) {
        set({ cartItems: res.data.cartData });
      }
      return res.data || { success: true };
    } catch (err) {
      set({ cartItems: previous });
      if (err.response?.status === 401) set({ isAuthenticated: false, user: null });
      throw err;
    }
  },

  removeFromCart: async (id, removeAll = false) => {
    const { isAuthenticated } = get();

    if (!isAuthenticated) {
      set((state) => {
        const updated = { ...state.cartItems };
        if (removeAll || updated[id] <= 1) delete updated[id];
        else updated[id]--;
        return { cartItems: updated };
      });
      return;
    }

    try {
      const endpoint = removeAll ? '/api/cart/remove-all' : '/api/cart/remove-one';
      const res = await api.post(endpoint, { id, removeAll });
      if (res.data.success) set({ cartItems: res.data.cartData });
    } catch (err) {
      if (err.response?.status === 401) set({ isAuthenticated: false, user: null });
    }
  },

  clearCart: async () => {
    if (!get().isAuthenticated) {
      set({ cartItems: {} });
      localStorage.removeItem('tota-store');
      return;
    }
    try {
      await api.post('/api/cart/clear');
      set({ cartItems: {} });
    } catch (err) {
      if (err.response?.status === 401) set({ isAuthenticated: false, user: null });
    }
  },
});
