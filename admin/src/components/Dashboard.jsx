// src/components/Dashboard.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, BarChart3, Crown, Wifi, WifiOff } from 'lucide-react';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import LoadingSpinner from './common/LoadingSpinner';
import { DashboardMainStats, DashboardOrderStatus } from './dashboard/DashboardStats';
import {
  RevenueTrendChart,
  TopProductsChart,
  CityChart,
  HourlyChart,
  FunnelChart,
  RecentOrdersTable,
} from './dashboard/DashboardCharts';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { summary, revenue, topProducts, cities, hourly, funnel, recent, loading, refreshing, error } =
    useSelector((s) => s.dashboard);

  useEffect(() => { dispatch(fetchDashboardData(false)); }, [dispatch]);

  if (loading) return <LoadingSpinner text="جارٍ تحميل الإحصائيات..." />;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-[1800px] mx-auto p-4 md:p-6 lg:p-10 space-y-6">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full mb-3">
              <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-bold text-violet-300">مرحباً، {user?.name || 'Admin'}</span>
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              لوحة الإحصائيات
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl">
              {error ? (
                <><WifiOff className="w-4 h-4 text-red-400" /><span className="text-xs font-bold text-red-400">خطأ في الاتصال</span></>
              ) : (
                <><Wifi className="w-4 h-4 text-emerald-400" /><span className="text-xs font-bold text-emerald-400">متصل</span></>
              )}
            </div>

            <button
              onClick={() => dispatch(fetchDashboardData(true))}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 disabled:opacity-60 disabled:scale-100"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'جارٍ التحديث...' : 'تحديث'}
            </button>
          </div>
        </div>

        {/* ── Error Banner ───────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 font-bold">
            ⚠️ {error} — بعض البيانات قد لا تكون محدّثة
          </div>
        )}

        {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
        <DashboardMainStats summary={summary} />

        {/* ── Order Status Strip ─────────────────────────────────────────────── */}
        <DashboardOrderStatus summary={summary} />

        {/* ── Revenue Trend (full width) ─────────────────────────────────────── */}
        <RevenueTrendChart data={revenue} />

        {/* ── 3-column: Top Products | City | Hourly ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <TopProductsChart data={topProducts} />
          <CityChart data={cities} />
          <HourlyChart data={hourly} />
        </div>

        {/* ── Funnel + Recent Orders ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2">
            <FunnelChart data={funnel} />
          </div>
          <div className="lg:col-span-3">
            <RecentOrdersTable data={recent} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;