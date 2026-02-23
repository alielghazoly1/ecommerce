// controllers/analyticsController.js
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import logger from '../utils/logger.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const startOf = (unit, ref = new Date()) => {
  const d = new Date(ref);
  if (unit === 'day')   { d.setHours(0,0,0,0); return d; }
  if (unit === 'week')  { d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; }
  if (unit === 'month') { d.setDate(1); d.setHours(0,0,0,0); return d; }
  if (unit === 'year')  { d.setMonth(0,1); d.setHours(0,0,0,0); return d; }
};

const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0,0,0,0); return d; };

const REVENUE_STATUSES = ['processing', 'shipped', 'delivered'];

// ─── 1. Dashboard Summary ─────────────────────────────────────────────────────
// GET /api/analytics/summary
// أرقام سريعة: إجمالي المبيعات، الطلبات، العملاء، متوسط الطلب — اليوم vs أمس

export const getSummary = async (req, res) => {
  try {
  const todayStart     = startOf('day');
  const yesterdayStart = daysAgo(1);
  const monthStart     = startOf('month');
  const yearStart      = startOf('year');

  const [
    totalOrders,
    todayOrders,
    yesterdayOrders,
    monthOrders,
    revenueAgg,
    todayRevenueAgg,
    yesterdayRevenueAgg,
    monthRevenueAgg,
    totalUsers,
    newUsersToday,
    pendingCount,
    processingCount,
    shippedCount,
    deliveredCount,
    cancelledCount,
  ] = await Promise.all([
    orderModel.countDocuments(),
    orderModel.countDocuments({ createdAt: { $gte: todayStart } }),
    orderModel.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: todayStart } }),
    orderModel.countDocuments({ createdAt: { $gte: monthStart } }),

    orderModel.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    orderModel.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    orderModel.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: yesterdayStart, $lt: todayStart } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    orderModel.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),

    userModel.countDocuments(),
    userModel.countDocuments({ createdAt: { $gte: todayStart } }),

    orderModel.countDocuments({ status: 'pending' }),
    orderModel.countDocuments({ status: 'processing' }),
    orderModel.countDocuments({ status: 'shipped' }),
    orderModel.countDocuments({ status: 'delivered' }),
    orderModel.countDocuments({ status: 'cancelled' }),
  ]);

  const totalRevenue     = revenueAgg[0]?.total || 0;
  const todayRevenue     = todayRevenueAgg[0]?.total || 0;
  const yesterdayRevenue = yesterdayRevenueAgg[0]?.total || 0;
  const monthRevenue     = monthRevenueAgg[0]?.total || 0;

  const pct = (curr, prev) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

  res.json({
    success: true,
    data: {
      revenue: {
        total:     totalRevenue,
        today:     todayRevenue,
        yesterday: yesterdayRevenue,
        month:     monthRevenue,
        todayChange: pct(todayRevenue, yesterdayRevenue), // % change vs yesterday
      },
      orders: {
        total:       totalOrders,
        today:       todayOrders,
        yesterday:   yesterdayOrders,
        month:       monthOrders,
        todayChange: pct(todayOrders, yesterdayOrders),
        byStatus: {
          pending:    pendingCount,
          processing: processingCount,
          shipped:    shippedCount,
          delivered:  deliveredCount,
          cancelled:  cancelledCount,
        },
      },
      customers: {
        total:     totalUsers,
        newToday:  newUsersToday,
      },
      averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    },
  });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 2. Revenue Over Time ─────────────────────────────────────────────────────
// GET /api/analytics/revenue?period=30d|12m|12w
// إيرادات يومية/أسبوعية/شهرية مناسبة للرسم البياني

