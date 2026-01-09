// userController.js
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';

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
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
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

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// =====================
// Register User
// =====================
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
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

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// =====================
// Admin Actions
// =====================
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await userModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { role: 'admin' },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User promoted to admin',
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const demoteToUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is not admin',
      });
    }

    user.role = 'user';
    await user.save();

    res.json({
      success: true,
      message: 'Admin demoted to user',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { loginUser, registerUser };
