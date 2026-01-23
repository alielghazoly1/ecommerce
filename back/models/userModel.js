// models/userModel.js - IMPROVED VERSION
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home',
  },
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
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
    required: true,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },

    phone: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
      default: null,
    },

    cartData: {
      type: Map,
      of: Number,
      default: {},
    },

    wishlist: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'product',
      default: [],
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'moderator'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    lastLogin: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    preferences: {
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'ar'],
      },
      currency: {
        type: String,
        default: 'EGP',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
    },

    metadata: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
      lastOrderDate: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
    minimize: false, // Keep empty objects
  },
);

// =====================
// Indexes for Performance
// =====================
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// =====================
// Virtual: Cart Items Count
// =====================
userSchema.virtual('cartItemsCount').get(function () {
  if (!this.cartData || this.cartData.size === 0) return 0;
  return Array.from(this.cartData.values()).reduce((sum, qty) => sum + qty, 0);
});

// =====================
// Virtual: Full Name (if needed later)
// =====================
userSchema.virtual('displayName').get(function () {
  return this.name;
});

// =====================
// Instance Methods
// =====================

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add to cart
userSchema.methods.addToCart = function (productId, quantity = 1) {
  const currentQty = this.cartData.get(productId.toString()) || 0;
  this.cartData.set(productId.toString(), currentQty + quantity);
  return this.save();
};

// Remove from cart
userSchema.methods.removeFromCart = function (productId) {
  this.cartData.delete(productId.toString());
  return this.save();
};

// Clear cart
userSchema.methods.clearCart = function () {
  this.cartData.clear();
  return this.save();
};

// Add to wishlist
userSchema.methods.addToWishlist = function (productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
  }
  return this.save();
};

// Remove from wishlist
userSchema.methods.removeFromWishlist = function (productId) {
  this.wishlist = this.wishlist.filter(
    (id) => id.toString() !== productId.toString(),
  );
  return this.save();
};

// Add address
userSchema.methods.addAddress = function (addressData) {
  // If this is the first address or marked as default, make it default
  if (this.addresses.length === 0 || addressData.isDefault) {
    // Remove default from other addresses
    this.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    addressData.isDefault = true;
  }
  this.addresses.push(addressData);
  return this.save();
};

// Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// =====================
// Static Methods
// =====================

// Get all admins
userSchema.statics.getAdmins = function () {
  return this.find({ role: 'admin', isActive: true });
};

// Get active users
userSchema.statics.getActiveUsers = function () {
  return this.find({ isActive: true, role: 'user' });
};

// Find by email (including inactive)
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// =====================
// Pre-save Middleware
// =====================
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// =====================
// Pre-remove Middleware (cleanup)
// =====================
userSchema.pre('remove', async function (next) {
  // You can add cleanup logic here
  // For example: delete user's orders, reviews, etc.
  next();
});

// =====================
// Ensure virtuals are included in JSON
// =====================
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpires;
    return ret;
  },
});

userSchema.set('toObject', { virtuals: true });

const userModel = mongoose.models.User || mongoose.model('User', userSchema);

export default userModel;
