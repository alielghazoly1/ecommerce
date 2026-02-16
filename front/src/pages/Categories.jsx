import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useContext,
} from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Star,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import LazyImage from '../components/LazyImage';
import Toast from '../components/ui/Toast';

const formatEGP = (v) => {
  try {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `${Number(v).toFixed(2)} ج.م`;
  }
};

// Professional Product Card Skeleton with shimmer effect
const ProductCardSkeleton = ({ index = 0 }) => (
  <div
    className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-scaleIn"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {/* Shimmer overlay */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-10" />

    {/* Discount Badge Skeleton */}
    <div className="absolute top-4 left-4 z-10">
      <div className="h-10 w-16 bg-gradient-to-r from-red-200 to-pink-200 rounded-full" />
    </div>

    {/* Image Section Skeleton */}
    <div className="relative w-full h-72 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center">
      <div className="w-40 h-40 bg-gray-300/50 rounded-3xl" />
    </div>

    {/* Content Skeleton */}
    <div className="p-6 space-y-4">
      {/* Title and Description */}
      <div className="space-y-2">
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5" />
        <div className="space-y-1 h-10">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full" />
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4" />
        </div>
      </div>

      {/* Rating Skeleton */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded-full" />
          ))}
        </div>
        <div className="h-4 w-8 bg-gray-200 rounded" />
      </div>

      {/* Price Skeleton */}
      <div className="flex items-baseline gap-2">
        <div className="h-8 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-lg w-28" />
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>

      {/* Button Skeleton */}
      <div className="h-14 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-2xl w-full" />
    </div>
  </div>
);

// Category Button Skeleton
const CategoryButtonSkeleton = () => (
  <div className="h-14 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
);

const Categories = () => {
  const { addToCart, url, all_products, isAuthenticated } = useContext(ShopContext);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [addingIds, setAddingIds] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [animateProducts, setAnimateProducts] = useState(false);
  const debounceRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setDebouncedSearch(searchTerm.trim()),
      300,
    );
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  useEffect(() => {
    setAnimateProducts(false);
    const timer = setTimeout(() => setAnimateProducts(true), 50);
    return () => clearTimeout(timer);
  }, [selectedCategory, debouncedSearch]);

  const categories = useMemo(() => {
    if (!all_products) return [];
    const cats = [
      ...new Set(all_products.map((p) => p.category).filter(Boolean)),
    ];
    return ['All', ...cats];
  }, [all_products]);

  const filteredProducts = useMemo(() => {
    if (!all_products) return [];
    let list =
      selectedCategory === 'All'
        ? all_products
        : all_products.filter((p) => p.category === selectedCategory);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [selectedCategory, all_products, debouncedSearch]);
  
  const TOAST_DURATION = 1800;

  const handleAddToCart = useCallback(
    async (id) => {
      if (!isAuthenticated) {
        setToast({
          type: 'error',
          message: 'يرجى تسجيل الدخول لإضافة منتجات للسلة',
        });

        setTimeout(() => {
          navigate('/login');
        }, TOAST_DURATION);

        return;
      }

      if (!id || addingIds.includes(id)) return;

      setAddingIds((s) => [...s, id]);

      try {
        await Promise.resolve(addToCart(id));

        setToast({
          type: 'success',
          message: 'تمت إضافة المنتج إلى السلة 🛒',
        });

        setTimeout(() => {
          setAddingIds((s) => s.filter((x) => x !== id));
        }, 700);
      } catch (err) {
        console.error('addToCart failed', err);

        setToast({
          type: 'error',
          message: 'حدث خطأ أثناء إضافة المنتج',
        });

        setAddingIds((s) => s.filter((x) => x !== id));
      }
    },
    [addToCart, addingIds, isAuthenticated, navigate],
  );

  // Check if data is still loading
  const isLoading = !all_products || all_products.length === 0;

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="relative w-full min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-6 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-blue-500/30 mb-4 animate-bounce">
              <Sparkles className="w-5 h-5" />
              <span>اكتشف أفضل المنتجات</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              فئات المنتجات
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              استكشف مجموعة واسعة من المنتجات المميزة المصممة خصيصاً لك
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative flex items-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <Search className="absolute right-6 w-6 h-6 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ابحث عن المنتج الذي تريده..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-16 pl-6 py-5 text-lg text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute left-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="relative">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  تصفية حسب الفئة
                </h3>
              </div>
              {isLoading ? (
                // Category Filters Skeleton
                <div className="flex flex-wrap justify-center gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <CategoryButtonSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`group relative px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 transform hover:scale-105 ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/40'
                          : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg hover:shadow-xl border border-gray-200'
                      }`}
                    >
                      {selectedCategory === cat && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      )}
                      <span className="relative flex items-center gap-2">
                        {cat === 'All' ? (
                          <>
                            <TrendingUp className="w-5 h-5" />
                            الكل
                          </>
                        ) : (
                          cat
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            // Loading Skeleton
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} index={i} />
                ))}
              </div>
            </>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <Search className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                لا توجد منتجات
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                جرب البحث بكلمات مختلفة أو اختر فئة أخرى
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-lg text-gray-600 font-medium">
                  <span className="text-blue-600 font-bold text-xl">
                    {filteredProducts.length}
                  </span>{' '}
                  منتج متاح
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product, index) => {
                  const isAdding = addingIds.includes(product._id);
                  return (
                    <div
                      key={product._id}
                      className={`group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 border border-gray-100 ${
                        animateProducts
                          ? 'animate-scaleIn opacity-100'
                          : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Product Image Section */}
                      <div
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="relative w-full h-72 bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <LazyImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                          <span className="text-white font-bold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            عرض التفاصيل
                          </span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 h-10">
                            {product.description}
                          </p>
                        </div>

                        {/* Rating (if available) */}
                        {product.ratings?.average > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.ratings.average)
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                              ({product.ratings.count})
                            </span>
                          </div>
                        )}

                        {/* Price Section */}
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {formatEGP(product.price)}
                          </p>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatEGP(product.originalPrice)}
                              </span>
                            )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product._id);
                          }}
                          disabled={isAdding}
                          aria-busy={isAdding}
                          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base shadow-lg transition-all duration-300 transform hover:scale-105 ${
                            isAdding
                              ? 'bg-gray-300 text-gray-600 cursor-wait shadow-none'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/40 hover:shadow-blue-500/60'
                          }`}
                        >
                          {isAdding ? (
                            <>
                              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>جاري الإضافة...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag
                                className="w-5 h-5"
                                strokeWidth={2.5}
                              />
                              <span>أضف للسلة</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Discount Badge */}
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                            -
                            {Math.round(
                              ((product.originalPrice - product.price) /
                                product.originalPrice) *
                                100,
                            )}
                            %
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Custom Animations */}
        <style>{`
          @keyframes gradient {
            0%,
            100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 5s ease infinite;
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .animate-scaleIn {
            animation: scaleIn 0.5s ease-out forwards;
          }
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default Categories;