// src/components/dashboard/DashboardStats.jsx
import { ShoppingCart, DollarSign, Package, Users, ArrowUpRight, ArrowDownRight, CheckCircle, Clock, Activity, XCircle } from 'lucide-react';

const MainStatCard = ({ title, value, suffix, change, subtitle, icon: Icon, gradient, bgGradient }) => (
  <div className="group relative">
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 rounded-3xl`}></div>
    <div className="relative h-full bg-slate-900 border border-slate-800 group-hover:border-slate-700 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className={`p-4 bg-gradient-to-br ${gradient} rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          {change !== 0 && (
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="text-xs font-black">{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-400 font-bold mb-2">{title}</p>
          <p className="text-5xl font-black text-white mb-1">
            {value}{suffix && <span className="text-2xl"> {suffix}</span>}
          </p>
          <p className="text-sm text-gray-500 font-semibold">{subtitle}</p>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${gradient} rounded-full`} style={{ width: '70%' }}></div>
        </div>
      </div>
    </div>
  </div>
);

export const DashboardMainStats = ({ stats }) => {
  const cards = [
    { title: 'إجمالي الطلبات', value: stats.totalOrders, change: stats.growthRate, subtitle: `${stats.weekOrders} هذا الأسبوع`, icon: ShoppingCart, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-500/10 to-purple-600/5' },
    { title: 'إجمالي الإيرادات', value: stats.totalRevenue.toFixed(0), suffix: 'ج.م', change: stats.revenueGrowthRate, subtitle: `${stats.weekRevenue.toFixed(0)} ج.م`, icon: DollarSign, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-500/10 to-emerald-600/5' },
    { title: 'إجمالي المنتجات', value: stats.totalProducts, change: 0, subtitle: 'منتج نشط', icon: Package, gradient: 'from-blue-500 to-cyan-600', bgGradient: 'from-blue-500/10 to-cyan-600/5' },
    { title: 'إجمالي المستخدمين', value: stats.totalUsers, change: 0, subtitle: 'مستخدم مسجل', icon: Users, gradient: 'from-cyan-500 to-blue-600', bgGradient: 'from-cyan-500/10 to-blue-600/5' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {cards.map((c, i) => <MainStatCard key={i} {...c} />)}
    </div>
  );
};

const STATUS_CARDS = [
  { key: 'completedOrders', label: 'تم التوصيل', color: 'green', gradient: 'from-green-500 via-emerald-500 to-green-600', emoji: '✅', Icon: CheckCircle },
  { key: 'pendingOrders', label: 'قيد الانتظار', color: 'yellow', gradient: 'from-yellow-500 via-orange-500 to-yellow-600', emoji: '⏳', Icon: Clock },
  { key: 'processingOrders', label: 'قيد المعالجة', color: 'blue', gradient: 'from-blue-500 via-cyan-500 to-blue-600', emoji: '⚡', Icon: Activity },
  { key: 'cancelledOrders', label: 'ملغي', color: 'red', gradient: 'from-red-500 via-pink-500 to-red-600', emoji: '❌', Icon: XCircle },
];

const OrderStatusCard = ({ Icon, label, count, color, gradient, emoji, total }) => {
  const percentage = total ? (count / total) * 100 : 0;
  return (
    <div className="group relative">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl`}></div>
      <div className="relative bg-slate-900 border border-slate-800 group-hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 bg-${color}-500/20 rounded-xl border border-${color}-500/40 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 text-${color}-400`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-gray-400 font-bold">{label}</p>
              <span className="text-lg">{emoji}</span>
            </div>
            <p className="text-4xl font-black text-white">{count || 0}</p>
          </div>
        </div>
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-500 font-black">{percentage.toFixed(1)}%</p>
          <p className="text-xs text-gray-600 font-bold">من الإجمالي</p>
        </div>
      </div>
    </div>
  );
};

export const DashboardOrderStatus = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
    {STATUS_CARDS.map(({ key, Icon, label, color, gradient, emoji }) => (
      <OrderStatusCard key={key} Icon={Icon} label={label} count={stats[key]} color={color} gradient={gradient} emoji={emoji} total={stats.totalOrders} />
    ))}
  </div>
);