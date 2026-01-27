// config/db.js - VERCEL OPTIMIZED
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Global variable to cache the connection
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if exists
  if (cachedConnection && mongoose.connection.readyState === 1) {
    logger.info('✅ Using cached database connection');
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    logger.error('❌ MONGODB_URI is not defined');
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    // Connection options optimized for Vercel
    const options = {
      serverSelectionTimeoutMS: 5000, // ✅ 5 seconds timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 10000,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
    };

    // Connect with timeout
    logger.info('🔌 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    cachedConnection = conn;
    
    logger.success('✅ MongoDB Connected Successfully', {
      host: conn.connection.host,
      name: conn.connection.name,
    });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error', { error: err.message });
      cachedConnection = null;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected');
      cachedConnection = null;
    });

    return conn;
  } catch (error) {
    logger.error('❌ MongoDB connection failed', {
      error: error.message,
      stack: error.stack,
    });
    cachedConnection = null;
    throw error;
  }
};

export default connectDB;