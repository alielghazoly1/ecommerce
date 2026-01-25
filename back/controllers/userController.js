// userController.js - FIXED VERSION
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import logger from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// =====================
// Create JWT Token
// =====================
const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// =====================
// Login User
// =====================
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel
    .findOne({ email })
    .select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User does not exist',
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const token = createToken(user);
  res.json({ success: true, token });
});

// =====================
// Register User
// =====================
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await userModel.findOne({ email });
  if (exists) {
    return res.status(409).json({
      success: false,
      message: 'User already exists',
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email',
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
    role: 'user',
  });

  const token = createToken(user);
  res.status(201).json({ success: true, token });
});

// =====================
// Admin Actions
// =====================
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userModel.find().select('-password');
  res.json({ success: true, data: users });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ Validation
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
    });
  }

  const deleted = await userModel.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  logger.info('User deleted', { userId: id });

  res.json({ 
    success: true, 
    message: 'User deleted successfully' 
  });
});

export const makeAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ Validation
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
    });
  }

  const user = await userModel.findById(id);

  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  // ✅ تحقق من الدور الحالي
  if (user.role === 'admin') {
    return res.status(400).json({
      success: false,
      message: 'User is already admin',
    });
  }

  user.role = 'admin';
  await user.save({ validateBeforeSave: false }); // ✅ تعطيل validation

  logger.info('User promoted to admin', { userId: id });

  res.json({
    success: true,
    message: 'User promoted to admin',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// ✅ FIXED: demoteToUser
export const demoteToUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ Validation
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
    });
  }

  const user = await userModel.findById(id);

  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  // ✅ تحقق من الدور الحالي
  if (user.role !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'User is not admin',
    });
  }

  // ✅ تحديث الدور مع تعطيل validation
  user.role = 'user';
  
  try {
    await user.save({ validateBeforeSave: false }); // ✅ تعطيل validation للـ password
    
    logger.info('Admin demoted to user', { userId: id });

    res.json({
      success: true,
      message: 'Admin demoted to user',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (saveError) {
    logger.error('Error saving user', { error: saveError.message, userId: id });
    
    // ✅ محاولة بديلة باستخدام findByIdAndUpdate
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { role: 'user' },
      { new: true, runValidators: false }
    ).select('-password');

    if (updatedUser) {
      return res.json({
        success: true,
        message: 'Admin demoted to user',
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    }

    throw saveError;
  }
});

export { loginUser, registerUser };