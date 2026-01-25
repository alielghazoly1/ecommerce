// controllers/cartController.js - FIXED
import userModel from '../models/userModel.js';
import logger from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const lastAddTimestamps = new Map();

// =====================
// Add to Cart
// =====================
const addToCart = asyncHandler(async (req, res) => {
    logger.debug('Add to cart request', {
      userId: req.user?._id,
      itemId: req.body.id,
      quantity: req.body.quantity,
    });

    const userId = req.user?._id; // ✅ استخدم _id مش id
    const { id: itemId, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (!itemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    // Dedupe check
    const key = `${userId}_${itemId}`;
    const now = Date.now();
    const last = lastAddTimestamps.get(key) || 0;
    
    if (now - last < 800) {
      logger.warn('Duplicate add to cart request detected', { userId, itemId });
      return res.status(429).json({ 
        success: false, 
        message: 'Please wait before adding again' 
      });
    }
    
    lastAddTimestamps.set(key, now);

    // Update cart atomically
    const updated = await userModel.findByIdAndUpdate(
      userId,
      { $inc: { [`cartData.${itemId}`]: quantity } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    logger.info('Item added to cart successfully', { userId, itemId, quantity });

    res.json({
      success: true,
      message: 'Added to cart',
      cartData: updated.cartData || {},
    });
});

// =====================
// Remove One from Cart
// =====================
const removeOneFromCart = asyncHandler(async (req, res) => {
    logger.debug('Remove one from cart request', {
      userId: req.user?._id,
      itemId: req.body.id,
    });

    const userId = req.user?._id;
    const { id: itemId } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (!itemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    const userData = await userModel.findById(userId);
    
    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const cartData = userData.cartData || {};
    const currentQty = Number(cartData.get(itemId) || 0);

    if (currentQty === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not in cart' 
      });
    }

    let updated;
    if (currentQty > 1) {
      updated = await userModel.findByIdAndUpdate(
        userId,
        { $inc: { [`cartData.${itemId}`]: -1 } },
        { new: true }
      );
    } else {
      updated = await userModel.findByIdAndUpdate(
        userId,
        { $unset: { [`cartData.${itemId}`]: '' } },
        { new: true }
      );
    }

    logger.info('Item quantity decreased in cart', { userId, itemId });

    res.json({ 
      success: true, 
      cartData: updated.cartData || {} 
    });
});

// =====================
// Remove All from Cart
// =====================
const removeFromCart = asyncHandler(async (req, res) => {
    logger.debug('Remove from cart request', {
      userId: req.user?._id,
      itemId: req.body.id,
    });

    const userId = req.user?._id;
    const { id: itemId } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (!itemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    const userData = await userModel.findById(userId);
    
    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const cartData = userData.cartData || {};
    
    if (!cartData.has(itemId)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not in cart' 
      });
    }

    const updated = await userModel.findByIdAndUpdate(
      userId,
      { $unset: { [`cartData.${itemId}`]: '' } },
      { new: true }
    );

    logger.info('Item removed from cart', { userId, itemId });

    res.json({ 
      success: true, 
      cartData: updated.cartData || {} 
    });
});

// =====================
// Get Cart
// =====================
const getCart = asyncHandler(async (req, res) => {
    logger.debug('Get cart request', { userId: req.user?._id });

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      cartData: user.cartData || {} 
    });
});

// =====================
// Clear Cart
// =====================
const clearCart = asyncHandler(async (req, res) => {
    logger.debug('Clear cart request', { userId: req.user?._id });

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const previousCart = user.cartData || {};
    
    user.cartData = new Map();
    await user.save();

    logger.info('Cart cleared successfully', { userId });

    res.json({
      success: true,
      message: 'Cart cleared',
      cartData: previousCart,
    });
});

export { addToCart, removeFromCart, removeOneFromCart, getCart, clearCart };