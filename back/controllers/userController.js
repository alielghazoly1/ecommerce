// userController.js - COOKIE + TOKEN VERSION (Safari Fix)
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
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// =====================
// Helper: Set Cookie with Token
// =====================
const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

// =====================
// Login User
// =====================
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select('+password');

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

  await user.updateLastLogin();

  const token = createToken(user);

  // 🍪 Set cookie (للـ browsers العادية)
  setTokenCookie(res, token);

  logger.info('User logged in', { email, userId: user._id });

  // ✅ رجّع الـ token في الـ response body كمان (عشان Safari و mobile)
  res.json({
    success: true,
    message: 'Login successful',
    token, // ← الإضافة الجديدة
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
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

  const user = await userModel.create({ name, email, password, role: 'user' });

  const token = createToken(user);

  // 🍪 Set cookie
  setTokenCookie(res, token);

  logger.info('User registered', { email, userId: user._id });

  // ✅ رجّع الـ token في الـ response body كمان
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token, // ← الإضافة الجديدة
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// =====================
// Logout User
// =====================
export const logoutUser = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });

  logger.info('User logged out', { userId: req.user?._id });

  res.json({ success: true, message: 'Logged out successfully' });
});

// =====================
// Get User Profile
// =====================
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await userModel
    .findById(req.user._id)
    .select('-password -emailVerificationToken -passwordResetToken');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const cartStats = {
    itemsCount: user.cartItemsCount || 0,
    totalItems: Array.from(user.cartData.values()).reduce(
      (sum, qty) => sum + qty,
      0,
    ),
  };

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      cartData: user.cartData,
      wishlist: user.wishlist,
      cartStats,
      addresses: user.addresses,
      preferences: user.preferences,
      metadata: {
        totalOrders: user.metadata?.totalOrders || 0,
        totalSpent: user.metadata?.totalSpent || 0,
        lastOrderDate: user.metadata?.lastOrderDate,
      },
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// =====================
// Update User Profile
// =====================
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, preferences } = req.body;

  const user = await userModel.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();

  logger.info('Profile updated', { userId: user._id });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      preferences: user.preferences,
    },
  });
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
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: 'User ID is required' });

  const deleted = await userModel.findByIdAndDelete(id);
  if (!deleted)
    return res.status(404).json({ success: false, message: 'User not found' });

  logger.info('User deleted', { userId: id });
  res.json({ success: true, message: 'User deleted successfully' });
});

export const makeAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userModel.findById(id);
  if (!user)
    return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin')
    return res
      .status(400)
      .json({ success: false, message: 'User is already admin' });

  user.role = 'admin';
  await user.save({ validateBeforeSave: false });

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

export const demoteToUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userModel.findById(id);
  if (!user)
    return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role !== 'admin')
    return res
      .status(400)
      .json({ success: false, message: 'User is not admin' });

  user.role = 'user';
  await user.save({ validateBeforeSave: false });

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
});

export { loginUser, registerUser };
