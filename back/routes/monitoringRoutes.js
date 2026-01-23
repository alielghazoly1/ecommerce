// routes/monitoringRoutes.js - System Monitoring Routes
import express from 'express';
import os from 'os';
import logger from '../utils/logger.js';
import { getQueryStats, resetQueryStats } from '../utils/dbLogger.js';
import { getActiveRequests } from '../middleware/requestLogger.js';
import authMiddleware from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const monitoringRouter = express.Router();

// All monitoring routes require admin access
monitoringRouter.use(authMiddleware, adminOnly);

// =====================
// System Health Check
// =====================
monitoringRouter.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptime,
      formatted: formatUptime(uptime),
    },
    memory: {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
    },
    cpu: {
      usage: process.cpuUsage(),
      loadAverage: os.loadavg(),
      cores: os.cpus().length,
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    },
  };

  logger.info('Health check performed');
  res.json({ success: true, data: health });
});

// =====================
// Get Recent Logs
// =====================
monitoringRouter.get('/logs', (req, res) => {
  const { limit = 100, level } = req.query;

  let logs;
  if (level) {
    logs = logger.getLogsByLevel(level.toUpperCase(), Number(limit));
  } else {
    logs = logger.getRecentLogs(Number(limit));
  }

  res.json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

// =====================
// Get Error Logs
// =====================
monitoringRouter.get('/logs/errors', (req, res) => {
  const { limit = 50 } = req.query;
  const errors = logger.getErrors(Number(limit));

  res.json({
    success: true,
    count: errors.length,
    data: errors,
  });
});

// =====================
// Clear Logs
// =====================
monitoringRouter.post('/logs/clear', (req, res) => {
  logger.clearLogs();
  res.json({
    success: true,
    message: 'Logs cleared successfully',
  });
});

// =====================
// Export Logs
// =====================
monitoringRouter.get('/logs/export', (req, res) => {
  const logsJson = logger.exportLogs();
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="logs-${timestamp}.json"`);
  res.send(logsJson);
});

// =====================
// Database Statistics
// =====================
monitoringRouter.get('/db/stats', (req, res) => {
  const stats = getQueryStats();

  res.json({
    success: true,
    data: stats,
  });
});

// =====================
// Reset Database Statistics
// =====================
monitoringRouter.post('/db/stats/reset', (req, res) => {
  resetQueryStats();
  res.json({
    success: true,
    message: 'Database statistics reset',
  });
});

// =====================
// Active Requests
// =====================
monitoringRouter.get('/requests/active', (req, res) => {
  const activeRequests = getActiveRequests();

  res.json({
    success: true,
    count: activeRequests.length,
    data: activeRequests,
  });
});

// =====================
// System Metrics Dashboard
// =====================
monitoringRouter.get('/dashboard', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  const queryStats = getQueryStats();
  const activeRequests = getActiveRequests();
  const recentErrors = logger.getErrors(10);

  const dashboard = {
    timestamp: new Date().toISOString(),
    system: {
      uptime: formatUptime(uptime),
      platform: process.platform,
      nodeVersion: process.version,
    },
    memory: {
      used: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      percentage: `${((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2)}%`,
    },
    database: queryStats,
    activeRequests: {
      count: activeRequests.length,
      requests: activeRequests,
    },
    recentErrors: {
      count: recentErrors.length,
      errors: recentErrors.slice(0, 5), // Last 5 errors
    },
  };

  res.json({
    success: true,
    data: dashboard,
  });
});

// =====================
// Helper: Format Uptime
// =====================
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export default monitoringRouter;