// middleware/auth.js ✅ FINAL - Works on all devices & browsers
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import logger from '../utils/logger.js';

const authMiddleware = async (req, res, next) => {
  let token = null;

  // 1️⃣ Authorization header — Bearer token (الأولوية الأولى)
  //    ده بيشتغل على كل الأجهزة والبراوزرات بدون استثناء
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim(); // أأمن من split
  }

  // 2️⃣ Cookie fallback (لو الـ Bearer مش موجود)
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  // 3️⃣ Query param fallback (للحالات الاستثنائية - مش مستحسن للإنتاج)
  // if (!token && req.query?.token) token = req.query.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح. يرجى تسجيل الدخول مرة أخرى',
    });
  }

  // تنظيف الـ token من أي مسافات زيادة
  token = token.trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password').lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'رمز المصادقة غير صالح. يرجى تسجيل الدخول مرة أخرى',
    });
  }
};

export default authMiddleware;
