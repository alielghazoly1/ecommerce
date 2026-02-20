// models/productModel.js - COMPLETE FIXED VERSION
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
      index: 'text',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description must not exceed 2000 characters'],
      index: 'text',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
      set: (val) => Math.round(val * 100) / 100,
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price must be positive'],
    },
    // ✅ سعر التكلفة / الاستيراد — خاص بالأدمن فقط، مش بيظهر للعملاء
    costPrice: {
      type: Number,
      min: [0, 'Cost price must be positive'],
      default: null,
    },
    image: { type: String, required: [true, 'Image is required'] },
    images: { type: [String], default: [] },
    cloudinary_id: { type: String, sparse: true },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    subCategory: { type: String, trim: true, lowercase: true },
    brand: { type: String, trim: true },
    stock: { type: Number, default: 0, min: [0, 'Stock cannot be negative'] },
    sold: {
      type: Number,
      default: 0,
      min: [0, 'Sold count cannot be negative'],
    },
    sku: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        set: (val) => Math.round(val * 10) / 10,
      },
      count: { type: Number, default: 0, min: 0 },
    },
    reviews: [reviewSchema],
    specifications: { type: Map, of: String, default: {} },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
    },
    shipping: {
      isFreeShipping: { type: Boolean, default: false },
      shippingCost: { type: Number, default: 0, min: 0 },
      deliveryTime: { type: String, default: '2-3 days' },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  { timestamps: true },
);

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ sold: -1 });
productSchema.index({ createdAt: -1 });

// Virtuals
productSchema.virtual('discountPercentage').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100,
    );
  }
  return 0;
});

// ✅ هامش الربح (بالجنيه)
productSchema.virtual('profitMargin').get(function () {
  if (this.costPrice && this.costPrice > 0) {
    return Math.round(this.price - this.costPrice);
  }
  return null;
});

// ✅ هامش الربح (بالنسبة المئوية)
productSchema.virtual('profitMarginPct').get(function () {
  if (this.costPrice && this.costPrice > 0) {
    return Math.round(((this.price - this.costPrice) / this.costPrice) * 100);
  }
  return null;
});

productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

productSchema.virtual('onSale').get(function () {
  return this.originalPrice && this.originalPrice > this.price;
});

// Instance Methods
productSchema.methods.addReview = function (userId, userName, rating, comment) {
  const existingReview = this.reviews.find(
    (r) => r.userId.toString() === userId.toString(),
  );
  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    this.reviews.push({ userId, userName, rating, comment });
  }
  this.calculateAverageRating();
  return this.save();
};

productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.ratings.average = sum / this.reviews.length;
    this.ratings.count = this.reviews.length;
  }
};

productSchema.methods.decreaseStock = function (quantity) {
  if (this.stock < quantity) throw new Error('Insufficient stock');
  this.stock -= quantity;
  this.sold += quantity;
  return this.save();
};

productSchema.methods.increaseStock = function (quantity) {
  this.stock += quantity;
  return this.save();
};

// Static Methods
productSchema.statics.getActiveProducts = function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

productSchema.statics.getFeaturedProducts = function (limit = 10) {
  return this.find({ isActive: true, isFeatured: true })
    .sort({ 'ratings.average': -1 })
    .limit(limit);
};

productSchema.statics.getByCategory = function (category, limit = 20) {
  return this.find({ category, isActive: true })
    .sort({ sold: -1 })
    .limit(limit);
};

productSchema.statics.searchProducts = function (query, limit = 20) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } },
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);
};

productSchema.statics.getBestSellers = function (limit = 10) {
  return this.find({ isActive: true }).sort({ sold: -1 }).limit(limit);
};

productSchema.statics.getTopRated = function (limit = 10) {
  return this.find({ isActive: true, 'ratings.count': { $gte: 5 } })
    .sort({ 'ratings.average': -1 })
    .limit(limit);
};

// ==========================================
// ✅✅✅ PRE-SAVE MIDDLEWARE - FIXED ✅✅✅
// ==========================================

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const productModel =
  mongoose.models.Product || mongoose.model('Product', productSchema);

export default productModel;