import React from 'react';
// Import useState and useContext for state management and shared data
import { useState, useContext } from 'react';
// Import categories and all products data
import { categories, all_products } from '../assets/data';
// Import Shop Context
import { ShopContext } from '../context/ShopContext';
// Shopping bag icon
import { ShoppingBag } from 'lucide-react';
// Navigation hook
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  // State to track selected category (default: All)
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get addToCart function from context
  const { addToCart } = useContext(ShopContext);

  // Filter products based on selected category
  // If "All", return all products
  const filteredProducts =
    selectedCategory === 'All'
      ? all_products
      : all_products.filter((p) => p.category === selectedCategory);

  // Hook for page navigation
  const navigate = useNavigate();

  return (
    // Main container with gradient background
    <div className="relative w-full min-h-screen bg-linear-to-r from-indigo-900 via-purple-900 to-pink-900 text-white py-24 px-6 sm:px-10">
      {/* Overlay for dark background and blur effect */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Page title */}
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12">
          فئات المنتجات
        </h2>

        {/* Category buttons */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {/* Button to show all products */}
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-6 py-3 rounded-2xl text-lg font-semibold transition-alz
          shadow-lg ${
            selectedCategory === 'All'
              ? 'bg-linear-to-r from-cyan-400 to-blue-500 text-white shadow-cyan-400/50 scale-105'
              : 'bg-white/10 text-gray-200 hover:bg-white/20 '
          }`}
          >
            جميع الفئات
          </button>

          {/* Dynamic category buttons */}
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-6 py-3 rounded-2xl text-lg font-semibold transition-alz
                shadow-lg ${
                  selectedCategory === 'All'
                    ? 'bg-linear-to-r from-cyan-400 to-blue-500 text-white shadow-cyan-400/50 scale-105'
                    : 'bg-white/10 text-gray-200 hover:bg-white/20 '
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Product card */}
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 hover:shadow-cyan-400/30 transition-all duration-500"
            >
              {/* Product image and navigation to details page */}
              <div
                onClick={() => {
                  navigate(`/product/${product._id}`);
                }}
                className=" relative cursor-pointer w-full h-64 flex items-center justify-center bg-linear-to-b from-purple-800/40 to-transparent"
              >
                <img
                loading="lazy"
                  src={product.image}
                  alt={product.name}
                  className="object-contain w-56 h-56 hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Product details */}
              <div className="p-5 text-left">
                {/* Product name */}
                <h3 className="text-lg font-bold mb-2 truncate">
                  {product.name}
                </h3>

                {/* Product description */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Price and add-to-cart button */}
                <div className="flex items-center gap-0.5 justify-around">
                  <span className="text-xl font-bold text-cyan-400">
                    $ {product.price.toFixed(2)}
                  </span>

                  <button
                    onClick={() => addToCart(product._id)}
                    className="flex items-center gap-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
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
