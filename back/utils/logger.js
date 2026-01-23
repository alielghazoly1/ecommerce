// utils/logger.js - Professional Logging System

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  HTTP: 3,
  DEBUG: 4,
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
    this.logs = []; // Store recent logs in memory
    this.maxLogs = 1000; // Keep last 1000 logs
  }

  // =====================
  // Get timestamp
  // =====================
  getTimestamp() {
    return new Date().toISOString();
  }

  // =====================
  // Format log message
  // =====================
  formatMessage(level, message, meta = {}) {
    const timestamp = this.getTimestamp();
    return {
      timestamp,
      level,
      message,
      meta,
      pid: process.pid,
      env: process.env.NODE_ENV || 'development',
    };
  }

  // =====================
  // Store log in memory
  // =====================
  storeLog(logEntry) {
    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  // =====================
  // Should log based on level
  // =====================
  shouldLog(level) {
    const currentLevel = LOG_LEVELS[this.level.toUpperCase()] || LOG_LEVELS.INFO;
    const messageLevel = LOG_LEVELS[level] || LOG_LEVELS.INFO;
    return messageLevel <= currentLevel;
  }

  // =====================
  // Core logging method
  // =====================
  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, meta);
    this.storeLog(logEntry);

    // Console output with colors
    const colorMap = {
      ERROR: colors.red,
      WARN: colors.yellow,
      INFO: colors.cyan,
      HTTP: colors.green,
      DEBUG: colors.magenta,
    };

    const color = colorMap[level] || colors.white;
    const timestamp = `${colors.dim}${logEntry.timestamp}${colors.reset}`;
    const levelTag = `${color}[${level}]${colors.reset}`;
    const messageText = `${colors.bright}${message}${colors.reset}`;

    console.log(`${timestamp} ${levelTag} ${messageText}`);

    // Log meta if exists
    if (Object.keys(meta).length > 0) {
      console.log(`${colors.dim}${JSON.stringify(meta, null, 2)}${colors.reset}`);
    }
  }

  // =====================
  // Convenience methods
  // =====================
  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  http(message, meta = {}) {
    this.log('HTTP', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  // =====================
  // Success log (special)
  // =====================
  success(message, meta = {}) {
    const timestamp = `${colors.dim}${this.getTimestamp()}${colors.reset}`;
    const tag = `${colors.green}[SUCCESS]${colors.reset}`;
    const msg = `${colors.bright}${message}${colors.reset}`;
    console.log(`${timestamp} ${tag} ${msg}`);
    
    if (Object.keys(meta).length > 0) {
      console.log(`${colors.dim}${JSON.stringify(meta, null, 2)}${colors.reset}`);
    }
  }

  // =====================
  // Get recent logs
  // =====================
  getRecentLogs(limit = 100) {
    return this.logs.slice(-limit);
  }

  // =====================
  // Get logs by level
  // =====================
  getLogsByLevel(level, limit = 100) {
    return this.logs
      .filter((log) => log.level === level)
      .slice(-limit);
  }

  // =====================
  // Get error logs
  // =====================
  getErrors(limit = 50) {
    return this.getLogsByLevel('ERROR', limit);
  }

  // =====================
  // Clear logs
  // =====================
  clearLogs() {
    const count = this.logs.length;
    this.logs = [];
    this.info(`Cleared ${count} logs`);
  }

  // =====================
  // Export logs to JSON
  // =====================
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;