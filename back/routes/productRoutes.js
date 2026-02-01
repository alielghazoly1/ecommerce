// routes/productRoutes.js - COMPLETE WITH UPDATE ROUTES
import express from 'express';
import multer from 'multer';
import {
  addProduct,
  updateProduct,
  removeProduct,
  listProducts,
  listAllProducts,
  getProduct,
  toggleProductStatus,
  bulkUpdateStock,
} from '../controllers/productController.js';
import authMiddleware from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { validateProduct, validateMongoId } from '../middleware/validation.js';

const productRouter = express.Router();

// =====================
// Multer Configuration
// =====================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// ✅ Multer error handler
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً. الحد الأقصى 5MB',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'خطأ في رفع الملف',
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'خطأ في رفع الملف',
    });
  }
  next();
};

// =====================
// PUBLIC ROUTES
// =====================
productRouter.get('/list', listProducts);
productRouter.get('/:id', getProduct);

// =====================
// ADMIN ONLY ROUTES
// =====================

// ✅ Add Product
productRouter.post(
  '/add',
  authMiddleware,
  adminOnly,
  upload.single('image'),
  multerErrorHandler,
  validateProduct,
  addProduct
);

// ✅ Update Product (with optional image)
productRouter.put(
  '/update/:id',
  authMiddleware,
  adminOnly,
  upload.single('image'),
  multerErrorHandler,
  validateMongoId('id'),
  updateProduct
);

// ✅ Delete Product
productRouter.delete(
  '/remove/:id',
  authMiddleware,
  adminOnly,
  validateMongoId('id'),
  removeProduct
);

// Alternative POST method for delete (for compatibility)
productRouter.post(
  '/remove',
  authMiddleware,
  adminOnly,
  validateMongoId('id'),
  removeProduct
);

// ✅ Toggle Product Status (Active/Inactive)
productRouter.patch(
  '/toggle-status/:id',
  authMiddleware,
  adminOnly,
  validateMongoId('id'),
  toggleProductStatus
);

// ✅ List All Products (including inactive) - للـ Dashboard
productRouter.get(
  '/admin/all',
  authMiddleware,
  adminOnly,
  listAllProducts
);

// ✅ Bulk Update Stock
productRouter.post(
  '/admin/bulk-update-stock',
  authMiddleware,
  adminOnly,
  bulkUpdateStock
);

export default productRouter;