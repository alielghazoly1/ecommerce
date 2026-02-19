// src/constants/index.js



export const ORDER_STATUSES = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'processing', label: 'قيد المعالجة' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'delivered', label: 'تم التوصيل' },
  { value: 'cancelled', label: 'ملغي' },
];

export const STATUS_COLORS = {
  pending: 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50',
  processing: 'bg-blue-500/30 text-blue-300 border-blue-400/50',
  shipped: 'bg-purple-500/30 text-purple-300 border-purple-400/50',
  delivered: 'bg-green-500/30 text-green-300 border-green-400/50',
  cancelled: 'bg-red-500/30 text-red-300 border-red-400/50',
};

export const ROLE_CONFIG = {
  admin: {
    label: 'أدمن',
    color: 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50',
  },
  user: {
    label: 'مستخدم',
    color: 'bg-blue-500/30 text-blue-300 border-blue-400/50',
  },
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'price-high', label: 'الأعلى سعراً' },
  { value: 'price-low', label: 'الأقل سعراً' },
  { value: 'name-asc', label: 'الاسم (أ-ي)' },
  { value: 'name-desc', label: 'الاسم (ي-أ)' },
];

export const IMAGE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
