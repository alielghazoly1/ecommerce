// config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not set — skipping DB connection');
    return;
  }

  // If already connected, reuse the connection (important for serverless / warm reuses)
  if (
    mongoose.connection &&
    mongoose.connection.readyState &&
    mongoose.connection.readyState === 1
  ) {
    console.log('Database already connected (reusing existing connection)');
    return;
  }

  try {
    // Fail fast if DB is unreachable to avoid long blocking on cold start
    await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose v6+ sets useful defaults; include a server selection timeout to fail fast
      serverSelectionTimeoutMS: 5000, // try to connect for 5s then fail
      socketTimeoutMS: 45000,
      // useNewUrlParser / useUnifiedTopology are default in newer mongoose but safe to leave out
    });
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error', err && (err.message || err));
    // Don't exit process on Vercel; just log and continue so function can still serve requests that don't need DB
  }
};

// **Default export**
export default connectDB;
