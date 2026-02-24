import { api } from '../../config/api';

export const createProductsSlice = (set) => ({
  // ─── State ──────────────────────────────────────────────────────
  products: [],

  // ─── Actions ─────────────────────────────────────────────────────

  fetchProducts: async () => {
    try {
      const res = await api.get('/api/product/list');
      set({ products: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  },
});
