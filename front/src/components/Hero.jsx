import heroImage from '../assets/bg.png';
import { ShoppingCart } from 'lucide-react';
import LazyImage from './LazyImage';

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen bg-gray-50 flex items-center">
      {/* Overlay خفيف جدا */}
      <div className="absolute inset-0 bg-white/30"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 flex flex-col-reverse md:flex-row items-center gap-16">
        {/* نصوص Hero */}
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight tracking-tight">
            اكتشف أفضل المنتجات <br /> بأفضل الأسعار
          </h1>
          <p className="text-gray-700 text-lg sm:text-xl md:text-2xl max-w-xl">
            تسوق من مجموعتنا الواسعة من المنتجات عالية الجودة المصممة لتلبية جميع احتياجاتك.
            استمتع بتجربة تسوق سلسة مع خدمة عملاء ممتازة وتوصيل سريع.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <button
              onClick={() => (window.location.href = '/shopping')}
              className="flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-indigo-400
                         text-white font-semibold px-8 py-4 rounded-2xl text-lg shadow-lg
                         transition-transform transform hover:scale-105 hover:shadow-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              تسوق الآن
            </button>

            <button
              onClick={() => (window.location.href = '/categories')}
              className="flex items-center gap-3 bg-gray-200 text-gray-800 font-semibold
                         px-8 py-4 rounded-2xl text-lg shadow-lg transition-transform
                         transform hover:scale-105 hover:shadow-xl"
            >
              تصفح الفئات
            </button>
          </div>
        </div>

        {/* صورة Hero */}
        <div className="flex-1 relative w-full max-w-lg">
          <LazyImage
            src={heroImage}
            alt="Hero"
            className="w-full h-auto object-cover rounded-3xl shadow-2xl transition-transform
                       transform hover:scale-105"
          />

          {/* Badge خصم */}
          <div className="absolute top-4 left-4 bg-red-400 text-white px-4 py-2 rounded-full
                          font-semibold shadow-lg animate-pulse text-base">
            خصم 50% لفترة محدودة!
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
