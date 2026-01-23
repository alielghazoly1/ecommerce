// utils/dbLogger.js - Database Query Logging
import mongoose from 'mongoose';
import logger from './logger.js';

// Query statistics
const queryStats = {
  total: 0,
  slow: 0,
  failed: 0,
  avgDuration: 0,
  totalDuration: 0,
};

// =====================
// Setup Database Logging
// =====================
export const setupDatabaseLogging = () => {
  // Only in development or if explicitly enabled
  if (process.env.NODE_ENV === 'development' || process.env.DB_LOGGING === 'true') {
    // Log all queries
    mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
      logger.debug(`MongoDB Query: ${collectionName}.${methodName}`, {
        args: JSON.stringify(methodArgs),
      });
    });
  }

  // Connection events
  mongoose.connection.on('connected', () => {
    logger.success('MongoDB connected successfully', {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', {
      error: err.message,
      stack: err.stack,
    });
    queryStats.failed++;
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  // Track slow queries
  mongoose.plugin((schema) => {
    schema.pre('find', function () {
      this._startTime = Date.now();
    });

    schema.pre('findOne', function () {
      this._startTime = Date.now();
    });

    schema.pre('save', function () {
      this._startTime = Date.now();
    });

    schema.post('find', function () {
      if (this._startTime) {
        const duration = Date.now() - this._startTime;
        trackQuery('find', duration);
      }
    });

    schema.post('findOne', function () {
      if (this._startTime) {
        const duration = Date.now() - this._startTime;
        trackQuery('findOne', duration);
      }
    });

    schema.post('save', function () {
      if (this._startTime) {
        const duration = Date.now() - this._startTime;
        trackQuery('save', duration);
      }
    });
  });
};

// =====================
// Track Query Performance
// =====================
const trackQuery = (type, duration) => {
  queryStats.total++;
  queryStats.totalDuration += duration;
  queryStats.avgDuration = queryStats.totalDuration / queryStats.total;

  // Log slow queries (> 100ms)
  if (duration > 100) {
    queryStats.slow++;
    logger.warn(`Slow database query detected`, {
      type,
      duration: `${duration}ms`,
      threshold: '100ms',
    });
  }

  // Alert very slow queries (> 1000ms)
  if (duration > 1000) {
    logger.error(`Very slow database query`, {
      type,
      duration: `${duration}ms`,
      threshold: '1000ms',
    });
  }
};

// =====================
// Get Query Statistics
// =====================
export const getQueryStats = () => {
  return {
    ...queryStats,
    avgDuration: `${queryStats.avgDuration.toFixed(2)}ms`,
    totalDuration: `${queryStats.totalDuration.toFixed(2)}ms`,
    slowQueryPercentage: queryStats.total > 0 
      ? `${((queryStats.slow / queryStats.total) * 100).toFixed(2)}%` 
      : '0%',
  };
};

// =====================
// Reset Statistics
// =====================
export const resetQueryStats = () => {
  queryStats.total = 0;
  queryStats.slow = 0;
  queryStats.failed = 0;
  queryStats.avgDuration = 0;
  queryStats.totalDuration = 0;
  logger.info('Query statistics reset');
};