import React, { useContext, useEffect, useMemo, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import LazyImage from '../components/LazyImage';
import { ShoppingCart, Share2, X } from 'lucide-react';

/**
 * Professional Product component
 * - No CenterAlert (uses inline toast/banner)
 * - Optimistic addToCart with per-button loading + "Added" state
 * - Image gallery with thumbnails and fullscreen lightbox
 * - Related products strip
 * - Price formatted to EGP
 */

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

const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;
  const color =
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
      ? 'bg-red-500'
      : 'bg-gray-800';
  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 top-8 z-50 ${color} text-white px-4 py-2 rounded-lg shadow-lg`}
    >
      <div className="flex items-center gap-3">
        <div className="text-sm">{message}</div>
        <button
          onClick={onClose}
          aria-label="close toast"
          className="opacity-80 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, all_products = [], url, token } = useContext(ShopContext);

  // find product safely
  const product = useMemo(
    () => all_products.find((p) => String(p._id) === String(productId)),
    [all_products, productId]
  );

  // local UI state
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'info' });

  // gallery state
  const images = useMemo(
    () =>
      product ? [product.image, ...(product.images || [])].filter(Boolean) : [],
    [product]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // related products (same category)
  const related = useMemo(() => {
    if (!product) return [];
    return (all_products || [])
      .filter((p) => p._id !== product._id && p.category === product.category)
      .slice(0, 6);
  }, [all_products, product]);

  useEffect(() => {
    setQty(1);
    setActiveIndex(0);
    setIsAdding(false);
    setIsAdded(false);
  }, [productId]);

  if (!product) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">المنتج غير موجود</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg"
          >
            العودة للتسوق
          </button>
        </div>
      </section>
    );
  }

  // Add to cart handler (optimistic + await backend)
  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const res = await addToCart(product._id, qty); // ShopContext.addToCart is async
      // addToCart returns null when no token (per context implementation)
      if (res === null) {
        setShowLoginBanner(true);
        setToast({ msg: 'يرجى تسجيل الدخول لإتمام الطلب', type: 'error' });
        setTimeout(() => setShowLoginBanner(false), 4000);
      } else {
        // success path: show added state briefly
        setIsAdded(true);
        setToast({ msg: 'تمت إضافة المنتج إلى السلة', type: 'success' });
        setTimeout(() => setIsAdded(false), 1400);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      setToast({ msg: 'حدث خطأ أثناء الإضافة. حاول مرة أخرى', type: 'error' });
    } finally {
      setIsAdding(false);
      // auto-hide toast
      setTimeout(() => setToast({ msg: '', type: 'info' }), 2000);
    }
  };

  // copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ msg: 'تم نسخ رابط المنتج', type: 'success' });
      setTimeout(() => setToast({ msg: '', type: 'info' }), 1600);
    } catch (err) {
      setToast({ msg: 'فشل نسخ الرابط', type: 'error' });
    }
  };

  // keyboard accessibility for thumbnails
  const thumbKeyHandler = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  return (
    <section className="min-h-screen py-16 px-4 bg-gray-50">
      <Toast
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: '', type: 'info' })}
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* LEFT: Gallery */}
        <div className="p-6">
          <div className="relative">
            <button
              onClick={() => setLightboxOpen(true)}
              aria-label="تكبير الصورة"
              className="absolute right-4 top-4 z-20 bg-white/80 hover:bg-white px-3 py-2 rounded-lg shadow-sm"
            >
              تكبير
            </button>

            <div
              className="w-full h-[420px] md:h-[520px] flex items-center justify-center bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setLightboxOpen(true);
              }}
            >
              <LazyImage
                src={images[activeIndex]}
                alt={product.name}
                className="max-h-full object-contain"
              />
            </div>
          </div>

          {/* thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto py-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={(e) => thumbKeyHandler(e, i)}
                  className={`flex-none w-20 h-20 rounded-xl overflow-hidden border ${
                    i === activeIndex
                      ? 'ring-2 ring-cyan-400'
                      : 'border-gray-200'
                  } focus:outline-none`}
                  aria-label={`عرض الصورة ${i + 1}`}
                >
                  <LazyImage
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Details */}
        <div className="p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">{product.name}</h1>

            <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
              <span>{product.category || 'عام'}</span>
              <span className="mx-1">•</span>
              <span>{product.brand || 'ماركة'}</span>
              {/* rating placeholder */}
              {product.rating && (
                <span className="ml-2">★ {product.rating.toFixed(1)}</span>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <div className="text-3xl font-extrabold text-cyan-600">
                  {formatEGP(product.price)}
                </div>
                {product.oldPrice && product.oldPrice > product.price && (
                  <div className="text-sm text-gray-400 line-through">
                    {formatEGP(product.oldPrice)}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600">
                {product.stock ? (
                  <span>المخزون: {product.stock}</span>
                ) : (
                  <span>متاح</span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-medium text-gray-700">الكمية</span>
              <div className="inline-flex items-center border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="نقص الكمية"
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  aria-label="الكمية"
                  min={1}
                  max={product.stock || 999}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Number(e.target.value || 1)))
                  }
                  className="w-20 text-center px-2 py-2 outline-none"
                />
                <button
                  onClick={() =>
                    setQty((q) =>
                      product.stock ? Math.min(product.stock, q + 1) : q + 1
                    )
                  }
                  aria-label="زيادة الكمية"
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 items-center">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                aria-busy={isAdding}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold transition ${
                  isAdding
                    ? 'bg-gray-300 text-gray-700 cursor-wait'
                    : isAdded
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isAdding
                  ? 'جاري الإضافة...'
                  : isAdded
                  ? 'تمت الإضافة'
                  : 'أضف إلى السلة'}
              </button>

              <button
                onClick={handleCopyLink}
                aria-label="نسخ رابط المنتج"
                className="w-12 h-12 rounded-2xl border flex items-center justify-center hover:bg-gray-100"
                title="نسخ الرابط"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Login banner (if addToCart returned null) */}
            {showLoginBanner && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    لقد أُضيف المنتج محليًا. الرجاء تسجيل الدخول للمزامنة وحفظ
                    الطلب.
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to="/login" className="text-cyan-600 font-semibold">
                      تسجيل الدخول
                    </Link>
                    <button
                      onClick={() => setShowLoginBanner(false)}
                      className="text-gray-400"
                    >
                      اغلاق
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">منتجات مشابهة</h3>
              <div className="flex gap-4 overflow-x-auto pb-3">
                {related.map((r) => (
                  <Link
                    key={r._id}
                    to={`/product/${r._id}`}
                    className="w-40 flex-none bg-gray-50 rounded-xl p-3 hover:shadow-md"
                  >
                    <div className="w-full h-28 mb-2 flex items-center justify-center">
                      <LazyImage
                        src={r.image}
                        alt={r.name}
                        className="max-h-full object-contain"
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-800 line-clamp-2">
                      {r.name}
                    </div>
                    <div className="text-sm text-cyan-600 mt-1">
                      {formatEGP(r.price)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-4xl w-full h-full md:h-auto relative">
            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="close"
              className="absolute right-4 top-4 z-20 bg-white/90 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={`${url}/images/${images[activeIndex]}`}
                alt={product.name}
                className="max-h-[90vh] object-contain"
              />
            </div>

            {/* thumbnails inside lightbox */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto justify-center">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(i);
                    }}
                    className={`w-20 h-20 rounded-md overflow-hidden ${
                      i === activeIndex ? 'ring-2 ring-cyan-400' : ''
                    }`}
                  >
                    <img
                      src={`${url}/images/${img}`}
                      alt={`thumb-${i}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Product;
