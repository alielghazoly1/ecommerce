// utils/orderCleanup.js - Auto-delete old shipped/cancelled orders after 7 days

import orderModel from '../models/orderModel.js';
import logger from './logger.js';

const DAYS_TO_KEEP = 7;

export const cleanupOldOrders = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP);

    const result = await orderModel.deleteMany({
      status: { $in: ['shipped', 'delivered', 'cancelled'] },
      updatedAt: { $lt: cutoffDate },
    });

    if (result.deletedCount > 0) {
      logger.info(`🗑️ Order Cleanup: deleted ${result.deletedCount} old orders`, {
        deletedCount: result.deletedCount,
        olderThan: cutoffDate.toISOString(),
        statuses: ['shipped', 'delivered', 'cancelled'],
      });
    } else {
      logger.info('✅ Order Cleanup: no old orders to delete');
    }

    return result.deletedCount;
  } catch (err) {
    logger.error('❌ Order Cleanup failed', { error: err.message });
    throw err;
  }
};