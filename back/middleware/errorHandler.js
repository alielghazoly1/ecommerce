// middleware/errorHandler.js - Global Error Handler
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  // Log error with full details
  logger.error('Error Handler Caught Exception', {
    path: req.path,
    method: req.method,
    requestId: req.requestId,
    userId: req.user?.id,
    errorName: err.name,
    errorMessage: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // =====================
  // Mongoose Validation Error
  // =====================
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // =====================
  // Mongoose Duplicate Key Error (11000)
  // =====================
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // =====================
  // Mongoose Cast Error (Invalid ObjectId)
  // =====================
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // =====================
  // JWT Errors
  // =====================
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please login again';
  }

  // =====================
  // Multer Errors
  // =====================
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size is too large';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    } else {
      message = err.message;
    }
  }

  // =====================
  // MongoDB Connection Errors
  // =====================
  if (err.name === 'MongoServerError') {
    statusCode = 503;
    message = 'Database connection error';
  }

  if (err.name === 'MongoNetworkError') {
    statusCode = 503;
    message = 'Database network error';
  }

  // =====================
  // Send Response
  // =====================
  const response = {
    success: false,
    message,
  };

  // Add errors array if exists
  if (errors) {
    response.errors = errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// =====================
// Not Found Handler (404)
// =====================
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// =====================
// Async Error Wrapper (للتخلص من try-catch في كل controller)
// =====================
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;