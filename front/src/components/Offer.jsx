import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, Tag } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import LazyImage from './LazyImage';
import Toast from './ui/Toast';

// Helper functions
const pad = (n) => String(n).padStart(2, '0');

const formatEGP = (v) => {
  try {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `ج.م ${Number(v).toFixed(2)}`;
  }
};

const Offer = () => {
  const [toast, setToast] = useState(null);
  const TOAST_DURATION = 1800;

  const { addToCart, all_products } = useContext(ShopContext);
  const navigate = useNavigate();

  // Countdown timer - 5 days from now
  const target = useMemo(() => Date.now() + 5 * 24 * 3600 * 1000, []);
  const [secs, setSecs] = useState(
    Math.max(0, Math.round((target - Date.now()) / 1000)),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setSecs(Math.max(0, Math.round((target - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  // Get top 8 products - only featured products with discounts priority
  const products = useMemo(() => {
    if (!all_products || !Array.isArray(all_products)) return null;

    return [...all_products]
      .filter((p) => p.isActive && p.inStock && p.isFeatured) // فقط المنتجات المميزة والنشطة والمتوفرة
      .sort((a, b) => {
        // أولوية للمنتجات اللي عليها خصم
        const aHasDiscount =
          a.originalPrice && a.originalPrice > a.price ? 1 : 0;
        const bHasDiscount =
          b.originalPrice && b.originalPrice > b.price ? 1 : 0;

        if (aHasDiscount !== bHasDiscount) return bHasDiscount - aHasDiscount;

        // ثم المنتجات الأحدث
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }

        return 0;
      })
      .slice(0, 8);
  }, [all_products]);

  const [loadingIds, setLoadingIds] = useState([]);
  const [addedIds, setAddedIds] = useState([]);

  const onAdd = useCallback(
    async (id) => {
      if (!id || loadingIds.includes(id)) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          type: 'error',
          message: 'يرجى تسجيل الدخول لإضافة منتجات للسلة',
        });
        setTimeout(() => navigate('/login'), TOAST_DURATION);
        return;
      }

      setLoadingIds((prev) => [...prev, id]);
      try {
        await addToCart(id);
        setAddedIds((prev) => [...prev, id]);

        setToast({
          type: 'success',
          message: 'تمت إضافة المنتج إلى السلة 🛒',
        });

        setTimeout(() => {
          setAddedIds((prev) => prev.filter((x) => x !== id));
        }, 1200);
      } catch (error) {
        console.error('addToCart failed:', error);
        setToast({
          type: 'error',
          message: 'حدث خطأ أثناء إضافة المنتج',
        });
      } finally {
        setLoadingIds((prev) => prev.filter((x) => x !== id));
      }
    },
    [addToCart, loadingIds, navigate],
  );

  // Calculate time remaining
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="relative w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header Section */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-6">
            <div className="text-center sm:text-right">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2">
                متجرنا الحصري
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                اكتشف أحدث العروض واغتنم التخفيضات قبل انتهاء الوقت
              </p>
            </div>

            {/* Countdown Timer */}
            <div
              className="inline-flex items-center gap-3 bg-white/90 px-4 py-3 rounded-2xl shadow-lg mx-auto sm:mx-0"
              role="status"
              aria-live="polite"
            >
              <Clock className="w-5 h-5 text-cyan-600" />
              <div className="flex gap-2">
                {[
                  ['أيام', days],
                  ['ساعات', hours],
                  ['دقائق', minutes],
                  ['ثواني', seconds],
                ].map(([label, val]) => (
                  <div key={label} className="text-center">
                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-bold rounded-lg px-2.5 py-1.5 min-w-[3rem] shadow-md">
                      {pad(val)}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1 font-medium">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* Products Grid */}
          {products === null ? (
            // Loading Skeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-2xl shadow-lg overflow-hidden"
                  aria-hidden="true"
                >
                  <div className="w-full h-64 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-6 bg-gray-200 rounded w-20" />
                      <div className="h-10 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            // No Products
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">لا توجد عروض حالياً</p>
            </div>
          ) : (
            // Products Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => {
                const loading = loadingIds.includes(p._id);
                const added = addedIds.includes(p._id);
                const hasDiscount =
                  p.originalPrice && p.originalPrice > p.price;
                const discount = hasDiscount
                  ? Math.round(
                      ((p.originalPrice - p.price) / p.originalPrice) * 100,
                    )
                  : 0;

                return (
                  <article
                    key={p._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/product/${p._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/product/${p._id}`);
                      }
                    }}
                    className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                  >
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                          <Tag className="w-3.5 h-3.5" />
                          خصم {discount}%
                        </div>
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="relative w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <LazyImage
                        src={p.image}
                        alt={p.name}
                        className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 truncate mb-2">
                        {p.name}
                      </h3>

                      {p.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[40px]">
                          {p.description}
                        </p>
                      )}

                      {/* Price and Add Button */}
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          {hasDiscount ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xl font-bold text-cyan-600">
                                {formatEGP(p.price)}
                              </span>
                              <span className="text-xs line-through text-gray-400">
                                {formatEGP(p.originalPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-cyan-600">
                              {formatEGP(p.price)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdd(p._id);
                          }}
                          disabled={loading}
                          aria-busy={loading}
                          aria-label={
                            loading
                              ? 'جاري الإضافة'
                              : added
                                ? 'تمت الإضافة'
                                : `أضف ${p.name} إلى السلة`
                          }
                          className={`
                            inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                            transition-all duration-300 shadow-md hover:shadow-lg
                            ${
                              loading
                                ? 'bg-gray-300 text-gray-600 cursor-wait'
                                : added
                                  ? 'bg-green-500 hover:bg-green-600 text-white'
                                  : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white'
                            }
                          `}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          {loading
                            ? 'جاري...'
                            : added
                              ? 'تمت الاضافة✓'
                              : 'أضف الي السلة'}
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
    </>
  );
};

export default Offer;
