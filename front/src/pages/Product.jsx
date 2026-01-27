import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import LazyImage from '../components/LazyImage';
import {
  ShoppingCart,
  Share2,
  X,
  Heart,
  Star,
  Package,
  Truck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  Plus,
  ZoomIn,
  Tag,
  TrendingUp,
} from 'lucide-react';

// Format price
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

// Toast Component
const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;
  
  const configs = {
    success: { bg: 'bg-green-500', icon: Check },
    error: { bg: 'bg-red-500', icon: X },
    info: { bg: 'bg-cyan-500', icon: Check },
  };
  
  const config = configs[type] || configs.info;
  const Icon = config.icon;
  
  return (
    <div className={`fixed left-1/2 -translate-x-1/2 top-8 z-50 ${config.bg} text-white px-6 py-3 rounded-xl shadow-2xl animate-slide-down`}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div className="text-sm font-medium">{message}</div>
        <button
          onClick={onClose}
          className="opacity-80 hover:opacity-100 transition-opacity"
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
  const { addToCart, all_products = [], url } = useContext(ShopContext);

  // Find product
  const product = useMemo(
    () => all_products.find((p) => String(p._id) === String(productId)),
    [all_products, productId]
  );

  // State
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'info' });
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Gallery state
  const images = useMemo(() => {
    if (!product) return [];
    const allImages = [product.image];
    if (product.images && Array.isArray(product.images)) {
      allImages.push(...product.images.filter(img => img !== product.image));
    }
    return allImages.filter(Boolean);
  }, [product]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Related products
  const related = useMemo(() => {
    if (!product) return [];
    return (all_products || [])
      .filter((p) => p._id !== product._id && p.category === product.category)
      .slice(0, 8);
  }, [all_products, product]);

  // Reset state on product change
  useEffect(() => {
    setQty(1);
    setActiveIndex(0);
    setIsAdding(false);
    setIsAdded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  // Product not found
  if (!product) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">المنتج غير موجود</h2>
          <p className="text-gray-600 mb-6">عذراً، لم نتمكن من العثور على هذا المنتج</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg"
          >
            العودة للتسوق
          </button>
        </div>
      </section>
    );
  }

  // Add to cart handler
  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    
    try {
      const res = await addToCart(product._id, qty);
      
      if (res === null || res?.success === false) {
        setShowLoginBanner(true);
        setToast({ msg: 'يرجى تسجيل الدخول لإتمام الطلب', type: 'error' });
        setTimeout(() => setShowLoginBanner(false), 4000);
      } else {
        setIsAdded(true);
        setToast({ msg: `تمت إضافة ${qty} من ${product.name} إلى السلة ✓`, type: 'success' });
        setTimeout(() => setIsAdded(false), 2000);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      setToast({ msg: 'حدث خطأ أثناء الإضافة', type: 'error' });
    } finally {
      setIsAdding(false);
      setTimeout(() => setToast({ msg: '', type: 'info' }), 3000);
    }
  };

  // Copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ msg: 'تم نسخ رابط المنتج ✓', type: 'success' });
      setTimeout(() => setToast({ msg: '', type: 'info' }), 2000);
    } catch (err) {
      setToast({ msg: 'فشل نسخ الرابط', type: 'error' });
    }
  };

  // Wishlist toggle
  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    setToast({ 
      msg: isWishlisted ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة ✓', 
      type: 'success' 
    });
    setTimeout(() => setToast({ msg: '', type: 'info' }), 2000);
  };

  // Calculate discount
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Navigation arrows for gallery
  const nextImage = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section className="min-h-screen py-8 md:py-12 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Toast
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: '', type: 'info' })}
      />

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-cyan-600 transition-colors">الرئيسية</Link>
          <ChevronLeft className="w-4 h-4" />
          <Link to="/categories" className="hover:text-cyan-600 transition-colors">المنتجات</Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{product.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* LEFT: Gallery */}
          <div className="p-6 lg:p-8">
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {hasDiscount && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                  <Tag className="w-3 h-3" />
                  خصم {discountPercent}%
                </div>
              )}
              {product.isFeatured && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-bold rounded-full shadow-lg">
                  <Star className="w-3 h-3 fill-white" />
                  مميز
                </div>
              )}
            </div>

            {/* Main Image */}
            <div className="relative group">
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute right-4 top-4 z-20 bg-white/90 hover:bg-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <ZoomIn className="w-4 h-4" />
                <span className="text-sm font-medium">تكبير</span>
              </button>

              <button
                onClick={toggleWishlist}
                className={`absolute left-4 top-4 z-20 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
                  isWishlisted 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/90 hover:bg-white text-gray-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              <div
                className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              >
                <LazyImage
                  src={images[activeIndex]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105 duration-300"
                />
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`flex-none w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeIndex
                        ? 'border-cyan-500 ring-2 ring-cyan-200 scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
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
          <div className="p-6 lg:p-8 flex flex-col">
            {/* Title & Category */}
            <div className="mb-6">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center flex-wrap gap-3 text-sm">
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full font-medium">
                  {product.category || 'عام'}
                </span>
                {product.brand && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                    {product.brand}
                  </span>
                )}
                {product.sku && (
                  <span className="text-gray-500">SKU: {product.sku}</span>
                )}
              </div>

              {/* Rating */}
              {product.ratings?.average > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(product.ratings.average)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {product.ratings.average.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({product.ratings.count} تقييم)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              {product.description}
            </p>

            {/* Price */}
            <div className="mb-6 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                    {formatEGP(product.price)}
                  </div>
                  {hasDiscount && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg text-gray-400 line-through">
                        {formatEGP(product.originalPrice)}
                      </span>
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                        وفّر {formatEGP(product.originalPrice - product.price)}
                      </span>
                    </div>
                  )}
                </div>

                {product.stock !== undefined && (
                  <div className={`text-sm font-medium px-4 py-2 rounded-lg ${
                    product.stock > 10
                      ? 'bg-green-100 text-green-700'
                      : product.stock > 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock > 10
                      ? 'متوفر'
                      : product.stock > 0
                      ? `باقي ${product.stock} فقط`
                      : 'نفذت الكمية'}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                الكمية
              </label>
              <div className="inline-flex items-center bg-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  disabled={qty <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={product.stock || 999}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-12 text-center bg-transparent font-bold text-lg outline-none"
                />
                <button
                  onClick={() => setQty((q) => (product.stock ? Math.min(product.stock, q + 1) : q + 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  disabled={product.stock && qty >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || (product.stock !== undefined && product.stock === 0)}
                className={`flex-1 h-14 inline-flex items-center justify-center gap-3 rounded-xl text-white font-bold text-lg transition-all shadow-lg ${
                  isAdding
                    ? 'bg-gray-400 cursor-wait'
                    : isAdded
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800'
                }`}
              >
                {isAdding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري الإضافة...</span>
                  </>
                ) : isAdded ? (
                  <>
                    <Check className="w-6 h-6" />
                    <span>تمت الإضافة ✓</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    <span>أضف إلى السلة</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyLink}
                className="w-14 h-14 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-cyan-600 transition-all"
                title="مشاركة المنتج"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Login Banner */}
            {showLoginBanner && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 mb-2">
                      <strong>تم الحفظ محلياً!</strong> سجّل الدخول لمزامنة طلباتك
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
                    >
                      تسجيل الدخول الآن
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </div>
                  <button
                    onClick={() => setShowLoginBanner(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">توصيل سريع</div>
                  <div className="text-xs text-gray-500">2-3 أيام</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">دفع آمن</div>
                  <div className="text-xs text-gray-500">100% محمي</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">ضمان الجودة</div>
                  <div className="text-xs text-gray-500">منتج أصلي</div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">الوسوم:</div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
              <h2 className="text-2xl font-bold text-gray-900">منتجات مشابهة</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {related.map((r) => (
                <Link
                  key={r._id}
                  to={`/product/${r._id}`}
                  className="group bg-white rounded-xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="relative w-full h-32 mb-3 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                    <LazyImage
                      src={r.image}
                      alt={r.name}
                      className="max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[40px]">
                    {r.name}
                  </h3>
                  <div className="text-lg font-bold text-cyan-600">
                    {formatEGP(r.price)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="max-w-6xl w-full relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center justify-center min-h-[70vh]">
              <img
                src={images[activeIndex]}
                alt={product.name}
                className="max-h-[85vh] max-w-full object-contain"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="mt-6 flex gap-3 overflow-x-auto justify-center pb-4">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`flex-none w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        i === activeIndex ? 'border-cyan-400 ring-2 ring-cyan-200' : 'border-white/20'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${i}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </section>
  );
};

export default Product;