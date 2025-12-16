import React from 'react';
import heroImage from '../assets/bg.png';
import { ShoppingCart } from 'lucide-react';
const Hero = () => {
  return (
    <section
      className="relative w-full min-h-screen bg-linear-to-r from-indigo-900 via-purple-900 to-pink-900
    text-white flex items-center"
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10
            flex flex-col-reverse md:flex-row items-center gap-16 "
      >
        <div className="flex-1 space-y-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight">
            اكتشف افضل المنتجات <br /> بافضل الاسعار
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-xl ">
            تسوق من مجموعتنا الواسعة من المنتجات عالية الجودة المصممة لتلبية
            جميع احتياجاتك. استمتع بتجربة تسوق سلسة مع خدمة عملاء ممتازة وتوصيل
            سريع.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
            <button
              onClick={() => {
                window.location.href = '/shopping';
              }}
              className="flex items-center gap-3 bg-cyan-400 hover:bg-cyan-500
                      text-white font-bold px-8 py-4 rounded-2xl text-xl shadow-2xl transition-transform
                      transform hover:scale-105"
            >
              <ShoppingCart className="w-6 h-6" />
              تسوق الان
            </button>
            <button
              onClick={() => {
                window.location.href = '/categories';
              }}
              className="flex items-center gap-3 bg-cyan-400 hover:bg-cyan-500
                      text-indigo-900 font-bold px-8 py-4 rounded-2xl text-xl shadow-2xl transition-transform
                      transform hover:scale-105"
            >
              تصفح الفئات
            </button>
          </div>
        </div>
        <div className="flex-1 relative w-full max-w-lg">
          <img
            src={heroImage}
            alt="Hero"
            className="w-full h-auto object-cover rounded-2xl shadow-2xl"
          />
          <div
            className="absolute top-6 left-6 bg-red-500 text-white px-5 py-3 rounded-full
                font-bold shadow-lg animate-pulse text-xl"
          >
            خصم 50% لفترة محدودة!
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
