// middleware/rateLimiter.js - Rate Limiting System (Development Friendly)
import logger from '../utils/logger.js';

// Store for request counts
const requestCounts = new Map();

// Configuration
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max requests per window

// =====================
// General Rate Limiter
// =====================
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  // Get or create record for this IP
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return next();
  }

  const record = requestCounts.get(ip);

  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
    return next();
  }

  // Check if limit exceeded
  if (record.count >= MAX_REQUESTS) {
    const timeLeft = Math.ceil((record.resetTime - now) / 1000 / 60);
    return res.status(429).json({
      success: false,
      message: `Too many requests. Please try again in ${timeLeft} minutes`,
      retryAfter: timeLeft,
    });
  }

  // Increment count
  record.count++;
  next();
};

// =====================
// Strict Rate Limiter (for sensitive endpoints)
// =====================
const strictRateLimiter = (maxRequests = 5, windowMs = 15 * 60 * 1000) => {
  const counts = new Map();

  return (req, res, next) => {
    // 🔥 Skip rate limiting in development mode
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true') {
      logger.debug('Rate limiting disabled in development mode');
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!counts.has(ip)) {
      counts.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    const record = counts.get(ip);

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    if (record.count >= maxRequests) {
      const timeLeft = Math.ceil((record.resetTime - now) / 1000 / 60);
      
      logger.warn('Rate limit exceeded', { 
        ip, 
        count: record.count, 
        maxRequests,
        timeLeft 
      });

      return res.status(429).json({
        success: false,
        message: `Too many attempts. Please try again in ${timeLeft} minutes`,
        retryAfter: timeLeft,
      });
    }

    record.count++;
    next();
  };
};

// =====================
// Cleanup old entries (runs every hour)
// =====================
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [ip, record] of requestCounts.entries()) {
    // ✅ Add 1 minute buffer to prevent edge cases
    if (now > record.resetTime + 60000) {
      requestCounts.delete(ip);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug(`Rate limiter cleaned ${cleaned} expired entries`);
  }
}, 15 * 60 * 1000); // Every 15 minutes

// Cleanup on process exit
process.on('SIGINT', () => {
  clearInterval(cleanupInterval);
});

process.on('SIGTERM', () => {
  clearInterval(cleanupInterval);
});

// =====================
// Rate limiters for specific routes
// =====================

// 🔧 Adjust limits based on environment
const isDevelopment = process.env.NODE_ENV === 'development';

// For login/register
// Development: 50 requests per 15 minutes
// Production: 5 requests per 15 minutes
export const authRateLimiter = strictRateLimiter(
  isDevelopment ? 50 : 5, 
  15 * 60 * 1000
);

// For password reset
export const passwordResetLimiter = strictRateLimiter(
  isDevelopment ? 20 : 3, 
  15 * 60 * 1000
);

// For admin operations
export const adminRateLimiter = strictRateLimiter(
  isDevelopment ? 100 : 20, 
  15 * 60 * 1000
);

// =====================
// Manual reset function (for development)
// =====================
export const resetRateLimit = (ip) => {
  requestCounts.delete(ip);
  logger.info('Rate limit reset for IP', { ip });
};

export default rateLimiter;