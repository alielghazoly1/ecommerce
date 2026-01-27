// routes/userRoutes.js - ENHANCED VERSION
import express from 'express';
import {
  loginUser,
  registerUser,
  getUserProfile,
  updateProfile,
  demoteToUser,
  getAllUsers,
  deleteUser,
  makeAdmin,
} from '../controllers/userController.js';

import authMiddleware from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import {
  validateLogin,
  validateRegister,
  validateMongoId,
} from '../middleware/validation.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const userRouter = express.Router();

// =====================
// PUBLIC ROUTES (أي حد يقدر يوصلها)
// =====================
userRouter.post('/login', authRateLimiter, validateLogin, loginUser);
userRouter.post('/register', authRateLimiter, validateRegister, registerUser);

// =====================
// PROTECTED USER ROUTES (لازم يكون مسجل دخول)
// =====================
userRouter.get('/profile', authMiddleware, getUserProfile);
userRouter.put('/profile', authMiddleware, updateProfile);

// =====================
// ADMIN ONLY ROUTES (لازم يكون admin)
// =====================
userRouter.get('/list', authMiddleware, adminOnly, getAllUsers);
userRouter.delete(
  '/delete/:id',
  authMiddleware,
  adminOnly,
  validateMongoId('id'),
  deleteUser,
);
userRouter.put(
  '/make-admin/:id',
  authMiddleware,
  adminOnly,
  validateMongoId('id'),
  makeAdmin,
);
userRouter.put(
  '/demote/:id',
  authMiddleware,
  adminOnly,
  validateMongoId('id'),
  demoteToUser,
);

export default userRouter;