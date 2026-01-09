import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Admin login attempt:', email);

    const user = await userModel.findOne({ email }).select('+password');
    console.log('Found user:', user);

    if (!user) return res.status(400).json({ message: 'User Not Found' });
    if (user.role !== 'admin')
      return res.status(403).json({ message: 'Not an Admin' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: err.message });
  }
};
