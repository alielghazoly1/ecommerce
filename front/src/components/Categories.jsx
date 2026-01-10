import { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazyImage from './LazyImage';

const Categories = () => {
  const { addToCart, url, all_products } = useContext(ShopContext);
  const navigate = useNavigate();

  /* ================= CATEGORIES (DYNAMIC ONLY) ================= */
  const categories = useMemo(() => {
    if (!all_products) return [];
    const cats = [...new Set(all_products.map((p) => p.category))];
    return ['All', ...cats]; // 👈 ضيفنا All كأول خيار
  }, [all_products]);

  /* ================= SELECTED CATEGORY ================= */
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0]); // أول كاتيجوري تلقائي (All)
    }
  }, [categories]);

  /* ================= FILTER PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    if (!all_products || !selectedCategory) return [];
    return selectedCategory === 'All'
      ? all_products.slice(0, 10) // 👈 كل المنتجات لو All
      : all_products
          .filter((p) => p.category === selectedCategory)
          .slice(0, 10);
  }, [selectedCategory, all_products]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = useCallback(
    (id) => {
      addToCart(id);
    },
    [addToCart]
  );

  return (
    <div className="relative w-full min-h-screen bg-linear-to-r from-indigo-900 via-purple-900 to-pink-900 text-white py-24 px-6 sm:px-10">
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* ===== TITLE ===== */}
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12">
          فئات المنتجات
        </h2>

        {/* ===== CATEGORIES ===== */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-lg font-semibold transition-all shadow-lg
                ${
                  selectedCategory === cat
                    ? 'bg-linear-to-r from-cyan-400 to-blue-500 text-white shadow-cyan-400/50 scale-105'
                    : 'bg-white/10 text-gray-200 hover:bg-white/20'
                }`}
            >
              {cat === 'All' ? 'الكل' : cat} {/* 👈 عرض الكل بالعربي */}
            </button>
          ))}
        </div>

        {/* ===== PRODUCTS ===== */}
        {filteredProducts.length === 0 ? (
          <p className="text-gray-300 text-xl">لا توجد منتجات في هذه الفئة</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-xl
                           transition-shadow duration-300 hover:shadow-cyan-400/30"
              >
                {/* IMAGE */}
                <div
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="cursor-pointer w-full h-64 flex items-center justify-center
                             bg-linear-to-b from-purple-800/40 to-transparent"
                >
                  <LazyImage
                    src={`${url}/images/${product.image}`}
                    alt={product.name}
                    width="224"
                    height="224"
                    className="object-contain transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* INFO */}
                <div className="p-5 text-left">
                  <h3 className="text-lg font-bold mb-2 truncate">
                    {product.name}
                  </h3>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-cyan-400">
                      ${product.price.toFixed(2)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product._id);
                      }}
                      className="flex items-center gap-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500
                                 px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90
                                 transition-all shadow-lg"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
