// userRoutes.js 
import express from 'express';
import {
  loginUser,
  registerUser,
  demoteToUser,
  getAllUsers,
  deleteUser,
  makeAdmin,
} from '../controllers/userController.js';

import authMiddleware from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const userRouter = express.Router();

// Auth
userRouter.post('/login', loginUser);
userRouter.post('/register', registerUser);

// Admin only
userRouter.get('/list', authMiddleware, adminOnly, getAllUsers);
userRouter.delete('/delete/:id', authMiddleware, adminOnly, deleteUser);
userRouter.put('/make-admin/:id', authMiddleware, adminOnly, makeAdmin);
userRouter.put('/demote/:id', authMiddleware, adminOnly, demoteToUser);
userRouter.get('/test-auth', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default userRouter;
