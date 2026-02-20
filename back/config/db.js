// config/db.js — Vercel Serverless Cached Connection ✅
import mongoose from 'mongoose';

// ✅ استخدام global عشان الـ cache يفضل موجود بين الـ invocations على Vercel
// لو مش Vercel، متغيرات عادية بتشتغل بنفس الطريقة
const globalWithMongoose = global;

if (!globalWithMongoose._mongooseCache) {
  globalWithMongoose._mongooseCache = {
    conn:    null,   // الاتصال الحالي
    promise: null,   // الـ promise اللي بينتظر الاتصال
  };
}

const cache = globalWithMongoose._mongooseCache;

const connectDB = async () => {
  // ✅ لو في اتصال جاهز — رجّعه فوراً
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  // ✅ لو في اتصال بيتعمل دلوقتي — استنّاه
  if (cache.promise) {
    cache.conn = await cache.promise;
    return cache.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('❌ MONGODB_URI is not defined in environment variables');
  }

  const maskedUri = process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log('🔄 Connecting to MongoDB...', maskedUri);

  // ✅ حفظ الـ promise قبل الـ await — ده بيمنع race condition
  cache.promise = mongoose
    .connect(process.env.MONGODB_URI, {
      maxPoolSize:              10,
      minPoolSize:               2,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS:          45000,
      family:                    4,
      retryWrites:            true,
      retryReads:             true,
      bufferCommands:         false,  // ✅ ضروري على Vercel
    })
    .then((mongooseInstance) => {
      console.log('✅ MongoDB Connected:', mongooseInstance.connection.host);
      return mongooseInstance;
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      // ✅ مسح الـ cache عند الفشل عشان المحاولة الجاية تشتغل
      cache.promise = null;
      cache.conn    = null;
      throw err;
    });

  cache.conn = await cache.promise;

  // Handle disconnect — reset cache عشان المحاولة الجاية تعمل reconnect
  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected — resetting cache');
    cache.conn    = null;
    cache.promise = null;
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
    cache.conn    = null;
    cache.promise = null;
  });

  return cache.conn;
};

export default connectDB;