import { useState, useEffect, useMemo } from 'react';
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
  Package,
  Search,
  XCircle,
  User
} from 'lucide-react';

// ============================================
// CONSTANTS
// ============================================
const STATUS_OPTIONS = [
  { value: 'all', label: 'الكل', color: 'gray' },
  { value: 'pending', label: 'قيد الانتظار', color: 'yellow' },
  { value: 'processing', label: 'قيد المعالجة', color: 'blue' },
  { value: 'shipped', label: 'تم الشحن', color: 'purple' },
  { value: 'delivered', label: 'تم التوصيل', color: 'green' },
  { value: 'cancelled', label: 'ملغي', color: 'red' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50',
  processing: 'bg-blue-500/30 text-blue-300 border-blue-400/50',
  shipped: 'bg-purple-500/30 text-purple-300 border-purple-400/50',
  delivered: 'bg-green-500/30 text-green-300 border-green-400/50',
  cancelled: 'bg-red-500/30 text-red-300 border-red-400/50',
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatPrice = (price) => {
  const num = Number(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const getStatusBg = (status) => STATUS_COLORS[status] || STATUS_COLORS.pending;

const getStatusLabel = (status) => {
  const option = STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.label : status;
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ============================================
// MAIN COMPONENT
// ============================================
const Orders = () => {
  const { token, isAuthenticated } = useAuth();
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  // State Management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [token, isAuthenticated]);

  // ============================================
  // API FUNCTIONS
  // ============================================
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
        await fetchOrders();
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

  // ============================================
  // FILTERING & SEARCH
  // ============================================
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.orderNumber?.toLowerCase().includes(query) ||
        order.userName?.toLowerCase().includes(query) ||
        order.userEmail?.toLowerCase().includes(query) ||
        order.userPhone?.includes(query) ||
        order._id?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [orders, statusFilter, searchQuery]);

  // ============================================
  // STATS CALCULATION
  // ============================================
  const stats = useMemo(() => {
    return STATUS_OPTIONS.reduce((acc, option) => {
      acc[option.value] = option.value === 'all' 
        ? orders.length 
        : orders.filter(o => o.status === option.value).length;
      return acc;
    }, {});
  }, [orders]);

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white text-xl font-bold">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen">
      {/* STICKY HEADER WITH SEARCH */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              <ShoppingCart className="w-10 h-10 text-purple-400" />
              إدارة الطلبات
            </h1>
            <p className="text-gray-300 text-lg font-semibold">
              إجمالي الطلبات: <span className="text-purple-400">{orders.length}</span>
            </p>
          </div>

          {/* Search Bar */}
          {orders.length > 0 && (
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم الطلب، اسم العميل، البريد الإلكتروني، أو رقم الهاتف..."
                className="w-full pr-14 pl-14 py-4 bg-slate-800 border-2 border-purple-500/30 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition bg-slate-700 rounded-lg p-1.5"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto p-6">
        
        {/* STATUS FILTERS */}
        {orders.length > 0 && (
          <div className="mb-8 bg-slate-800 rounded-2xl border-2 border-purple-500/20 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <Filter className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">تصفية حسب الحالة</h3>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {STATUS_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-6 py-3.5 rounded-xl font-bold text-base transition-all transform hover:scale-105 border-2 ${
                    statusFilter === option.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-2xl shadow-purple-500/50'
                      : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600 hover:border-purple-500/50'
                  }`}
                >
                  {option.label} <span className="ml-2 font-black text-lg">({stats[option.value]})</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* ORDERS LIST */}
        <OrdersList
          orders={orders}
          filteredOrders={filteredOrders}
          setSelectedOrder={setSelectedOrder}
          setShowModal={setShowModal}
        />
        
        {/* MODAL */}
        {showModal && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setShowModal(false)}
            onUpdateStatus={updateStatus}
            updating={updating}
          />
        )}
      </div>
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

// Orders List Component
const OrdersList = ({ orders, filteredOrders, setSelectedOrder, setShowModal }) => {
  // Empty state
  if (orders.length === 0) {
    return (
      <div className="bg-slate-800 rounded-3xl border-2 border-purple-500/20 p-20 text-center shadow-2xl">
        <ShoppingCart className="w-24 h-24 text-gray-500 mx-auto mb-6" />
        <h3 className="text-3xl font-bold text-white mb-3">لا توجد طلبات</h3>
        <p className="text-gray-300 text-xl">لم يتم تقديم أي طلبات حتى الآن</p>
      </div>
    );
  }

  // No results after filtering
  if (filteredOrders.length === 0) {
    return (
      <div className="bg-slate-800 rounded-3xl border-2 border-purple-500/20 p-20 text-center shadow-2xl">
        <Filter className="w-24 h-24 text-gray-500 mx-auto mb-6" />
        <h3 className="text-3xl font-bold text-white mb-3">لا توجد نتائج</h3>
        <p className="text-gray-300 text-xl">جرب تغيير معايير البحث أو التصفية</p>
      </div>
    );
  }

  // Orders grid
  return (
    <div className="grid gap-6">
      {filteredOrders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          onViewDetails={() => {
            setSelectedOrder(order);
            setShowModal(true);
          }}
        />
      ))}
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order, onViewDetails }) => (
  <div className="group bg-slate-800 rounded-2xl border-2 border-purple-500/20 overflow-hidden hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
    <div className="p-6">
      {/* Order Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b-2 border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-1">
              طلب #{order.orderNumber || order._id?.slice(-8) || 'N/A'}
            </h3>
            <p className="text-base text-gray-300 flex items-center gap-2 font-semibold">
              <Calendar className="w-4 h-4 text-purple-400" />
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`px-5 py-2.5 rounded-xl font-black text-base border-2 ${getStatusBg(order.status)} shadow-lg`}>
            {getStatusLabel(order.status)}
          </span>
          <div className="text-right">
            <p className="text-4xl font-black text-green-400 mb-1">
              {formatPrice(order.totalAmount)} ج.م
            </p>
            <p className="text-sm text-gray-400 font-bold">
              {order.itemsCount || order.items?.length || 0} منتج
            </p>
          </div>
        </div>
      </div>

      {/* Order Details & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3 text-base">
          <span className="flex items-center gap-3 text-gray-200 font-semibold">
            <User className="w-5 h-5 text-purple-400" />
            {order.userName || 'غير متوفر'}
          </span>
          <span className="flex items-center gap-3 text-gray-200 font-semibold">
            <Mail className="w-5 h-5 text-blue-400" />
            {order.userEmail || 'غير متوفر'}
          </span>
          <span className="flex items-center gap-3 text-gray-200 font-semibold">
            <Phone className="w-5 h-5 text-green-400" />
            {order.userPhone || order.shippingAddress?.phone || 'غير متوفر'}
          </span>
        </div>

        <button
          onClick={onViewDetails}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"
        >
          <Eye className="w-6 h-6" />
          عرض التفاصيل
        </button>
      </div>
    </div>
  </div>
);

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, onUpdateStatus, updating }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNum, setTrackingNum] = useState(order.trackingNumber || '');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full border-2 border-purple-500/30 my-8">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Package className="w-9 h-9" />
              تفاصيل الطلب
            </h2>
            <p className="text-white text-lg font-bold mt-1">
              رقم الطلب: <span className="font-mono">{order.orderNumber || order._id?.slice(-8)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-7 h-7 text-white" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          
          {/* Status & Order Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-2xl border-2 border-blue-500/30 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-semibold mb-1">حالة الطلب</p>
                  <p className={`text-lg font-black px-3 py-1.5 rounded-lg inline-block border-2 ${getStatusBg(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border-2 border-purple-500/30 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-semibold mb-1">تاريخ الطلب</p>
                  <p className="text-white font-black text-lg">
                    {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border-2 border-green-500/30 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-semibold mb-1">طريقة الدفع</p>
                  <p className="text-white font-black text-lg">
                    {order.paymentMethod === 'cash' ? 'عند الاستلام' : 'بطاقة'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-slate-800 rounded-2xl border-2 border-blue-500/30 p-6">
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-400" />
                معلومات العميل
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 font-semibold mb-1">الاسم</p>
                  <p className="text-white font-bold text-lg">{order.userName || 'غير متوفر'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-semibold mb-1">البريد الإلكتروني</p>
                  <p className="text-white font-bold text-lg break-all">{order.userEmail || 'غير متوفر'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-semibold mb-1">رقم الهاتف</p>
                  <p className="text-white font-bold text-lg">{order.userPhone || 'غير متوفر'}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-slate-800 rounded-2xl border-2 border-purple-500/30 p-6">
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-purple-400" />
                عنوان الشحن
              </h3>
              <div className="space-y-3">
                {order.shippingAddress ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-400 font-semibold mb-1">العنوان</p>
                      <p className="text-white font-bold text-lg">
                        {order.shippingAddress.street}, {order.shippingAddress.city}
                      </p>
                    </div>
                    {order.shippingAddress.state && (
                      <div>
                        <p className="text-sm text-gray-400 font-semibold mb-1">المحافظة</p>
                        <p className="text-white font-bold text-lg">{order.shippingAddress.state}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400 font-semibold mb-1 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        رقم الهاتف
                      </p>
                      <p className="text-white font-bold text-lg">{order.shippingAddress.phone}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-lg">لا توجد معلومات شحن</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-slate-800 rounded-2xl border-2 border-cyan-500/30 p-6">
            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-cyan-400" />
              المنتجات ({order.items?.length || 0})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {order.items?.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="flex items-center gap-4 bg-slate-700 rounded-xl p-4 border-2 border-slate-600 hover:border-purple-500/50 transition-colors"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg bg-slate-600"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-lg truncate">{item.name || 'منتج'}</p>
                    <p className="text-base text-gray-300 font-semibold">
                      الكمية: <span className="text-purple-400 font-black">{item.quantity || 1}</span>
                      {' × '}
                      <span className="text-cyan-400 font-black">{formatPrice(item.price)} ج.م</span>
                    </p>
                  </div>
                  <p className="text-xl font-black text-green-400">
                    {formatPrice((item.price || 0) * (item.quantity || 1))} ج.م
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-6 border-t-2 border-slate-700">
              <div className="flex justify-between items-center">
                <p className="text-2xl font-black text-white">المجموع الكلي</p>
                <p className="text-4xl font-black text-green-400">
                  {formatPrice(order.totalAmount)} ج.م
                </p>
              </div>
            </div>
          </div>

          {/* Update Status Section */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border-2 border-purple-500/50 p-6">
            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Truck className="w-6 h-6 text-purple-400" />
              تحديث حالة الطلب
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-base font-bold text-gray-300 mb-2">
                  الحالة الجديدة
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-800 border-2 border-purple-500/30 rounded-xl text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                >
                  {STATUS_OPTIONS.filter(opt => opt.value !== 'all').map(option => (
                    <option key={option.value} value={option.value} className="bg-slate-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {newStatus === 'shipped' && (
                <div>
                  <label className="block text-base font-bold text-gray-300 mb-2">
                    رقم التتبع (اختياري)
                  </label>
                  <input
                    type="text"
                    value={trackingNum}
                    onChange={(e) => setTrackingNum(e.target.value)}
                    placeholder="أدخل رقم التتبع"
                    className="w-full px-4 py-3.5 bg-slate-800 border-2 border-purple-500/30 rounded-xl text-white text-lg placeholder-gray-500 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
              )}

              <button
                onClick={() => onUpdateStatus(order._id, newStatus, trackingNum)}
                disabled={updating || newStatus === order.status}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/50"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    جارٍ التحديث...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
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

export default Orders;