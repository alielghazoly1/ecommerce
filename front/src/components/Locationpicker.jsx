import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Loader2, CheckCircle, XCircle, RefreshCw, Edit2 } from 'lucide-react';

// ─── Reverse Geocode (OpenStreetMap - مجاني بدون API Key) ─────────────────────
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`,
      { headers: { 'User-Agent': 'EcommerceApp/1.0' } }
    );
    const data = await res.json();
    if (data?.display_name) {
      const addr = data.address || {};
      // بناء اسم واضح ومختصر
      const parts = [
        addr.road || addr.street,
        addr.neighbourhood || addr.suburb || addr.quarter,
        addr.city || addr.town || addr.village || addr.county,
        addr.state,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join('، ') : data.display_name.split(',').slice(0, 3).join(',');
    }
    return null;
  } catch {
    return null;
  }
};

// ─── Load Leaflet dynamically (no npm needed) ─────────────────────────────────
const loadLeaflet = () => {
  return new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });
};

// ─── Main LocationPicker Component ────────────────────────────────────────────
const LocationPicker = ({ value, onChange, disabled = false }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [leaflet, setLeaflet] = useState(null);

  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | success | denied | error
  const [placeName, setPlaceName] = useState(value?.placeName || null);
  const [geocoding, setGeocoding] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const hasLocation = value?.latitude && value?.longitude;

  // ─── Load Leaflet on mount ─────────────────────────────────────────────────
  useEffect(() => {
    loadLeaflet().then(setLeaflet);
  }, []);

  // ─── Update place name when value changes externally ──────────────────────
  useEffect(() => {
    if (value?.placeName) setPlaceName(value.placeName);
  }, [value?.placeName]);

  // ─── Initialize or update map ─────────────────────────────────────────────
  useEffect(() => {
    if (!leaflet || !mapRef.current || !hasLocation) return;

    const lat = value.latitude;
    const lng = value.longitude;

    if (!mapInstanceRef.current) {
      // Init map
      const map = leaflet.map(mapRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true,
      });

      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const icon = leaflet.divIcon({
        html: `<div style="
          width:36px;height:36px;
          background:linear-gradient(135deg,#06b6d4,#0891b2);
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid white;
          box-shadow:0 4px 12px rgba(6,182,212,0.5);
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        className: '',
      });

      const marker = leaflet.marker([lat, lng], { icon, draggable: !disabled }).addTo(map);
      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Drag marker → update location
      if (!disabled) {
        marker.on('dragend', async (e) => {
          const { lat: newLat, lng: newLng } = e.target.getLatLng();
          setGeocoding(true);
          const name = await reverseGeocode(newLat, newLng);
          setPlaceName(name);
          setGeocoding(false);
          onChange({ latitude: newLat, longitude: newLng, accuracy: null, placeName: name });
        });

        // Click on map → move marker
        map.on('click', async (e) => {
          const { lat: newLat, lng: newLng } = e.latlng;
          marker.setLatLng([newLat, newLng]);
          map.panTo([newLat, newLng]);
          setGeocoding(true);
          const name = await reverseGeocode(newLat, newLng);
          setPlaceName(name);
          setGeocoding(false);
          onChange({ latitude: newLat, longitude: newLng, accuracy: null, placeName: name });
        });
      }

      setMapReady(true);
    } else {
      // Update existing marker position
      markerRef.current?.setLatLng([lat, lng]);
      mapInstanceRef.current?.panTo([lat, lng]);
    }
  }, [leaflet, hasLocation, value?.latitude, value?.longitude]);

  // ─── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // ─── Get GPS location ──────────────────────────────────────────────────────
  const handleGetGPS = useCallback(() => {
    if (!navigator.geolocation) { setGpsStatus('denied'); return; }
    setGpsStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        setGpsStatus('success');
        setGeocoding(true);
        const name = await reverseGeocode(lat, lng);
        setPlaceName(name);
        setGeocoding(false);

        onChange({ latitude: lat, longitude: lng, accuracy, placeName: name });
      },
      () => setGpsStatus('error'),
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 0 }
    );
  }, [onChange]);

  // ─── Reset location ────────────────────────────────────────────────────────
  const handleReset = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      setMapReady(false);
    }
    setGpsStatus('idle');
    setPlaceName(null);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        الموقع الجغرافي
        <span className="text-xs text-gray-400 mr-1">(اختياري - يساعد في التوصيل)</span>
      </label>

      {/* ── No location yet: show GPS button ── */}
      {!hasLocation && (
        <div className="space-y-2">
          {gpsStatus === 'idle' && (
            <button
              type="button"
              onClick={handleGetGPS}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-dashed border-cyan-300 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-400 transition-all text-sm font-semibold"
            >
              <Navigation className="w-4 h-4" />
              تحديد موقعي الحالي تلقائياً
            </button>
          )}

          {gpsStatus === 'loading' && (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 text-sm font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              جارٍ تحديد موقعك بدقة عالية...
            </div>
          )}

          {(gpsStatus === 'denied' || gpsStatus === 'error') && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="flex items-center gap-2 text-red-600 text-sm font-semibold mb-1">
                <XCircle className="w-4 h-4" />
                {gpsStatus === 'denied' ? 'لم يتم السماح بالوصول للموقع' : 'تعذّر تحديد الموقع'}
              </div>
              <p className="text-xs text-red-400 mb-2">ممكن تكمل الطلب بدون موقع.</p>
              <button type="button" onClick={handleGetGPS} className="text-xs text-cyan-600 hover:underline font-semibold">
                المحاولة مرة أخرى
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Has location: show map + info ── */}
      {hasLocation && (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          {/* Place name bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-cyan-600 text-white text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {geocoding ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" />جارٍ تحديد الاسم...</span>
            ) : (
              <span className="truncate">{placeName || 'موقع محدد'}</span>
            )}
          </div>

          {/* Interactive map */}
          <div
            ref={mapRef}
            style={{ height: '220px', width: '100%', background: '#e5e7eb' }}
          />

          {/* Hint + actions */}
          {!disabled && (
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Edit2 className="w-3 h-3" />
                اسحب البين أو اضغط على الخريطة لتعديل الموقع
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                إعادة تحديد
              </button>
            </div>
          )}

          {disabled && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-t border-amber-100">
              <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-semibold">تم شحن الطلب - لا يمكن تعديل الموقع</p>
            </div>
          )}
        </div>
      )}

      {/* Accuracy badge */}
      {hasLocation && value.accuracy && !disabled && (
        <p className="text-xs text-gray-400 text-center">
          دقة الموقع: ~{value.accuracy} متر
          {value.accuracy <= 20 ? ' ✓ دقة عالية' : value.accuracy <= 50 ? ' جيد' : ' متوسط'}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;