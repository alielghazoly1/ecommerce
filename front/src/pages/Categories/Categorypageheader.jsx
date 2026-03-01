import { Sparkles } from 'lucide-react';

/**
 * Decorative hero header shown at the top of the Categories page.
 * Pure presentational — no state.
 */
const CategoryPageHeader = () => (
  <div className="text-center mb-10 sm:mb-16 space-y-4 sm:space-y-6">
    <div className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/30 animate-bounce">
      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
      <span>اكتشف أفضل المنتجات</span>
    </div>
    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient leading-tight">
      فئات المنتجات
    </h1>
    <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto font-medium px-2">
      استكشف مجموعة واسعة من المنتجات المميزة المصممة خصيصاً لك
    </p>
  </div>
);

export default CategoryPageHeader;