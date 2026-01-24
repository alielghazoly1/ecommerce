// cartController.js
import userModel from '../models/userModel.js';

// مؤقتًا: خريطة في الذاكرة لمنع النداءات المكررة السريعة (debug only)
const lastAddTimestamps = new Map();

// =====================
// إضافة عنصر للسلة (atomic) + logging + dedupe
// =====================
const addToCart = async (req, res) => {
  try {
    logger.info('[addToCart] incoming', {
      user: req.user && req.user.id,
      body: req.body,
      time: new Date().toISOString(),
    });

    const userId = req.user && req.user.id;
    const { id: itemId, quantity = 1 } = req.body;
    if (!userId) {
      logger.info('[addToCart] missing req.user');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: 'Item id is required' });
    }

    // تجاهل إذا أرسل الـ client كامل cartData (safety)
    if (req.body.cartData) {
      logger.info('[addToCart] client sent cartData - ignoring that field');
    }

    // dedupe بسيط: إذا نفس المستخدم أرسل نفس العنصر خلال 800ms اعتبره مكرر
    const key = `${userId}_${itemId}`;
    const now = Date.now();
    const last = lastAddTimestamps.get(key) || 0;
    if (now - last < 800) {
      logger.info('[addToCart] duplicate request detected, rejecting', {
        key,
        now,
        last,
      });
      return res
        .status(429)
        .json({ success: false, message: 'Duplicate request' });
    }
    lastAddTimestamps.set(key, now);

    // إجراء آتومي لزيادة الكمية
    const updated = await userModel.findByIdAndUpdate(
      userId,
      { $inc: { [`cartData.${itemId}`]: quantity } }, // 👈 استخدم الـ quantity من الـ body
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: 'User Not Found' });
    }

    logger.info('[addToCart] updated cart', { userId, cart: updated.cartData });
    // نرجّع الكارت المحدث (يمكن حذفه إن أردت)
    res.json({
      success: true,
      message: 'Added to Cart',
      cartData: updated.cartData || {},
    });
  } catch (err) {
    logger.error('[addToCart] error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// إزالة عنصر واحد من السلة أو حذف المفتاح تمامًا + logging
// =====================
const removeOneFromCart = async (req, res) => {
  try {
    logger.info('[removeOneFromCart] incoming', {
      user: req.user && req.user.id,
      body: req.body,
    });

    const userId = req.user && req.user.id;
    const { id: itemId } = req.body;

    if (!userId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!itemId)
      return res
        .status(400)
        .json({ success: false, message: 'Item id is required' });

    const userData = await userModel.findById(userId);
    if (!userData)
      return res
        .status(404)
        .json({ success: false, message: 'User Not Found' });

    const cartData = userData.cartData || {};
    const currentQty = Number(cartData[itemId] || 0);
    if (currentQty === 0)
      return res
        .status(404)
        .json({ success: false, message: 'Item not in cart' });

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

    logger.info('[removeOneFromCart] updated cart', {
      userId,
      cart: updated.cartData,
    });
    res.json({ success: true, cartData: updated.cartData || {} });
  } catch (err) {
    logger.error('[removeOneFromCart] error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// إزالة المنتج بشكل كامل من السلة
const removeFromCart = async (req, res) => {
  try {
    logger.info('[removeFromCart] incoming', {
      user: req.user && req.user.id,
      body: req.body,
    });

    const userId = req.user && req.user.id;
    const { id: itemId } = req.body;
    if (!userId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!itemId)
      return res
        .status(400)
        .json({ success: false, message: 'Item id is required' });

    const userData = await userModel.findById(userId);
    if (!userData)
      return res
        .status(404)
        .json({ success: false, message: 'User Not Found' });

    const cartData = userData.cartData || {};
    if (!Object.prototype.hasOwnProperty.call(cartData, itemId)) {
      return res
        .status(404)
        .json({ success: false, message: 'Item not in cart' });
    }

    const updated = await userModel.findByIdAndUpdate(
      userId,
      { $unset: { [`cartData.${itemId}`]: '' } },
      { new: true }
    );

    logger.info('[removeFromCart] updated cart', {
      userId,
      cart: updated.cartData,
    });
    res.json({ success: true, cartData: updated.cartData || {} });
  } catch (err) {
    logger.error('[removeFromCart] error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// جلب محتويات السلة + logging
// =====================
const getCart = async (req, res) => {
  try {
    logger.info('[getCart] incoming', { user: req.user && req.user.id });
    const userId = req.user && req.user.id;
    if (!userId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await userModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User Not Found' });

    res.json({ success: true, cartData: user.cartData || {} });
  } catch (err) {
    logger.error('[getCart] error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// تصفير السلة وإرجاعها (يرجع الكارت القديم ثم يفرغه)
// =====================
const clearCart = async (req, res) => {
  try {
    logger.info('[clearCart] incoming', { user: req.user && req.user.id });
    const userId = req.user && req.user.id;
    if (!userId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await userModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    const previousCart = user.cartData || {};
    user.cartData = {};
    await user.save();

    logger.info('[clearCart] cleared', { userId, previousCart });
    res.json({
      success: true,
      message: 'Cart fetched and cleared successfully',
      cartData: previousCart,
    });
  } catch (err) {
    logger.error('[clearCart] error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export { addToCart, removeFromCart, removeOneFromCart, getCart, clearCart };
