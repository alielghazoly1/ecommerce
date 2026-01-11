import { useContext, useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import LazyImage from './LazyImage';

const Offer = () => {
  const { addToCart, url, all_products } = useContext(ShopContext);
  const [timeLeft, setTimeLeft] = useState({});
  const [products, setProducts] = useState([]);

  // Countdown timer
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5); // 5 أيام للعرض
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Select offer products
  useEffect(() => {
    if (all_products) {
      const offerProducts = all_products.slice(0, 8);
      setProducts(offerProducts);
    }
  }, [all_products]);

  return (
    <section className="relative w-full min-h-screen bg-gray-50 text-gray-800 py-24 px-6 sm:px-10">
      {/* Overlay شفاف للـ blur */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gray-900">
          متجرنا الحصري
        </h2>
        <p className="text-gray-600 mb-12 text-lg sm:text-xl">
          اكتشف أحدث المنتجات واغتنم التخفيضات قبل انتهاء الوقت
        </p>

        {/* Countdown Timer */}
        <div className="flex justify-center items-center gap-6 mb-16 text-center">
          {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
            <div
              key={unit}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-6 w-24 sm:w-28 shadow-lg"
            >
              <span className="block text-3xl sm:text-4xl font-extrabold text-cyan-500">
                {timeLeft[unit] ?? 0}
              </span>
              <span className="block mt-2 text-gray-700 capitalize font-medium">
                {unit}
              </span>
            </div>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white/70 backdrop-blur-md border border-gray-200
                rounded-3xl overflow-hidden shadow-xl hover:scale-105 hover:shadow-cyan-400/30
                transition-all duration-500"
            >
              <div className="relative w-full h-64 flex items-center justify-center bg-gray-100">
                <LazyImage
                  src={`${url}/images/${product.image}`}
                  alt={product.name}
                  className="object-contain w-56 h-56 hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-5 text-left">
                <h3 className="text-lg font-semibold mb-2 truncate">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-cyan-500">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product._id)}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600
                               px-4 py-2 rounded-xl font-semibold transition-all text-white shadow-md"
                  >
                    <ShoppingBag className="w-5 h-5" /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offer;
