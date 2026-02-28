import { ShoppingBag, XCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from "../../hooks/useOrders"
import OrderCard from "./Ordercard"

import OrderSkeleton from "./Orderskeleton"

import OrderSkeleton from './Orderskeleton';


const MyOrders = () => {
  const { orders, loading, error, fetchOrders, updateOrderLocation } = useOrders();
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="min-h-screen bg-linear-to-br from-slate-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-cyan-600 rounded-2xl mx-auto mb-4 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-xl w-40 mx-auto mb-3 animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-gray-100 px-6" dir="rtl">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-sm">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error}</h2>
          <p className="text-gray-500 text-sm mb-6">تحقق من اتصالك بالإنترنت وحاول مرة أخرى</p>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors mx-auto font-semibold"
          >
            <RefreshCw className="w-4 h-4" />إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-linear-to-br from-slate-50 via-white to-cyan-50/30 px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-200">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900">طلباتي</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {orders.length > 0 ? `${orders.length} طلبات مسجلة` : 'لا توجد طلبات بعد'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700 px-4 py-2 rounded-xl hover:bg-cyan-50 transition-all border border-cyan-100"
          >
            <RefreshCw className="w-4 h-4" />تحديث
          </button>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="bg-white rounded-3xl shadow-xl p-14 border border-gray-100">
              <div className="w-28 h-28 mx-auto mb-6 bg-linear-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-14 h-14 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">لا توجد طلبات بعد</h3>
              <p className="text-gray-500 mb-8">ابدأ التسوق الآن واستمتع بأفضل تجربة شراء</p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-linear-to-r from-cyan-500 to-teal-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-teal-700 transition-all shadow-lg shadow-cyan-200"
              >
                تصفح المنتجات
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} onLocationUpdate={updateOrderLocation} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyOrders;