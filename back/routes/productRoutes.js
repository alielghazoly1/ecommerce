import express from 'express';
import multer from 'multer';
import {
  addProduct,
  listProducts,
  removeProduct,
} from '../controllers/productController.js';

const productRouter = express.Router();

// Use memory storage in serverless to avoid ENOENT when 'uploads' folder doesn't exist
const storage = multer.memoryStorage();

const upload = multer({ storage });

productRouter.post('/add', upload.single('image'), addProduct);
productRouter.get('/list', listProducts);
productRouter.post('/remove', removeProduct);

export default productRouter;