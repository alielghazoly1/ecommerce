// models/orderModel.js - IMPROVED VERSION (FIXED)
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {           // سعر البيع الفعلي (بعد الخصم)
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {   // السعر قبل الخصم (لو فيه خصم)
    type: Number,
    default: null,
  },
  discountAmount: {  // مبلغ الخصم على المنتج × الكمية
    type: Number,
    default: 0,
  },
  costPrice: {       // سعر التكلفة (للأدمن فقط - لحساب الأرباح)
    type: Number,
    default: null,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Index for faster queries
    },

    orderNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values during creation
    },

    items: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },

    subtotal: {        // مجموع المنتجات قبل الشحن والخصم
      type: Number,
      default: 0,
    },
    totalDiscount: {   // إجمالي الخصومات على المنتجات
      type: Number,
      default: 0,
    },
    shippingFee: {     // مصاريف الشحن (ثابتة 60 ج)
      type: Number,
      default: 60,
    },
    totalAmount: {     // الإجمالي النهائي = subtotal - discount + shippingFee
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount must be positive'],
    },

    shippingAddress: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        default: 'Egypt',
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
      },

      // ✅ GPS Location (اختياري)
      location: {
        latitude: {
          type: Number,
          min: [-90, 'Invalid latitude'],
          max: [90, 'Invalid latitude'],
        },
        longitude: {
          type: Number,
          min: [-180, 'Invalid longitude'],
          max: [180, 'Invalid longitude'],
        },
        accuracy: {
          type: Number,
          min: 0,
        },
        placeName: {
          type: String,
          trim: true,
        },
      },
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      index: true, // Index for status queries
    },

    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online'],
      default: 'cash',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    isDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },

    trackingNumber: {
      type: String,
      sparse: true,
    },

    cancelReason: {
      type: String,
      maxlength: [300, 'Cancel reason cannot exceed 300 characters'],
    },

    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

// =====================
// Indexes for Performance
// =====================
orderSchema.index({ userId: 1, createdAt: -1 }); // User's recent orders
orderSchema.index({ status: 1, createdAt: -1 }); // Orders by status

// =====================
// Virtual: Total Items Count
// =====================
orderSchema.virtual('itemsCount').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// =====================
// Pre-save Middleware: Generate Order Number
// ✅ FIXED: Using async function without next()
// =====================
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  // ✅ No next() needed in async functions
});

// =====================
// Instance Methods
// =====================

// Mark as paid
orderSchema.methods.markAsPaid = function () {
  this.isPaid = true;
  this.paymentStatus = 'paid';
  this.paidAt = new Date();
  return this.save();
};

// Mark as delivered
orderSchema.methods.markAsDelivered = function () {
  this.isDelivered = true;
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

// Cancel order
orderSchema.methods.cancelOrder = function (reason) {
  this.status = 'cancelled';
  this.cancelReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// =====================
// Static Methods
// =====================

// Get user's recent orders
orderSchema.statics.getUserOrders = function (userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email');
};

// Get orders by status
orderSchema.statics.getOrdersByStatus = function (status) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email');
};

// Get today's orders
orderSchema.statics.getTodaysOrders = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.find({
    createdAt: { $gte: today },
  }).sort({ createdAt: -1 });
};

// =====================
// Ensure virtuals are included in JSON
// =====================
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const orderModel =
  mongoose.models.Order || mongoose.model('Order', orderSchema);

export default orderModel;