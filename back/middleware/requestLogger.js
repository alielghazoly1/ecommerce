// middleware/requestLogger.js - HTTP Request Logging
import logger from '../utils/logger.js';

// Store for request tracking
const activeRequests = new Map();

// =====================
// Request Logger Middleware
// =====================
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Add request ID to request object
  req.requestId = requestId;

  // Store request start
  activeRequests.set(requestId, {
    method: req.method,
    url: req.originalUrl,
    startTime,
  });

  // Log incoming request (without body to avoid size issues)
  logger.http(`Incoming ${req.method} ${req.originalUrl}`, {
    requestId,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent') ? req.get('user-agent').substring(0, 100) : 'unknown',
    userId: req.user?._id || 'anonymous',
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend; // Restore original
    
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Determine log level based on status code
    let logLevel = 'http';
    if (statusCode >= 500) {
      logLevel = 'error';
    } else if (statusCode >= 400) {
      logLevel = 'warn';
    }

    // Log response
    logger[logLevel](`Response ${req.method} ${req.originalUrl}`, {
      requestId,
      statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || 0,
    });

    // Remove from active requests
    activeRequests.delete(requestId);

    return originalSend.call(this, data);
  };

  next();
};

// =====================
// Get Active Requests
// =====================
export const getActiveRequests = () => {
  const requests = [];
  const now = Date.now();

  for (const [requestId, data] of activeRequests.entries()) {
    requests.push({
      requestId,
      method: data.method,
      url: data.url,
      duration: `${now - data.startTime}ms`,
    });
  }

  return requests;
};

// =====================
// Performance Monitor
// =====================
export const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to ms

    // Warn if request is slow (> 1 second)
    if (duration > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.originalUrl}`, {
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
      });
    }

    // Error if very slow (> 5 seconds)
    if (duration > 5000) {
      logger.error(`Very slow request: ${req.method} ${req.originalUrl}`, {
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

export default requestLogger;