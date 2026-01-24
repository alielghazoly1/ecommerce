// controllers/cartController.js - FIXED
import userModel from '../models/userModel.js';

const lastAddTimestamps = new Map();

// =====================
// Add to Cart
// =====================
const addToCart = async (req, res) => {
  try {
    console.log('[addToCart] Request:', {
      user: req.user?._id,
      body: req.body,
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
      console.log('[addToCart] Duplicate request detected');
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

    console.log('[addToCart] Success:', { userId, itemId, quantity });

    res.json({
      success: true,
      message: 'Added to cart',
      cartData: updated.cartData || {},
    });
  } catch (err) {
    console.error('[addToCart] Error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to add to cart' 
    });
  }
};

// =====================
// Remove One from Cart
// =====================
const removeOneFromCart = async (req, res) => {
  try {
    console.log('[removeOneFromCart] Request:', {
      user: req.user?._id,
      body: req.body,
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

    console.log('[removeOneFromCart] Success');

    res.json({ 
      success: true, 
      cartData: updated.cartData || {} 
    });
  } catch (err) {
    console.error('[removeOneFromCart] Error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// =====================
// Remove All from Cart
// =====================
const removeFromCart = async (req, res) => {
  try {
    console.log('[removeFromCart] Request:', {
      user: req.user?._id,
      body: req.body,
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

    console.log('[removeFromCart] Success');

    res.json({ 
      success: true, 
      cartData: updated.cartData || {} 
    });
  } catch (err) {
    console.error('[removeFromCart] Error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// =====================
// Get Cart
// =====================
const getCart = async (req, res) => {
  try {
    console.log('[getCart] Request:', { user: req.user?._id });

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
  } catch (err) {
    console.error('[getCart] Error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// =====================
// Clear Cart
// =====================
const clearCart = async (req, res) => {
  try {
    console.log('[clearCart] Request:', { user: req.user?._id });

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

    console.log('[clearCart] Success');

    res.json({
      success: true,
      message: 'Cart cleared',
      cartData: previousCart,
    });
  } catch (err) {
    console.error('[clearCart] Error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export { addToCart, removeFromCart, removeOneFromCart, getCart, clearCart };