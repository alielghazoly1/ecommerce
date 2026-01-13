import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, Tag } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import LazyImage from './LazyImage';

// helpers
const pad = (n) => String(n).padStart(2, '0');
const formatEGP = (v) => {
  try {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 2 }).format(v);
  } catch {
    return `ج.م ${Number(v).toFixed(2)}`;
  }
};

const Offer = () => {
  const { addToCart, url, all_products } = useContext(ShopContext);
  const navigate = useNavigate();

  // countdown target = 5 days from now
  const target = useMemo(() => Date.now() + 5 * 24 * 3600 * 1000, []);
  const [secs, setSecs] = useState(Math.max(0, Math.round((target - Date.now()) / 1000)));

  useEffect(() => {
    const id = setInterval(() => setSecs(Math.max(0, Math.round((target - Date.now()) / 1000))), 1000);
    return () => clearInterval(id);
  }, [target]);

  const products = useMemo(() => {
    if (!all_products) return null;
    return [...all_products]
      .sort((a, b) => {
        const ad = a.oldPrice > a.price ? 1 : 0;
        const bd = b.oldPrice > b.price ? 1 : 0;
        if (ad !== bd) return bd - ad;
        if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
        return (b.price || 0) - (a.price || 0);
      })
      .slice(0, 8);
  }, [all_products]);

  const [loadingIds, setLoadingIds] = useState([]);
  const [addedIds, setAddedIds] = useState([]);

  const onAdd = useCallback(
    async (id) => {
      if (!id || loadingIds.includes(id)) return;
      setLoadingIds((s) => [...s, id]);
      try {
        await addToCart(id);
        setAddedIds((s) => [...s, id]);
        setTimeout(() => setAddedIds((s) => s.filter((x) => x !== id)), 1200);
      } catch (e) {
        console.error('addToCart failed', e);
      } finally {
        setLoadingIds((s) => s.filter((x) => x !== id));
      }
    },
    [addToCart, loadingIds]
  );

  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  return (
    <section className="relative w-full bg-gray-50 text-gray-800 py-24 px-6 sm:px-10">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">متجرنا الحصري</h2>
            <p className="text-gray-600 mt-2">اكتشف أحدث العروض واغتنم التخفيضات قبل انتهاء الوقت</p>
          </div>

          <div className="inline-flex items-center gap-4 bg-white/90 px-4 py-3 rounded-full shadow-md" role="status" aria-live="polite">
            <Clock className="w-6 h-6 text-cyan-500" />
            <div className="flex gap-3">
              {[
                ['أيام', days],
                ['ساعات', hours],
                ['دقائق', minutes],
                ['ثواني', seconds],
              ].map(([label, val]) => (
                <div key={label} className="text-center">
                  <div className="bg-cyan-50 text-cyan-600 font-bold rounded-lg px-3 py-2 w-16">{pad(val)}</div>
                  <div className="text-xs text-gray-600 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {products === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl shadow-lg p-4 h-96" aria-hidden />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-20">لا توجد عروض حالياً</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((p) => {
              const loading = loadingIds.includes(p._id);
              const added = addedIds.includes(p._id);
              const hasOld = p.oldPrice && p.oldPrice > p.price;
              const discount = hasOld ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

              return (
                <article
                  key={p._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/product/${p._id}`)}             /* ← navigate on whole card click */
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/product/${p._id}`); }}
                  className="relative bg-white/90 rounded-3xl shadow-xl overflow-hidden hover:shadow-cyan-400/30 transition-transform transform hover:-translate-y-1 cursor-pointer"
                >
                  {hasOld && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="inline-flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm shadow">
                        <Tag className="w-4 h-4" />
                        خصم {discount}%
                      </div>
                    </div>
                  )}

                  <div className="relative w-full h-64 flex items-center justify-center bg-gray-100">
                    <LazyImage src={`${url}/images/${p.image}`} alt={p.name} className="object-contain w-56 h-56 transition-transform duration-500 hover:scale-105" />
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{p.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mt-2">{p.description}</p>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        {hasOld ? (
                          <div className="flex items-baseline gap-3">
                            <span className="text-xl font-bold text-cyan-500">{formatEGP(p.price)}</span>
                            <span className="text-sm line-through text-gray-400">{formatEGP(p.oldPrice)}</span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-cyan-500">{formatEGP(p.price)}</span>
                        )}
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); onAdd(p._id); }} /* prevent navigation when clicking Add */
                        disabled={loading}
                        aria-busy={loading}
                        aria-label={loading ? 'جارٍ الإضافة' : added ? 'تمت الإضافة' : `أضف ${p.name}`}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition ${loading ? 'bg-gray-300 text-gray-700 cursor-wait' : added ? 'bg-green-500 hover:bg-green-600' : 'bg-cyan-500 hover:bg-cyan-600'}`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {loading ? 'جاري الإضافة...' : added ? 'تمت الإضافة' : 'أضف'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Offer;