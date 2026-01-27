// userController.js - ENHANCED VERSION
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
    { expiresIn: '1d' },
  );
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

  // Update last login
  await user.updateLastLogin();

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

  // Password will be hashed by the pre-save middleware
  const user = await userModel.create({
    name,
    email,
    password,
    role: 'user',
  });

  const token = createToken(user);
  res.status(201).json({ success: true, token });
});

// =====================
// Get User Profile (Enhanced)
// =====================
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await userModel
    .findById(req.user._id)
    .select('-password -emailVerificationToken -passwordResetToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Calculate cart statistics
  const cartStats = {
    itemsCount: user.cartItemsCount || 0,
    totalItems: Array.from(user.cartData.values()).reduce((sum, qty) => sum + qty, 0),
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
      
      // Cart & Wishlist
      cartData: user.cartData,
      wishlist: user.wishlist,
      cartStats,
      
      // Addresses
      addresses: user.addresses,
      
      // Preferences
      preferences: user.preferences,
      
      // Metadata & Statistics
      metadata: {
        totalOrders: user.metadata?.totalOrders || 0,
        totalSpent: user.metadata?.totalSpent || 0,
        lastOrderDate: user.metadata?.lastOrderDate,
      },
      
      // Account Info
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
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }
  
  // Update allowed fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
  }
  
  await user.save();
  
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
      message: 'User not found',
    });
  }

  logger.info('User deleted', { userId: id });

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

export const makeAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

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
      message: 'User not found',
    });
  }

  if (user.role === 'admin') {
    return res.status(400).json({
      success: false,
      message: 'User is already admin',
    });
  }

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
      message: 'User not found',
    });
  }

  if (user.role !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'User is not admin',
    });
  }

  user.role = 'user';

  try {
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
  } catch (saveError) {
    logger.error('Error saving user', { error: saveError.message, userId: id });

    const updatedUser = await userModel
      .findByIdAndUpdate(
        id,
        { role: 'user' },
        { new: true, runValidators: false },
      )
      .select('-password');

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