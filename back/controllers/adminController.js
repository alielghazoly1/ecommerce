import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js'; // ✅ أضف هذا

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info('Admin login attempt', { email }); // ✅ غير لـ logger

    const user = await userModel.findOne({ email }).select('+password');
    logger.debug('User found', { found: !!user }); // ✅ غير لـ logger

    if (!user) return res.status(400).json({ message: 'User Not Found' });
    if (user.role !== 'admin')
      return res.status(403).json({ message: 'Not an Admin' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
    );

    logger.success('Admin logged in', { email, id: user._id }); // ✅ أضف هذا

    res.json({
      success: true,
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    logger.error('Admin login error', { error: err.message }); // ✅ غير لـ logger
    res.status(500).json({ message: err.message });
  }
};
