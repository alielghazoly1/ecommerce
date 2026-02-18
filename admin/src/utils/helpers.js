// src/utils/helpers.js

import { STATUS_COLORS, ORDER_STATUSES } from '../constants';

export const formatPrice = (price) => {
  const num = Number(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

export const formatDate = (date) => {
  if (!date) return 'غير متوفر';
  return new Date(date).toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (date) => {
  if (!date) return 'غير متوفر';
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusColor = (status) =>
  STATUS_COLORS[status] || STATUS_COLORS.pending;

export const getStatusLabel = (status) => {
  const option = ORDER_STATUSES.find((o) => o.value === status);
  return option ? option.label : status;
};

export const validateProductField = (name, value) => {
  switch (name) {
    case 'name':
      if (!value?.trim()) return 'اسم المنتج مطلوب';
      if (value.trim().length < 3)
        return 'اسم المنتج يجب أن يكون 3 أحرف على الأقل';
      if (value.trim().length > 100) return 'اسم المنتج يجب ألا يتجاوز 100 حرف';
      return null;
    case 'description':
      if (!value?.trim()) return 'الوصف مطلوب';
      if (value.trim().length < 10)
        return 'الوصف يجب أن يكون 10 أحرف على الأقل';
      return null;
    case 'price':
      if (!value) return 'السعر مطلوب';
      if (isNaN(Number(value)) || Number(value) <= 0)
        return 'السعر يجب أن يكون رقماً موجباً';
      if (Number(value) > 999999) return 'السعر مرتفع جداً';
      return null;
    case 'stock':
      if (value !== '' && (isNaN(Number(value)) || Number(value) < 0))
        return 'الكمية يجب أن تكون رقماً موجباً';
      return null;
    default:
      return null;
  }
};

export const validateAllProductFields = (data) => {
  const fields = ['name', 'description', 'price', 'stock'];
  const errors = {};
  fields.forEach((field) => {
    const err = validateProductField(field, data[field]);
    if (err) errors[field] = err;
  });
  return errors;
};

export const buildProductFormData = (data, image) => {
  const formData = new FormData();
  formData.append('name', data.name.trim());
  formData.append('description', data.description.trim());
  formData.append('price', Number(data.price).toFixed(2));
  formData.append('category', data.category);
  formData.append('stock', data.stock || '0');
  if (data.brand?.trim()) formData.append('brand', data.brand.trim());
  formData.append('isFeatured', data.isFeatured);
  if (data.tags?.trim()) {
    const tagsArray = data.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    formData.append('tags', JSON.stringify(tagsArray));
  }
  if (image) formData.append('image', image);
  return formData;
};

export const validateImageFile = (file) => {
  const ALLOWED = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  if (file.size > 5 * 1024 * 1024)
    return 'حجم الصورة كبير جداً. الحد الأقصى 5MB';
  if (!ALLOWED.includes(file.type))
    return 'نوع الصورة غير مدعوم. JPG, PNG, GIF, WebP فقط';
  return null;
};

export const calcDashboardStats = (orders, products, users) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(weekAgo);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  monthAgo.setHours(0, 0, 0, 0);

  const lastMonthStart = new Date(monthAgo);
  lastMonthStart.setDate(lastMonthStart.getDate() - 30);

  const sum = (arr) => arr.reduce((s, o) => s + (o.totalAmount || 0), 0);

  const todayArr = orders.filter((o) => new Date(o.createdAt) >= today);
  const yesterdayArr = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= yesterday && d < today;
  });
  const weekArr = orders.filter((o) => new Date(o.createdAt) >= weekAgo);
  const lastWeekArr = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= lastWeekStart && d < weekAgo;
  });
  const monthArr = orders.filter((o) => new Date(o.createdAt) >= monthAgo);
  const lastMonthArr = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= lastMonthStart && d < monthAgo;
  });

  const totalRevenue = sum(orders);
  const growthRate =
    lastWeekArr.length > 0
      ? ((weekArr.length - lastWeekArr.length) / lastWeekArr.length) * 100
      : weekArr.length > 0
        ? 100
        : 0;

  const revenueGrowthRate =
    sum(lastWeekArr) > 0
      ? ((sum(weekArr) - sum(lastWeekArr)) / sum(lastWeekArr)) * 100
      : sum(weekArr) > 0
        ? 100
        : 0;

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalProducts: products.length,
    totalUsers: users.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    processingOrders: orders.filter((o) => o.status === 'processing').length,
    completedOrders: orders.filter((o) => o.status === 'delivered').length,
    cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
    todayOrders: todayArr.length,
    todayRevenue: sum(todayArr),
    yesterdayOrders: yesterdayArr.length,
    yesterdayRevenue: sum(yesterdayArr),
    weekOrders: weekArr.length,
    weekRevenue: sum(weekArr),
    lastWeekOrders: lastWeekArr.length,
    lastWeekRevenue: sum(lastWeekArr),
    monthOrders: monthArr.length,
    monthRevenue: sum(monthArr),
    lastMonthOrders: lastMonthArr.length,
    lastMonthRevenue: sum(lastMonthArr),
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    growthRate,
    revenueGrowthRate,
  };
};
