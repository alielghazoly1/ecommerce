import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { token } = useAuth();
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get(`${url}/api/order/list`, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${url}/api/product/list`, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${url}/api/users/list`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      if (ordersRes.data.success) {
        const orders = ordersRes.data.data;

        // حساب الإحصائيات
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const processingOrders = orders.filter(o => o.status === 'processing').length;
        const completedOrders = orders.filter(o => o.status === 'delivered').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrdersArr = orders.filter(o => new Date(o.createdAt) >= today);
        const todayRevenue = todayOrdersArr.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: productsRes.data.data?.length || 0,
          totalUsers: usersRes.data.data?.length || 0,
          pendingOrders: pendingOrders + processingOrders,
          completedOrders,
          cancelledOrders,
          todayOrders: todayOrdersArr.length,
          todayRevenue,
        });

        // أحدث 5 طلبات
        const recentOrdersArr = orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentOrders(recentOrdersArr);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, trendValue, bgColor, iconColor }) => (
    <div className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-3 flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-purple-400" />
          لوحة التحكم
        </h1>
        <p className="text-gray-400 text-lg">مرحباً بك في لوحة إدارة المتجر</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={DollarSign}
          title="إجمالي الإيرادات"
          value={`${(stats.totalRevenue || 0).toFixed(2)} ج.م`}
          subtitle={`اليوم: ${(stats.todayRevenue || 0).toFixed(2)} ج.م`}
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
        />
        
        <StatCard
          icon={Package}
          title="إجمالي المنتجات"
          value={stats.totalProducts || 0}
          bgColor="bg-gradient-to-br from-purple-500 to-pink-600"
          iconColor="text-white"
        />
        
        <StatCard
          icon={Users}
          title="إجمالي المستخدمين"
          value={stats.totalUsers || 0}
          bgColor="bg-gradient-to-br from-orange-500 to-red-600"
          iconColor="text-white"
        />
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-yellow-500/30 transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">طلبات معلقة</p>
              <p className="text-3xl font-black text-white">{stats.pendingOrders || 0}</p>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.totalOrders ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }}
            />
          </div>
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
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-purple-400" />
            أحدث الطلبات
          </h2>
          <button 
            onClick={() => window.location.href = '/admin/orders'}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            عرض الكل
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد طلبات حتى الآن</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">رقم الطلب</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">العميل</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">المبلغ</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">الحالة</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr 
                    key={order._id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => window.location.href = '/admin/orders'}
                  >
                    <td className="py-4 px-4">
                      <p className="font-mono font-semibold text-white">{order.orderNumber || order._id.slice(-8)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-white font-medium">{order.userName}</p>
                      <p className="text-sm text-gray-400">{order.userEmail}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-green-400">{(order.totalAmount || 0).toFixed(2)} ج.م</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${getStatusBg(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
