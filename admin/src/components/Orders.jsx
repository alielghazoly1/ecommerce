// src/components/Orders.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { Loader2, ShoppingCart, MapPin, Phone, Mail, Calendar, Filter } from 'lucide-react';

const Orders = () => {
  const { token, isAuthenticated } = useAuth();
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/order/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.data.success) {
        setOrders(res.data.data || []);
      } else {
        toast.error('فشل تحميل الطلبات');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'فشل تحميل الطلبات');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      const res = await axios.post('/order/status', 
        {
          orderId,
          status: newStatus,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success('تم تحديث حالة الطلب');
      } else {
        toast.error(res.data.message || 'فشل تحديث الحالة');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'فشل تحديث الحالة');
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [token, isAuthenticated]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      shipped: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'قيد الانتظار',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      cancelled: 'ملغي',
    };
    return texts[status] || status;
  };

  // Filter orders by status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-purple-400" />
            الطلبات
          </h1>
          <p className="text-gray-400">
            إجمالي الطلبات: <span className="text-white font-semibold">{orders.length}</span>
          </p>
        </div>

        {/* Status Filter */}
        {orders.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-400" />
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                الكل ({orders.length})
              </button>
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => {
                const count = orders.filter(o => o.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      statusFilter === status
                        ? getStatusColor(status)
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {getStatusText(status)} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد طلبات حالياً</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد طلبات بهذه الحالة</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => {
              const total = order.items?.reduce(
                (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
                0
              ) || order.totalAmount || 0;

              return (
                <div
                  key={order._id}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          طلب #{order._id?.slice(-6) || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {order.date ? new Date(order.date).toLocaleString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'غير متوفر'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm border cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${getStatusColor(order.status)}`}
                        >
                          <option value="pending" className="bg-slate-800">قيد الانتظار</option>
                          <option value="processing" className="bg-slate-800">قيد المعالجة</option>
                          <option value="shipped" className="bg-slate-800">تم الشحن</option>
                          <option value="delivered" className="bg-slate-800">تم التسليم</option>
                          <option value="cancelled" className="bg-slate-800">ملغي</option>
                        </select>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-400">{total} ج.م</p>
                          <p className="text-xs text-gray-400">الإجمالي</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">معلومات العميل</h4>
                        <div className="space-y-2 text-sm">
                          {order.userEmail && (
                            <p className="text-white flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              {order.userEmail}
                            </p>
                          )}
                          {order.address && (
                            <>
                              <p className="text-white flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                <span>
                                  {order.address.name && `${order.address.name}, `}
                                  {order.address.address || order.address.street}, {order.address.city}
                                </span>
                              </p>
                              {order.address.phone && (
                                <p className="text-white flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  {order.address.phone}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">
                          المنتجات ({order.items?.length || 0})
                        </h4>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div
                              key={item._id || idx}
                              className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                            >
                              {item.image && (
                                <img
                                  src={`${url}/images/${item.image}`}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {item.name || 'منتج'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  الكمية: {item.quantity || 1}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-purple-400">
                                {(item.price || 0) * (item.quantity || 1)} ج.م
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;