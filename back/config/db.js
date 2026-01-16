// config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not set — skipping DB connection');
    return;
  }

  // If already connected (readyState 1), reuse
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    // already connected
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // fail fast (5s)
      socketTimeoutMS: 45000,
    });
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error', err && (err.message || err));
    // Throw so caller (ensureDb) can decide; do NOT process.exit in serverless environment
    throw err;
  }
};

export default connectDB;
