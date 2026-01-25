// middleware/auth.js - CORRECT VERSION
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import logger from '../utils/logger.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Please login again',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ المفروض decoded.id يكون _id بتاع اليوزر
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // ✅ احفظ كل بيانات اليوزر في req.user
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message, token: token.substring(0, 20) + '...' });
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export default authMiddleware;