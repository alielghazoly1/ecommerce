// index.js - FIXED VERSION for Vercel ✅
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import 'dotenv/config';

// =====================
// Database Connection (MUST BE IMPORTED FROM config/db.js)
// =====================
import connectDB from './config/db.js';

// Import routes
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import monitoringRouter from './routes/monitoringRoutes.js';

// =====================
// Create Express App
// =====================
const app = express();

// =====================
// Logger Utility
// =====================
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  success: (...args) => console.log('[SUCCESS]', ...args),
};

// =====================
// Global Error Handlers
// =====================
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION', err.message);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION', err.message);
});

// =====================
// Trust Proxy
// =====================
app.set('trust proxy', true);

// =====================
// Security Headers
// =====================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// =====================
// Body Parsing
// =====================
app.use(express.json({ limit: '10mb', strict: true }));
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 100 }));

// =====================
// Performance
// =====================
app.use(compression());

// =====================
// CORS Configuration
// =====================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://ecommerce-nine-theta-34.vercel.app',
    ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.includes('vercel.app') ||
      origin.includes('railway.app') ||
      origin.includes('koyeb.app')
    ) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// =====================
// Health Check Routes (PUBLIC - NO AUTH - NO DB)
// =====================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'running',
    message: 'E-commerce API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

app.get('/health', (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1
      ? 'connected'
      : mongoose.connection.readyState === 2
        ? 'connecting'
        : 'disconnected';

  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
    },
    database: dbStatus,
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// =====================
// Database Connection Middleware - FIXED VERSION ✅
// =====================
const ensureDb = async (req, res, next) => {
  // Skip DB for health check routes
  if (
    req.path === '/' ||
    req.path === '/health' ||
    req.path === '/api/health' ||
    req.path === '/favicon.ico'
  ) {
    return next();
  }

  // Validate MongoDB URI
  if (!process.env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set');
    return res.status(503).json({
      success: false,
      message: 'Database configuration error',
    });
  }

  // Routes that need database
  const dbRoutes = [
    '/api/users',
    '/api/order',
    '/api/product',
    '/api/cart',
    '/api/admin',
    '/api/monitoring',
  ];

  const needsDb = dbRoutes.some((route) => req.path.startsWith(route));
  if (!needsDb) return next();

  // ✅ FIX: Actually wait for the connection!
  try {
    await connectDB();
    
    // Double check connection is ready
    if (mongoose.connection.readyState !== 1) {
      logger.warn('Database not ready, state:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database not ready',
      });
    }
    
    next();
  } catch (err) {
    logger.error('Database connection failed', err.message);
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: 'Database connection failed',
    });
  }
};

app.use(ensureDb);

// =====================
// API Routes
// =====================
app.use('/api/users', userRouter);
app.use('/api/order', orderRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin', adminRouter);
app.use('/api/monitoring', monitoringRouter);

// =====================
// 404 Handler
// =====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// =====================
// Error Handler (MUST BE LAST)
// =====================
app.use((err, req, res, next) => {
  logger.error('Global error handler', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// =====================
// START SERVER (for local/Docker)
// =====================
const PORT = process.env.PORT || 4000;

if (!process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.success('🚀 Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'production',
      nodeVersion: process.version,
    });
  });

  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received: closing gracefully`);
    if (server) server.close(() => logger.info('Server closed'));
    if (mongoose.connection?.readyState === 1) {
      mongoose.connection.close(false, () => {
        logger.info('MongoDB closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// =====================
// EXPORT FOR VERCEL
// =====================
export default app;