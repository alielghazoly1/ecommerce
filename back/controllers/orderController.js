import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

// ----------------------
// Place Order (Cash on Delivery)
// ----------------------
const placeOrder = async (req, res) => {
  try {
    const { items, address, amount } = req.body;

    const newOrder = new orderModel({
      userId: req.user.id,
      items,
      address,
      amount,
    });

    await newOrder.save();

    // تفريغ سلة العميل بعد الطلب
    await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });

    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId: newOrder._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ----------------------
// User Orders
// ----------------------
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.user.id })
      .populate('userId', 'name email'); // 👈 يجيب الاسم والإيميل

    // نرجع البيانات جاهزة للفرونت
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      userName: order.userId?.name || 'مستخدم غير معروف',
      userEmail: order.userId?.email || 'مستخدم غير معروف',
      items: order.items,
      amount: order.amount,
      status: order.status,
      date: order.date,
      address: order.address,
      payment: order.payment,
    }));

    res.json({ success: true, data: formattedOrders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ----------------------
// List All Orders (Admin)
// ----------------------
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().populate('userId', 'name email');
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      userName: order.userId?.name || 'مستخدم غير معروف',
      userEmail: order.userId?.email || 'مستخدم غير معروف',
      items: order.items,
      amount: order.amount,
      status: order.status,
      date: order.date,
      address: order.address,
      payment: order.payment,
    }));
    res.json({ success: true, data: formattedOrders });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// ----------------------
// Update Order Status (Admin)
// ----------------------
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: 'Status Updated' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

export { placeOrder, userOrders, listOrders, updateStatus };
