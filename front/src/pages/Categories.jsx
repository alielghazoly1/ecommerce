import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useContext,
} from 'react';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import LazyImage from '../components/LazyImage';

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

const Categories = () => {
  const { addToCart, url, all_products } = useContext(ShopContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [addingIds, setAddingIds] = useState([]);
  const debounceRef = useRef(null);

  // debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setDebouncedSearch(searchTerm.trim()),
      300
    );
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

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
          (p.description || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, all_products, debouncedSearch]);

  const handleAddToCart = useCallback(
    async (id) => {
      if (!token) {
        alert('يرجى تسجيل الدخول لإضافة منتجات للسلة');
        return;
      }
      if (!id || addingIds.includes(id)) return;

      setAddingIds((s) => [...s, id]);
      try {
        await Promise.resolve(addToCart(id));
        // عرض حالة "مضافة" قصيرة إن رغبت لاحقًا (حاليًا نعيد الزر لوضعه الطبيعي)
        setTimeout(() => {
          setAddingIds((s) => s.filter((x) => x !== id));
        }, 700); // لو العملية سريعة لن يظهر التحميل طويلاً
      } catch (err) {
        console.error('addToCart failed', err);
        setAddingIds((s) => s.filter((x) => x !== id));
      }
    },
    [addToCart, addingIds, token]
  );

  return (
    <div className="relative w-full min-h-screen bg-gray-50 py-24 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-gray-800 text-center">
          فئات المنتجات
        </h2>

        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 px-5 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-lg font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-cyan-400 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
              }`}
            >
              {cat === 'All' ? 'الكل' : cat}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-gray-500 text-xl text-center">لا توجد منتجات</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isAdding = addingIds.includes(product._id);
              return (
                <div
                  key={product._id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-transform hover:-translate-y-1 cursor-pointer"
                >
                  <div
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="relative w-full h-64 flex items-center justify-center bg-gray-100"
                  >
                    <LazyImage
                      src={product.image}
                      alt={product.name}
                      className="object-contain w-56 h-56"
                    />
                  </div>

                  <div className="p-5 flex flex-col gap-3">
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {product.description}
                    </p>

                    <div className="mt-2">
                      <div className="text-lg font-bold text-cyan-500">
                        {formatEGP(product.price)}
                      </div>

                      {/* الزر الآن تحت السعر (block) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product._id);
                        }}
                        disabled={isAdding}
                        aria-busy={isAdding}
                        className={`mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition ${
                          isAdding
                            ? 'bg-gray-300 text-gray-700 cursor-wait'
                            : 'bg-cyan-400 hover:bg-cyan-500'
                        }`}
                      >
                        {isAdding ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 24v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                              />
                            </svg>
                            جاري الإضافة...
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            أضف
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
