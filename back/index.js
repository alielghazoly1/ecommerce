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

// Health + favicon early to avoid hitting DB or heavy routes
app.get('/', (req, res) => res.send('API running'));
app.get('/test', (req, res) => res.send('API working'));
app.get('/favicon.ico', (req, res) => res.status(204).end()); // fast no-content

// Static images (keep this, but note vercel routes must not override /images)
app.use('/images', express.static('uploads'));

// Middleware to ensure DB connected only when needed
const ensureDb = async (req, res, next) => {
  // Only try to connect if MONGODB_URI is set and mongoose isn't already connected
  if (process.env.MONGODB_URI) {
    try {
      await connectDB(); // connectDB will be idempotent / fast-fail (see config/db.js)
      return next();
    } catch (err) {
      // If DB unreachable, log and optionally allow endpoints that don't need DB to run
      console.error('ensureDb: DB connect failed', err && (err.message || err));
      // If the route definitely needs DB, respond with 503
      const routesThatNeedDb = ['/api/user', '/api/order', '/api/product', '/api/cart', '/api/admin'];
      if (routesThatNeedDb.some(r => req.path.startsWith(r))) {
        return res.status(503).json({ error: 'Database unavailable. Please try later.' });
      }
      // Otherwise continue (for static or health checks)
    }
  }
  next();
};

// Attach ensureDb middleware before API routes
app.use(ensureDb);

// Routes
app.use('/api/user', userRouter);
app.use('/api/order', orderRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin', adminRouter);

// Local dev only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

// ✅ EXPORT MUST BE LAST
export default serverless(app);