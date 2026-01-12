import { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazyImage from './LazyImage';

const Categories = () => {
  const { addToCart, url, all_products } = useContext(ShopContext);
  const navigate = useNavigate();
  const Token = localStorage.getItem('token');

  /* ================= CATEGORIES (DYNAMIC) ================= */
  const categories = useMemo(() => {
    if (!all_products) return [];
    const cats = [...new Set(all_products.map((p) => p.category))];
    return ['All', ...cats]; 
  }, [all_products]);

  /* ================= SELECTED CATEGORY ================= */
  const [selectedCategory, setSelectedCategory] = useState('All');

  /* ================= FILTER PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    if (!all_products || !selectedCategory) return [];
    const filtered =
      selectedCategory === 'All'
        ? all_products
        : all_products.filter((p) => p.category === selectedCategory);
    return filtered.slice(0, 10); // slice بعد الفلتر
  }, [selectedCategory, all_products]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = useCallback(
    (id) => {
      if (!Token) {
        alert('Please login to add products to cart!');
        return;
      }
      addToCart(id)
    },
    [addToCart, Token]
  );

  return (
    <div className="relative w-full min-h-screen bg-gray-50 text-gray-900 py-24 px-6 sm:px-10">
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* ===== TITLE ===== */}
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-gray-800">
          فئات المنتجات
        </h2>

        {/* ===== CATEGORIES BUTTONS ===== */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-lg font-semibold transition-all shadow-md
                ${
                  selectedCategory === cat
                    ? 'bg-cyan-400 text-white shadow-lg scale-105'
                    : 'bg-white/40 text-gray-700 hover:bg-white/60 hover:shadow-lg'
                }`}
            >
              {cat === 'All' ? 'الكل' : cat}
            </button>
          ))}
        </div>

        {/* ===== PRODUCTS GRID ===== */}
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500 text-xl">لا توجد منتجات في هذه الفئة</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-3xl overflow-hidden shadow-lg hover:scale-105 hover:shadow-cyan-300 transition-all duration-500 cursor-pointer"
              >
                {/* IMAGE */}
                <div
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="w-full h-64 flex items-center justify-center bg-white/10"
                >
                  <LazyImage
                    src={`${url}/images/${product.image}`}
                    alt={product.name}
                    width="224"
                    height="224"
                    className="object-contain w-56 h-56 transition-transform duration-500 hover:scale-110"
                  />
                </div>

                {/* INFO */}
                <div className="p-5 text-left">
                  <h3 className="text-lg font-bold mb-2 truncate text-gray-800">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-cyan-500">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product._id);
                      }}
                      className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transition-all"
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
