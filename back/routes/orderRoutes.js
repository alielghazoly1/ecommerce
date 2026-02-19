// routes/orderRoutes.js - FIXED & PROTECTED
import express from 'express';
import {
  placeOrder,
  userOrders,
  listOrders,
  updateStatus,
  updateLocation,
} from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { validateOrder, validateOrderStatus } from '../middleware/validation.js';

const orderRouter = express.Router();

// =====================
// USER ROUTES (محمية بـ auth فقط)
// =====================
orderRouter.post('/place', authMiddleware,validateOrder, placeOrder);
orderRouter.post('/userorders', authMiddleware, userOrders);

// ✅ Update Location (User - يعدل موقعه بعد الطلب)
orderRouter.post('/update-location', authMiddleware, updateLocation);

// =====================
// ADMIN ROUTES (محمية بـ auth + adminOnly)
// =====================
orderRouter.get('/list', authMiddleware, adminOnly, listOrders);
orderRouter.post('/status', authMiddleware, adminOnly,validateOrderStatus, updateStatus);

export default orderRouter;