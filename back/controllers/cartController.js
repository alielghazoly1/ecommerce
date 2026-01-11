// cartController.js
import userModel from '../models/userModel.js';

// =====================
// إضافة عنصر للسلة
// =====================
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id; // التعديل هنا
    const { id: itemId } = req.body;

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User Not Found' });
    }

    const cartData = userData.cartData || {};
    cartData[itemId] = cartData[itemId] ? cartData[itemId] + 1 : 1;

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: 'Added to Cart', cartData });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// إزالة عنصر من السلة أو تصفيرها
// =====================
const removeOneFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: itemId } = req.body;

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User Not Found' });
    }

    const cartData = userData.cartData || {};

    if (cartData[itemId] > 1) {
      cartData[itemId] -= 1; // نقص واحد
    } else {
      delete cartData[itemId]; // لو الكمية 1 أو أقل، نحذف العنصر بالكامل
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, cartData });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// remove product completely from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: itemId } = req.body;

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User Not Found' });
    }

    // تأكد إن العنصر موجود في الكارت
    const cartData = userData.cartData || {};
    if (!Object.prototype.hasOwnProperty.call(cartData, itemId)) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    // حذف المفتاح بشكل atomic من المستند
    const updated = await userModel.findByIdAndUpdate(
      userId,
      { $unset: { [`cartData.${itemId}`]: "" } },
      { new: true }
    );

    res.json({ success: true, cartData: updated.cartData });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};





// =====================
// جلب محتويات السلة
// =====================
const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // التعديل هنا
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User Not Found' });
    }

    res.json({ success: true, cartData: user.cartData || {} });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// تصفير السلة وإرجاعها
// =====================
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id; // التعديل هنا
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const cartData = user.cartData || {};
    user.cartData = {};
    await user.save();

    res.json({
      success: true,
      message: 'Cart fetched and cleared successfully',
      cartData,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export { addToCart,removeFromCart, removeOneFromCart, getCart, clearCart };
