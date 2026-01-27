// productController.js - COMPLETE VERSION WITH ALL FIELDS
import productModel from '../models/productModel.js';
import path from 'path';
import { promises as fs } from 'fs';
import logger from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add Product - Complete
const addProduct = asyncHandler(async (req, res) => {
  logger.info('Add product request received', {
    hasFile: !!req.file,
    productName: req.body.name,
  });

  // Validation - Image
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'صورة المنتج مطلوبة',
    });
  }

  const { name, description, price, category, stock, brand, isFeatured, tags } =
    req.body;

  // Validation - Required Fields
  if (!name || !description || !price || !category) {
    return res.status(400).json({
      success: false,
      message: 'جميع الحقول المطلوبة يجب ملؤها (الاسم، الوصف، السعر، الفئة)',
    });
  }

  // Validation - Price
  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: 'السعر يجب أن يكون رقماً موجباً',
    });
  }

  // Validation - Stock
  let parsedStock = 0;
  if (stock) {
    parsedStock = Number(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'الكمية يجب أن تكون رقماً موجباً أو صفر',
      });
    }
  }

  try {
    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      uploadStream.end(req.file.buffer);
    });

    logger.info('Image uploaded to Cloudinary', {
      public_id: result.public_id,
      url: result.secure_url,
    });

    // Parse tags if provided
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        // If parsing fails, try splitting by comma
        parsedTags = tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      }
    }

    // Generate SKU
    const prefix = category.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    const sku = `${prefix}-${random}`;

    // Create product object
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category: category.trim().toLowerCase(),
      image: result.secure_url,
      images: [result.secure_url], // Add to images array
      cloudinary_id: result.public_id,
      sku: sku,
      stock: parsedStock,
      isActive: true,
    };

    // Add optional fields if provided
    if (brand && brand.trim()) {
      productData.brand = brand.trim();
    }

    if (isFeatured === 'true' || isFeatured === true) {
      productData.isFeatured = true;
    }

    if (parsedTags.length > 0) {
      productData.tags = parsedTags;
    }

    // Save to database
    const product = new productModel(productData);
    await product.save();

    logger.info('Product added successfully', {
      productId: product._id,
      name: product.name,
      sku: product.sku,
    });

    res.json({
      success: true,
      message: 'تم إضافة المنتج بنجاح',
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: result.secure_url,
        sku: product.sku,
        stock: product.stock,
        brand: product.brand,
        isFeatured: product.isFeatured,
        tags: product.tags,
      },
    });
  } catch (error) {
    logger.error('Error in addProduct', {
      error: error.message,
      stack: error.stack,
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        details: Object.values(error.errors).map((err) => err.message),
      });
    }

    // If there's a duplicate SKU error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'حدث خطأ في إنشاء رقم المنتج. يرجى المحاولة مرة أخرى',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة المنتج',
      details:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});

// Remove Product
const removeProduct = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required',
    });
  }

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Delete image from Cloudinary
  if (product.cloudinary_id) {
    try {
      await cloudinary.uploader.destroy(product.cloudinary_id);
      logger.info('Image deleted from Cloudinary', {
        public_id: product.cloudinary_id,
      });
    } catch (err) {
      logger.warn('Failed to delete image from Cloudinary', {
        error: err.message,
        public_id: product.cloudinary_id,
      });
    }
  }

  await productModel.findByIdAndDelete(id);
  logger.info('Product deleted successfully', { productId: id });

  res.json({
    success: true,
    message: 'Product Removed Successfully',
  });
});

// List Products
const listProducts = asyncHandler(async (req, res) => {
  const products = await productModel
    .find({ isActive: true })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: products,
    count: products.length,
  });
});

// Get Single Product
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

// Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock, brand, isFeatured, tags } =
    req.body;

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Update fields
  if (name) product.name = name.trim();
  if (description) product.description = description.trim();
  if (price) product.price = Number(price);
  if (category) product.category = category.trim().toLowerCase();
  if (stock !== undefined) product.stock = Number(stock);
  if (brand !== undefined) product.brand = brand.trim();
  if (isFeatured !== undefined)
    product.isFeatured = isFeatured === 'true' || isFeatured === true;

  if (tags) {
    try {
      product.tags = JSON.parse(tags);
    } catch (e) {
      product.tags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    }
  }

  // Update image if provided
  if (req.file) {
    // Delete old image from Cloudinary
    if (product.cloudinary_id) {
      try {
        await cloudinary.uploader.destroy(product.cloudinary_id);
        logger.info('Old image deleted from Cloudinary', {
          public_id: product.cloudinary_id,
        });
      } catch (err) {
        logger.warn('Failed to delete old image from Cloudinary', {
          error: err.message,
          public_id: product.cloudinary_id,
        });
      }
    }

    // Upload new image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      uploadStream.end(req.file.buffer);
    });

    product.image = result.secure_url;
    product.cloudinary_id = result.public_id;

    // Update images array
    if (!product.images.includes(result.secure_url)) {
      product.images.push(result.secure_url);
    }

    logger.info('New image uploaded to Cloudinary', {
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  await product.save();

  logger.info('Product updated successfully', { productId: id });

  res.json({
    success: true,
    message: 'Product updated successfully',
    product,
  });
});

export { addProduct, listProducts, removeProduct, getProduct, updateProduct };
