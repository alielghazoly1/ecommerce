// index.js - FINAL PRODUCTION READY VERSION
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import compression from 'compression';
import connectDB from './config/db.js';
import 'dotenv/config';

// Routes
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import adminRouter from './routes/adminRoutes.js';

// Middleware
import errorHandler, { notFoundHandler } from './middleware/errorHandler.js';
import rateLimiter from './middleware/rateLimiter.js';

const app = express();

// =====================
// Global Error Handlers
// =====================
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION:', err?.stack || err);
});

process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err?.stack || err);
});

// =====================
// Security & Performance Middleware
// =====================

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// =====================
// Health Check Routes (no DB needed)
// =====================
app.get('/', (req, res) => {
  res.json({
    status: 'API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// =====================
// Static Files
// =====================
app.use('/images', express.static('uploads'));

// =====================
// Database Connection Middleware
// =====================
const ensureDb = async (req, res, next) => {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set - skipping DB connection');
    return next();
  }

  // Check if route needs database
  const dbRoutes = ['/api/users', '/api/order', '/api/product', '/api/cart', '/api/admin'];
  const needsDb = dbRoutes.some((route) => req.path.startsWith(route));

  if (!needsDb) {
    return next();
  }

  // Connect to database
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Database connection failed:', err?.message);
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again later.',
    });
  }
};

app.use(ensureDb);

// =====================
// Rate Limiting (apply to all API routes)
// =====================
app.use('/api/', rateLimiter);

// =====================
// API Routes
// =====================
app.use('/api/users', userRouter);
app.use('/api/order', orderRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin', adminRouter);

// =====================
// Error Handlers (must be last)
// =====================

// 404 Not Found
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// =====================
// Local Development Server
// =====================
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log('='.repeat(50));
  });
}

// =====================
// Export for Serverless (Vercel)
// =====================
export default serverless(app);