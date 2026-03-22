import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag } from 'lucide-react';
import LazyImage from './LazyImage';
import Toast from './ui/Toast';
import { formatEGP } from '../lib/utils';
import {
  useAuth,
  useCartActions,
  useFeaturedProducts,
} from '../store/selectors';
import useStore from '../store/useStore';

const ProductSkeleton = () => (
  <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent z-10" />
    <div className="absolute top-3 left-3 z-10">
      <div className="h-7 w-20 bg-linear-to-r from-gray-200 to-gray-300 rounded-full" />
    </div>
    <div className="relative w-full h-64 bg-linear-to-r from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center">
      <div className="w-32 h-32 bg-gray-300/50 rounded-2xl" />
    </div>
    <div className="p-5 space-y-4">
      <div className="h-5 bg-linear-to-r from-gray-200 to-gray-300 rounded-lg w-4/5" />
      <div className="space-y-2 min-h-10">
        <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-full" />
        <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-linear-to-r from-cyan-200 to-cyan-300 rounded-lg w-24" />
        <div className="h-10 bg-linear-to-r from-cyan-200 to-cyan-300 rounded-xl w-32" />
      </div>
    </div>
  </div>
);

const TOAST_DURATION = 1800;

const Offer = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCartActions();
  const authLoading = useStore((s) => s.authLoading);
  const allProducts = useStore((s) => s.products);
  const products = useFeaturedProducts(15);
  const isLoading = authLoading || !allProducts;
  const [toast, setToast] = useState(null);
  const [loadingIds, setLoadingIds] = useState([]);
  const [addedIds, setAddedIds] = useState([]);

  const onAdd = useCallback(
    async (id) => {
      if (!id || loadingIds.includes(id)) return;
      if (!isAuthenticated) {
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
        setToast({ type: 'success', message: 'تمت إضافة المنتج إلى السلة 🛒' });
        setTimeout(
          () => setAddedIds((prev) => prev.filter((x) => x !== id)),
          1200,
        );
      } catch {
        setToast({ type: 'error', message: 'حدث خطأ أثناء إضافة المنتج' });
      } finally {
        setLoadingIds((prev) => prev.filter((x) => x !== id));
      }
    },
    [addToCart, loadingIds, navigate, isAuthenticated],
  );

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="relative w-full bg-linear-to-r from-gray-50 via-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-6">
            <div className="text-center sm:text-right">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2">
                متجرنا الحصري
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                اكتشف أحدث العروض واغتنم التخفيضات قبل انتهاء الوقت
              </p>
            </div>
          </header>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">
                لا توجد عروض حالياً
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 gap-3">
              {products.map((p) => {
                const isAdding = loadingIds.includes(p._id);
                const isAdded = addedIds.includes(p._id);
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
                    className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                  >
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="inline-flex items-center gap-1.5 bg-linear-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                          <Tag className="w-3.5 h-3.5" />
                          خصم {discount}%
                        </div>
                      </div>
                    )}
                    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
                      <LazyImage
                        src={p.image}
                        alt={p.name}
                        className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {p.name}
                      </h3>
                      <div className="flex-col flex  md:flex-row items-center justify-between gap-3">
                        <div>
                          {hasDiscount ? (
                            <div className="flex items-center justify-center md:flex-col gap-1 ">
                              <span className="text-lg font-bold text-cyan-600">
                                {formatEGP(p.price)}
                              </span>
                              <span className="text-xs line-through text-red-700">
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
                          disabled={isAdding}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg ${
                            isAdding
                              ? 'bg-gray-300 text-gray-600 cursor-wait'
                              : isAdded
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          {isAdding
                            ? 'جاري...'
                            : isAdded
                              ? 'تمت الاضافة ✔'
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
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </>
  );
};

export default Offer;
