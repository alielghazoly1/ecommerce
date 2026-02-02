import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import LazyImage from '../components/LazyImage';
import CardSkeleton from '../components/ui/CardSkeleton';
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
    <div
      className={`fixed left-1/2 -translate-x-1/2 top-8 z-50 ${config.bg} text-white px-6 py-3 rounded-xl shadow-2xl animate-slide-down`}
    >
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

// 🔥 Product Details Skeleton Component
const ProductDetailsSkeleton = () => {
  return (
    <section className="min-h-screen py-8 md:py-12 px-4 bg-linear-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <ChevronLeft className="w-4 h-4 text-gray-300" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          <ChevronLeft className="w-4 h-4 text-gray-300" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* LEFT: Gallery Skeleton */}
          <div className="p-6 lg:p-8">
            {/* Main Image Skeleton */}
            <div className="w-full aspect-square bg-gray-200 rounded-2xl animate-pulse mb-4"></div>

            {/* Thumbnails Skeleton */}
            <div className="flex gap-2 overflow-x-auto custom-scrollbar">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse flex-none"
                ></div>
              ))}
            </div>
          </div>

          {/* RIGHT: Details Skeleton */}
          <div className="p-6 lg:p-8">
            {/* Title */}
            <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-pulse mb-4"></div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4 mb-6">
              <div className="h-14 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-14 flex-1 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-12">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton
                key={i}
                width={200}
                height={280}
                imageHeight={140}
                radius={12}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {
    addToCart,
    all_products = [],
    url,
    authLoading,
  } = useContext(ShopContext);
  // Loading State
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Find product
  const product = useMemo(
    () => all_products.find((p) => String(p._id) === String(productId)),
    [all_products, productId],
  );

  // State
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'info' });

  // Gallery state
  const images = useMemo(() => {
    if (!product) return [];
    // استخدام الصورة الرئيسية فقط
    return [product.image].filter(Boolean);
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

  // 🔥 Handle Loading - ننتظر تحميل المنتجات والـ auth
  useEffect(() => {
    if (!authLoading && all_products.length > 0) {
      // نعطي وقت بسيط عشان الـ transition يبقى سلس
      setTimeout(() => setIsPageLoading(false), 300);
    }
  }, [authLoading, all_products]);

  // Reset state on product change
  useEffect(() => {
    setQty(1);
    setActiveIndex(0);
    setIsAdding(false);
    setIsAdded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  // 🔥 عرض Skeleton أثناء التحميل
  if (isPageLoading || authLoading) {
    return <ProductDetailsSkeleton />;
  }

  // Product not found
  if (!product) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-linear-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            المنتج غير موجود
          </h2>
          <p className="text-gray-600 mb-6">
            عذراً، لم نتمكن من العثور على هذا المنتج
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg"
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
        setToast({
          msg: `تمت إضافة ${qty} من ${product.name} إلى السلة ✓`,
          type: 'success',
        });
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

  // Calculate discount
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  // Navigation arrows for gallery
  const nextImage = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section className="min-h-screen py-8 md:py-12 px-4 bg-linear-to-br from-gray-50 via-white to-gray-50">
      <Toast
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: '', type: 'info' })}
      />

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-cyan-600 transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft className="w-4 h-4" />
          <Link
            to="/categories"
            className="hover:text-cyan-600 transition-colors"
          >
            المنتجات
          </Link>
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
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                  <Star className="w-3 h-3 fill-white" />
                  مميز
                </div>
              )}
            </div>

            {/* Main Image */}
            <div className="relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 group">
              <LazyImage
                src={images[activeIndex]}
                alt={product.name}
                className="w-full h-full object-contain"
              />

              {/* Zoom Button */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </button>

              {/* Navigation Arrows (if multiple images) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`flex-none w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeIndex
                        ? 'border-cyan-500 ring-2 ring-cyan-200'
                        : 'border-gray-200 hover:border-gray-300'
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
            )}
          </div>

          {/* RIGHT: Details */}
          <div className="p-6 lg:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-cyan-600">
                  {formatEGP(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatEGP(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                شامل ضريبة القيمة المضافة
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                الوصف:
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'لا يوجد وصف متاح لهذا المنتج'}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                  product.stock > 0
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {product.stock > 0
                    ? `متوفر في المخزن (${product.stock} قطعة)`
                    : 'غير متوفر حالياً'}
                </span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Quantity Selector */}
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-14">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 h-full hover:bg-gray-100 transition-colors"
                  disabled={qty <= 1}
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <div className="px-6 font-semibold text-lg min-w-[60px] text-center">
                  {qty}
                </div>
                <button
                  onClick={() =>
                    setQty(Math.min(product.stock || 999, qty + 1))
                  }
                  className="px-4 h-full hover:bg-gray-100 transition-colors"
                  disabled={qty >= (product.stock || 999)}
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0}
                className={`flex-1 h-14 rounded-xl font-semibold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isAdded
                    ? 'bg-green-600 hover:bg-green-700'
                    : isAdding
                      ? 'bg-gray-400 cursor-not-allowed'
                      : product.stock === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800'
                }`}
              >
                {isAdding ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإضافة...
                  </>
                ) : isAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    تمت الإضافة ✓
                  </>
                ) : product.stock === 0 ? (
                  'غير متوفر'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    أضف للسلة
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleCopyLink}
                className="h-12 px-4 rounded-xl border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Login Banner */}
            {showLoginBanner && (
              <div className="mb-6 animate-slide-down">
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-none">
                    <Package className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 mb-2">
                      <strong>تم الحفظ محلياً!</strong> سجّل الدخول لمزامنة
                      طلباتك
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
                  <div className="font-semibold text-gray-900 text-sm">
                    توصيل سريع
                  </div>
                  <div className="text-xs text-gray-500">2-3 أيام</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    دفع آمن
                  </div>
                  <div className="text-xs text-gray-500">100% محمي</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    ضمان الجودة
                  </div>
                  <div className="text-xs text-gray-500">منتج أصلي</div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  الوسوم:
                </div>
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
              <h2 className="text-2xl font-bold text-gray-900">
                منتجات مشابهة
              </h2>
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
          <div
            className="max-w-6xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
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
                        i === activeIndex
                          ? 'border-cyan-400 ring-2 ring-cyan-200'
                          : 'border-white/20'
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