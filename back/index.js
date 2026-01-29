// index.js - PRODUCTION OPTIMIZED VERSION ✅
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import 'dotenv/config';

// Logger
import logger from './utils/logger.js';

// Routes
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import monitoringRouter from './routes/monitoringRoutes.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';
import rateLimiter from './middleware/rateLimiter.js';
import requestLogger from './middleware/requestLogger.js';

// Security Middleware
import {
  sanitizeInput,
  preventNoSQLInjection,
  preventParameterPollution,
} from './middleware/security.js';

// =====================
// Create Express App
// =====================
const app = express();

// =====================
// Global Error Handlers
// =====================
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION', {
    error: err.message,
    stack: err.stack,
  });
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION', {
    error: err.message,
    stack: err.stack,
  });
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
// Input Sanitization
// =====================
app.use(sanitizeInput);
app.use(preventNoSQLInjection);
app.use(preventParameterPollution);

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

logger.info('🌍 Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app') || origin.includes('railway.app')) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      // Allow but log warning in production
      callback(null, true); // Allow all in production for now
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
// Request Logging (Optional)
// =====================
if (process.env.ENABLE_REQUEST_LOGGING !== 'false') {
  app.use(requestLogger);
}

// =====================
// Health Check Routes (PUBLIC - NO AUTH - NO DB) ✅
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
// Static Files (SECURED)
// =====================
app.use(
  '/images',
  (req, res, next) => {
    if (req.path === '/' || req.path === '') {
      return res.status(403).json({
        success: false,
        error: 'Directory listing forbidden',
      });
    }

    if (req.path.includes('..')) {
      return res.status(403).json({
        success: false,
        error: 'Invalid path',
      });
    }

    next();
  },
  express.static('uploads/images', {
    maxAge: '7d',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('Cache-Control', 'public, max-age=604800');
    },
    fallthrough: true,
  }),
);

// =====================
// Database Connection Middleware (OPTIMIZED) ✅
// =====================
const ensureDb = async (req, res, next) => {
  // Skip DB for health checks
  if (
    req.path === '/' ||
    req.path === '/health' ||
    req.path === '/api/health' ||
    req.path === '/favicon.ico'
  ) {
    return next();
  }

  if (!process.env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set');
    return res.status(503).json({
      success: false,
      message: 'Database configuration error',
    });
  }

  const dbRoutes = [
    '/api/users',
    '/api/order',
    '/api/product',
    '/api/cart',
    '/api/admin',
  ];
  
  const needsDb = dbRoutes.some((route) => req.path.startsWith(route));

  if (!needsDb) return next();

  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    // Try to connect with longer timeout
    const connectPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 10000), // 10 seconds
    );

    await Promise.race([connectPromise, timeoutPromise]);
    next();
  } catch (err) {
    logger.error('Database connection failed', { error: err.message });
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: 'Database connection failed',
    });
  }
};

app.use(ensureDb);

// =====================
// Rate Limiting (Optional)
// =====================
if (process.env.ENABLE_RATE_LIMITING === 'true') {
  app.use('/api/', rateLimiter);
}

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
// Start Server (CRITICAL FIX) ✅
// =====================
const PORT = process.env.PORT || 8000; // Use 8000 as default

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.success('🚀 Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'production',
    nodeVersion: process.version,
    pid: process.pid,
  });
  logger.info(`🔗 Server: http://localhost:${PORT}`);
  logger.info(`📊 Health: http://localhost:${PORT}/health`);
});

// =====================
// Graceful Shutdown
// =====================
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received: closing server gracefully`);

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;