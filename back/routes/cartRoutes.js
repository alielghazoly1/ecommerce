// routes/cartRoutes.js
import express from 'express';
import {
  addToCart,
  removeOneFromCart,
  removeFromCart,
  getCart,
  clearCart,
} from '../controllers/cartController.js';
import authMiddleware from '../middleware/auth.js';
const cartRouter = express.Router();

cartRouter.post('/add', authMiddleware, addToCart);
cartRouter.post('/remove-one', authMiddleware, removeOneFromCart);
cartRouter.post('/remove-all', authMiddleware, removeFromCart);
cartRouter.post('/get', authMiddleware, getCart);
cartRouter.post('/clear', authMiddleware, clearCart);

export default cartRouter;
