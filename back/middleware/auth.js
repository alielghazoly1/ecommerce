import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // استبدل بالمسار الصحيح للـ model

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

    // fetch كامل بيانات المستخدم من قاعدة البيانات
    const user = await User.findById(decoded.id).select('-password'); // ما نرجعش الباسورد

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user; // ✅ بيانات كاملة جاهزة لأي endpoint
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export default authMiddleware;
