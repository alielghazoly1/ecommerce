import { useState, useContext, useMemo, useCallback } from 'react';
import { categories, all_products } from '../assets/data';
import { ShopContext } from '../context/ShopContext';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazyImage from './LazyImage';

const Categories = () => {
  // Selected category
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Context
  const { addToCart } = useContext(ShopContext);

  // Memoized products filtering (performance)
  const filteredProducts = useMemo(() => {
    const products =
      selectedCategory === 'All'
        ? all_products
        : all_products.filter((p) => p.category === selectedCategory);

    return products.slice(0, 10);
  }, [selectedCategory]);

  const navigate = useNavigate();

  // Memoized handler
  const handleAddToCart = useCallback(
    (id) => {
      addToCart(id);
    },
    [addToCart]
  );

  return (
    <div className="relative w-full min-h-screen bg-linear-to-r from-indigo-900 via-purple-900 to-pink-900 text-white py-24 px-6 sm:px-10">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12">
          فئات المنتجات
        </h2>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-6 py-3 rounded-2xl text-lg font-semibold transition-all shadow-lg
              ${
                selectedCategory === 'All'
                  ? 'bg-linear-to-r from-cyan-400 to-blue-500 text-white shadow-cyan-400/50 scale-105'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              }`}
          >
            جميع الفئات
          </button>

          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-6 py-3 rounded-2xl text-lg font-semibold transition-all shadow-lg
                ${
                  selectedCategory === cat.name
                    ? 'bg-linear-to-r from-cyan-400 to-blue-500 text-white shadow-cyan-400/50 scale-105'
                    : 'bg-white/10 text-gray-200 hover:bg-white/20'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-xl
                         transition-shadow duration-300 hover:shadow-cyan-400/30"
            >
              {/* Image */}
              <div
                onClick={() => navigate(`/product/${product._id}`)}
                className="cursor-pointer w-full h-64 flex items-center justify-center
                           bg-linear-to-b from-purple-800/40 to-transparent"
              >
                <LazyImage
                  src={product.image}
                  alt={product.name}
                  width="224"
                  height="224"
                  className="object-contain  transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Info */}
              <div className="p-5 text-left">
                <h3 className="text-lg font-bold mb-2 truncate">
                  {product.name}
                </h3>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-around">
                  <span className="text-xl font-bold text-cyan-400">
                    $ {product.price.toFixed(2)}
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
      </div>
    </div>
  );
};

export default Categories;
