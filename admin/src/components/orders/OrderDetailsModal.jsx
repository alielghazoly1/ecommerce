// src/components/orders/OrderDetailsModal.jsx
import { useState } from 'react';
import { Package, ShoppingCart, Calendar, CreditCard, User, MapPin, Phone, Truck, CheckCircle, Loader2, Navigation } from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { formatPrice, formatDate, getStatusLabel } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../constants';

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-400 font-semibold mb-1">{label}</p>
    <p className="text-white font-bold text-lg">{value || 'غير متوفر'}</p>
  </div>
);

const OrderDetailsModal = ({ order, onClose, onUpdateStatus, updating }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNum, setTrackingNum] = useState(order.trackingNumber || '');

  return (
    <Modal
      title="تفاصيل الطلب"
      subtitle={`رقم الطلب: ${order.orderNumber || order._id?.slice(-8)}`}
      onClose={onClose}
    >
      {/* Status Cards Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: ShoppingCart, color: 'blue', label: 'حالة الطلب', content: <StatusBadge status={order.status} /> },
          { icon: Calendar, color: 'purple', label: 'تاريخ الطلب', content: <p className="text-white font-black text-lg">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p> },
          { icon: CreditCard, color: 'green', label: 'طريقة الدفع', content: <p className="text-white font-black text-lg">{order.paymentMethod === 'cash' ? 'عند الاستلام' : 'بطاقة'}</p> },
        ].map(({ icon: Icon, color, label, content }) => (
          <div key={label} className={`bg-slate-800 rounded-2xl border-2 border-${color}-500/30 p-5`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-${color}-500/30 rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 text-${color}-400`} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-semibold mb-1">{label}</p>
                {content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer & Shipping */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl border-2 border-blue-500/30 p-6">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2"><User className="w-6 h-6 text-blue-400" />معلومات العميل</h3>
          <div className="space-y-3">
            <InfoItem label="الاسم" value={order.userName} />
            <InfoItem label="البريد الإلكتروني" value={order.userEmail} />
            <InfoItem label="رقم الهاتف" value={order.userPhone} />
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl border-2 border-purple-500/30 p-6">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2"><MapPin className="w-6 h-6 text-purple-400" />عنوان الشحن</h3>
          {order.shippingAddress ? (
            <div className="space-y-3">
              <InfoItem label="العنوان" value={`${order.shippingAddress.street}, ${order.shippingAddress.city}`} />
              {order.shippingAddress.state && <InfoItem label="المحافظة" value={order.shippingAddress.state} />}
              <InfoItem label="رقم الهاتف" value={order.shippingAddress.phone} />
            </div>
          ) : <p className="text-gray-400">لا توجد معلومات شحن</p>}
        </div>
      </div>

      {/* ✅ GPS Location */}
      {order.googleMapsLink && (
        <div className="bg-slate-800 rounded-2xl border-2 border-green-500/30 p-6">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-green-400" />
            الموقع الجغرافي للعميل
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-gray-400 text-sm font-semibold">الإحداثيات</p>
              <p className="text-white font-bold font-mono text-sm">
                {order.googleMapsLink.replace('https://www.google.com/maps?q=', '')}
              </p>
            </div>
            <a
              href={order.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-base transition-all transform hover:scale-105 shadow-lg shadow-green-500/30 whitespace-nowrap"
            >
              <MapPin className="w-5 h-5" />
              فتح على الخريطة
            </a>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-slate-800 rounded-2xl border-2 border-cyan-500/30 p-6">
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <Package className="w-6 h-6 text-cyan-400" />المنتجات ({order.items?.length || 0})
        </h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {order.items?.map((item, i) => {
            const hasDiscount = item.originalPrice && item.originalPrice > item.price;
            const discountPct = hasDiscount
              ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
              : 0;
            const lineTotal = (item.price || 0) * (item.quantity || 1);
            const lineCost  = item.costPrice ? item.costPrice * (item.quantity || 1) : null;
            const lineProfit = lineCost !== null ? Math.round(lineTotal - lineCost) : null;

            return (
              <div key={item._id || i} className="flex items-center gap-4 bg-slate-700 rounded-xl p-4 border-2 border-slate-600">
                {item.image && (
                  <div className="relative flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                    {hasDiscount && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-lg truncate">{item.name || 'منتج'}</p>
                  {/* ✅ السعر مع الخصم */}
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-gray-300 text-sm">{item.quantity || 1} ×</span>
                    {hasDiscount ? (
                      <>
                        <span className="text-gray-500 text-sm line-through">{formatPrice(item.originalPrice)} ج.م</span>
                        <span className="text-green-400 font-bold text-sm">{formatPrice(item.price)} ج.م</span>
                        <span className="text-xs bg-orange-500/30 text-orange-300 px-2 py-0.5 rounded-full font-bold">
                          خصم {discountPct}%
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-300 text-sm">{formatPrice(item.price)} ج.م</span>
                    )}
                  </div>
                  {/* 🔒 سعر التكلفة وهامش الربح — للأدمن فقط */}
                  {item.costPrice != null && (
                    <p className="text-xs mt-1">
                      <span className="text-rose-400 font-bold">
                        🔒 تكلفة: {formatPrice(item.costPrice)} ج.م/قطعة
                      </span>
                      {lineProfit !== null && (
                        <span className={`mr-2 font-bold ${lineProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          | ربح: {lineProfit >= 0 ? '+' : ''}{formatPrice(lineProfit)} ج.م
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <p className="text-xl font-black text-green-400 flex-shrink-0">{formatPrice(lineTotal)} ج.م</p>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-6 border-t-2 border-slate-700 space-y-2">
          {/* subtotal */}
          {order.subtotal != null && order.subtotal !== order.totalAmount && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">المجموع الفرعي</span>
              <span className="text-white font-bold">{formatPrice(order.subtotal)} ج.م</span>
            </div>
          )}
          {/* خصم المنتجات */}
          {order.totalDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-400">🏷️ خصم المنتجات</span>
              <span className="text-green-400 font-bold">-{formatPrice(order.totalDiscount)} ج.م</span>
            </div>
          )}
          {/* مصاريف الشحن */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">🚚 مصاريف الشحن</span>
            <span className="text-orange-400 font-bold">{formatPrice(order.shippingFee ?? 60)} ج.م</span>
          </div>
          {/* الإجمالي */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-600">
            <p className="text-2xl font-black text-white">المجموع الكلي</p>
            <p className="text-4xl font-black text-green-400">{formatPrice(order.totalAmount)} ج.م</p>
          </div>
        </div>
      </div>

      {/* Update Status */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border-2 border-purple-500/50 p-6">
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2"><Truck className="w-6 h-6 text-purple-400" />تحديث حالة الطلب</h3>
        <div className="space-y-4">
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-800 border-2 border-purple-500/30 rounded-xl text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
            {ORDER_STATUSES.filter((o) => o.value !== 'all').map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
            ))}
          </select>

          {newStatus === 'shipped' && (
            <input type="text" value={trackingNum} onChange={(e) => setTrackingNum(e.target.value)}
              placeholder="أدخل رقم التتبع"
              className="w-full px-4 py-3.5 bg-slate-800 border-2 border-purple-500/30 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
          )}

          <button onClick={() => onUpdateStatus(order._id, newStatus, trackingNum)}
            disabled={updating || newStatus === order.status}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/50">
            {updating ? <><Loader2 className="w-6 h-6 animate-spin" />جارٍ التحديث...</> : <><CheckCircle className="w-6 h-6" />تحديث الحالة</>}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;