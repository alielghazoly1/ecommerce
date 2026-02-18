// src/store/slices/monitoringSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axiosConfig';
import toast from 'react-hot-toast';

export const fetchMonitoringData = createAsyncThunk(
  'monitoring/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const [dashRes, logsRes] = await Promise.all([
        axios.get('/monitoring/dashboard'),
        axios.get('/monitoring/logs?limit=50'),
      ]);
      return {
        data: dashRes.data.success ? dashRes.data.data : null,
        logs: logsRes.data.success ? logsRes.data.data : [],
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'فشل تحميل بيانات المراقبة',
      );
    }
  },
);

export const clearLogs = createAsyncThunk(
  'monitoring/clearLogs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post('/monitoring/logs/clear', {});
      if (res.data.success) {
        toast.success('تم حذف السجلات بنجاح');
        return true;
      }
      return rejectWithValue('فشل حذف السجلات');
    } catch (err) {
      return rejectWithValue('فشل حذف السجلات');
    }
  },
);

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState: {
    data: null,
    logs: [],
    loading: false,
    refreshing: false,
    error: null,
    logFilter: 'all',
    autoRefresh: true,
  },
  reducers: {
    setLogFilter: (state, action) => {
      state.logFilter = action.payload;
    },
    setAutoRefresh: (state, action) => {
      state.autoRefresh = action.payload;
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonitoringData.pending, (state) => {
        state.loading = !state.data;
      })
      .addCase(fetchMonitoringData.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        if (action.payload.data) state.data = action.payload.data;
        state.logs = action.payload.logs;
      })
      .addCase(fetchMonitoringData.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload;
      })
      .addCase(clearLogs.fulfilled, (state) => {
        state.logs = [];
      });
  },
});

export const { setLogFilter, setAutoRefresh, setRefreshing } =
  monitoringSlice.actions;
export default monitoringSlice.reducer;
