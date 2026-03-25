// controllers/adminController.js ✅ FINAL
import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
};

// =====================
// Admin Login
// =====================
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  logger.info('Admin login attempt', { email });

  const user = await userModel.findOne({ email }).select('+password');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  );

  // Cookie كـ fallback للبراوزرات اللي بتدعمه
  setTokenCookie(res, token);

  logger.success('Admin logged in', { email, id: user._id });

  // ✅ بنبعت الـ token في الـ response body — الفرونت بيحتاجه
  res.json({
    success: true,
    message: 'Admin login successful',
    token,
    user: {
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
});

// =====================
// Admin Logout
// =====================
export const adminLogout = asyncHandler(async (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});