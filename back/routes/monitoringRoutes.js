// routes/monitoringRoutes.js - ENHANCED & CLEAN CODE ✨
import express from 'express';
import os from 'os';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { getQueryStats, resetQueryStats } from '../utils/dbLogger.js';
import { getActiveRequests } from '../middleware/requestLogger.js';
import authMiddleware from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const monitoringRouter = express.Router();

// =====================
// Middleware: All routes require admin access
// =====================
monitoringRouter.use(authMiddleware, adminOnly);

// =====================
// Helper Functions
// =====================
const formatUptime = (seconds) => {
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
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getSystemInfo = () => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptime,
      formatted: formatUptime(uptime),
    },
    memory: {
      process: {
        rss: formatBytes(memoryUsage.rss),
        heapTotal: formatBytes(memoryUsage.heapTotal),
        heapUsed: formatBytes(memoryUsage.heapUsed),
        external: formatBytes(memoryUsage.external),
        heapUsedPercentage: ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2),
      },
      system: {
        total: formatBytes(totalMem),
        free: formatBytes(freeMem),
        used: formatBytes(usedMem),
        usedPercentage: ((usedMem / totalMem) * 100).toFixed(2),
      },
    },
    cpu: {
      usage: process.cpuUsage(),
      loadAverage: os.loadavg().map(load => load.toFixed(2)),
      cores: os.cpus().length,
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      hostname: os.hostname(),
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A',
    },
  };
};

// =====================
// MAIN DASHBOARD - All metrics in one call
// =====================
monitoringRouter.get('/dashboard', async (req, res) => {
  try {
    const systemInfo = getSystemInfo();
    const queryStats = getQueryStats();
    const activeRequests = getActiveRequests();
    const recentErrors = logger.getErrors(10);

    const dashboard = {
      ...systemInfo,
      database: {
        ...systemInfo.database,
        stats: queryStats,
      },
      requests: {
        active: activeRequests.length,
        list: activeRequests,
      },
      errors: {
        count: recentErrors.length,
        recent: recentErrors.slice(0, 5),
      },
    };

    logger.info('Dashboard metrics retrieved');
    res.json({ success: true, data: dashboard });
  } catch (error) {
    logger.error('Dashboard metrics error', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve dashboard metrics',
      error: error.message 
    });
  }
});

// =====================
// SYSTEM HEALTH - Lightweight health check
// =====================
monitoringRouter.get('/health', (req, res) => {
  try {
    const health = getSystemInfo();
    logger.info('Health check performed');
    res.json({ success: true, data: health });
  } catch (error) {
    logger.error('Health check error', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Health check failed',
      error: error.message 
    });
  }
});

// =====================
// LOGS MANAGEMENT
// =====================

// Get all logs with filters
monitoringRouter.get('/logs', (req, res) => {
  try {
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
  } catch (error) {
    logger.error('Get logs error', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve logs',
      error: error.message 
    });
  }
});

// Get error logs only
monitoringRouter.get('/logs/errors', (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const errors = logger.getErrors(Number(limit));

    res.json({
      success: true,
      count: errors.length,
      data: errors,
    });
  } catch (error) {
    logger.error('Get error logs error', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve error logs',
      error: error.message 
    });
  }
});

// Clear all logs
monitoringRouter.post('/logs/clear', (req, res) => {
  try {
    logger.clearLogs();
    logger.info('Logs cleared by admin');
    res.json({
      success: true,
      message: 'Logs cleared successfully',
    });
  } catch (error) {
    logger.error('Clear logs error', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear logs',
      error: error.message 
    });
  }
});

// Export logs as JSON
monitoringRouter.get('/logs/export', (req, res) => {
  try {
    const logsJson = logger.exportLogs();
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="logs-${timestamp}.json"`);
    res.send(logsJson);
    
    logger.info('Logs exported by admin');
  } catch (error) {
    logger.error('Export logs error', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export logs',
      error: error.message 
    });
  }
});

// =====================
// DATABASE STATISTICS
// =====================

// Get database query stats
monitoringRouter.get('/db/stats', (req, res) => {
  try {
    const stats = getQueryStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get DB stats error', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve database statistics',
      error: error.message 
    });
  }
});

// Reset database statistics
monitoringRouter.post('/db/stats/reset', (req, res) => {
  try {
    resetQueryStats();
    logger.info('Database statistics reset by admin');
    res.json({
      success: true,
      message: 'Database statistics reset successfully',
    });
  } catch (error) {
    logger.error('Reset DB stats error', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset database statistics',
      error: error.message 
    });
  }
});

// =====================
// ACTIVE REQUESTS
// =====================
monitoringRouter.get('/requests/active', (req, res) => {
  try {
    const activeRequests = getActiveRequests();
    res.json({
      success: true,
      count: activeRequests.length,
      data: activeRequests,
    });
  } catch (error) {
    logger.error('Get active requests error', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve active requests',
      error: error.message 
    });
  }
});

// =====================
// SYSTEM METRICS (Real-time)
// =====================
monitoringRouter.get('/metrics', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    const metrics = {
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        percentage: ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2),
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: uptime,
      requests: {
        active: getActiveRequests().length,
      },
    };

    res.json({ success: true, data: metrics });
  } catch (error) {
    logger.error('Get metrics error', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve metrics',
      error: error.message 
    });
  }
});

export default monitoringRouter;