// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';
import usersReducer from './slices/usersSlice';
import monitoringReducer from './slices/monitoringSlice';
import dashboardReducer from './slices/dashboardSlice';

const store = configureStore({
  reducer: {
    products: productsReducer,
    orders: ordersReducer,
    users: usersReducer,
    monitoring: monitoringReducer,
    dashboard: dashboardReducer,
  },
});

export default store;
