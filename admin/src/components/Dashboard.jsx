// src/components/Dashboard.jsx - ENHANCED VERSION ✨
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown,
  ShoppingCart, 
  Package, 
  DollarSign, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  RefreshCw,
  Activity,
  Calendar,
  ArrowRight,
  Eye,
  Percent,
  ShoppingBag,
  Star,
  TrendingUpIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const url = "https://tropical-kiah-totacheco-1c5e3dcb.koyeb.app";
  
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
    weekOrders: 0,
    weekRevenue: 0,
    monthOrders: 0,
    monthRevenue: 0,
    averageOrderValue: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get(`${url}/api/order/list`, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${url}/api/product/list`),
        axios.get(`${url}/api/users/list`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      if (ordersRes.data.success) {
        const orders = ordersRes.data.data;
        const products = productsRes.data.data || [];

        // حساب الإحصائيات المتقدمة
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const processingOrders = orders.filter(o => o.status === 'processing').length;
        const completedOrders = orders.filter(o => o.status === 'delivered').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

        // حساب إحصائيات اليوم
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrdersArr = orders.filter(o => new Date(o.createdAt) >= today);
        const todayRevenue = todayOrdersArr.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // حساب إحصائيات الأسبوع
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        const weekOrdersArr = orders.filter(o => new Date(o.createdAt) >= weekAgo);
        const weekRevenue = weekOrdersArr.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // حساب إحصائيات الشهر
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);
        const monthOrdersArr = orders.filter(o => new Date(o.createdAt) >= monthAgo);
        const monthRevenue = monthOrdersArr.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.length,
          totalUsers: usersRes.data.data?.length || 0,
          pendingOrders,
          processingOrders,
          completedOrders,
          cancelledOrders,
          todayOrders: todayOrdersArr.length,
          todayRevenue,
          weekOrders: weekOrdersArr.length,
          weekRevenue,
          monthOrders: monthOrdersArr.length,
          monthRevenue,
          averageOrderValue,
        });

        // أحدث 5 طلبات
        const recentOrdersArr = orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentOrders(recentOrdersArr);

        // أشهر 5 منتجات (حسب عدد المبيعات)
        const productSales = {};
        orders.forEach(order => {
          order.items?.forEach(item => {
            if (productSales[item.productId]) {
              productSales[item.productId].quantity += item.quantity;
              productSales[item.productId].revenue += item.price * item.quantity;
            } else {
              productSales[item.productId] = {
                name: item.name,
                quantity: item.quantity,
                revenue: item.price * item.quantity,
                image: item.image,
              };
            }
          });
        });

        const topProductsArr = Object.values(productSales)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
        setTopProducts(topProductsArr);
      }

      setLoading(false);
      setRefreshing(false);
      
      if (isRefresh) {
        toast.success('تم تحديث البيانات بنجاح');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      setRefreshing(false);
      if (isRefresh) {
        toast.error('فشل تحديث البيانات');
      }
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // =====================
  // Components
  // =====================

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, trendValue, bgColor, iconColor, onClick }) => (
    <div 
      className={`group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
            trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}%
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );

  const TimeRangeCard = ({ title, orders, revenue, icon: Icon, color }) => (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-purple-500/20 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-gray-400 text-xs">{title}</p>
          <p className="text-white font-bold text-lg">{orders} طلب</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-green-400 font-bold">{revenue.toFixed(2)} ج.م</p>
        <ArrowRight className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  );

  const getStatusBg = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'قيد الانتظار',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    };
    return labels[status] || status;
  };

  // =====================
  // Loading State
  // =====================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
      {/* ===================== */}
      {/* Header */}
      {/* ===================== */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-black text-white mb-3 flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-purple-400" />
              لوحة التحكم
            </h1>
            <p className="text-gray-400 text-lg">مرحباً بك في لوحة إدارة المتجر</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>

        {/* Quick Time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TimeRangeCard 
            title="اليوم"
            orders={stats.todayOrders}
            revenue={stats.todayRevenue}
            icon={Activity}
            color="bg-gradient-to-br from-cyan-500 to-blue-600"
          />
          <TimeRangeCard 
            title="آخر 7 أيام"
            orders={stats.weekOrders}
            revenue={stats.weekRevenue}
            icon={Calendar}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <TimeRangeCard 
            title="آخر 30 يوم"
            orders={stats.monthOrders}
            revenue={stats.monthRevenue}
            icon={TrendingUpIcon}
            color="bg-gradient-to-br from-orange-500 to-red-600"
          />
        </div>
      </div>

      {/* ===================== */}
      {/* Main Stats Grid */}
      {/* ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={DollarSign}
          title="إجمالي الإيرادات"
          value={`${(stats.totalRevenue || 0).toFixed(2)} ج.م`}
          subtitle={`متوسط الطلب: ${(stats.averageOrderValue || 0).toFixed(2)} ج.م`}
          bgColor="bg-gradient-to-br from-green-500 to-emerald-600"
          iconColor="text-white"
          trend="up"
          trendValue="12.5"
        />
        
        <StatCard
          icon={ShoppingCart}
          title="إجمالي الطلبات"
          value={stats.totalOrders || 0}
          subtitle={`اليوم: ${stats.todayOrders || 0} طلب`}
          bgColor="bg-gradient-to-br from-blue-500 to-cyan-600"
          iconColor="text-white"
          trend="up"
          trendValue="8.3"
          onClick={() => navigate('/admin/orders')}
        />
        
        <StatCard
          icon={Package}
          title="إجمالي المنتجات"
          value={stats.totalProducts || 0}
          bgColor="bg-gradient-to-br from-purple-500 to-pink-600"
          iconColor="text-white"
          onClick={() => navigate('/admin/list')}
        />
        
        <StatCard
          icon={Users}
          title="إجمالي المستخدمين"
          value={stats.totalUsers || 0}
          bgColor="bg-gradient-to-br from-orange-500 to-red-600"
          iconColor="text-white"
          onClick={() => navigate('/admin/users')}
        />
      </div>

      {/* ===================== */}
      {/* Order Status Cards */}
      {/* ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">طلبات مكتملة</p>
              <p className="text-3xl font-black text-white">{stats.completedOrders || 0}</p>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.totalOrders ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalOrders ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}% من الإجمالي
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-yellow-500/30 transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">قيد الانتظار</p>
              <p className="text-3xl font-black text-white">{stats.pendingOrders || 0}</p>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.totalOrders ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalOrders ? ((stats.pendingOrders / stats.totalOrders) * 100).toFixed(1) : 0}% من الإجمالي
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">قيد المعالجة</p>
              <p className="text-3xl font-black text-white">{stats.processingOrders || 0}</p>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.totalOrders ? (stats.processingOrders / stats.totalOrders) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalOrders ? ((stats.processingOrders / stats.totalOrders) * 100).toFixed(1) : 0}% من الإجمالي
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-red-500/30 transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">طلبات ملغاة</p>
              <p className="text-3xl font-black text-white">{stats.cancelledOrders || 0}</p>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.totalOrders ? (stats.cancelledOrders / stats.totalOrders) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalOrders ? ((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1) : 0}% من الإجمالي
          </p>
        </div>
      </div>

      {/* ===================== */}
      {/* Two Column Layout */}
      {/* ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-purple-400" />
              أحدث الطلبات
            </h2>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
            >
              <Eye className="w-4 h-4" />
              عرض الكل
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">لا توجد طلبات حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div 
                  key={order._id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => navigate('/admin/orders')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{order.userName}</p>
                        <p className="text-xs text-gray-400">{order.userEmail}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusBg(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : '-'}
                    </p>
                    <p className="font-bold text-green-400">{(order.totalAmount || 0).toFixed(2)} ج.م</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Star className="w-7 h-7 text-yellow-400" />
              أكثر المنتجات مبيعاً
            </h2>
            <button 
              onClick={() => navigate('/admin/list')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/30"
            >
              <Eye className="w-4 h-4" />
              عرض الكل
            </button>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">لا توجد مبيعات بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div 
                  key={index}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-yellow-500/30 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-slate-900">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.quantity} مبيعة</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-400">{(product.revenue || 0).toFixed(2)} ج.م</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;