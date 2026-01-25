// productController.js - LOCAL STORAGE VERSION (بديل Cloudinary)
import productModel from '../models/productModel.js';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// ✅ حفظ الصورة محلياً (بديل Cloudinary)
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

  const { name, description, price, category } = req.body;

  // Validation - Fields
  if (!name || !description || !price || !category) {
    return res.status(400).json({
      success: false,
      message: 'جميع الحقول مطلوبة',
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

  try {
    // ✅ احفظ الصورة محلياً
    const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
    
    // تأكد من وجود المجلد
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // اسم فريد للصورة
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(req.file.originalname)}`;
    const filepath = path.join(uploadsDir, filename);

    // احفظ الملف
    fs.writeFileSync(filepath, req.file.buffer);

    logger.info('Image saved locally', { filename });

    // ✅ احفظ في Database
    const product = new productModel({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category: category.trim().toLowerCase(),
      image: filename, // ✅ احفظ اسم الملف فقط
    });

    await product.save();
    logger.info('Product added successfully', { 
      productId: product._id, 
      name: product.name 
    });

    res.json({
      success: true,
      message: 'تم إضافة المنتج بنجاح',
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        image: filename,
      },
    });

  } catch (error) {
    logger.error('Error in addProduct', { 
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة المنتج',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// ✅ حذف المنتج (مع حذف الصورة المحلية)
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

  // ✅ احذف الصورة من المجلد
  if (product.image) {
    const filepath = path.join(process.cwd(), 'uploads', 'images', product.image);
    
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
        logger.info('Image deleted from local storage', { filename: product.image });
      } catch (err) {
        logger.warn('Failed to delete image from local storage', { error: err.message });
      }
    }
  }

  // احذف من Database
  await productModel.findByIdAndDelete(id);
  logger.info('Product deleted successfully', { productId: id });

  res.json({
    success: true,
    message: 'Product Removed Successfully',
  });
});

// باقي الـ functions كما هي...
const listProducts = asyncHandler(async (req, res) => {
  const products = await productModel.find({ isActive: true });
  res.json({
    success: true,
    data: products,
    count: products.length,
  });
});

export { addProduct, listProducts, removeProduct };