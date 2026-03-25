// controllers/adminController.js ✅ FINAL
import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  logger.info('Admin login attempt', { email });

  const user = await userModel.findOne({ email }).select('+password');

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: 'بيانات تسجيل الدخول غير صحيحة' });
  }
  if (user.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, message: 'غير مصرح. هذه المنطقة للمشرفين فقط' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: 'بيانات تسجيل الدخول غير صحيحة' });
  }

  // ✅ 7 أيام بدل يوم — أريح للمستخدم
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );

  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  logger.success('Admin logged in', { email, id: user._id });

  res.json({
    success: true,
    message: 'تم تسجيل الدخول بنجاح',
    token,
    user: { name: user.name, email: user.email, role: user.role },
  });
});

export const adminLogout = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});
