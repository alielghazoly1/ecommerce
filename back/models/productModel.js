// models/productModel.js - Updated for Cloudinary
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    cloudinary_id: {
      type: String, // Store Cloudinary public_id for deletion
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

const productModel =
  mongoose.models.product || mongoose.model('product', productSchema);

export default productModel;
