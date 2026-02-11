// config/db.js - Vercel Optimized ✅
import mongoose from 'mongoose';

let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  // ✅ If already connected, return immediately
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ Using existing database connection');
    return mongoose.connection;
  }

  // ✅ If connection is in progress, wait for it
  if (connectionPromise) {
    console.log('⏳ Waiting for ongoing connection...');
    return await connectionPromise;
  }

  // Validate MongoDB URI
  if (!process.env.MONGODB_URI) {
    throw new Error('❌ MONGODB_URI is not defined in environment variables');
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    const maskedUri = process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log('📍 URI:', maskedUri);

    // ✅ Create new connection promise
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true,
      bufferCommands: false, // ✅ Critical for Vercel serverless!
    });

    const conn = await connectionPromise;
    
    isConnected = conn.connections[0].readyState === 1;
    
    if (isConnected) {
      console.log('✅ MongoDB Connected Successfully');
      console.log(`📊 Database: ${conn.connections[0].name}`);
      console.log(`🌍 Host: ${conn.connections[0].host}`);
      console.log(`🔌 Connection State: Connected (${conn.connections[0].readyState})`);
      console.log('-----------------------------------');
    } else {
      throw new Error('Connection established but not ready');
    }

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
      connectionPromise = null;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
      connectionPromise = null;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    isConnected = false;
    connectionPromise = null;
    throw error;
  }
};

export default connectDB;