// api/index.js - Vercel Serverless Ready with Cookie Support 🍪
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser'; // 🍪 مهم جداً
import 'dotenv/config';

// Import database connection
import connectDB from '../config/db.js';

// Import routes
import userRouter from '../routes/userRoutes.js';
import orderRouter from '../routes/orderRoutes.js';
import productRouter from '../routes/productRoutes.js';
import cartRouter from '../routes/cartRoutes.js';
import adminRouter from '../routes/adminRoutes.js';
import monitoringRouter from '../routes/monitoringRoutes.js';

// Create Express App
const app = express();

// Logger
const logger = {
  info: (...args) => console.log('[INFO]', new Date().toISOString(), ...args),
  error: (...args) => console.error('[ERROR]', new Date().toISOString(), ...args),
  warn: (...args) => console.warn('[WARN]', new Date().toISOString(), ...args),
  success: (...args) => console.log('[SUCCESS]', new Date().toISOString(), ...args),
};

// Global Error Handlers
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err.message);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err.message);
});

// Trust Proxy (important for Vercel)
app.set('trust proxy', true);

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 🍪 Cookie Parser - لازم يكون قبل أي route
app.use(cookieParser());

// Body Parsing
app.use(express.json({ limit: '10mb', strict: true }));
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 100 }));

// Compression
app.use(compression());

// CORS Configuration
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
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (
      allowedOrigins.includes(origin) ||
      origin.includes('vercel.app') ||
      origin.includes('railway.app') ||
      origin.includes('koyeb.app')
    ) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request from:', origin);
      callback(null, true); // Allow for now (change to false in production)
    }
  },
  credentials: true, // 🔥 مهم جداً عشان الـ Cookies
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// =====================
// PUBLIC ROUTES (No DB/Auth Required)
// =====================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'running',
    message: '🛒 E-Commerce API is running with Cookie Auth 🍪',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      users: '/api/users',
      products: '/api/product',
      cart: '/api/cart',
      orders: '/api/order',
      admin: '/api/admin',
    }
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
// Database Connection Middleware
// =====================
const ensureDb = async (req, res, next) => {
  // Skip DB for health check routes
  const skipPaths = ['/', '/health', '/api/health', '/favicon.ico'];
  if (skipPaths.includes(req.path)) {
    return next();
  }

  // Validate MongoDB URI
  if (!process.env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set in environment variables');
    return res.status(503).json({
      success: false,
      message: 'Database configuration error',
      hint: 'Please set MONGODB_URI in your environment variables'
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

  // Connect to database
  try {
    await connectDB();
    
    // Verify connection is ready
    if (mongoose.connection.readyState !== 1) {
      logger.warn('Database not ready, state:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database not ready, please try again',
      });
    }
    
    next();
  } catch (err) {
    logger.error('Database connection failed:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Database connection failed',
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
    availableRoutes: [
      '/',
      '/health',
      '/api/health',
      '/api/users',
      '/api/product',
      '/api/cart',
      '/api/order',
      '/api/admin',
      '/api/monitoring'
    ]
  });
});

// =====================
// Global Error Handler (MUST BE LAST)
// =====================
app.use((err, req, res, next) => {
  logger.error('Global error handler:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// =====================
// START SERVER (Local/Docker only)
// =====================
const PORT = process.env.PORT || 4000;

if (!process.env.VERCEL) {
  // Connect to MongoDB first, then start server
  connectDB()
    .then(() => {
      const server = app.listen(PORT, '0.0.0.0', () => {
        logger.success('🚀 Server started successfully with Cookie Auth 🍪');
        logger.info('Port:', PORT);
        logger.info('Environment:', process.env.NODE_ENV || 'production');
        logger.info('Node Version:', process.version);
        logger.info('-----------------------------------');
      });

      const gracefulShutdown = (signal) => {
        logger.info(`${signal} received: closing gracefully...`);
        
        if (server) {
          server.close(() => logger.info('✅ HTTP server closed'));
        }
        
        if (mongoose.connection?.readyState === 1) {
          mongoose.connection.close(false, () => {
            logger.info('✅ MongoDB connection closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    })
    .catch((err) => {
      logger.error('Failed to connect to MongoDB. Server not started.');
      logger.error(err.message);
      process.exit(1);
    });
}

// =====================
// EXPORT FOR VERCEL SERVERLESS
// =====================
export default app;