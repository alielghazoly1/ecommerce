// src/store/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axiosConfig';
import { calcDashboardStats } from '../../utils/helpers';
import toast from 'react-hot-toast';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetch',
  async (isRefresh = false, { rejectWithValue }) => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get('/order/list'),
        axios.get('/product/list'),
        axios.get('/users/list'),
      ]);

      const orders = ordersRes.data.success ? ordersRes.data.data : [];
      const products = productsRes.data.success
        ? productsRes.data.data || []
        : [];
      const users = usersRes.data.success ? usersRes.data.data || [] : [];

      return { stats: calcDashboardStats(orders, products, users), isRefresh };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'فشل تحميل الإحصائيات',
      );
    }
  },
);

const defaultStats = {
  totalOrders: 0,
  totalRevenue: 0,
  totalProducts: 0,
  totalUsers: 0,
  pendingOrders: 0,
  processingOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
  todayOrders: 0,
  todayRevenue: 0,
  yesterdayOrders: 0,
  yesterdayRevenue: 0,
  weekOrders: 0,
  weekRevenue: 0,
  lastWeekOrders: 0,
  lastWeekRevenue: 0,
  monthOrders: 0,
  monthRevenue: 0,
  lastMonthOrders: 0,
  lastMonthRevenue: 0,
  averageOrderValue: 0,
  growthRate: 0,
  revenueGrowthRate: 0,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: defaultStats,
    loading: false,
    refreshing: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state, action) => {
        if (action.meta.arg) {
          state.refreshing = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.stats = action.payload.stats;
        if (action.payload.isRefresh)
          toast.success('✨ تم تحديث الإحصائيات بنجاح');
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
