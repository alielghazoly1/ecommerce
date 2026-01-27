import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Loader2, 
  ShoppingCart, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Filter,
  Eye,
  X,
  CreditCard,
  Truck,
  CheckCircle,
  Package
} from 'lucide-react';

const Orders = () => {
  const { token, isAuthenticated } = useAuth();
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'الكل', color: 'gray' },
    { value: 'pending', label: 'قيد الانتظار', color: 'yellow' },
    { value: 'processing', label: 'قيد المعالجة', color: 'blue' },
    { value: 'shipped', label: 'تم الشحن', color: 'purple' },
    { value: 'delivered', label: 'تم التوصيل', color: 'green' },
    { value: 'cancelled', label: 'ملغي', color: 'red' },
  ];

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    filterOrders();
  }, [statusFilter, orders]);

  const fetchOrders = async () => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${url}/api/order/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.success) {
        setOrders(res.data.data || []);
        console.log(res.data)
        setFilteredOrders(res.data.data || []);
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

  const filterOrders = () => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  };

  const updateStatus = async (orderId, newStatus, trackingNumber = '') => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      setUpdating(true);
      
      const res = await axios.post(
        `${url}/api/order/status`,
        { 
          orderId, 
          status: newStatus,
          trackingNumber: trackingNumber || undefined
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('تم تحديث حالة الطلب بنجاح');
        await fetchOrders(); // Refresh orders
        setShowModal(false);
      } else {
        toast.error(res.data.message || 'فشل تحديث الحالة');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'gray';
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

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

  // Order Details Modal Component
  const OrderDetailsModal = () => {
    if (!selectedOrder) return null;

    const [newStatus, setNewStatus] = useState(selectedOrder.status);
    const [trackingNum, setTrackingNum] = useState(selectedOrder.trackingNumber || '');

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full border border-white/10 my-8">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between rounded-t-3xl">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Package className="w-8 h-8" />
                تفاصيل الطلب
              </h2>
              <p className="text-white/80 mt-1">
                رقم الطلب: <span className="font-mono">{selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}</span>
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Status & Order Info */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">حالة الطلب</p>
                    <p className={`text-lg font-bold px-3 py-1 rounded-lg inline-block ${getStatusBg(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">تاريخ الطلب</p>
                    <p className="text-white font-semibold">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">طريقة الدفع</p>
                    <p className="text-white font-semibold">
                      {selectedOrder.paymentMethod === 'cash' ? 'الدفع عند الاستلام' : 'بطاقة ائتمان'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  معلومات العميل
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">الاسم</p>
                    <p className="text-white font-medium">{selectedOrder.userName || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">البريد الإلكتروني</p>
                    <p className="text-white font-medium break-all">{selectedOrder.userEmail || 'غير متوفر'}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  عنوان الشحن
                </h3>
                <div className="space-y-3">
                  {selectedOrder.shippingAddress ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-400">العنوان</p>
                        <p className="text-white font-medium">
                          {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}
                        </p>
                      </div>
                      {selectedOrder.shippingAddress.state && (
                        <div>
                          <p className="text-sm text-gray-400">المحافظة</p>
                          <p className="text-white font-medium">{selectedOrder.shippingAddress.state}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          رقم الهاتف
                        </p>
                        <p className="text-white font-medium">{selectedOrder.shippingAddress.phone}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-400">لا توجد معلومات شحن</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                المنتجات ({selectedOrder.items?.length || 0})
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-colors"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg bg-white/10"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.name || 'منتج'}</p>
                      <p className="text-sm text-gray-400">
                        الكمية: <span className="text-purple-400 font-semibold">{item.quantity || 1}</span>
                        {' × '}
                        <span className="text-cyan-400 font-semibold">{(item.price || 0).toFixed(2)} ج.م</span>
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-400">
                      {((item.price || 0) * (item.quantity || 1)).toFixed(2)} ج.م
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold text-white">المجموع الكلي</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                    {selectedOrder.totalAmount.toFixed(2)} ج.م
                  </p>
                </div>
              </div>
            </div>

            {/* Update Status Section */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-400" />
                تحديث حالة الطلب
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الحالة الجديدة
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  >
                    {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                      <option key={option.value} value={option.value} className="bg-slate-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {newStatus === 'shipped' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      رقم التتبع (اختياري)
                    </label>
                    <input
                      type="text"
                      value={trackingNum}
                      onChange={(e) => setTrackingNum(e.target.value)}
                      placeholder="أدخل رقم التتبع"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                  </div>
                )}

                <button
                  onClick={() => updateStatus(selectedOrder._id, newStatus, trackingNum)}
                  disabled={updating || newStatus === selectedOrder.status}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جارٍ التحديث...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      تحديث الحالة
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-3 flex items-center gap-3">
            <ShoppingCart className="w-10 h-10 text-purple-400" />
            إدارة الطلبات
          </h1>
          <p className="text-gray-400 text-lg">
            إجمالي الطلبات: <span className="text-white font-bold">{orders.length}</span>
          </p>
        </div>

        {/* Status Filter */}
        {orders.length > 0 && (
          <div className="mb-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">تصفية حسب الحالة</h3>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {statusOptions.map(option => {
                const count = option.value === 'all' ? orders.length : orders.filter(o => o.status === option.value).length;
                return (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                      statusFilter === option.value
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {option.label} <span className="ml-2 font-bold">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center">
            <ShoppingCart className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">لا توجد طلبات</h3>
            <p className="text-gray-400 text-lg">لم يتم تقديم أي طلبات حتى الآن</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center">
            <Filter className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">لا توجد طلبات بهذه الحالة</h3>
            <p className="text-gray-400 text-lg">جرب تصفية أخرى</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          طلب #{order.orderNumber || order._id?.slice(-8) || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-xl font-bold text-sm border ${getStatusBg(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <div className="text-right">
                        <p className="text-3xl font-black bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                          {(order.totalAmount || 0).toFixed(2)} ج.م
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{order.itemsCount || order.items?.length || 0} منتج</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details & Action */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {order.userEmail || 'غير متوفر'}
                      </span>
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {order.paymentMethod === 'cash' ? 'عند الاستلام' : 'بطاقة'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
                    >
                      <Eye className="w-5 h-5" />
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && <OrderDetailsModal />}
    </div>
  );
};

export default Orders;