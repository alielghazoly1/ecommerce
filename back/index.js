// index.js
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import compression from 'compression';
import connectDB from './config/db.js';
import 'dotenv/config';

import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import adminRouter from './routes/adminRoutes.js';

const app = express();

// Global error logging
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err && (err.stack || err));
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err && (err.stack || err));
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());

// Routes
app.use('/images', express.static('uploads'));
app.use('/api/user', userRouter);
app.use('/api/order', orderRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin', adminRouter);

// Root & test
app.get('/', (req, res) => res.send('API working'));
app.get('/test', (req, res) => res.send('API working'));

// DB
if (process.env.MONGODB_URI) {
  connectDB()
    .then(() => console.log('DB connected'))
    .catch((err) => console.error('DB connection failed', err));
} else {
  console.warn('MONGODB_URI not set — skipping DB connection');
}

// Local dev only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

// ✅ EXPORT MUST BE LAST
export default serverless(app);
