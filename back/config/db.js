import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not set — skipping DB connection');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error', err.message);
    // مفيش process.exit(1) على Vercel
  }
};

// **Default export**
export default connectDB;
