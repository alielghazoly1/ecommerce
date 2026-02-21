// =====================
// orderController.js - UPDATED with Enhanced Response
// =====================
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import logger from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Place Order (User endpoint)
const placeOrder = asyncHandler(async (req, res) => {
  const { items, address, amount, paymentMethod = 'cash', notes } = req.body;

  // Validation
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

  // Prepare order items with product details
  const SHIPPING_FEE = 60; // مصاريف الشحن الثابتة
  const orderItems = [];
  let subtotal = 0;
  let totalDiscount = 0;

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

    // ✅ حساب الخصم على المنتج
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const itemDiscount = hasDiscount
      ? Math.round((product.originalPrice - product.price) * item.quantity * 100) / 100
      : 0;

    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,                          // سعر البيع الفعلي
      originalPrice: hasDiscount ? product.originalPrice : null,
      discountAmount: itemDiscount,                  // الخصم على المنتج × الكمية
      costPrice: product.costPrice || null,          // للأدمن (حساب الأرباح)
      quantity: item.quantity,
      image: product.image,
    });

    subtotal += product.price * item.quantity;
    totalDiscount += itemDiscount;

    // Decrease stock
    await product.decreaseStock(item.quantity);
  }

  const calculatedTotal = subtotal + SHIPPING_FEE;

  // Create order with new schema
  const newOrder = new orderModel({
    userId: req.user._id,
    items: orderItems,
    subtotal,
    totalDiscount,
    shippingFee: SHIPPING_FEE,
    totalAmount: calculatedTotal,
    shippingAddress: {
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'Egypt',
      phone: address.phone,
      // ✅ GPS location (optional)
      ...(address.location?.latitude && address.location?.longitude && {
        location: {
          latitude: address.location.latitude,
          longitude: address.location.longitude,
          accuracy: address.location.accuracy || null,
        },
      }),
    },
    paymentMethod,
    notes,
  });

  await newOrder.save();

  // Update user metadata
  await userModel.findByIdAndUpdate(req.user._id, {
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

// Get User Orders
const userOrders = asyncHandler(async (req, res) => {
  // Use static method from model
  const orders = await orderModel.getUserOrders(req.user._id, 50);

  const formattedOrders = orders.map((order) => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    items: order.items.map(item => ({
      _id: item._id,
      productId: item.productId,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice || null,   // ✅ للعميل يشوف الخصم
      discountAmount: item.discountAmount || 0,
      quantity: item.quantity,
      image: item.image || null,
      // ❌ costPrice مش بتظهر للعميل
    })),
    subtotal: order.subtotal || order.totalAmount,
    totalDiscount: order.totalDiscount || 0,
    shippingFee: order.shippingFee ?? 60,
    totalAmount: order.totalAmount,
    itemsCount: order.itemsCount,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    isPaid: order.isPaid,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt || null,
    trackingNumber: order.trackingNumber || null,
    notes: order.notes || '',
    cancelReason: order.cancelReason || null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    shippingAddress: order.shippingAddress,
    googleMapsLink: order.shippingAddress?.location?.latitude
      ? `https://www.google.com/maps?q=${order.shippingAddress.location.latitude},${order.shippingAddress.location.longitude}`
      : null,
    locationPlaceName: order.shippingAddress?.location?.placeName || null,
  }));

  res.json({
    success: true,
    data: formattedOrders,
    count: formattedOrders.length,
  });
});

