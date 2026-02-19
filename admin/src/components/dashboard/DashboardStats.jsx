// src/components/dashboard/DashboardStats.jsx
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, TrendingDown, Clock, CheckCircle, Truck, XCircle, Activity } from 'lucide-react';

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmt  = (n) => new Intl.NumberFormat('ar-EG').format(Math.round(n || 0));
const fmtK = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : fmt(n);

// ── Single KPI card ────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, suffix, sub, change, gradient, glow }) => (
  <div className="group relative overflow-hidden">
    <div className={`absolute -inset-px bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-sm`} />
    <div className="relative bg-slate-900 border border-slate-800 group-hover:border-slate-600 rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
      {/* glow dot */}
      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${glow} animate-pulse`} />

      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-white mb-0.5">
        {fmtK(value)}{suffix && <span className="text-lg font-bold text-gray-400 mr-1"> {suffix}</span>}
      </p>
      <p className="text-xs text-gray-500 mb-3">{sub}</p>

      {change !== undefined && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
          change >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
        }`}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change >= 0 ? '+' : ''}{change}% مقارنة بالأمس
        </div>
      )}
    </div>
  </div>
);

export const DashboardMainStats = ({ summary }) => {
  if (!summary) return null;
  const { revenue, orders, customers, averageOrderValue } = summary;

  const cards = [
    {
      icon: DollarSign, label: 'إجمالي الإيرادات',
      value: revenue.total, suffix: 'ج.م',
      sub: `اليوم: ${fmt(revenue.today)} ج.م`,
      change: revenue.todayChange,
      gradient: 'from-emerald-500 to-teal-600', glow: 'bg-emerald-400',
    },
    {
      icon: ShoppingCart, label: 'إجمالي الطلبات',
      value: orders.total, suffix: '',
      sub: `اليوم: ${orders.today} طلب`,
      change: orders.todayChange,
      gradient: 'from-violet-500 to-purple-700', glow: 'bg-violet-400',
    },
    {
      icon: Users, label: 'إجمالي العملاء',
      value: customers.total, suffix: '',
      sub: `جديد اليوم: ${customers.newToday}`,
      gradient: 'from-sky-500 to-blue-700', glow: 'bg-sky-400',
    },
    {
      icon: Activity, label: 'متوسط قيمة الطلب',
      value: averageOrderValue, suffix: 'ج.م',
      sub: `إيرادات الشهر: ${fmtK(revenue.month)} ج.م`,
      gradient: 'from-amber-500 to-orange-600', glow: 'bg-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      {cards.map((c) => <KpiCard key={c.label} {...c} />)}
    </div>
  );
};

// ── Order status strip ─────────────────────────────────────────────────────────
const STATUS_MAP = [
  { key: 'pending',    label: 'قيد المراجعة', icon: Clock,         color: 'text-amber-400',   bar: 'bg-amber-400',   bg: 'bg-amber-400/10'  },
  { key: 'processing', label: 'قيد التجهيز',  icon: Package,       color: 'text-blue-400',    bar: 'bg-blue-400',    bg: 'bg-blue-400/10'   },
  { key: 'shipped',    label: 'تم الشحن',     icon: Truck,         color: 'text-violet-400',  bar: 'bg-violet-400',  bg: 'bg-violet-400/10' },
  { key: 'delivered',  label: 'تم التوصيل',   icon: CheckCircle,   color: 'text-emerald-400', bar: 'bg-emerald-400', bg: 'bg-emerald-400/10'},
  { key: 'cancelled',  label: 'ملغي',          icon: XCircle,       color: 'text-red-400',     bar: 'bg-red-400',     bg: 'bg-red-400/10'    },
];

export const DashboardOrderStatus = ({ summary }) => {
  if (!summary) return null;
  const byStatus = summary.orders.byStatus;
  const total    = summary.orders.total || 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">توزيع الطلبات حسب الحالة</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STATUS_MAP.map(({ key, label, icon: Icon, color, bar, bg }) => {
          const count = byStatus[key] || 0;
          const pct   = Math.round((count / total) * 100);
          return (
            <div key={key} className={`${bg} rounded-xl p-4 border border-slate-800`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs font-bold text-gray-400">{label}</span>
              </div>
              <p className="text-3xl font-black text-white mb-2">{count}</p>
              <div className="h-1 bg-slate-800 rounded-full">
                <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-600 mt-1 font-bold">{pct}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};