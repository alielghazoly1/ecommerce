import { useState } from 'react';
import { Navigation, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import LocationPicker from "../../components/Locationpicker"

const OrderLocation = ({ order, onLocationUpdate }) => {
  const [editLocation, setEditLocation] = useState(null);
  const [saving, setSaving]             = useState(false);
  const [showPicker, setShowPicker]     = useState(false);

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
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-green-600 text-white text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5" />الموقع الجغرافي للتوصيل
        </span>
        {canEdit && !showPicker && (
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-green-700 hover:bg-green-50 font-bold text-xs shadow-sm"
          >
            تعديل الموقع ✏️
          </button>
        )}
      </div>

      {/* Map Link */}
      <div className="flex items-center justify-between px-4 py-3 gap-3 bg-linear-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-green-600 shrink-0" />
          {placeName
            ? <p className="text-sm font-bold text-green-800">{placeName}</p>
            : <p className="text-xs font-mono text-green-700 truncate">{coords}</p>}
        </div>
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shrink-0 active:scale-95"
        >
          <ExternalLink className="w-3.5 h-3.5" />فتح الخريطة
        </a>
      </div>

      {/* Location Picker */}
      {canEdit && showPicker && (
        <div className="px-3 pb-3 pt-2 border-t border-green-100 bg-white space-y-3">
          <LocationPicker value={editLocation} onChange={setEditLocation} />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !editLocation?.latitude}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold transition-colors"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saving ? 'جارٍ الحفظ...' : '💾 حفظ الموقع الجديد'}
            </button>
            <button
              onClick={() => { setShowPicker(false); setEditLocation(null); }}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Footer message */}
      {footerMsg && (
        <div className="px-3 py-2 border-t border-green-100 text-xs font-semibold bg-amber-50 text-amber-700">
          {footerMsg}
        </div>
      )}
    </div>
  );
};

export default OrderLocation;