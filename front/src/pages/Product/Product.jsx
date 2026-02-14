import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import LazyImage from '../../components/LazyImage';
import { formatEGP } from '../../components/utils';
import ToastSmall from '../../components/ui/TostSmall';
import ProductDetailsSkeleton from './ProductDetailsSkeleton';
import {
  ShoppingCart,
  X,
  Star,
  Package,
  Truck,
  ShieldCheck,
  ChevronLeft,
  Check,
  Minus,
  Plus,
  ZoomIn,
  Tag,
  TrendingUp,
  Link2,
} from 'lucide-react';
const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {
    addToCart,
    all_products = [],
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

  return (
    <section className="min-h-screen py-8 md:py-12 px-4 bg-linear-to-br from-gray-50 via-white to-gray-50">
      <ToastSmall
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 bg-white rounded-2xl lg:rounded-3xl shadow-xl overflow-hidden">
          {/* LEFT: Gallery - الصورة الرئيسية تملا المساحة */}
          <div className="p-4 lg:p-8 flex flex-col">
            {/* Badges */}
            <div className="flex gap-2 mb-3 lg:mb-4">
              {hasDiscount && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 lg:px-3 lg:py-1 bg-red-500 text-white text-xs lg:text-sm font-bold rounded-full shadow-lg">
                  <Tag className="w-3 h-3" />
                  خصم {discountPercent}%
                </div>
              )}
              {product.isFeatured && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 lg:px-3 lg:py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs lg:text-sm font-bold rounded-full shadow-lg">
                  <Star className="w-3 h-3 fill-white" />
                  مميز
                </div>
              )}
            </div>

            {/* Main Image - تملا المساحة */}
            <div className="relative w-full flex-1 min-h-[300px] lg:min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl lg:rounded-2xl overflow-hidden group">
              <LazyImage
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4 lg:p-6"
              />

              {/* Zoom Button */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ZoomIn className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="p-4 lg:p-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-4 lg:mb-6">
              <div className="flex items-baseline gap-2 lg:gap-3">
                <span className="text-3xl lg:text-4xl font-bold text-cyan-600">
                  {formatEGP(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg lg:text-xl text-gray-400 line-through">
                    {formatEGP(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs lg:text-sm text-gray-500 mt-1">
                شامل ضريبة القيمة المضافة
              </p>
            </div>

            {/* Description */}
            <div className="mb-4 lg:mb-6">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-700 mb-2">
                الوصف:
              </h3>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                {product.description || 'لا يوجد وصف متاح لهذا المنتج'}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-4 lg:mb-6">
              <div
                className={`inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg ${
                  product.stock > 0
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <Package className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm font-medium">
                  {product.stock > 0
                    ? `متوفر في المخزن (${product.stock} قطعة)`
                    : 'غير متوفر حالياً'}
                </span>
              </div>
            </div>

            {/* Quantity & Add to Cart & Copy Link */}
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 mb-4 lg:mb-6">
              {/* Quantity Selector */}
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-14 lg:h-16">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 lg:px-5 h-full hover:bg-gray-100 transition-colors active:bg-gray-200"
                  disabled={qty <= 1}
                >
                  <Minus className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                </button>
                <div className="px-5 lg:px-6 font-bold text-lg lg:text-xl min-w-[60px] lg:min-w-[70px] text-center">
                  {qty}
                </div>
                <button
                  onClick={() =>
                    setQty(Math.min(product.stock || 999, qty + 1))
                  }
                  className="px-4 lg:px-5 h-full hover:bg-gray-100 transition-colors active:bg-gray-200"
                  disabled={qty >= (product.stock || 999)}
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0}
                className={`flex-1 h-14 lg:h-16 rounded-xl font-bold text-base lg:text-lg text-white transition-all shadow-lg flex items-center justify-center gap-2 lg:gap-3 active:scale-95 ${
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
                    <div className="w-5 h-5 lg:w-6 lg:h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">جاري الإضافة...</span>
                    <span className="sm:hidden">جاري...</span>
                  </>
                ) : isAdded ? (
                  <>
                    <Check className="w-5 h-5 lg:w-6 lg:h-6" />
                    تمت الإضافة ✓
                  </>
                ) : product.stock === 0 ? (
                  'غير متوفر'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                    أضف للسلة
                  </>
                )}
              </button>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="h-14 lg:h-16 px-4 lg:px-5 rounded-xl border-2 border-gray-200 text-gray-700 hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-600 transition-all flex items-center justify-center gap-2 font-semibold active:scale-95 text-sm lg:text-base"
                title="نسخ رابط المنتج"
              >
                <Link2 className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">نسخ</span>
              </button>
            </div>

            {/* Login Banner */}
            {showLoginBanner && (
              <div className="mb-4 lg:mb-6 animate-slide-down">
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-3 lg:p-4 flex items-start gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-none">
                    <Package className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm text-gray-800 mb-1 lg:mb-2">
                      <strong>تم الحفظ محلياً!</strong> سجّل الدخول لمزامنة
                      طلباتك
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-semibold text-cyan-600 hover:text-cyan-700"
                    >
                      تسجيل الدخول الآن
                      <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Link>
                  </div>
                  <button
                    onClick={() => setShowLoginBanner(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 lg:gap-4 py-4 lg:py-6 border-y border-gray-200">
              <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-right">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-1 sm:mb-0">
                  <Truck className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs lg:text-sm">
                    توصيل سريع
                  </div>
                  <div className="text-[10px] lg:text-xs text-gray-500">
                    2-3 أيام
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-right">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center mb-1 sm:mb-0">
                  <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs lg:text-sm">
                    دفع آمن
                  </div>
                  <div className="text-[10px] lg:text-xs text-gray-500">
                    100% محمي
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-right">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-1 sm:mb-0">
                  <Package className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs lg:text-sm">
                    ضمان الجودة
                  </div>
                  <div className="text-[10px] lg:text-xs text-gray-500">
                    منتج أصلي
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-4 lg:mt-6">
                <div className="text-xs lg:text-sm font-semibold text-gray-700 mb-2">
                  الوسوم:
                </div>
                <div className="flex flex-wrap gap-1.5 lg:gap-2">
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 lg:px-3 py-1 bg-gray-100 text-gray-700 text-[10px] lg:text-xs rounded-full"
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
                src={product.image}
                alt={product.name}
                className="max-h-[85vh] max-w-full object-contain"
              />
            </div>
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
