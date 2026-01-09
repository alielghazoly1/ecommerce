import userModel from '../models/userModel.js';

// إضافة عنصر للسلة
const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { id: itemId } = req.body;
    const userData = await userModel.findById(userId);
    if (!userData)
      return res.status(404).json({ success: false, message: 'User Not Found' });

    const cartData = userData.cartData || {};

    cartData[itemId] = cartData[itemId] ? cartData[itemId] + 1 : 1;

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: 'Added to Cart', cartData });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// إزالة عنصر من السلة أو تصفيرها
const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { id: itemId } = req.body;

    const user = await userModel.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (itemId && user.cartData[itemId]) {
      user.cartData[itemId] -= 1;
      if (user.cartData[itemId] <= 0) delete user.cartData[itemId];
    } else if (!itemId) {
      user.cartData = {};
    }

    await user.save();
    res.json({
      success: true,
      message: itemId ? 'Item removed from cart' : 'Cart cleared successfully',
      cartData: user.cartData,
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// جلب محتويات السلة
const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User Not Found' });

    res.json({ success: true, cartData: user.cartData || {} });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// تصفير السلة وإرجاعها
const clearCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

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
    res.json({ success: false, message: err.message });
  }
};

export { addToCart, removeFromCart, getCart, clearCart };
