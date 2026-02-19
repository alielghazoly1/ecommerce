// routes/analyticsRoutes.js
import express from 'express';
import authMiddleware      from '../middleware/auth.js';
import { adminOnly }      from '../middleware/adminOnly.js';
import {
  getSummary,
  getRevenueTrend,
  getTopProducts,
  getSalesByCity,
  getHourlyOrders,
  getOrderFunnel,
  getRecentActivity,
} from '../controllers/analyticsController.js';

const analyticsRouter = express.Router();

// All analytics endpoints are admin-only
analyticsRouter.use(authMiddleware, adminOnly);

// GET /api/analytics/summary       → أرقام سريعة (revenue, orders, customers)
analyticsRouter.get('/summary',      getSummary);

// GET /api/analytics/revenue?period=30d|12w|12m  → ترند الإيرادات
analyticsRouter.get('/revenue',      getRevenueTrend);

// GET /api/analytics/top-products?limit=10&period=30d|7d|90d|all → أكتر المنتجات مبيعاً
analyticsRouter.get('/top-products', getTopProducts);

// GET /api/analytics/by-city       → توزيع المبيعات على المدن
analyticsRouter.get('/by-city',      getSalesByCity);

// GET /api/analytics/hourly        → توزيع الطلبات على ساعات اليوم
analyticsRouter.get('/hourly',       getHourlyOrders);

// GET /api/analytics/funnel        → نسب تحويل الطلبات
analyticsRouter.get('/funnel',       getOrderFunnel);

// GET /api/analytics/recent?limit=10 → آخر الطلبات
analyticsRouter.get('/recent',       getRecentActivity);

export default analyticsRouter;