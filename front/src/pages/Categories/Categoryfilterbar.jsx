import { Filter, TrendingUp } from 'lucide-react';

const CategoryButtonSkeleton = () => (
  <div className="h-10 sm:h-14 w-24 sm:w-32 bg-linear-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
);

/**
 * Horizontal scrollable row of category filter buttons.
 * Shows skeletons while data loads.
 */
const CategoryFilterBar = ({ categories, selected, onSelect, isLoading }) => (
  <div className="mb-8 sm:mb-12">
    <div className="flex items-center justify-center gap-3 mb-4">
      <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
      <h3 className="text-base sm:text-lg font-bold text-gray-800">تصفية حسب الفئة</h3>
    </div>

    {isLoading ? (
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CategoryButtonSkeleton key={i} />
        ))}
      </div>
    ) : (
      /* Horizontally scrollable on mobile, wrapping on larger screens */
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center scrollbar-none">
        {categories.map((cat) => {
          const isActive = selected === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`shrink-0 flex items-center gap-1.5 px-4 sm:px-8 py-2.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 whitespace-nowrap ${
                isActive
                  ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/40'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg hover:shadow-xl border border-gray-200'
              }`}
            >
              {cat === 'All' && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
              {cat === 'All' ? 'الكل' : cat}
            </button>
          );
        })}
      </div>
    )}
  </div>
);

export default CategoryFilterBar;