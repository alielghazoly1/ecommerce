// src/components/Dashboard.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Calendar, Crown, RefreshCw, Download } from 'lucide-react';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import LoadingSpinner from './common/LoadingSpinner';
import { DashboardMainStats, DashboardOrderStatus } from './dashboard/DashboardStats';
import { TodayVsYesterday, WeekComparison, MonthStats } from './dashboard/DashboardComparisons';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { stats, loading, refreshing } = useSelector((s) => s.dashboard);

  useEffect(() => { dispatch(fetchDashboardData(false)); }, [dispatch]);

  if (loading) return <LoadingSpinner text="جاري تحميل الإحصائيات..." />;

  return (
    <div className="min-h-screen bg-slate-950 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-4 md:p-6 lg:p-10 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-300">مرحباً بك، {user?.name || 'Admin'}</span>
              <Crown className="w-4 h-4 text-yellow-400" />
            </div>
            <h1 className="text-6xl font-black text-white leading-tight">لوحة الإحصائيات</h1>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-lg font-semibold">
                  {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-bold text-green-400">مباشر</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => dispatch(fetchDashboardData(true))}
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-purple-500/50 hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'جاري التحديث...' : 'تحديث'}</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-white rounded-2xl font-bold transition-all hover:scale-105">
              <Download className="w-5 h-5" />
              <span>تصدير</span>
            </button>
          </div>
        </div>

        <DashboardMainStats stats={stats} />
        <DashboardOrderStatus stats={stats} />

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TodayVsYesterday stats={stats} />
            <WeekComparison stats={stats} />
          </div>
          <MonthStats stats={stats} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;