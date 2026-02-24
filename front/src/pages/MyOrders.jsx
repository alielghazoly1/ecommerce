import {
  CheckCircle, XCircle, Package, Truck, Clock,
  MapPin, Phone, Calendar, ShoppingBag, CreditCard, Banknote,
  Copy, Check, RefreshCw, ChevronDown, ChevronUp, Scan,
  Navigation, ExternalLink, Loader2,
} from 'lucide-react';
import { useState } from 'react';
import LocationPicker from '../components/LocationPicker';
import { useOrders } from '../hooks/useOrders';
import { formatDate, formatEGP } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  processing: { label: 'قيد التجهيز',  color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  shipped:    { label: 'تم الشحن',     color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  delivered:  { label: 'تم التوصيل',   color: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  cancelled:  { label: 'ملغي',         color: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500' },
};

// ─── Order Progress ────────────────────────────────────────────────────────────
const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const STEP_LABELS  = { pending: 'مراجعة', processing: 'تجهيز', shipped: 'شحن', delivered: 'توصيل' };
const STEP_ICONS   = { pending: Clock, processing: Package, shipped: Truck, delivered: CheckCircle };

const OrderProgress = ({ status }) => {
  if (status === 'cancelled') return null;
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 mb-5">
      {STATUS_STEPS.map((step, idx) => {
        const Icon = STEP_ICONS[step];
        const isCompleted = idx <= currentIdx;
        const isCurrent   = idx === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 
                ${isCompleted ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200' : 'bg-gray-100 text-gray-400'} 
                ${isCurrent ? 'ring-2 ring-cyan-300 ring-offset-1' : ''}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isCompleted ? 'text-cyan-700' : 'text-gray-400'}`}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mb-4 transition-all duration-500 ${idx < currentIdx ? 'bg-cyan-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Tracking Badge ────────────────────────────────────────────────────────────
const TrackingBadge = ({ trackingNumber }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold">
        <Scan className="w-3.5 h-3.5" /> رقم التتبع / الشحن
      </div>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Truck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="font-mono text-sm font-bold text-indigo-800 tracking-widest truncate">{trackingNumber}</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all flex-shrink-0 active:scale-95">
          {copied ? <><Check className="w-3.5 h-3.5" /> تم النسخ</> : <><Copy className="w-3.5 h-3.5" /> نسخ</>}
        </button>
      </div>
    </div>
  );
};

// ─── Order Location ────────────────────────────────────────────────────────────
const OrderLocation = ({ order, onLocationUpdate }) => {
  const [editLocation, setEditLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const { status, googleMapsLink, shippingAddress } = order;
  const canEdit  = status === 'pending';
  const isLocked = ['shipped', 'delivered', 'cancelled'].includes(status);

  const handleSave = async () => {
    if (!editLocation?.latitude) return;
    setSaving(true);
    await onLocationUpdate(order._id, editLocation);
    setSaving(false);
    setShowPicker(false);
    setEditLocation(null);
  };

  if (!googleMapsLink) return null;

  const coords    = googleMapsLink.replace('https://www.google.com/maps?q=', '');
  const placeName = shippingAddress?.location?.placeName;

  const footerMsg = isLocked
    ? '🔒 تم شحن الطلب — لا يمكن تعديل الموقع'
    : status === 'processing'
    ? '⏳ طلبك قيد التجهيز — لا يمكن تعديل الموقع الآن'
    : null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-green-100 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-green-600 text-white text-xs font-semibold">
        <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5" />الموقع الجغرافي للتوصيل</span>
        {canEdit && !showPicker && (
          <button onClick={() => setShowPicker(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-green-700 hover:bg-green-50 font-bold text-xs shadow-sm">
            تعديل الموقع ✏️
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 gap-3 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
          {placeName
            ? <p className="text-sm font-bold text-green-800">{placeName}</p>
            : <p className="text-xs font-mono text-green-700 truncate">{coords}</p>}
        </div>
        <a href={googleMapsLink} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all flex-shrink-0 active:scale-95">
          <ExternalLink className="w-3.5 h-3.5" />فتح الخريطة
        </a>
      </div>

      {canEdit && showPicker && (
        <div className="px-3 pb-3 pt-2 border-t border-green-100 bg-white space-y-3">
          <LocationPicker value={editLocation} onChange={setEditLocation} />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !editLocation?.latitude}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold transition-colors">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saving ? 'جارٍ الحفظ...' : '💾 حفظ الموقع الجديد'}
            </button>
            <button onClick={() => { setShowPicker(false); setEditLocation(null); }}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {footerMsg && (
        <div className="px-3 py-2 border-t border-green-100 text-xs font-semibold bg-amber-50 text-amber-700">{footerMsg}</div>
      )}
    </div>
  );
};

// ─── Order Card ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, onLocationUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />{formatDate(order.createdAt)}
          </p>
          <p className="text-xs font-mono text-gray-500 truncate">#{order._id?.slice(-8).toUpperCase()}</p>
        </div>
        <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />{statusCfg.label}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <OrderProgress status={order.status} />

        {/* Items Preview */}
        <div className="space-y-2">
          {(expanded ? order.items : order.items?.slice(0, 2))?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name || `منتج #${i + 1}`}</p>
                <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-gray-700 flex-shrink-0">{formatEGP(item.price * item.quantity)}</p>
            </div>
          ))}
          {!expanded && order.items?.length > 2 && (
            <button onClick={() => setExpanded(true)} className="w-full text-xs text-cyan-600 hover:text-cyan-700 font-semibold py-1.5 flex items-center justify-center gap-1 hover:bg-cyan-50 rounded-lg transition-colors">
              <ChevronDown className="w-3.5 h-3.5" />عرض {order.items.length - 2} منتجات أخرى
            </button>
          )}
          {expanded && (
            <button onClick={() => setExpanded(false)} className="w-full text-xs text-gray-500 hover:text-gray-700 font-semibold py-1.5 flex items-center justify-center gap-1 hover:bg-gray-50 rounded-lg transition-colors">
              <ChevronUp className="w-3.5 h-3.5" />إخفاء
            </button>
          )}
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{order.shippingAddress.street}</p>
              <p className="text-xs text-gray-500">{order.shippingAddress.city}{order.shippingAddress.state && `, ${order.shippingAddress.state}`}</p>
              {order.shippingAddress.phone && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{order.shippingAddress.phone}</p>
              )}
            </div>
          </div>
        )}

        <OrderLocation order={order} onLocationUpdate={onLocationUpdate} />
        {order.trackingNumber && <TrackingBadge trackingNumber={order.trackingNumber} />}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            {order.paymentMethod === 'cash' ? <Banknote className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
            {order.paymentMethod === 'cash' ? 'دفع عند الاستلام' : 'دفع إلكتروني'}
          </div>
          <p className="text-xl font-black text-gray-900">{formatEGP(order.amount)}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const OrderSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 animate-pulse space-y-4">
    <div className="flex justify-between">
      <div className="space-y-1.5"><div className="h-3 bg-gray-100 rounded w-16" /><div className="h-5 bg-gray-200 rounded w-36" /></div>
      <div className="h-7 bg-gray-100 rounded-full w-24" />
    </div>
    <div className="flex gap-2 mt-2">
      {[...Array(4)].map((_, i) => <div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-8 h-8 bg-gray-100 rounded-full" /><div className="h-2 bg-gray-100 rounded w-8" /></div>)}
    </div>
    <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/3" /></div>
    </div>
    <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
      <div className="h-3 bg-gray-100 rounded w-12" />
      <div className="h-7 bg-gray-200 rounded w-28" />
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const MyOrders = () => {
  const { orders, loading, error, fetchOrders, updateOrderLocation } = useOrders();
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
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
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 px-6" dir="rtl">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-sm">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error}</h2>
          <p className="text-gray-500 text-sm mb-6">تحقق من اتصالك بالإنترنت وحاول مرة أخرى</p>
          <button onClick={fetchOrders} className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors mx-auto font-semibold">
            <RefreshCw className="w-4 h-4" />إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-200">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900">طلباتي</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {orders.length > 0 ? `${orders.length} طلبات مسجلة` : 'لا توجد طلبات بعد'}
              </p>
            </div>
          </div>
          <button onClick={fetchOrders} className="flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700 px-4 py-2 rounded-xl hover:bg-cyan-50 transition-all border border-cyan-100">
            <RefreshCw className="w-4 h-4" />تحديث
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="bg-white rounded-3xl shadow-xl p-14 border border-gray-100">
              <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-14 h-14 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">لا توجد طلبات بعد</h3>
              <p className="text-gray-500 mb-8">ابدأ التسوق الآن واستمتع بأفضل تجربة شراء</p>
              <button onClick={() => navigate('/')} className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-teal-700 transition-all shadow-lg shadow-cyan-200">
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
