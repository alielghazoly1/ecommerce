// index.js - FINAL PRODUCTION-READY VERSION ✅
import express from 'express';
import serverless from 'serverless-http';
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
import errorHandler, { notFoundHandler } from './middleware/errorHandler.js';
import rateLimiter from './middleware/rateLimiter.js';
import requestLogger, {
  performanceMonitor,
} from './middleware/requestLogger.js';

// Security Middleware
import {
  sanitizeInput,
  preventNoSQLInjection,
  securityHeaders,
  ipBlacklist,
  preventParameterPollution,
  detectSuspiciousActivity,
} from './middleware/security.js';

const app = express();

// =====================
// Global Error Handlers
// =====================
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION', {
    error: err.message,
    stack: err.stack,
  });
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION', {
    error: err.message,
    stack: err.stack,
  });
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// =====================
// Trust Proxy (for Vercel/Cloudflare)
// =====================
app.set('trust proxy', 1);

// =====================
// Security Middleware (MUST BE FIRST)
// =====================
app.use(securityHeaders);
app.use(ipBlacklist);

// =====================
// Body Parsing with Security
// =====================
app.use(
  express.json({
    limit: '1mb',
    strict: true,
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
    parameterLimit: 100,
  }),
);

// =====================
// Input Sanitization & Security
// =====================
app.use(sanitizeInput);
app.use(preventNoSQLInjection);
app.use(preventParameterPollution);
app.use(detectSuspiciousActivity);

// =====================
// Performance Middleware
// =====================
app.use(compression());

// =====================
// CORS Configuration (STRICT)
// =====================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
};

app.use(cors(corsOptions));

// =====================
// Request Logging & Monitoring
// =====================
app.use(requestLogger);
app.use(performanceMonitor);

// =====================
// Health Check Routes (No Auth Required)
// =====================
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
    },
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// =====================
// Static Files (SECURED) ✅
// =====================
app.use(
  '/images',
  (req, res, next) => {
    // ✅ منع directory listing
    if (req.path === '/' || req.path === '') {
      return res.status(403).json({
        success: false,
        error: 'Directory listing forbidden',
      });
    }

    // ✅ منع الوصول للملفات خارج مجلد images
    if (req.path.includes('..')) {
      return res.status(403).json({
        success: false,
        error: 'Invalid path',
      });
    }

    next();
  },
  express.static('uploads/images', {
    maxAge: '7d', // ✅ Cache للأداء
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // ✅ أمان إضافي
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('Cache-Control', 'public, max-age=604800'); // 7 days
    },
    fallthrough: true, // ✅ إذا الملف مش موجود، يروح للـ 404 handler العام
  }),
);

// =====================
// Database Connection Middleware
// =====================
const ensureDb = async (req, res, next) => {
  if (!process.env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set');
    return next();
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
    await connectDB();
    next();
  } catch (err) {
    logger.error('Database connection failed', { error: err.message });
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
    });
  }
};

app.use(ensureDb);

// =====================
// Rate Limiting (Apply to all API routes)
// =====================
if (process.env.ENABLE_RATE_LIMITING !== 'false') {
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
// Error Handlers (MUST BE LAST)
// =====================
app.use(notFoundHandler);
app.use(errorHandler);

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

// =====================
// Local Development Server
// =====================
let server;
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  server = app.listen(PORT, () => {
    logger.success('🚀 Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      pid: process.pid,
    });
    logger.info(`🔗 Local: http://localhost:${PORT}`);
    logger.info(
      `📊 Monitoring: http://localhost:${PORT}/api/monitoring/dashboard`,
    );
    logger.info(`🔒 Security: All security features enabled`);
    logger.info(`📁 Images: http://localhost:${PORT}/images/`);
  });
}

// =====================
// Export for Serverless (Vercel)
// =====================
export default serverless(app);
