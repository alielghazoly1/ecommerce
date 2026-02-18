// src/store/slices/usersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axiosConfig';
import toast from 'react-hot-toast';

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/users/list');
      if (res.data.success) return res.data.data || [];
      return rejectWithValue(res.data.message || 'فشل تحميل المستخدمين');
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'فشل تحميل المستخدمين',
      );
    }
  },
);

export const fetchUserOrders = createAsyncThunk(
  'users/fetchUserOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get('/order/list');
      if (res.data.success)
        return res.data.data.filter((o) => o.userId === userId);
      return rejectWithValue('فشل تحميل طلبات المستخدم');
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'فشل تحميل طلبات المستخدم',
      );
    }
  },
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/users/delete/${id}`);
      if (res.data.success) {
        toast.success('تم حذف المستخدم بنجاح');
        return id;
      }
      return rejectWithValue(res.data.message || 'فشل الحذف');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل الحذف');
    }
  },
);

export const promoteUser = createAsyncThunk(
  'users/promote',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/users/make-admin/${id}`, {});
      if (res.data.success) {
        toast.success('تم الترقية بنجاح');
        return id;
      }
      return rejectWithValue(res.data.message || 'فشل الترقية');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل الترقية');
    }
  },
);

export const demoteUser = createAsyncThunk(
  'users/demote',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/users/demote/${id}`, {});
      if (res.data.success) {
        toast.success('تم إعادة الدور بنجاح');
        return id;
      }
      return rejectWithValue(res.data.message || 'فشل إعادة الدور');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'فشل إعادة الدور');
    }
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    selectedUser: null,
    userOrders: [],
    loading: false,
    actionLoading: {},
    loadingOrders: false,
    error: null,
    filters: {
      search: '',
      role: 'all',
    },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      if (!action.payload) state.userOrders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      .addCase(fetchUserOrders.pending, (state) => {
        state.loadingOrders = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loadingOrders = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loadingOrders = false;
        toast.error(action.payload);
      })

      .addCase(deleteUser.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        delete state.actionLoading[action.payload];
        state.items = state.items.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        delete state.actionLoading[action.meta.arg];
        toast.error(action.payload);
      })

      .addCase(promoteUser.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true;
      })
      .addCase(promoteUser.fulfilled, (state, action) => {
        delete state.actionLoading[action.payload];
        const user = state.items.find((u) => u._id === action.payload);
        if (user) user.role = 'admin';
      })
      .addCase(promoteUser.rejected, (state, action) => {
        delete state.actionLoading[action.meta.arg];
        toast.error(action.payload);
      })

      .addCase(demoteUser.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true;
      })
      .addCase(demoteUser.fulfilled, (state, action) => {
        delete state.actionLoading[action.payload];
        const user = state.items.find((u) => u._id === action.payload);
        if (user) user.role = 'user';
      })
      .addCase(demoteUser.rejected, (state, action) => {
        delete state.actionLoading[action.meta.arg];
        toast.error(action.payload);
      });
  },
});

export const { setFilter, setSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;
