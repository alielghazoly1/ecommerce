// controllers/productController.js - Cloudinary Solution
import productModel from '../models/productModel.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'ecommerce-products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
};

// Helper: Delete from Cloudinary
const deleteFromCloudinary = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

// =====================
// Add Product with Cloudinary
// =====================
const addProduct = async (req, res) => {
  try {
    console.log('--- New addProduct request ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    console.log('[addProduct] Request received:', {
      body: req.body,
      hasFile: !!req.file,
    });

    // Validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    const { name, description, price, category } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Upload to Cloudinary
    console.log('[addProduct] Uploading to Cloudinary...');
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    console.log('[addProduct] Upload successful:', uploadResult.secure_url);

    const product = new productModel({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      image: uploadResult.secure_url, // Store Cloudinary URL
      cloudinary_id: uploadResult.public_id, // Store public_id for deletion
    });

    await product.save();
    console.log('[addProduct] Product saved successfully:', product._id);

    res.json({
      success: true,
      message: 'Product Added Successfully',
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
    });
  } catch (err) {
    console.error('[addProduct] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to add product',
    });
  }
};

// =====================
// List All Products
// =====================
const listProducts = async (req, res) => {
  try {
    console.log('[listProducts] Fetching all products');

    const products = await productModel.find({});

    console.log('[listProducts] Found products:', products.length);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    console.error('[listProducts] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch products',
    });
  }
};

// =====================
// Remove Product (with Cloudinary cleanup)
// =====================
const removeProduct = async (req, res) => {
  try {
    console.log('[removeProduct] Request:', req.body);

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

    // Delete from Cloudinary if cloudinary_id exists
    if (product.cloudinary_id) {
      try {
        await deleteFromCloudinary(product.cloudinary_id);
        console.log(
          '[removeProduct] Deleted from Cloudinary:',
          product.cloudinary_id,
        );
      } catch (cloudinaryErr) {
        console.error(
          '[removeProduct] Cloudinary delete error:',
          cloudinaryErr,
        );
        // Continue anyway - we still want to delete from DB
      }
    }

    // Delete from database
    await productModel.findByIdAndDelete(id);
    console.log('[removeProduct] Product deleted from DB:', id);

    res.json({
      success: true,
      message: 'Product Removed Successfully',
    });
  } catch (err) {
    console.error('[removeProduct] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to remove product',
    });
  }
};

export { addProduct, listProducts, removeProduct };
