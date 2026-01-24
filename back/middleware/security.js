// middleware/security.js - Complete Security Layer
import validator from 'validator';
import logger from '../utils/logger.js';

// =====================
// Sanitize Input Middleware
// =====================
export const sanitizeInput = (req, res, next) => {
  // Sanitize body
if (req.body) {
  Object.keys(req.body).forEach(key => {
    req.body[key] = sanitizeValue(req.body[key]);
  });
}
  // Sanitize query params
 if (req.query) {
  Object.keys(req.query).forEach(key => {
    req.query[key] = sanitizeValue(req.query[key]);
  });
}


  // Sanitize URL params
if (req.params) {
  Object.keys(req.params).forEach(key => {
    req.params[key] = sanitizeValue(req.params[key]);
  });
}

  next();
};

// =====================
// Sanitize Object Helper
// =====================
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeValue);
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeValue(obj[key]);
    }
  }
  return sanitized;
};

// =====================
// Sanitize Value Helper
// =====================
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    // Remove any HTML tags
    value = validator.stripLow(value);
    value = value.trim();

    // Escape HTML special characters
    value = validator.escape(value);

    // Remove potential SQL injection attempts
    value = value.replace(/['";\\]/g, '');

    return value;
  }

  if (typeof value === 'object' && value !== null) {
    return sanitizeObject(value);
  }

  return value;
};

// =====================
// Prevent NoSQL Injection
// =====================
export const preventNoSQLInjection = (req, res, next) => {
  const checkForInjection = (obj) => {
    if (typeof obj !== 'object' || obj === null) return false;

    for (const key in obj) {
      if (key.startsWith('$')) {
        return true; // MongoDB operator detected
      }

      if (typeof obj[key] === 'object' && checkForInjection(obj[key])) {
        return true;
      }
    }
    return false;
  };

  if (
    checkForInjection(req.body) ||
    checkForInjection(req.query) ||
    checkForInjection(req.params)
  ) {
    logger.warn('NoSQL injection attempt detected', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    return res.status(400).json({
      success: false,
      message: 'Invalid request format',
    });
  }

  next();
};

// =====================
// Security Headers Middleware
// =====================
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "img-src 'self' data: https:; " +
      "script-src 'self'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "font-src 'self' data:;",
  );

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
  }

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()',
  );

  next();
};

// =====================
// IP Blacklist Middleware
// =====================
const blacklistedIPs = new Set();
const ipAttempts = new Map();
const MAX_FAILED_ATTEMPTS = 10;
const BLACKLIST_DURATION = 60 * 60 * 1000; // 1 hour

export const ipBlacklist = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  // Check if IP is blacklisted
  if (blacklistedIPs.has(ip)) {
    logger.warn('Blacklisted IP attempted access', { ip, path: req.path });
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  next();
};

// =====================
// Track Failed Login Attempts
// =====================
export const trackFailedLogin = (ip) => {
  if (!ipAttempts.has(ip)) {
    ipAttempts.set(ip, { count: 0, firstAttempt: Date.now() });
  }

  const attempts = ipAttempts.get(ip);
  attempts.count++;

  if (attempts.count >= MAX_FAILED_ATTEMPTS) {
    blacklistedIPs.add(ip);
    logger.error('IP blacklisted due to failed attempts', {
      ip,
      attempts: attempts.count,
    });

    // Auto-remove after duration
    setTimeout(() => {
      blacklistedIPs.delete(ip);
      ipAttempts.delete(ip);
      logger.info('IP removed from blacklist', { ip });
    }, BLACKLIST_DURATION);
  }
};

// =====================
// Reset Failed Attempts (on successful login)
// =====================
export const resetFailedAttempts = (ip) => {
  ipAttempts.delete(ip);
};

// =====================
// Prevent Parameter Pollution
// =====================
export const preventParameterPollution = (req, res, next) => {
  // Check for duplicate parameters
  const checkDuplicates = (obj) => {
    if (typeof obj !== 'object' || obj === null) return false;

    for (const key in obj) {
      if (Array.isArray(obj[key]) && obj[key].length > 1) {
        // Allow arrays for specific fields
        const allowedArrayFields = ['items', 'tags', 'categories', 'images'];
        if (!allowedArrayFields.includes(key)) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkDuplicates(req.query)) {
    logger.warn('Parameter pollution detected', {
      ip: req.ip,
      query: req.query,
    });

    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
    });
  }

  next();
};

// =====================
// Request Size Limiter
// =====================
export const requestSizeLimiter = (maxSize = 10) => {
  return (req, res, next) => {
    const contentLength = req.get('content-length');

    if (contentLength && parseInt(contentLength) > maxSize * 1024 * 1024) {
      logger.warn('Request size exceeds limit', {
        ip: req.ip,
        size: contentLength,
        limit: `${maxSize}MB`,
      });

      return res.status(413).json({
        success: false,
        message: `Request size exceeds ${maxSize}MB limit`,
      });
    }

    next();
  };
};

// =====================
// CSRF Protection (for session-based auth)
// =====================
export const csrfProtection = (req, res, next) => {
  // For JWT-based auth, we don't need CSRF
  // But you can implement if using cookies
  next();
};

// =====================
// Detect Suspicious Activity
// =====================
const suspiciousPatterns = [
  /(\.\.|\/\/)/g, // Path traversal
  /<script>/gi, // XSS
  /union.*select/gi, // SQL injection
  /base64_decode/gi, // PHP injection
  /eval\(/gi, // Code injection
];

export const detectSuspiciousActivity = (req, res, next) => {
  const testString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(testString)) {
      logger.error('Suspicious activity detected', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        pattern: pattern.toString(),
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid request',
      });
    }
  }

  next();
};

// =====================
// Export all security middleware
// =====================
export default {
  sanitizeInput,
  preventNoSQLInjection,
  securityHeaders,
  ipBlacklist,
  trackFailedLogin,
  resetFailedAttempts,
  preventParameterPollution,
  requestSizeLimiter,
  csrfProtection,
  detectSuspiciousActivity,
};
