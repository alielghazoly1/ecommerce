import { Clock, Package, Truck, CheckCircle } from 'lucide-react';

export const STATUS_CONFIG = {
  pending: {
    label: 'قيد المراجعة',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  processing: {
    label: 'قيد التجهيز',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  shipped: {
    label: 'تم الشحن',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  delivered: {
    label: 'تم التوصيل',
    color: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  cancelled: {
    label: 'ملغي',
    color: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
};

export const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
export const STEP_LABELS = {
  pending: 'مراجعة',
  processing: 'تجهيز',
  shipped: 'شحن',
  delivered: 'توصيل',
};
export const STEP_ICONS = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
};