export const getRevenueTrend = async (req, res) => {
  try {
  const { period = '30d' } = req.query;

  let groupBy, fromDate, dateFormat, labelFormat;

  if (period === '12m') {
    // آخر 12 شهر، تجميع شهري
    fromDate    = new Date(); fromDate.setMonth(fromDate.getMonth() - 12); fromDate.setDate(1); fromDate.setHours(0,0,0,0);
    groupBy     = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    dateFormat  = '%Y-%m';
    labelFormat = 'month';
  } else if (period === '12w') {
    // آخر 12 أسبوع، تجميع أسبوعي
    fromDate   = daysAgo(84);
    groupBy    = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
    labelFormat = 'week';
  } else {
    // آخر 30 يوم (default)، تجميع يومي
    fromDate    = daysAgo(30);
    groupBy     = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    labelFormat = 'day';
  }

  const results = await orderModel.aggregate([
    { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: fromDate } } },
    {
      $group: {
        _id:      groupBy,
        revenue:  { $sum: '$totalAmount' },
        orders:   { $sum: 1 },
        avgOrder: { $avg: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
  ]);

  // Build clean labels
  const formatted = results.map((r) => {
    let label;
    if (labelFormat === 'day') {
      label = `${r._id.year}-${String(r._id.month).padStart(2,'0')}-${String(r._id.day).padStart(2,'0')}`;
    } else if (labelFormat === 'month') {
      const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      label = `${monthNames[r._id.month - 1]} ${r._id.year}`;
    } else {
      label = `أسبوع ${r._id.week}`;
    }
    return {
      label,
      revenue:  Math.round(r.revenue),
      orders:   r.orders,
      avgOrder: Math.round(r.avgOrder),
    };
  });

  res.json({ success: true, period, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 3. Top Products ──────────────────────────────────────────────────────────
// GET /api/analytics/top-products?limit=10&period=30d
// أكتر المنتجات مبيعاً بالكمية والإيراد

export const getTopProducts = async (req, res) => {
  try {
  const limit  = Math.min(parseInt(req.query.limit) || 10, 50);
  const period = req.query.period || '30d';
  const fromDate = period === 'all' ? new Date(0) : daysAgo(period === '7d' ? 7 : period === '30d' ? 30 : 90);

  const results = await orderModel.aggregate([
    { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: fromDate } } },
    { $unwind: '$items' },
    {
      $group: {
        _id:        '$items.productId',
        name:       { $first: '$items.name' },
        image:      { $first: '$items.image' },
        totalSold:  { $sum: '$items.quantity' },
        revenue:    { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orderCount: { $sum: 1 },
        avgPrice:   { $avg: '$items.price' },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
  ]);

  res.json({
    success: true,
    period,
    data: results.map((p, i) => ({
      rank:       i + 1,
      productId:  p._id,
      name:       p.name,
      image:      p.image,
      totalSold:  p.totalSold,
      revenue:    Math.round(p.revenue),
      orderCount: p.orderCount,
      avgPrice:   Math.round(p.avgPrice),
    })),
  });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 4. Sales by City ─────────────────────────────────────────────────────────
// GET /api/analytics/by-city
// توزيع المبيعات على المدن

export const getSalesByCity = async (req, res) => {
  try {
  const results = await orderModel.aggregate([
    { $match: { status: { $in: REVENUE_STATUSES } } },
    {
      $group: {
        _id:     { $toLower: { $trim: { input: '$shippingAddress.city' } } },
        city:    { $first: '$shippingAddress.city' },
        orders:  { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { orders: -1 } },
    { $limit: 20 },
  ]);

  const total = results.reduce((s, r) => s + r.orders, 0);

  res.json({
    success: true,
    data: results.map((r) => ({
      city:       r.city || 'غير محدد',
      orders:     r.orders,
      revenue:    Math.round(r.revenue),
      percentage: total > 0 ? Math.round((r.orders / total) * 100) : 0,
    })),
  });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 5. Hourly Orders (Today) ─────────────────────────────────────────────────
// GET /api/analytics/hourly
// توزيع الطلبات على ساعات اليوم — يفيد لمعرفة أوقات الذروة

export const getHourlyOrders = async (req, res) => {
  try {
  const fromDate = daysAgo(7); // آخر 7 أيام عشان الأرقام تبقى معبّرة

  const results = await orderModel.aggregate([
    { $match: { createdAt: { $gte: fromDate } } },
    {
      $group: {
        _id:    { $hour: { date: '$createdAt', timezone: 'Africa/Cairo' } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill all 24 hours
  const byHour = Array.from({ length: 24 }, (_, h) => {
    const found = results.find((r) => r._id === h);
    return {
      hour:   h,
      label:  `${String(h).padStart(2,'0')}:00`,
      orders: found?.orders || 0,
    };
  });

  res.json({ success: true, days: 7, data: byHour });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 6. Conversion Funnel ─────────────────────────────────────────────────────
// GET /api/analytics/funnel
// نسبة تحويل الطلبات من pending → delivered

export const getOrderFunnel = async (req, res) => {
  try {
  const [pending, processing, shipped, delivered, cancelled] = await Promise.all([
    orderModel.countDocuments({ status: 'pending' }),
    orderModel.countDocuments({ status: 'processing' }),
    orderModel.countDocuments({ status: 'shipped' }),
    orderModel.countDocuments({ status: 'delivered' }),
    orderModel.countDocuments({ status: 'cancelled' }),
  ]);

  const total = pending + processing + shipped + delivered + cancelled;
  const pct   = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  res.json({
    success: true,
    data: {
      total,
      stages: [
        { status: 'pending',    label: 'قيد المراجعة', count: pending,    pct: pct(pending) },
        { status: 'processing', label: 'قيد التجهيز',  count: processing, pct: pct(processing) },
        { status: 'shipped',    label: 'تم الشحن',     count: shipped,    pct: pct(shipped) },
        { status: 'delivered',  label: 'تم التوصيل',   count: delivered,  pct: pct(delivered) },
        { status: 'cancelled',  label: 'ملغي',          count: cancelled,  pct: pct(cancelled) },
      ],
      deliveryRate:     total > 0 ? Math.round((delivered / total) * 100) : 0,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
    },
  });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 7. Recent Activity ───────────────────────────────────────────────────────
// GET /api/analytics/recent?limit=10
// آخر الطلبات للعرض في الداشبورد

export const getRecentActivity = async (req, res) => {
  try {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const orders = await orderModel
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .lean();

  res.json({
    success: true,
    data: orders.map((o) => ({
      _id:         o._id,
      orderNumber: o.orderNumber,
      userName:    o.userId?.name || 'عميل',
      userEmail:   o.userId?.email || '',
      totalAmount: o.totalAmount,
      status:      o.status,
      itemsCount:  o.itemsCount || o.items?.length || 0,
      createdAt:   o.createdAt,
    })),
  });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ─── 8. Profit Summary ────────────────────────────────────────────────────────
// GET /api/analytics/profit
// ملخص الأرباح: إجمالي + لكل منتج — للداشبورد الأدمن

export const getProfitSummary = async (req, res) => {
  try {
    // ✅ جلب المنتجات اللي عندها costPrice + sold > 0
    const products = await productModel
      .find({ costPrice: { $ne: null }, sold: { $gt: 0 } })
      .select('name image price costPrice sold category brand')
      .lean();

    // ✅ حساب الأرباح لكل منتج
    const productProfits = products.map((p) => {
      const revenue       = Math.round(p.price * p.sold);
      const totalCost     = Math.round(p.costPrice * p.sold);
      const profit        = revenue - totalCost;
      const profitPct     = totalCost > 0 ? Math.round((profit / totalCost) * 100) : 0;
      const marginPerUnit = Math.round(p.price - p.costPrice);

      return {
        productId:    p._id,
        name:         p.name,
        image:        p.image,
        category:     p.category,
        brand:        p.brand,
        unitsSold:    p.sold,
        salePrice:    p.price,
        costPrice:    p.costPrice,
        marginPerUnit,          // هامش الربح للقطعة الواحدة
        revenue,                // الإيراد الكلي
        totalCost,              // التكلفة الكلية
        profit,                 // الربح الصافي
        profitPct,              // نسبة الربح %
      };
    });

    // ✅ ترتيب تنازلي بالربح
    productProfits.sort((a, b) => b.profit - a.profit);

    // ✅ الإجماليات
    const totals = productProfits.reduce(
      (acc, p) => ({
        revenue:   acc.revenue   + p.revenue,
        totalCost: acc.totalCost + p.totalCost,
        profit:    acc.profit    + p.profit,
      }),
      { revenue: 0, totalCost: 0, profit: 0 }
    );

    const overallProfitPct = totals.totalCost > 0
      ? Math.round((totals.profit / totals.totalCost) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        summary: {
          ...totals,
          overallProfitPct,
          productsTracked: productProfits.length,  // عدد المنتجات اللي عندها costPrice
        },
        products: productProfits,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};