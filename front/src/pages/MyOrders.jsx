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
  CreditCard,
  Banknote,
  Hash,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Scan,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const api = axios.create({ withCredentials: true });

// ─── Tracking Number Badge ────────────────────────────────────────────────────
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
        <Scan className="w-3.5 h-3.5" />
        رقم التتبع / الشحن
      </div>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Truck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="font-mono text-sm font-bold text-indigo-800 tracking-widest truncate">
            {trackingNumber}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all flex-shrink-0 active:scale-95"
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5" /> تم النسخ</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> نسخ</>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Progress Steps ───────────────────────────────────────────────────────────
const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

const OrderProgress = ({ status }) => {
  if (status === 'cancelled') return null;
  const currentIdx = statusSteps.indexOf(status);

  const labels = {
    pending: 'مراجعة',
    processing: 'تجهيز',
    shipped: 'شحن',
    delivered: 'توصيل',
  };

  const icons = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
  };

  return (
    <div className="flex items-center gap-0 mb-5">
      {statusSteps.map((step, idx) => {
        const Icon = icons[step];
        const isCompleted = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200'
                    : 'bg-gray-100 text-gray-400'
                } ${isCurrent ? 'ring-2 ring-cyan-300 ring-offset-1' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isCompleted ? 'text-cyan-700' : 'text-gray-400'}`}>
                {labels[step]}
              </span>
            </div>
            {idx < statusSteps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mb-4 transition-all duration-500 ${
                  idx < currentIdx ? 'bg-cyan-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};


// ─── Order Location Section ───────────────────────────────────────────────────
// pending     → يضيف ويعدل الموقع بحرية
// processing  → يشوف الموقع بس (view only)
// shipped+    → view only + رسالة مقفول

const OrderLocationSection = ({ order, onLocationUpdate }) => {
  const { status } = order;
  const canEdit   = status === 'pending';          // يعدل بس في pending
  const viewOnly  = status === 'processing';       // يشوف بس
  const isLocked  = ['shipped', 'delivered', 'cancelled'].includes(status);

  const [editLocation, setEditLocation] = useState(null);
  const [saving, setSaving]             = useState(false);
  const [showPicker, setShowPicker]     = useState(false);

  const handleSave = async () => {
    if (!editLocation?.latitude) return;
    setSaving(true);
    await onLocationUpdate(order._id, editLocation);
    setSaving(false);
    setShowPicker(false);
    setEditLocation(null);
  };

  // ── Helper: view card (used in view-only + locked modes) ──────────────────
  const LocationViewCard = ({ footerMsg, footerColor = 'amber' }) => {
    const coords    = order.googleMapsLink.replace('https://www.google.com/maps?q=', '');
    const placeName = order.shippingAddress?.location?.placeName;
    const footerColors = {
      amber: 'bg-amber-50 border-amber-100 text-amber-700',
      blue:  'bg-blue-50  border-blue-100  text-blue-700',
    };

    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-green-100 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-xs font-semibold">
          <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
          <span>الموقع الجغرافي للتوصيل</span>
        </div>

        {/* Place info + map link */}
        <div className="flex items-center justify-between px-4 py-3 gap-3 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              {placeName
                ? <p className="text-sm font-bold text-green-800 leading-snug">{placeName}</p>
                : <p className="text-xs font-mono text-green-700 truncate">{coords}</p>
              }
            </div>
          </div>
          <a
            href={order.googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all flex-shrink-0 shadow hover:shadow-md active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            فتح الخريطة
          </a>
        </div>

        {/* Footer message */}
        {footerMsg && (
          <div className={`px-3 py-2 border-t text-xs font-semibold ${footerColors[footerColor]}`}>
            {footerMsg}
          </div>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════
  // CASE 1: Has location
  // ══════════════════════════════════════════════════════════
  if (order.googleMapsLink) {
    // processing → view only
    if (viewOnly) {
      return <LocationViewCard footerColor="blue" footerMsg="⏳ طلبك قيد التجهيز — لا يمكن تعديل الموقع الآن" />;
    }

    // shipped+ → locked
    if (isLocked) {
      return <LocationViewCard footerColor="amber" footerMsg="🔒 تم شحن الطلب — لا يمكن تعديل الموقع" />;
    }

    // pending → can edit
    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-green-100 shadow-sm">
        {/* Header with prominent edit button */}
        <div className="flex items-center justify-between px-3 py-2 bg-green-600 text-white text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" />
            الموقع الجغرافي للتوصيل
          </span>
          {!showPicker && (
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-green-700 hover:bg-green-50 font-bold transition-all text-xs shadow-sm"
            >
              <Navigation className="w-3 h-3" />
              تعديل الموقع ✏️
            </button>
          )}
        </div>

        {/* Place name + map link */}
        <div className="flex items-center justify-between px-4 py-3 gap-3 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              {order.shippingAddress?.location?.placeName
                ? <p className="text-sm font-bold text-green-800">{order.shippingAddress.location.placeName}</p>
                : <p className="text-xs font-mono text-green-700 truncate">{order.googleMapsLink.replace('https://www.google.com/maps?q=', '')}</p>
              }
            </div>
          </div>
          <a
            href={order.googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all flex-shrink-0 shadow hover:shadow-md active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            فتح الخريطة
          </a>
        </div>

        {/* Edit picker */}
        {showPicker && (
          <div className="px-3 pb-3 pt-2 border-t border-green-100 bg-white space-y-3">
            <p className="text-xs text-gray-500 font-semibold">اختر الموقع الجديد من الخريطة أو اسحب البين:</p>
            <LocationPicker value={editLocation} onChange={setEditLocation} disabled={false} />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !editLocation?.latitude}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold transition-colors shadow"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'جارٍ الحفظ...' : '💾 حفظ الموقع الجديد'}
              </button>
              <button
                onClick={() => { setShowPicker(false); setEditLocation(null); }}
                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // CASE 2: No location
  // ══════════════════════════════════════════════════════════

  // Only pending can add location
  if (!canEdit) return null;

  return (
    <div className="mt-3">
      {!showPicker ? (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-cyan-300 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-500 transition-all text-xs font-bold"
        >
          <Navigation className="w-4 h-4" />
          📍 إضافة موقعك لتسهيل التوصيل
        </button>
      ) : (
        <div className="rounded-xl border-2 border-cyan-200 overflow-hidden shadow-sm">
          <div className="px-3 py-2 bg-cyan-600 text-white text-xs font-bold flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" />
            تحديد موقع التوصيل
          </div>
          <div className="p-3 bg-white space-y-3">
            <LocationPicker value={editLocation} onChange={setEditLocation} disabled={false} />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !editLocation?.latitude}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold transition-colors shadow"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'جارٍ الحفظ...' : '💾 حفظ الموقع'}
              </button>
              <button
                onClick={() => { setShowPicker(false); setEditLocation(null); }}
                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Single Order Card ────────────────────────────────────────────────────────
const OrderCard = ({ order, formatDate, formatPrice, onLocationUpdate }) => {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    pending: {
      label: 'قيد المراجعة',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      pill: 'bg-amber-100 text-amber-800',
      accent: 'from-amber-400 to-orange-400',
    },
    processing: {
      label: 'قيد التجهيز',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      pill: 'bg-blue-100 text-blue-800',
      accent: 'from-blue-400 to-cyan-400',
    },
    shipped: {
      label: 'تم الشحن',
      color: 'text-violet-700',
      bg: 'bg-violet-50',
      border: 'border-violet-300',
      pill: 'bg-violet-100 text-violet-800',
      accent: 'from-violet-400 to-purple-400',
    },
    delivered: {
      label: 'تم التوصيل',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      pill: 'bg-emerald-100 text-emerald-800',
      accent: 'from-emerald-400 to-teal-400',
    },
    cancelled: {
      label: 'ملغي',
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-300',
      pill: 'bg-red-100 text-red-800',
      accent: 'from-red-400 to-rose-400',
    },
  };

  const cfg = statusConfig[order.status] || statusConfig.pending;
  const total = order.totalAmount || 0;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Accent top bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.accent}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] text-gray-400 font-medium mb-0.5">رقم الطلب</p>
            <p className="text-base font-extrabold text-gray-900 tracking-tight font-mono">
              {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.pill} border-transparent`}>
            {cfg.label}
          </span>
        </div>

        {/* Progress */}
        <OrderProgress status={order.status} />

        {/* Date & Payment row */}
        <div className="flex flex-wrap gap-3 mb-4">
          {order.createdAt && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
            {order.paymentMethod === 'cash' ? (
              <><Banknote className="w-3.5 h-3.5 text-green-500" /><span>كاش عند الاستلام</span></>
            ) : (
              <><CreditCard className="w-3.5 h-3.5 text-blue-500" /><span>بطاقة</span></>
            )}
          </div>
        </div>

        {/* Items preview - first item always visible */}
        {order.items?.length > 0 && (
          <div className="space-y-2 mb-4">
            {(expanded ? order.items : order.items.slice(0, 1)).map((item, idx) => (
              <div
                key={item._id || idx}
                className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 hover:bg-cyan-50/50 transition-colors"
              >
                {item.image && (
                  <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">الكمية: {item.quantity || 1}</p>
                </div>
                <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                  {formatPrice(item.price * (item.quantity || 1))}
                </p>
              </div>
            ))}

            {order.items.length > 1 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 py-2 rounded-lg hover:bg-cyan-50 transition-all"
              >
                {expanded ? (
                  <><ChevronUp className="w-3.5 h-3.5" /> إخفاء المنتجات</>
                ) : (
                  <><ChevronDown className="w-3.5 h-3.5" /> عرض {order.items.length - 1} منتجات أخرى</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Tracking Number */}
        {order.trackingNumber && <TrackingBadge trackingNumber={order.trackingNumber} />}

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 mb-0.5">عنوان التوصيل</p>
                <p className="text-sm font-medium text-gray-700">
                  {order.shippingAddress.street}، {order.shippingAddress.city}
                  {order.shippingAddress.country ? ` - ${order.shippingAddress.country}` : ''}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✅ GPS Location Section */}
        <OrderLocationSection
          order={order}
          onLocationUpdate={onLocationUpdate}
        />

        {/* Footer total */}
        <div className="mt-5 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            <span className="font-medium text-gray-600">{order.itemsCount || order.items?.length || 0}</span> منتج
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 mb-0.5">الإجمالي</p>
            <p className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">
              {formatPrice(total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const OrderSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
    <div className="h-1.5 bg-gray-200 w-full" />
    <div className="p-5 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-5 bg-gray-200 rounded w-36" />
        </div>
        <div className="h-7 bg-gray-100 rounded-full w-24" />
      </div>
      <div className="flex gap-2 mt-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-8 h-8 bg-gray-100 rounded-full" />
            <div className="h-2 bg-gray-100 rounded w-8" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="h-8 bg-gray-100 rounded-lg w-40" />
        <div className="h-8 bg-gray-100 rounded-lg w-28" />
      </div>
      <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
        <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-20 self-center" />
      </div>
      <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
        <div className="h-3 bg-gray-100 rounded w-12" />
        <div className="h-7 bg-gray-200 rounded w-28" />
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { url, isAuthenticated, authLoading } = useContext(ShopContext);
  const navigate = useNavigate();

  const handleLocationUpdate = async (orderId, location) => {
    try {
      await api.post(`${url}/api/order/update-location`, { orderId, location });
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  };

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

  const formatPrice = (price) =>
    new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);

  // Loading
  if (authLoading || loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-cyan-600 rounded-2xl mx-auto mb-4 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-xl w-40 mx-auto mb-3 animate-pulse" />
            <div className="h-5 bg-gray-100 rounded-lg w-28 mx-auto animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  // Error
  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 px-6" dir="rtl">
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
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 px-4 sm:px-6 lg:px-8 py-12"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-200">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900">طلباتي</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {orders.length > 0
                  ? `${orders.length} ${orders.length === 1 ? 'طلب' : 'طلبات'} مسجلة`
                  : 'لا توجد طلبات بعد'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700 px-4 py-2 rounded-xl hover:bg-cyan-50 transition-all border border-cyan-100 hover:border-cyan-200"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
        </div>

        {/* ── Empty State ── */}
        {orders.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="bg-white rounded-3xl shadow-xl p-14 border border-gray-100">
              <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-14 h-14 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">لا توجد طلبات بعد</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                ابدأ التسوق الآن واستمتع بأفضل تجربة شراء
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-teal-700 transition-all shadow-lg shadow-cyan-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                تصفح المنتجات
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                formatDate={formatDate}
                formatPrice={formatPrice}
                onLocationUpdate={handleLocationUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyOrders;