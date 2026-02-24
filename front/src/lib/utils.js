/**
 * تنسيق السعر بالجنيه المصري
 */
export const formatEGP = (value) => {
  try {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `ج.م ${Number(value).toFixed(2)}`;
  }
};

/**
 * تنسيق التاريخ بالعربي
 */
export const formatDate = (date) => {
  if (!date) return 'غير محدد';
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * حساب نسبة الخصم
 */
export const calcDiscountPercent = (originalPrice, price) => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};
