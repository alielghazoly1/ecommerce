// routes/adminRoutes.js - IMPROVED VERSION
import express from 'express';
import { adminLogin } from '../controllers/adminController.js';
import authMiddleware from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { validateLogin } from '../middleware/validation.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
const adminRouter = express.Router();

// =====================
// PUBLIC ROUTE - Admin Login
// =====================
adminRouter.post('/login',authRateLimiter, validateLogin, adminLogin);

// =====================
// PROTECTED ADMIN ROUTES
// =====================


// Verify admin token
adminRouter.get('/verify', authMiddleware, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: 'Valid admin token',
    admin: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default adminRouter;