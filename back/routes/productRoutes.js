// routes/productRoutes.js - FIXED & PROTECTED
import express from 'express';
import multer from 'multer';
import {
  addProduct,
  listProducts,
  removeProduct,
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
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// =====================
// PUBLIC ROUTES (أي حد يقدر يشوف المنتجات)
// =====================
productRouter.get('/list', listProducts);

// =====================
// ADMIN ONLY ROUTES (إضافة وحذف المنتجات للأدمن فقط)
// =====================
productRouter.post(
  '/add',
  authMiddleware,
  adminOnly,
  upload.single('image'),
  (err, req, res, next) => {
    // Handle multer errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size is too large. Maximum size is 5MB',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }
    next();
  },
  validateProduct,
  addProduct,
);

productRouter.post(
  '/remove',
  authMiddleware,
  adminOnly,
  validateMongoId('id'),
  removeProduct,
);

export default productRouter;
