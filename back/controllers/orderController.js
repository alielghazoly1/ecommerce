// =====================
// orderController.js - UPDATED with new Order Model features
// =====================
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';

const placeOrder = async (req, res) => {
  try {
    const { items, address, amount, paymentMethod = 'cash', notes } = req.body;

    // Validation (already done in middleware, but double-check)
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required',
      });
    }

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
      userId: req.user.id,
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
    await userModel.findByIdAndUpdate(req.user.id, {
      cartData: {},
      $inc: {
        'metadata.totalOrders': 1,
        'metadata.totalSpent': calculatedTotal,
      },
      'metadata.lastOrderDate': new Date(),
    });

    console.log('[placeOrder] Order created:', newOrder.orderNumber);

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
  } catch (err) {
    console.error('[placeOrder] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to place order',
    });
  }
};

const userOrders = async (req, res) => {
  try {
    // Use static method from model
    const orders = await orderModel.getUserOrders(req.user.id, 50);

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
  } catch (err) {
    console.error('[userOrders] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch orders',
    });
  }
};

const listOrders = async (req, res) => {
  try {
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
  } catch (err) {
    console.error('[listOrders] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch orders',
    });
  }
};

const updateStatus = async (req, res) => {
  try {
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

    console.log('[updateStatus] Order updated:', orderId, 'Status:', status);

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
  } catch (err) {
    console.error('[updateStatus] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update status',
    });
  }
};

// New: Get today's orders
const getTodaysOrders = async (req, res) => {
  try {
    const orders = await orderModel.getTodaysOrders();

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error('[getTodaysOrders] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export { placeOrder, userOrders, listOrders, updateStatus, getTodaysOrders };

// =====================
// productController.js - UPDATED additions
// =====================

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await productModel.getFeaturedProducts(10);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    console.error('[getFeaturedProducts] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get best sellers
export const getBestSellers = async (req, res) => {
  try {
    const products = await productModel.getBestSellers(10);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    console.error('[getBestSellers] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const products = await productModel.searchProducts(q, 50);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    console.error('[searchProducts] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Add review to product
export const addProductReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.addReview(req.user.id, req.user.name, rating, comment);

    res.json({
      success: true,
      message: 'Review added successfully',
      ratings: product.ratings,
    });
  } catch (err) {
    console.error('[addProductReview] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
