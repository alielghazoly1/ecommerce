// src/components/Dashboard.jsx - STATIC VERSION (بدون حركة) 📊
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axiosConfig';
import { 
  TrendingUp, TrendingDown, ShoppingCart, Package, DollarSign, Users, 
  Clock, CheckCircle, XCircle, Activity, Loader2, RefreshCw,
  ArrowUpRight, ArrowDownRight, Calendar, Download, BarChart3, 
  Crown, Target, Award, Percent, ShoppingBag, CreditCard, PieChart, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    yesterdayOrders: 0,
    yesterdayRevenue: 0,
    weekOrders: 0,
    weekRevenue: 0,
    lastWeekOrders: 0,
    lastWeekRevenue: 0,
    monthOrders: 0,
    monthRevenue: 0,
    lastMonthOrders: 0,
    lastMonthRevenue: 0,
    averageOrderValue: 0,
    growthRate: 0,
    revenueGrowthRate: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get('/order/list'),
        axios.get('/product/list'),
        axios.get('/users/list'),
      ]);

      if (ordersRes.data.success) {
        const orders = ordersRes.data.data;
        const products = productsRes.data.data || [];
        const users = usersRes.data.data || [];

        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const processingOrders = orders.filter(o => o.status === 'processing').length;
        const completedOrders = orders.filter(o => o.status === 'delivered').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrdersArr = orders.filter(o => new Date(o.createdAt) >= today);
        const todayRevenue = todayOrdersArr.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayOrdersArr = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date >= yesterday && date < today;
        });
        const yesterdayRevenue = yesterdayOrdersArr.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        const weekOrdersArr = orders.filter(o => new Date(o.createdAt) >= weekAgo);
        const weekRevenue = weekOrdersArr.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const lastWeekStart = new Date(weekAgo);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekOrdersArr = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date >= lastWeekStart && date < weekAgo;
        });
        const lastWeekRevenue = lastWeekOrdersArr.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);
        const monthOrdersArr = orders.filter(o => new Date(o.createdAt) >= monthAgo);
        const monthRevenue = monthOrdersArr.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const lastMonthStart = new Date(monthAgo);
        lastMonthStart.setDate(lastMonthStart.getDate() - 30);
        const lastMonthOrdersArr = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date >= lastMonthStart && date < monthAgo;
        });
        const lastMonthRevenue = lastMonthOrdersArr.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const growthRate = lastWeekOrdersArr.length > 0 
          ? ((weekOrdersArr.length - lastWeekOrdersArr.length) / lastWeekOrdersArr.length) * 100 
          : weekOrdersArr.length > 0 ? 100 : 0;

        const revenueGrowthRate = lastWeekRevenue > 0
          ? ((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100
          : weekRevenue > 0 ? 100 : 0;

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.length,
          totalUsers: users.length,
          pendingOrders,
          processingOrders,
          completedOrders,
          cancelledOrders,
          todayOrders: todayOrdersArr.length,
          todayRevenue,
          yesterdayOrders: yesterdayOrdersArr.length,
          yesterdayRevenue,
          weekOrders: weekOrdersArr.length,
          weekRevenue,
          lastWeekOrders: lastWeekOrdersArr.length,
          lastWeekRevenue,
          monthOrders: monthOrdersArr.length,
          monthRevenue,
          lastMonthOrders: lastMonthOrdersArr.length,
          lastMonthRevenue,
          averageOrderValue,
          growthRate,
          revenueGrowthRate,
        });
      }

      setLoading(false);
      setRefreshing(false);
      
      if (isRefresh) {
        toast.success('✨ تم تحديث الإحصائيات بنجاح');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        {/* خلفية ثابتة */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950"></div>

        <div className="relative text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-purple-400" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">جاري تحميل الإحصائيات</h2>
          <p className="text-gray-400 text-lg">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* خلفية ثابتة - بدون حركة */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950"></div>
        {/* دوائر ثابتة - بدون animate-float */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-4 md:p-6 lg:p-10 max-w-[1800px] mx-auto">
        {/* HEADER */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="relative">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 backdrop-blur-xl border border-purple-500/30 rounded-full">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-purple-300">مرحباً بك، {user?.name || 'Admin'}</span>
                  <Crown className="w-4 h-4 text-yellow-400" />
                </div>

                <h1 className="text-6xl font-black text-white leading-tight">
                  لوحة الإحصائيات
                </h1>
                
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
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 disabled:opacity-50"
              >
                <div className="relative flex items-center gap-2">
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'جاري التحديث...' : 'تحديث'}</span>
                </div>
              </button>

              <button className="group relative px-6 py-3 bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105">
                <div className="relative flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>تصدير</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN STATISTICS - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { 
              title: 'إجمالي الطلبات',
              value: stats.totalOrders,
              change: stats.growthRate,
              subtitle: `${stats.weekOrders} هذا الأسبوع`,
              icon: ShoppingCart,
              gradient: 'from-purple-500 to-purple-600',
              bgGradient: 'from-purple-500/10 to-purple-600/5',
            },
            { 
              title: 'إجمالي الإيرادات',
              value: `${stats.totalRevenue.toFixed(0)}`,
              change: stats.revenueGrowthRate,
              subtitle: `${stats.weekRevenue.toFixed(0)} ج.م`,
              icon: DollarSign,
              gradient: 'from-green-500 to-emerald-600',
              bgGradient: 'from-green-500/10 to-emerald-600/5',
              suffix: 'ج.م',
            },
            { 
              title: 'إجمالي المنتجات',
              value: stats.totalProducts,
              change: 0,
              subtitle: 'منتج نشط',
              icon: Package,
              gradient: 'from-blue-500 to-cyan-600',
              bgGradient: 'from-blue-500/10 to-cyan-600/5',
            },
            { 
              title: 'إجمالي المستخدمين',
              value: stats.totalUsers,
              change: 0,
              subtitle: 'مستخدم مسجل',
              icon: Users,
              gradient: 'from-cyan-500 to-blue-600',
              bgGradient: 'from-cyan-500/10 to-blue-600/5',
            },
          ].map((stat, index) => (
            <div 
              key={index}
              className="group relative"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 rounded-3xl`}></div>
              
              <div className="relative h-full bg-slate-900 border border-slate-800 group-hover:border-slate-700 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-4 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    {stat.change !== 0 && (
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${stat.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span className="text-xs font-black">{Math.abs(stat.change).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 font-bold mb-2">{stat.title}</p>
                    <p className="text-5xl font-black text-white mb-1">
                      {stat.value}{stat.suffix && <span className="text-2xl"> {stat.suffix}</span>}
                    </p>
                    <p className="text-sm text-gray-500 font-semibold">{stat.subtitle}</p>
                  </div>

                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                      style={{ width: '70%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER STATUS - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { status: 'completed', icon: CheckCircle, label: 'تم التوصيل', count: stats.completedOrders, color: 'green', gradient: 'from-green-500 via-emerald-500 to-green-600', emoji: '✅' },
            { status: 'pending', icon: Clock, label: 'قيد الانتظار', count: stats.pendingOrders, color: 'yellow', gradient: 'from-yellow-500 via-orange-500 to-yellow-600', emoji: '⏳' },
            { status: 'processing', icon: Activity, label: 'قيد المعالجة', count: stats.processingOrders, color: 'blue', gradient: 'from-blue-500 via-cyan-500 to-blue-600', emoji: '⚡' },
            { status: 'cancelled', icon: XCircle, label: 'ملغي', count: stats.cancelledOrders, color: 'red', gradient: 'from-red-500 via-pink-500 to-red-600', emoji: '❌' },
          ].map(({ status, icon: Icon, label, count, color, gradient, emoji }, index) => {
            const percentage = stats.totalOrders ? (count / stats.totalOrders) * 100 : 0;
            return (
              <div key={status} className="group relative">
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
                    <div 
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500 font-black">{percentage.toFixed(1)}%</p>
                    <p className="text-xs text-gray-600 font-bold">من الإجمالي</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ADVANCED STATISTICS */}
        <div className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today vs Yesterday */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl"></div>
              
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">اليوم مقابل أمس</h2>
                      <p className="text-sm text-gray-400 font-semibold">مقارنة الأداء اليومي</p>
                    </div>
                  </div>
                  <Target className="w-8 h-8 text-orange-400" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                      <div>
                        <p className="text-sm text-gray-400 font-bold mb-1">طلبات اليوم</p>
                        <p className="text-3xl font-black text-white">{stats.todayOrders}</p>
                      </div>
                      <ShoppingBag className="w-8 h-8 text-orange-400" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                      <div>
                        <p className="text-sm text-gray-400 font-bold mb-1">إيرادات اليوم</p>
                        <p className="text-2xl font-black text-green-400">{stats.todayRevenue.toFixed(0)} ج.م</p>
                      </div>
                      <CreditCard className="w-8 h-8 text-green-400" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
                      <div>
                        <p className="text-sm text-gray-500 font-bold mb-1">طلبات أمس</p>
                        <p className="text-3xl font-black text-gray-500">{stats.yesterdayOrders}</p>
                      </div>
                      <ShoppingBag className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
                      <div>
                        <p className="text-sm text-gray-500 font-bold mb-1">إيرادات أمس</p>
                        <p className="text-2xl font-black text-gray-500">{stats.yesterdayRevenue.toFixed(0)} ج.م</p>
                      </div>
                      <CreditCard className="w-8 h-8 text-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-300">الفرق</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 font-semibold">الطلبات:</span>
                        <span className={`text-lg font-black ${stats.todayOrders >= stats.yesterdayOrders ? 'text-green-400' : 'text-red-400'}`}>
                          {stats.todayOrders >= stats.yesterdayOrders ? '+' : ''}{stats.todayOrders - stats.yesterdayOrders}
                        </span>
                      </div>
                      <div className="w-px h-6 bg-slate-700"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 font-semibold">الإيرادات:</span>
                        <span className={`text-lg font-black ${stats.todayRevenue >= stats.yesterdayRevenue ? 'text-green-400' : 'text-red-400'}`}>
                          {stats.todayRevenue >= stats.yesterdayRevenue ? '+' : ''}{(stats.todayRevenue - stats.yesterdayRevenue).toFixed(0)} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Week vs Last Week */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl"></div>
              
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">الأسبوع الحالي vs الماضي</h2>
                      <p className="text-sm text-gray-400 font-semibold">مقارنة الأداء الأسبوعي</p>
                    </div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                      <div>
                        <p className="text-sm text-gray-400 font-bold mb-1">هذا الأسبوع</p>
                        <p className="text-3xl font-black text-white">{stats.weekOrders}</p>
                      </div>
                      <Zap className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                      <div>
                        <p className="text-sm text-gray-400 font-bold mb-1">إيرادات الأسبوع</p>
                        <p className="text-2xl font-black text-green-400">{stats.weekRevenue.toFixed(0)} ج.م</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-400" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
                      <div>
                        <p className="text-sm text-gray-500 font-bold mb-1">الأسبوع الماضي</p>
                        <p className="text-3xl font-black text-gray-500">{stats.lastWeekOrders}</p>
                      </div>
                      <Zap className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
                      <div>
                        <p className="text-sm text-gray-500 font-bold mb-1">إيرادات الأسبوع الماضي</p>
                        <p className="text-2xl font-black text-gray-500">{stats.lastWeekRevenue.toFixed(0)} ج.م</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-300">معدل النمو</span>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${stats.growthRate >= 0 ? 'bg-green-500/20 border border-green-500/40' : 'bg-red-500/20 border border-red-500/40'}`}>
                        {stats.growthRate >= 0 ? <TrendingUp className="w-5 h-5 text-green-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
                        <span className={`text-xl font-black ${stats.growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Month Statistics */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl"></div>
            
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">إحصائيات الشهر</h2>
                    <p className="text-sm text-gray-400 font-semibold">آخر 30 يوم</p>
                  </div>
                </div>
                <Award className="w-8 h-8 text-purple-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-xl">
                      <ShoppingCart className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-xs font-bold text-purple-400 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/30">
                      30 يوم
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-bold mb-2">طلبات الشهر</p>
                  <p className="text-4xl font-black text-white mb-2">{stats.monthOrders}</p>
                  <p className="text-xs text-gray-500 font-semibold">الشهر الماضي: {stats.lastMonthOrders}</p>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-500/20 rounded-xl">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-xs font-bold text-green-400 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/30">
                      30 يوم
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-bold mb-2">إيرادات الشهر</p>
                  <p className="text-4xl font-black text-green-400 mb-2">{stats.monthRevenue.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 font-semibold">الشهر الماضي: {stats.lastMonthRevenue.toFixed(0)} ج.م</p>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-cyan-500/20 rounded-xl">
                      <Percent className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-xs font-bold text-cyan-400 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/30">
                      متوسط
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-bold mb-2">متوسط قيمة الطلب</p>
                  <p className="text-4xl font-black text-cyan-400 mb-2">{stats.averageOrderValue.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 font-semibold">جنيه مصري</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;