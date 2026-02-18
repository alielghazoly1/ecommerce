// src/store/slices/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axiosConfig';
import toast from 'react-hot-toast';
import { buildProductFormData } from '../../utils/helpers';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/product/list');
      if (res.data.success) return res.data.data || [];
      return rejectWithValue(res.data.message || 'فشل تحميل المنتجات');
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'فشل تحميل المنتجات',
      );
    }
  },
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/product/${id}`);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || 'فشل تحميل المنتج');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحميل المنتج');
    }
  },
);

export const addProduct = createAsyncThunk(
  'products/add',
  async ({ data, image }, { rejectWithValue }) => {
    try {
      const formData = buildProductFormData(data, image);
      const res = await axios.post('/product/add', formData);
      if (res.data.success) {
        toast.success('✨ تم إضافة المنتج بنجاح!');
        return res.data.data;
      }
      return rejectWithValue(res.data.message || 'فشل إضافة المنتج');
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'حدث خطأ أثناء الإضافة',
      );
    }
  },
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, data, image }, { rejectWithValue }) => {
    try {
      const formData = buildProductFormData(data, image);
      const res = await axios.put(`/product/update/${id}`, formData);
      if (res.data.success) {
        toast.success('تم تحديث المنتج بنجاح!');
        return res.data.data;
      }
      return rejectWithValue(res.data.message || 'فشل تحديث المنتج');
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'حدث خطأ أثناء التحديث',
      );
    }
  },
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/product/remove/${id}`);
      if (res.data.success) {
        toast.success('تم حذف المنتج بنجاح');
        return id;
      }
      return rejectWithValue(res.data.message || 'فشل حذف المنتج');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل حذف المنتج');
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    selectedProduct: null,
    loading: false,
    actionLoading: {},
    error: null,
    filters: {
      search: '',
      category: 'all',
      sortBy: 'newest',
    },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      // addProduct
      .addCase(addProduct.pending, (state) => {
        state.actionLoading.add = true;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.actionLoading.add = false;
        if (action.payload) state.items.unshift(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.actionLoading.add = false;
        toast.error(action.payload);
      })

      // updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.actionLoading.update = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.actionLoading.update = false;
        if (action.payload) {
          const idx = state.items.findIndex(
            (p) => p._id === action.payload._id,
          );
          if (idx !== -1) state.items[idx] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.actionLoading.update = false;
        toast.error(action.payload);
      })

      // deleteProduct
      .addCase(deleteProduct.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        delete state.actionLoading[action.payload];
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        delete state.actionLoading[action.meta.arg];
        toast.error(action.payload);
      });
  },
});

export const { setFilter, setSelectedProduct, clearError } =
  productsSlice.actions;
export default productsSlice.reducer;
