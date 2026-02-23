// src/store/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axiosConfig';
import toast from 'react-hot-toast';

// ── Fetch everything in parallel ──────────────────────────────────────────────
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetch',
  async (isRefresh = false, { rejectWithValue }) => {
    try {
      const [summaryRes, revenueRes, topProductsRes, cityRes, hourlyRes, funnelRes, recentRes, profitRes] =
        await Promise.all([
          axios.get('/analytics/summary'),
          axios.get('/analytics/revenue?period=30d'),
          axios.get('/analytics/top-products?limit=8'),
          axios.get('/analytics/by-city'),
          axios.get('/analytics/hourly'),
          axios.get('/analytics/funnel'),
          axios.get('/analytics/recent?limit=8'),
          axios.get('/analytics/profit'),          // ✅ جديد
        ]);

      return {
        summary:     summaryRes.data.success     ? summaryRes.data.data             : null,
        revenue:     revenueRes.data.success      ? revenueRes.data.data             : [],
        topProducts: topProductsRes.data.success  ? topProductsRes.data.data         : [],
        cities:      cityRes.data.success         ? cityRes.data.data                : [],
        hourly:      hourlyRes.data.success       ? hourlyRes.data.data              : [],
        funnel:      funnelRes.data.success       ? funnelRes.data.data              : null,
        recent:      recentRes.data.success       ? recentRes.data.data              : [],
        profit:      profitRes.data.success       ? profitRes.data.data              : null,  // ✅ جديد
        isRefresh,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحميل الإحصائيات');
    }
  },
);

// ── Fetch only revenue trend (period switcher) ────────────────────────────────
export const fetchRevenueTrend = createAsyncThunk(
  'dashboard/fetchRevenue',
  async (period = '30d', { rejectWithValue }) => {
    try {
      const res = await axios.get(`/analytics/revenue?period=${period}`);
      return res.data.success ? res.data.data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحميل بيانات الإيرادات');
    }
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    summary:        null,
    revenue:        [],
    topProducts:    [],
    cities:         [],
    hourly:         [],
    funnel:         null,
    recent:         [],
    profit:         null,   // ✅ { summary, products }
    loading:        false,
    refreshing:     false,
    revenueLoading: false,
    error:          null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state, action) => {
        action.meta.arg ? (state.refreshing = true) : (state.loading = true);
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading       = false;
        state.refreshing    = false;
        state.summary       = action.payload.summary;
        state.revenue       = action.payload.revenue;
        state.topProducts   = action.payload.topProducts;
        state.cities        = action.payload.cities;
        state.hourly        = action.payload.hourly;
        state.funnel        = action.payload.funnel;
        state.recent        = action.payload.recent;
        state.profit        = action.payload.profit;    // ✅
        if (action.payload.isRefresh) toast.success('✨ تم تحديث الإحصائيات بنجاح');
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading    = false;
        state.refreshing = false;
        state.error      = action.payload;
        toast.error(action.payload || 'فشل تحميل الإحصائيات');
      })

      .addCase(fetchRevenueTrend.pending,   (state) => { state.revenueLoading = true; })
      .addCase(fetchRevenueTrend.fulfilled,  (state, action) => { state.revenueLoading = false; state.revenue = action.payload; })
      .addCase(fetchRevenueTrend.rejected,   (state) => { state.revenueLoading = false; });
  },
});

export default dashboardSlice.reducer;