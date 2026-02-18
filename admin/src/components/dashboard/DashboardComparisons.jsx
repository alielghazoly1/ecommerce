// src/components/dashboard/DashboardComparisons.jsx
import { Calendar, TrendingUp, TrendingDown, ShoppingBag, CreditCard, DollarSign, Zap, PieChart, ShoppingCart, Percent, Award, BarChart3, Target } from 'lucide-react';

const ComparisonBlock = ({ label, orders, revenue, dimmed = false }) => (
  <div className="space-y-4">
    <div className={`flex items-center justify-between p-4 ${dimmed ? 'bg-slate-800/30' : 'bg-slate-800/50'} rounded-2xl border border-slate-700`}>
      <div>
        <p className={`text-sm font-bold mb-1 ${dimmed ? 'text-gray-500' : 'text-gray-400'}`}>{label} - طلبات</p>
        <p className={`text-3xl font-black ${dimmed ? 'text-gray-500' : 'text-white'}`}>{orders}</p>
      </div>
      <ShoppingBag className={`w-8 h-8 ${dimmed ? 'text-gray-600' : 'text-orange-400'}`} />
    </div>
    <div className={`flex items-center justify-between p-4 ${dimmed ? 'bg-slate-800/30' : 'bg-slate-800/50'} rounded-2xl border border-slate-700`}>
      <div>
        <p className={`text-sm font-bold mb-1 ${dimmed ? 'text-gray-500' : 'text-gray-400'}`}>{label} - إيرادات</p>
        <p className={`text-2xl font-black ${dimmed ? 'text-gray-500' : 'text-green-400'}`}>{revenue.toFixed(0)} ج.م</p>
      </div>
      <CreditCard className={`w-8 h-8 ${dimmed ? 'text-gray-600' : 'text-green-400'}`} />
    </div>
  </div>
);

export const TodayVsYesterday = ({ stats }) => (
  <div className="group relative">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl"></div>
    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:shadow-2xl transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">اليوم مقابل أمس</h2>
            <p className="text-sm text-gray-400">مقارنة الأداء اليومي</p>
          </div>
        </div>
        <Target className="w-8 h-8 text-orange-400" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <ComparisonBlock label="اليوم" orders={stats.todayOrders} revenue={stats.todayRevenue} />
        <ComparisonBlock label="أمس" orders={stats.yesterdayOrders} revenue={stats.yesterdayRevenue} dimmed />
      </div>
      <div className="mt-6 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/30">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-300">الفرق</span>
          <div className="flex items-center gap-4">
            <span className={`text-lg font-black ${stats.todayOrders >= stats.yesterdayOrders ? 'text-green-400' : 'text-red-400'}`}>
              الطلبات: {stats.todayOrders >= stats.yesterdayOrders ? '+' : ''}{stats.todayOrders - stats.yesterdayOrders}
            </span>
            <div className="w-px h-6 bg-slate-700"></div>
            <span className={`text-lg font-black ${stats.todayRevenue >= stats.yesterdayRevenue ? 'text-green-400' : 'text-red-400'}`}>
              الإيرادات: {stats.todayRevenue >= stats.yesterdayRevenue ? '+' : ''}{(stats.todayRevenue - stats.yesterdayRevenue).toFixed(0)} ج.م
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const WeekComparison = ({ stats }) => (
  <div className="group relative">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl"></div>
    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:shadow-2xl transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">الأسبوع الحالي vs الماضي</h2>
            <p className="text-sm text-gray-400">مقارنة الأداء الأسبوعي</p>
          </div>
        </div>
        <BarChart3 className="w-8 h-8 text-blue-400" />
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          {[{ label: 'هذا الأسبوع', value: stats.weekOrders, Icon: Zap }, { label: 'إيرادات الأسبوع', value: `${stats.weekRevenue.toFixed(0)} ج.م`, Icon: DollarSign, green: true }].map(({ label, value, Icon, green }) => (
            <div key={label} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
              <div><p className="text-sm text-gray-400 font-bold mb-1">{label}</p><p className={`text-3xl font-black ${green ? 'text-green-400' : 'text-white'}`}>{value}</p></div>
              <Icon className={`w-8 h-8 ${green ? 'text-green-400' : 'text-blue-400'}`} />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[{ label: 'الأسبوع الماضي', value: stats.lastWeekOrders, Icon: Zap }, { label: 'إيرادات الماضي', value: `${stats.lastWeekRevenue.toFixed(0)} ج.م`, Icon: DollarSign }].map(({ label, value, Icon }) => (
            <div key={label} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
              <div><p className="text-sm text-gray-500 font-bold mb-1">{label}</p><p className="text-3xl font-black text-gray-500">{value}</p></div>
              <Icon className="w-8 h-8 text-gray-600" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/30 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-300">معدل النمو</span>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${stats.growthRate >= 0 ? 'bg-green-500/20 border border-green-500/40' : 'bg-red-500/20 border border-red-500/40'}`}>
          {stats.growthRate >= 0 ? <TrendingUp className="w-5 h-5 text-green-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
          <span className={`text-xl font-black ${stats.growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.growthRate >= 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  </div>
);

export const MonthStats = ({ stats }) => (
  <div className="group relative">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl"></div>
    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:shadow-2xl transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
            <PieChart className="w-6 h-6 text-white" />
          </div>
          <div><h2 className="text-2xl font-black text-white">إحصائيات الشهر</h2><p className="text-sm text-gray-400">آخر 30 يوم</p></div>
        </div>
        <Award className="w-8 h-8 text-purple-400" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: ShoppingCart, color: 'purple', label: 'طلبات الشهر', value: stats.monthOrders, prev: `${stats.lastMonthOrders} الشهر الماضي` },
          { icon: DollarSign, color: 'green', label: 'إيرادات الشهر', value: stats.monthRevenue.toFixed(0), prev: `${stats.lastMonthRevenue.toFixed(0)} ج.م`, green: true },
          { icon: Percent, color: 'cyan', label: 'متوسط قيمة الطلب', value: stats.averageOrderValue.toFixed(0), prev: 'جنيه مصري', cyan: true },
        ].map(({ icon: Icon, color, label, value, prev, green, cyan }) => (
          <div key={label} className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 bg-${color}-500/20 rounded-xl`}>
                <Icon className={`w-6 h-6 text-${color}-400`} />
              </div>
              <span className={`text-xs font-bold text-${color}-400 px-3 py-1 bg-${color}-500/10 rounded-full border border-${color}-500/30`}>30 يوم</span>
            </div>
            <p className="text-sm text-gray-400 font-bold mb-2">{label}</p>
            <p className={`text-4xl font-black mb-2 ${green ? 'text-green-400' : cyan ? 'text-cyan-400' : 'text-white'}`}>{value}</p>
            <p className="text-xs text-gray-500 font-semibold">{prev}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);