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
    return res.status(404).json({ 
      success: false,
      message: 'User not found' 
    });
  }
  
  if (user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin only.' 
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid password' 
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  );

  logger.success('Admin logged in', { email, id: user._id });

  res.json({
    success: true,
    token,
    user: { name: user.name, email: user.email },
  });
});
