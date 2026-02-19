// src/components/dashboard/DashboardCharts.jsx
// Pure CSS/SVG charts — no external chart library needed
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevenueTrend } from '../../store/slices/dashboardSlice';
import { TrendingUp, MapPin, Package, Clock, Loader2 } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('ar-EG').format(Math.round(n || 0));

// ── Revenue Trend Chart (SVG Line Chart) ──────────────────────────────────────
export const RevenueTrendChart = ({ data = [], loading }) => {
  const dispatch   = useDispatch();
  const revLoading = useSelector((s) => s.dashboard.revenueLoading);
  const [period, setPeriod] = useState('30d');

  const handlePeriod = (p) => {
    setPeriod(p);
    dispatch(fetchRevenueTrend(p));
  };

  const periods = [
    { value: '30d', label: '30 يوم' },
    { value: '12w', label: '12 أسبوع' },
    { value: '12m', label: '12 شهر' },
  ];

  const W = 800, H = 220, PAD = 40;
  const max    = Math.max(...data.map((d) => d.revenue), 1);
  const points = data.map((d, i) => ({
    x: PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2),
    y: H - PAD - (d.revenue / max) * (H - PAD * 2),
    ...d,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area     = points.length > 0
    ? `M${points[0].x},${H - PAD} ` + points.map((p) => `L${p.x},${p.y}`).join(' ') + ` L${points[points.length-1].x},${H-PAD} Z`
    : '';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">ترند الإيرادات</h3>
            <p className="text-xs text-gray-500">الإيرادات عبر الزمن</p>
          </div>
        </div>
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === p.value
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {revLoading || loading ? (
        <div className="flex items-center justify-center h-[220px]">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[220px] text-gray-600 text-sm">لا توجد بيانات</div>
      ) : (
        <div className="relative overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: '300px' }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((t) => (
              <g key={t}>
                <line
                  x1={PAD} y1={H - PAD - t * (H - PAD * 2)}
                  x2={W - PAD} y2={H - PAD - t * (H - PAD * 2)}
                  stroke="#1e293b" strokeWidth="1"
                />
                <text x={PAD - 6} y={H - PAD - t * (H - PAD * 2) + 4} textAnchor="end"
                  fontSize="10" fill="#475569">
                  {fmtK(max * t)}
                </text>
              </g>
            ))}

            {/* Area fill */}
            {area && <path d={area} fill="url(#areaGrad)" />}

            {/* Line */}
            {points.length > 1 && (
              <polyline points={polyline} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            )}

            {/* Dots + tooltip trigger */}
            {points.map((p, i) => (
              <g key={i} className="group">
                <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
                <circle cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="#0f172a" strokeWidth="2"
                  className="opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* X labels - show every nth */}
                {(i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 6) === 0) && (
                  <text x={p.x} y={H - 8} textAnchor="middle" fontSize="9" fill="#475569">
                    {p.label?.slice(-5)}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800">
            {[
              { label: 'إجمالي الفترة', value: `${fmt(data.reduce((s, d) => s + d.revenue, 0))} ج.م` },
              { label: 'إجمالي الطلبات', value: fmt(data.reduce((s, d) => s + d.orders, 0)) },
              { label: 'متوسط الطلب', value: `${fmt(data.reduce((s, d) => s + d.avgOrder, 0) / (data.length || 1))} ج.م` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-500 font-bold">{label}</p>
                <p className="text-base font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const fmtK = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : fmt(n);

// ── Top Products ──────────────────────────────────────────────────────────────
export const TopProductsChart = ({ data = [] }) => {
  const maxSold = Math.max(...data.map((d) => d.totalSold), 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-500/20 rounded-xl">
          <Package className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white">أكثر المنتجات مبيعاً</h3>
          <p className="text-xs text-gray-500">آخر 30 يوم</p>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-center text-gray-600 text-sm py-8">لا توجد بيانات</p>
      ) : (
        <div className="space-y-3">
          {data.map((p, i) => (
            <div key={p.productId || i} className="flex items-center gap-3 group">
              {/* Rank */}
              <span className={`w-6 text-center text-xs font-black flex-shrink-0 ${
                i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'
              }`}>
                {i + 1}
              </span>

              {/* Image or placeholder */}
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-700" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight">{p.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-700"
                      style={{ width: `${(p.totalSold / maxSold) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-white">{p.totalSold} <span className="text-xs text-gray-500">قطعة</span></p>
                <p className="text-xs text-emerald-400 font-bold">{fmtK(p.revenue)} ج.م</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Sales by City ─────────────────────────────────────────────────────────────
export const CityChart = ({ data = [] }) => {
  const top5 = data.slice(0, 7);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-sky-500/20 rounded-xl">
          <MapPin className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white">المبيعات حسب المدينة</h3>
          <p className="text-xs text-gray-500">توزيع جغرافي</p>
        </div>
      </div>

      {top5.length === 0 ? (
        <p className="text-center text-gray-600 text-sm py-8">لا توجد بيانات</p>
      ) : (
        <div className="space-y-3">
          {top5.map((c, i) => (
            <div key={c.city} className="flex items-center gap-3">
              <span className="text-xs font-black text-gray-600 w-4">{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-white">{c.city}</span>
                  <span className="text-xs font-bold text-sky-400">{c.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${c.percentage}%`,
                      background: `hsl(${200 + i * 20}, 80%, ${50 - i * 3}%)`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{c.orders} طلب · {fmt(c.revenue)} ج.م</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Hourly Orders Heatmap ─────────────────────────────────────────────────────
export const HourlyChart = ({ data = [] }) => {
  const max  = Math.max(...data.map((d) => d.orders), 1);
  const peak = data.reduce((p, c) => c.orders > p.orders ? c : p, { orders: 0, label: '--' });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-xl">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">أوقات الذروة</h3>
            <p className="text-xs text-gray-500">توزيع الطلبات على 24 ساعة (آخر 7 أيام)</p>
          </div>
        </div>
        {peak.orders > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">ذروة</p>
            <p className="text-sm font-black text-amber-400">{peak.label}</p>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <p className="text-center text-gray-600 text-sm py-8">لا توجد بيانات</p>
      ) : (
        <div className="flex items-end gap-1" style={{ height: '100px' }}>
          {data.map((d) => {
            const h = max > 0 ? (d.orders / max) * 100 : 0;
            const isPeak = d.orders === max && max > 0;
            return (
              <div key={d.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {d.label}: {d.orders} طلب
                </div>
                <div
                  className={`w-full rounded-t transition-all duration-300 ${isPeak ? 'bg-amber-400' : 'bg-slate-700 group-hover:bg-slate-500'}`}
                  style={{ height: `${Math.max(h, 2)}%` }}
                />
                {d.hour % 6 === 0 && (
                  <span className="text-[8px] text-gray-600 font-bold">{d.label.slice(0,2)}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Order Funnel ──────────────────────────────────────────────────────────────
export const FunnelChart = ({ data }) => {
  if (!data) return null;
  const { stages, deliveryRate, cancellationRate, total } = data;

  const colors = {
    pending:    'from-amber-500 to-orange-500',
    processing: 'from-blue-500 to-cyan-500',
    shipped:    'from-violet-500 to-purple-600',
    delivered:  'from-emerald-500 to-teal-600',
    cancelled:  'from-red-500 to-rose-600',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-white">قمع الطلبات</h3>
          <p className="text-xs text-gray-500">إجمالي {total} طلب</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">معدل التوصيل</p>
            <p className="text-2xl font-black text-emerald-400">{deliveryRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">معدل الإلغاء</p>
            <p className="text-2xl font-black text-red-400">{cancellationRate}%</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {stages.map((s) => (
          <div key={s.status} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20 text-right flex-shrink-0">{s.label}</span>
            <div className="flex-1 h-7 bg-slate-800 rounded-lg overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colors[s.status]} flex items-center px-3 transition-all duration-700`}
                style={{ width: `${Math.max(s.pct, s.count > 0 ? 3 : 0)}%` }}
              >
                {s.pct >= 8 && (
                  <span className="text-xs font-black text-white">{s.count}</span>
                )}
              </div>
            </div>
            <span className="text-xs font-bold text-gray-400 w-10 text-left flex-shrink-0">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Recent Orders ─────────────────────────────────────────────────────────────
const STATUS_PILL = {
  pending:    'bg-amber-500/15 text-amber-400 border-amber-500/30',
  processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  shipped:    'bg-violet-500/15 text-violet-400 border-violet-500/30',
  delivered:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled:  'bg-red-500/15 text-red-400 border-red-500/30',
};
const STATUS_LABEL = {
  pending: 'انتظار', processing: 'تجهيز', shipped: 'شحن', delivered: 'توصيل', cancelled: 'ملغي',
};

export const RecentOrdersTable = ({ data = [] }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
    <h3 className="text-lg font-black text-white mb-5">آخر الطلبات</h3>
    {data.length === 0 ? (
      <p className="text-center text-gray-600 text-sm py-8">لا توجد طلبات</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-slate-800">
              {['رقم الطلب', 'العميل', 'المبلغ', 'الحالة', 'التاريخ'].map((h) => (
                <th key={h} className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((o) => (
              <tr key={o._id} className="group hover:bg-slate-800/30 transition-colors">
                <td className="py-3 text-xs font-mono text-gray-400">{o.orderNumber || o._id?.slice(-8)}</td>
                <td className="py-3">
                  <p className="text-sm font-bold text-white">{o.userName}</p>
                  <p className="text-xs text-gray-500">{o.itemsCount} منتج</p>
                </td>
                <td className="py-3 text-sm font-black text-emerald-400">{fmt(o.totalAmount)} ج.م</td>
                <td className="py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${STATUS_PILL[o.status] || 'bg-slate-700 text-gray-400 border-slate-600'}`}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                </td>
                <td className="py-3 text-xs text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);