import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  Truck,
  Clock,
  MapPin,
  Phone,
  Calendar,
  ShoppingBag,
} from 'lucide-react';

// ✅ axios instance برا الـ component - مش بيتعمل في كل render
const api = axios.create({ withCredentials: true });

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { url, isAuthenticated, authLoading } = useContext(ShopContext);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.post(`${url}/api/order/userorders`);

      if (res.data?.success) {
        const ordersData = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];
        setOrders(ordersData);
      } else {
        setError('فشل تحميل الطلبات');
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('حدث خطأ في تحميل الطلبات');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ انتظر authLoading قبل ما تعمل أي حاجة
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, authLoading, navigate]);

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'قيد المراجعة',
        icon: Clock,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
      },
      processing: {
        label: 'قيد التجهيز',
        icon: Package,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
      },
      shipped: {
        label: 'تم الشحن',
        icon: Truck,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
      },
      delivered: {
        label: 'تم التوصيل',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
      },
      cancelled: {
        label: 'ملغي',
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
      },
    };
    return configs[status] || configs.pending;
  };

  // ✅ لما authLoading أو loading تكون true
  if (authLoading || loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Loader2 className="w-20 h-20 animate-spin text-cyan-600" />
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-cyan-100"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-6">
            جاري تحميل طلباتك...
          </h2>
          <p className="text-gray-500 mt-2">لحظة من فضلك</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6">
        <div className="text-center">
          <XCircle className="w-24 h-24 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
          <button
            onClick={fetchOrders}
            className="mt-4 px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl mb-4 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3">
            طلباتي
          </h1>
          <p className="text-gray-600 text-lg">
            {orders.length > 0
              ? `لديك ${orders.length} ${orders.length === 1 ? 'طلب' : 'طلبات'}`
              : 'لا توجد طلبات بعد'}
          </p>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="bg-white rounded-3xl shadow-lg p-12">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                لا توجد طلبات بعد
              </h3>
              <p className="text-gray-600 mb-6">
                ابدأ التسوق الآن واستمتع بتجربة فريدة
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg hover:shadow-xl"
              >
                تصفح المنتجات
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const total = order.totalAmount || 0;
              const itemsCount = order.itemsCount || order.items?.length || 0;

              return (
                <div
                  key={order._id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Status Bar */}
                  <div className={`h-2 ${statusConfig.bg} ${statusConfig.border} border-b-2`} />

                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          رقم الطلب
                        </h3>
                        <p className="text-lg font-bold text-gray-900">
                          {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.border} border`}>
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span className={`text-sm font-semibold ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Order Date */}
                    {order.createdAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    )}

                    {/* Items Preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        المنتجات ({itemsCount})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {order.items?.map((item, idx) => (
                          <div
                            key={item._id || idx}
                            className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                          >
                            {item.image && (
                              <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-1"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                الكمية: {item.quantity || 1}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPrice(item.price * (item.quantity || 1))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          عنوان التوصيل
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {order.shippingAddress.street}, {order.shippingAddress.city}
                          {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                        </p>
                        {order.shippingAddress.phone && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.shippingAddress.phone}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Total */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">الإجمالي</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyOrders;