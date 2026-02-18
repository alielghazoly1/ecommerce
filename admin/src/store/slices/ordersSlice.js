// src/store/slices/ordersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axiosConfig';
import toast from 'react-hot-toast';

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/order/list');
      if (res.data.success) return res.data.data || [];
      return rejectWithValue(res.data.message || 'فشل تحميل الطلبات');
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'فشل تحميل الطلبات',
      );
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status, trackingNumber }, { rejectWithValue }) => {
    try {
      const res = await axios.post('/order/status', {
        orderId,
        status,
        trackingNumber: trackingNumber || undefined,
      });
      if (res.data.success) {
        toast.success('تم تحديث حالة الطلب بنجاح');
        return { orderId, status };
      }
      return rejectWithValue(res.data.message || 'فشل تحديث الحالة');
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'حدث خطأ أثناء التحديث',
      );
    }
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    selectedOrder: null,
    loading: false,
    updating: false,
    error: null,
    filters: {
      status: 'all',
      search: '',
    },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      .addCase(updateOrderStatus.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.selectedOrder = null;
        const { orderId, status } = action.payload;
        const order = state.items.find((o) => o._id === orderId);
        if (order) order.status = status;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updating = false;
        toast.error(action.payload);
      });
  },
});

export const { setFilter, setSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
