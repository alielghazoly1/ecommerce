// controllers/orderController.js - IMPROVED VERSION
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

// ----------------------
// Place Order (Cash on Delivery)
// ----------------------
const placeOrder = async (req, res) => {
  try {
    const { items, address, amount } = req.body;

    // ✅ Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required and must be a non-empty array',
      });
    }

    if (!address || typeof address !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Valid address is required',
      });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    // Validate address fields
    const requiredAddressFields = ['street', 'city', 'phone'];
    const missingFields = requiredAddressFields.filter(
      (field) => !address[field],
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing address fields: ${missingFields.join(', ')}`,
      });
    }

    console.log('[placeOrder] Creating order for user:', req.user.id);

    const newOrder = new orderModel({
      userId: req.user.id,
      items,
      address,
      amount,
    });

    await newOrder.save();
    console.log('[placeOrder] Order created:', newOrder._id);

    // Clear cart after successful order
    await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });
    console.log('[placeOrder] Cart cleared for user:', req.user.id);

    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId: newOrder._id,
      order: {
        id: newOrder._id,
        amount: newOrder.amount,
        status: newOrder.status,
        date: newOrder.date,
      },
    });
  } catch (err) {
    console.error('[placeOrder] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to place order',
    });
  }
};

// ----------------------
// User Orders (للمستخدم العادي)
// ----------------------
const userOrders = async (req, res) => {
  try {
    console.log('[userOrders] Fetching orders for user:', req.user.id);

    const orders = await orderModel
      .find({ userId: req.user.id })
      .populate('userId', 'name email')
      .sort({ date: -1 }); // الأحدث الأول

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      items: order.items,
      amount: order.amount,
      status: order.status,
      date: order.date,
      address: order.address,
      payment: order.payment,
    }));

    console.log('[userOrders] Found orders:', formattedOrders.length);

    res.json({
      success: true,
      data: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (err) {
    console.error('[userOrders] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch orders',
    });
  }
};

// ----------------------
// List All Orders (Admin فقط)
// ----------------------
const listOrders = async (req, res) => {
  try {
    console.log('[listOrders] Admin fetching all orders');

    const orders = await orderModel
      .find()
      .populate('userId', 'name email')
      .sort({ date: -1 }); // الأحدث الأول

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      userName: order.userId?.name || 'Unknown User',
      userEmail: order.userId?.email || 'Unknown Email',
      items: order.items,
      amount: order.amount,
      status: order.status,
      date: order.date,
      address: order.address,
      payment: order.payment,
    }));

    console.log('[listOrders] Total orders:', formattedOrders.length);

    res.json({
      success: true,
      data: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (err) {
    console.error('[listOrders] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch orders',
    });
  }
};

// ----------------------
// Update Order Status (Admin فقط)
// ----------------------
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // ✅ Validation
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const validStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    console.log(
      '[updateStatus] Updating order:',
      orderId,
      'to status:',
      status,
    );

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }, // Return updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    console.log('[updateStatus] Order updated successfully');

    res.json({
      success: true,
      message: 'Status Updated Successfully',
      order: {
        id: updatedOrder._id,
        status: updatedOrder.status,
      },
    });
  } catch (err) {
    console.error('[updateStatus] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update status',
    });
  }
};

export { placeOrder, userOrders, listOrders, updateStatus };
