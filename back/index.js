// index.js - WORKS ON VERCEL & RAILWAY ✅
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import 'dotenv/config';

// =====================
// Import utilities (with fallbacks)
// =====================
let connectDB, logger;

try {
  const dbModule = await import('./config/db.js');
  connectDB = dbModule.default;
} catch (err) {
  console.warn('⚠️ Warning: config/db.js not found, using inline DB connection');
  let isConnected = false;
  connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
      console.log('✅ Using existing database connection');
      return;
    }
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI is not defined');
    }
    try {
      console.log('🔄 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      isConnected = true;
      console.log('✅ MongoDB Connected');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  };
}

try {
  const loggerModule = await import('./utils/logger.js');
  logger = loggerModule.default;
} catch (err) {
  console.warn('⚠️ Warning: utils/logger.js not found, using console');
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
    success: console.log,
    debug: console.log,
  };
}

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
app.use(
  express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 100 }),
);

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

logger.info('🌐 Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.includes('vercel.app') ||
      origin.includes('railway.app')
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
// Database Connection Middleware (SERVERLESS OPTIMIZED) ✅
// =====================
const ensureDb = async (req, res, next) => {
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
    '/api/monitoring',
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
      error: 'Database connection failed',
    });
  }
};

app.use(ensureDb);

// =====================
// Import Routes (with error handling)
// =====================
let userRouter, orderRouter, productRouter, cartRouter, adminRouter, monitoringRouter;

try {
  const userModule = await import('./routes/userRoutes.js');
  userRouter = userModule.default;
  app.use('/api/users', userRouter);
} catch (err) {
  console.warn('⚠️ Warning: userRoutes not loaded');
  app.all('/api/users/*', (req, res) => {
    res.status(503).json({ success: false, message: 'Users routes not available' });
  });
}

try {
  const orderModule = await import('./routes/orderRoutes.js');
  orderRouter = orderModule.default;
  app.use('/api/order', orderRouter);
} catch (err) {
  console.warn('⚠️ Warning: orderRoutes not loaded');
  app.all('/api/order/*', (req, res) => {
    res.status(503).json({ success: false, message: 'Order routes not available' });
  });
}

try {
  const productModule = await import('./routes/productRoutes.js');
  productRouter = productModule.default;
  app.use('/api/product', productRouter);
} catch (err) {
  console.warn('⚠️ Warning: productRoutes not loaded');
  app.all('/api/product/*', (req, res) => {
    res.status(503).json({ success: false, message: 'Product routes not available' });
  });
}

try {
  const cartModule = await import('./routes/cartRoutes.js');
  cartRouter = cartModule.default;
  app.use('/api/cart', cartRouter);
} catch (err) {
  console.warn('⚠️ Warning: cartRoutes not loaded');
  app.all('/api/cart/*', (req, res) => {
    res.status(503).json({ success: false, message: 'Cart routes not available' });
  });
}

try {
  const adminModule = await import('./routes/adminRoutes.js');
  adminRouter = adminModule.default;
  app.use('/api/admin', adminRouter);
} catch (err) {
  console.warn('⚠️ Warning: adminRoutes not loaded');
  app.all('/api/admin/*', (req, res) => {
    res.status(503).json({ success: false, message: 'Admin routes not available' });
  });
}

try {
  const monitoringModule = await import('./routes/monitoringRoutes.js');
  monitoringRouter = monitoringModule.default;
  app.use('/api/monitoring', monitoringRouter);
} catch (err) {
  console.warn('⚠️ Warning: monitoringRoutes not loaded');
  app.all('/api/monitoring/*', (req, res) => {
    res.status(503).json({ success: false, message: 'Monitoring routes not available' });
  });
}

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
// START SERVER (WORKS ON BOTH VERCEL & RAILWAY) ✅
// =====================
const PORT = process.env.PORT || 8000;

if (!process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.success('🚀 Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'production',
      nodeVersion: process.version,
      pid: process.pid,
    });
    logger.info(`📍 Server: http://localhost:${PORT}`);
    logger.info(`📊 Health: http://localhost:${PORT}/health`);
  });

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
}

export default app;