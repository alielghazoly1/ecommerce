// config/db.js - Updated with Logging
import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { setupDatabaseLogging } from '../utils/dbLogger.js';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set – skipping DB connection');
    return;
  }

  // If already connected, reuse connection
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    logger.debug('Using existing database connection');
    return;
  }

  try {
    logger.info('Attempting to connect to MongoDB...');

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.success('Database connected successfully', {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });

    // Setup database logging
    setupDatabaseLogging();
  } catch (err) {
    logger.error('Database connection failed', {
      error: err.message,
      stack: err.stack,
    });
    throw err;
  }
};

export default connectDB;