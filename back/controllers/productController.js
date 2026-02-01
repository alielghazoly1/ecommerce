// productController.js - PROFESSIONAL UPDATE SYSTEM
import productModel from '../models/productModel.js';
import logger from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =====================
// Add Product - مع originalPrice
// =====================
const addProduct = asyncHandler(async (req, res) => {
  logger.info('Add product request received', {
    hasFile: !!req.file,
    productName: req.body.name,
  });

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'صورة المنتج مطلوبة',
    });
  }

  const {
    name,
    description,
    price,
    originalPrice, // ✅ السعر القديم
    category,
    stock,
    brand,
    isFeatured,
    tags,
  } = req.body;

  // Validation
  if (!name || !description || !price || !category) {
    return res.status(400).json({
      success: false,
      message: 'جميع الحقول المطلوبة يجب ملؤها (الاسم، الوصف، السعر، الفئة)',
    });
  }

  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: 'السعر يجب أن يكون رقماً موجباً',
    });
  }

  // ✅ معالجة السعر القديم
  let parsedOriginalPrice = null;
  if (originalPrice) {
    parsedOriginalPrice = Number(originalPrice);
    if (isNaN(parsedOriginalPrice) || parsedOriginalPrice < parsedPrice) {
      return res.status(400).json({
        success: false,
        message: 'السعر القديم يجب أن يكون أكبر من أو يساوي السعر الحالي',
      });
    }
  }

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
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    logger.info('Image uploaded to Cloudinary', {
      public_id: result.public_id,
      url: result.secure_url,
    });

    // Parse tags
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
      }
    }

    // Generate SKU
    const prefix = category.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const sku = `${prefix}-${random}`;

    // Create product
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      originalPrice: parsedOriginalPrice, // ✅ إضافة السعر القديم
      category: category.trim().toLowerCase(),
      image: result.secure_url,
      images: [result.secure_url],
      cloudinary_id: result.public_id,
      sku: sku,
      stock: parsedStock,
      isActive: true,
    };

    if (brand && brand.trim()) {
      productData.brand = brand.trim();
    }

    if (isFeatured === 'true' || isFeatured === true) {
      productData.isFeatured = true;
    }

    if (parsedTags.length > 0) {
      productData.tags = parsedTags;
    }

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
      product,
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

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'حدث خطأ في إنشاء رقم المنتج. يرجى المحاولة مرة أخرى',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة المنتج',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// =====================
// Update Product - نظام احترافي
// =====================
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.info('Update product request', {
    productId: id,
    hasFile: !!req.file,
    fields: Object.keys(req.body),
  });

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'المنتج غير موجود',
    });
  }

  const {
    name,
    description,
    price,
    originalPrice, // ✅ السعر القديم
    category,
    stock,
    brand,
    isFeatured,
    isActive,
    tags,
  } = req.body;

  // ✅ Update name
  if (name !== undefined && name.trim()) {
    product.name = name.trim();
  }

  // ✅ Update description
  if (description !== undefined && description.trim()) {
    product.description = description.trim();
  }

  // ✅ Update price with validation
  if (price !== undefined) {
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'السعر يجب أن يكون رقماً موجباً',
      });
    }
    product.price = parsedPrice;
  }

  // ✅ Update originalPrice
  if (originalPrice !== undefined) {
    if (originalPrice === null || originalPrice === '') {
      product.originalPrice = null; // إزالة السعر القديم
    } else {
      const parsedOriginalPrice = Number(originalPrice);
      if (isNaN(parsedOriginalPrice) || parsedOriginalPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'السعر القديم يجب أن يكون رقماً موجباً',
        });
      }
      // التحقق من أن السعر القديم أكبر من السعر الحالي
      if (parsedOriginalPrice < product.price) {
        return res.status(400).json({
          success: false,
          message: 'السعر القديم يجب أن يكون أكبر من أو يساوي السعر الحالي',
        });
      }
      product.originalPrice = parsedOriginalPrice;
    }
  }

  // ✅ Update category
  if (category !== undefined && category.trim()) {
    product.category = category.trim().toLowerCase();
  }

  // ✅ Update stock
  if (stock !== undefined) {
    const parsedStock = Number(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'الكمية يجب أن تكون رقماً موجباً أو صفر',
      });
    }
    product.stock = parsedStock;
  }

  // ✅ Update brand
  if (brand !== undefined) {
    product.brand = brand.trim() || null;
  }

  // ✅ Update isFeatured
  if (isFeatured !== undefined) {
    product.isFeatured = isFeatured === 'true' || isFeatured === true;
  }

  // ✅ Update isActive
  if (isActive !== undefined) {
    product.isActive = isActive === 'true' || isActive === true;
  }

  // ✅ Update tags
  if (tags !== undefined) {
    try {
      product.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    } catch (e) {
      product.tags = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
    }
  }

  // ✅ Update image if provided
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

    // Upload new image
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
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

  logger.info('Product updated successfully', {
    productId: id,
    updatedFields: Object.keys(req.body),
  });

  res.json({
    success: true,
    message: 'تم تحديث المنتج بنجاح',
    product,
  });
});

// =====================
// Remove Product
// =====================
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

// =====================
// List Products
// =====================
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

// =====================
// List All Products (Admin) - including inactive
// =====================
const listAllProducts = asyncHandler(async (req, res) => {
  const products = await productModel.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: products,
    count: products.length,
  });
});

// =====================
// Get Single Product
// =====================
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

// =====================
// Toggle Product Status (Active/Inactive)
// =====================
const toggleProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await productModel.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'المنتج غير موجود',
    });
  }

  product.isActive = !product.isActive;
  await product.save();

  logger.info('Product status toggled', {
    productId: id,
    newStatus: product.isActive,
  });

  res.json({
    success: true,
    message: `تم ${product.isActive ? 'تفعيل' : 'إلغاء تفعيل'} المنتج بنجاح`,
    product,
  });
});

// =====================
// Bulk Update Stock
// =====================
const bulkUpdateStock = asyncHandler(async (req, res) => {
  const { updates } = req.body; // [{ id, stock }, ...]

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'يجب توفير قائمة التحديثات',
    });
  }

  const results = [];
  const errors = [];

  for (const update of updates) {
    try {
      const product = await productModel.findById(update.id);
      if (!product) {
        errors.push({ id: update.id, error: 'Product not found' });
        continue;
      }

      product.stock = Number(update.stock);
      await product.save();
      results.push({ id: update.id, success: true });
    } catch (error) {
      errors.push({ id: update.id, error: error.message });
    }
  }

  res.json({
    success: true,
    message: `تم تحديث ${results.length} منتج`,
    results,
    errors,
  });
});

export {
  addProduct,
  updateProduct,
  removeProduct,
  listProducts,
  listAllProducts,
  getProduct,
  toggleProductStatus,
  bulkUpdateStock,
};