// ✅ List Orders (Admin) - ENHANCED RESPONSE
const listOrders = asyncHandler(async (req, res) => {
  const { status, limit = 100 } = req.query;

  let orders;
  if (status) {
    orders = await orderModel
      .getOrdersByStatus(status)
      .populate('userId', 'name email phone');
  } else {
    orders = await orderModel
      .find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
  }

  // ✅ Enhanced formatting with complete user details
  const formattedOrders = orders.map((order) => {
    // Get user info safely
    const user = order.userId || {};
    
    return {
      _id: order._id,
      orderNumber: order.orderNumber,
      
      // ✅ User Information (Enhanced)
      userName: user.name || 'Unknown User',
      userEmail: user.email || 'No email provided',
      userPhone: user.phone || order.shippingAddress?.phone || 'N/A',
      userId: user._id || null,
      
      // ✅ Order Items with full details (admin sees costPrice + profit)
      items: order.items.map(item => {
        const lineTotal = (item.price || 0) * (item.quantity || 1);
        const lineCost  = item.costPrice ? item.costPrice * (item.quantity || 1) : null;
        return {
          _id: item._id,
          productId: item.productId,
          name: item.name,
          price: item.price || 0,
          originalPrice: item.originalPrice || null,   // ✅ سعر قبل الخصم
          discountAmount: item.discountAmount || 0,     // ✅ الخصم على هذا المنتج
          costPrice: item.costPrice || null,            // 🔒 للأدمن فقط
          quantity: item.quantity || 1,
          image: item.image || null,
          total: lineTotal,
          // ✅ هامش الربح على المنتج (للأدمن)
          profit: lineCost !== null ? Math.round(lineTotal - lineCost) : null,
          profitPct: lineCost !== null && lineCost > 0
            ? Math.round(((lineTotal - lineCost) / lineCost) * 100)
            : null,
        };
      }),
      
      // ✅ Order totals
      subtotal: order.subtotal || order.totalAmount || 0,
      totalDiscount: order.totalDiscount || 0,
      shippingFee: order.shippingFee ?? 60,
      totalAmount: order.totalAmount || 0,
      itemsCount: order.itemsCount || order.items?.length || 0,
      
      // ✅ Shipping Address (Full details)
      shippingAddress: {
        street: order.shippingAddress?.street || '',
        city: order.shippingAddress?.city || '',
        state: order.shippingAddress?.state || '',
        zipCode: order.shippingAddress?.zipCode || '',
        country: order.shippingAddress?.country || 'Egypt',
        phone: order.shippingAddress?.phone || '',
      },
      
      // ✅ Order Status
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      
      // ✅ Delivery Info
      isDelivered: order.isDelivered,
      deliveredAt: order.deliveredAt || null,
      isPaid: order.isPaid,
      paidAt: order.paidAt || null,
      
      // ✅ Tracking
      trackingNumber: order.trackingNumber || null,
      
      // ✅ Notes
      notes: order.notes || '',
      
      // ✅ Timestamps
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      
      // ✅ Cancel info (if applicable)
      cancelReason: order.cancelReason || null,
      cancelledAt: order.cancelledAt || null,

      // ✅ Google Maps link للأدمن
      googleMapsLink: order.shippingAddress?.location?.latitude
        ? `https://www.google.com/maps?q=${order.shippingAddress.location.latitude},${order.shippingAddress.location.longitude}`
        : null,
    };
  });

  res.json({
    success: true,
    data: formattedOrders,
    count: formattedOrders.length,
  });
});

// Update Order Status
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

// Get Today's Orders
const getTodaysOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel
    .getTodaysOrders()
    .populate('userId', 'name email phone');

  const formattedOrders = orders.map((order) => {
    const user = order.userId || {};
    
    return {
      _id: order._id,
      orderNumber: order.orderNumber,
      userName: user.name || 'Unknown User',
      userEmail: user.email || 'No email',
      userPhone: user.phone || order.shippingAddress?.phone || 'N/A',
      totalAmount: order.totalAmount || 0,
      itemsCount: order.itemsCount || 0,
      status: order.status,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
    };
  });

  res.json({
    success: true,
    count: formattedOrders.length,
    data: formattedOrders,
  });
});

// Update Order Location (User endpoint - يسمح لليوزر يضيف/يعدل موقعه بعد الطلب)
const updateLocation = asyncHandler(async (req, res) => {
  const { orderId, location } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required' });
  }

  if (!location?.latitude || !location?.longitude) {
    return res.status(400).json({ success: false, message: 'Valid location is required' });
  }

  const order = await orderModel.findOne({ _id: orderId, userId: req.user._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // ✅ فقط لو الأوردر لسه في مرحلة pending أو processing
  if (!['pending', 'processing'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'لا يمكن تعديل الموقع بعد شحن الطلب',
    });
  }

  order.shippingAddress.location = {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy || null,
    placeName: location.placeName || null,
  };

  await order.save();

  const googleMapsLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

  logger.info('Order location updated', { orderId, userId: req.user._id });

  res.json({
    success: true,
    message: 'تم تحديث الموقع بنجاح',
    googleMapsLink,
  });
});

export { placeOrder, userOrders, listOrders, updateStatus, getTodaysOrders, updateLocation };