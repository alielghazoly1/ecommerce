// =====================
// orderController.js - UPDATED with new Order Model features
// =====================
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import logger from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// في orderController.js - تعديل بسيط في placeOrder
const placeOrder = asyncHandler(async (req, res) => {
  const { items, address, amount, paymentMethod = 'cash', notes } = req.body;

  // ✅ Validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    logger.warn('Order placement failed: Items are required', {
      requestId: req.requestId,
      userId: req.user._id,
      error: 'Items are required',
      itemsProvided: items,
    });
    return res.status(400).json({
      success: false,
      message: 'Items are required',
    });
  }

  if (!address || !address.street || !address.city || !address.phone) {
    logger.warn(
      'Order placement failed: Complete shipping address is required',
      {
        requestId: req.requestId,
        userId: req.user._id,
        error: 'Complete shipping address is required',
        addressProvided: address,
      },
    );
    return res.status(400).json({
      success: false,
      message: 'Complete shipping address is required',
    });
  }

  // ✅ باقي الكود كما هو...
  // Prepare order items with product details
  const orderItems = [];
  let calculatedTotal = 0;

  for (const item of items) {
    const product = await productModel.findById(item.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product ${item.id} not found`,
      });
    }

    if (!product.inStock || product.stock < item.quantity) {
      logger.warn('Order placement failed: Insufficient stock', {
        requestId: req.requestId,
        userId: req.user._id,
        error: `Insufficient stock for ${product.name}`,
        productId: product._id,
        productName: product.name,
        requestedQuantity: item.quantity,
        availableStock: product.stock,
      });
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}`,
      });
    }

    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
    });

    calculatedTotal += product.price * item.quantity;

    // Decrease stock
    await product.decreaseStock(item.quantity);
  }

  // Create order with new schema
  const newOrder = new orderModel({
    userId: req.user._id, // ✅ استخدم _id
    items: orderItems,
    totalAmount: calculatedTotal,
    shippingAddress: {
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'Egypt',
      phone: address.phone,
    },
    paymentMethod,
    notes,
  });

  await newOrder.save();

  // Update user metadata
  await userModel.findByIdAndUpdate(req.user._id, {
    // ✅ استخدم _id
    cartData: {},
    $inc: { 'metadata.totalOrders': 1, 'metadata.totalSpent': calculatedTotal },
    'metadata.lastOrderDate': new Date(),
  });

  logger.info('Order created successfully', {
    orderNumber: newOrder.orderNumber,
    orderId: newOrder._id,
  });

  res.json({
    success: true,
    message: 'Order placed successfully',
    order: {
      id: newOrder._id,
      orderNumber: newOrder.orderNumber,
      totalAmount: newOrder.totalAmount,
      status: newOrder.status,
      itemsCount: newOrder.itemsCount,
    },
  });
});

const userOrders = asyncHandler(async (req, res) => {
  // Use static method from model
  const orders = await orderModel.getUserOrders(req.user._id, 50);

  const formattedOrders = orders.map((order) => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    items: order.items,
    totalAmount: order.totalAmount,
    itemsCount: order.itemsCount,
    status: order.status,
    paymentStatus: order.paymentStatus,
    isPaid: order.isPaid,
    isDelivered: order.isDelivered,
    createdAt: order.createdAt,
    shippingAddress: order.shippingAddress,
  }));

  res.json({
    success: true,
    data: formattedOrders,
    count: formattedOrders.length,
  });
});

const listOrders = asyncHandler(async (req, res) => {
  const { status, limit = 100 } = req.query;

  let orders;
  if (status) {
    orders = await orderModel.getOrdersByStatus(status);
  } else {
    orders = await orderModel
      .find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
  }

  const formattedOrders = orders.map((order) => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    userName: order.userId?.name || 'Unknown',
    userEmail: order.userId?.email || 'Unknown',
    items: order.items,
    totalAmount: order.totalAmount,
    itemsCount: order.itemsCount,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    isDelivered: order.isDelivered,
    createdAt: order.createdAt,
    trackingNumber: order.trackingNumber,
  }));

  res.json({
    success: true,
    data: formattedOrders,
    count: formattedOrders.length,
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { orderId, status, trackingNumber } = req.body;

  const order = await orderModel.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Update status
  order.status = status;

  // If tracking number provided
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  // Auto-mark as delivered if status is delivered
  if (status === 'delivered') {
    await order.markAsDelivered();
  } else {
    await order.save();
  }

  logger.info('Order status updated', { orderId, status, trackingNumber });

  res.json({
    success: true,
    message: 'Status updated successfully',
    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
    },
  });
});

// New: Get today's orders
const getTodaysOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel.getTodaysOrders();

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

export { placeOrder, userOrders, listOrders, updateStatus, getTodaysOrders };
