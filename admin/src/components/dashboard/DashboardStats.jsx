// src/components/dashboard/DashboardStats.jsx
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, TrendingDown,
         Clock, CheckCircle, Truck, XCircle, Activity, BadgeDollarSign } from 'lucide-react';

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmt  = (n) => new Intl.NumberFormat('ar-EG').format(Math.round(n || 0));
const fmtK = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : fmt(n);

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, suffix, sub, change, gradient, glow }) => (
  <div className="group relative overflow-hidden">
    <div className={`absolute -inset-px bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-sm`} />
    <div className="relative bg-slate-900 border border-slate-800 group-hover:border-slate-600 rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
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

// ── Main KPI Cards ────────────────────────────────────────────────────────────
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

// ── Order Status Strip ────────────────────────────────────────────────────────
const STATUS_MAP = [
  { key: 'pending',    label: 'قيد المراجعة', icon: Clock,       color: 'text-amber-400',   bar: 'bg-amber-400',   bg: 'bg-amber-400/10'   },
  { key: 'processing', label: 'قيد التجهيز',  icon: Package,     color: 'text-blue-400',    bar: 'bg-blue-400',    bg: 'bg-blue-400/10'    },
  { key: 'shipped',    label: 'تم الشحن',     icon: Truck,       color: 'text-violet-400',  bar: 'bg-violet-400',  bg: 'bg-violet-400/10'  },
  { key: 'delivered',  label: 'تم التوصيل',   icon: CheckCircle, color: 'text-emerald-400', bar: 'bg-emerald-400', bg: 'bg-emerald-400/10' },
  { key: 'cancelled',  label: 'ملغي',          icon: XCircle,     color: 'text-red-400',     bar: 'bg-red-400',     bg: 'bg-red-400/10'     },
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

// ── Profit Summary ────────────────────────────────────────────────────────────
// يعرض: إجمالي الأرباح + جدول أفضل المنتجات ربحاً
export const ProfitStats = ({ profit }) => {
  if (!profit) return null;
  const { summary, products } = profit;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
          <BadgeDollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">تحليل الأرباح</h3>
          <p className="text-xs text-gray-600 mt-0.5">{summary.productsTracked} منتج مُتتبَّع</p>
        </div>
      </div>

      {/* ── الإجماليات ── */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">إجمالي الإيراد</p>
          <p className="text-xl font-black text-white">{fmtK(summary.revenue)}<span className="text-xs text-gray-400 mr-1">ج.م</span></p>
        </div>
        <div className="text-center border-x border-slate-700">
          <p className="text-xs text-gray-500 mb-1">إجمالي التكلفة</p>
          <p className="text-xl font-black text-rose-400">{fmtK(summary.totalCost)}<span className="text-xs text-gray-400 mr-1">ج.م</span></p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">صافي الربح</p>
          <p className={`text-xl font-black ${summary.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {summary.profit >= 0 ? '+' : ''}{fmtK(summary.profit)}<span className="text-xs text-gray-400 mr-1">ج.م</span>
          </p>
          <p className="text-xs font-bold text-emerald-500">{summary.overallProfitPct}% هامش</p>
        </div>
      </div>

      {/* ── جدول المنتجات ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-slate-800">
              <th className="text-right pb-3 font-bold">المنتج</th>
              <th className="text-center pb-3 font-bold px-3">بيع</th>
              <th className="text-center pb-3 font-bold px-3">إيراد</th>
              <th className="text-center pb-3 font-bold px-3">تكلفة</th>
              <th className="text-center pb-3 font-bold px-3">ربح</th>
              <th className="text-center pb-3 font-bold px-3">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.slice(0, 10).map((p) => (
              <tr key={p.productId} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name}
                      className="w-8 h-8 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                    <span className="text-white font-medium text-xs line-clamp-1 max-w-[120px]">{p.name}</span>
                  </div>
                </td>
                <td className="text-center py-3 px-3">
                  <span className="text-gray-300 font-bold">{p.unitsSold}</span>
                  <span className="text-gray-600 text-xs mr-0.5">قطعة</span>
                </td>
                <td className="text-center py-3 px-3 text-gray-300 font-bold">{fmtK(p.revenue)}</td>
                <td className="text-center py-3 px-3 text-rose-400 font-bold">{fmtK(p.totalCost)}</td>
                <td className="text-center py-3 px-3">
                  <span className={`font-black ${p.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {p.profit >= 0 ? '+' : ''}{fmtK(p.profit)}
                  </span>
                </td>
                <td className="text-center py-3 px-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${
                    p.profitPct >= 20 ? 'bg-emerald-500/20 text-emerald-400' :
                    p.profitPct >= 0  ? 'bg-amber-500/20 text-amber-400'    :
                                        'bg-red-500/20 text-red-400'
                  }`}>{p.profitPct}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center text-gray-600 py-8 text-sm">
            لا توجد منتجات بسعر تكلفة محدد — أضف costPrice للمنتجات لرؤية الأرباح
          </p>
        )}
      </div>
    </div>
  );
};