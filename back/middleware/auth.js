// middleware/auth.js - COOKIE + BEARER TOKEN VERSION (Safari Fix)
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import logger from '../utils/logger.js';

const authMiddleware = async (req, res, next) => {
  let token = null;

  // 1️⃣ Authorization header أولاً (Bearer token) — بيشتغل على كل البراوزرات
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2️⃣ Cookie كـ fallback
  if (!token) {
    token = req.cookies?.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please login again',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export default authMiddleware;