import { Search } from 'lucide-react';
import ProductCard from "./Productcard"

// ── Skeleton ─────────────────────────────────────────────────────────────────
const ProductCardSkeleton = ({ index = 0 }) => (
  <div
    className="group relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl overflow-hidden border border-gray-100 animate-scaleIn"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {/* Shimmer sweep */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent z-10" />
    {/* Badge placeholder */}
    <div className="absolute top-3 left-3 z-10">
      <div className="h-7 w-14 bg-linear-to-r from-red-200 to-pink-200 rounded-full" />
    </div>
    {/* Image area */}
    <div className="relative w-full h-44 sm:h-72 bg-linear-to-br from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center">
      <div className="w-24 h-24 sm:w-40 sm:h-40 bg-gray-300/50 rounded-3xl" />
    </div>
    {/* Text area */}
    <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
      <div className="space-y-1.5">
        <div className="h-5 bg-linear-to-r from-gray-200 to-gray-300 rounded-lg w-4/5" />
        <div className="hidden sm:block space-y-1 h-10">
          <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-full" />
          <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 rounded w-3/4" />
        </div>
      </div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded-full" />
        ))}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="h-6 sm:h-8 bg-linear-to-r from-blue-200 to-indigo-200 rounded-lg w-24 sm:w-28" />
        <div className="h-4 bg-gray-200 rounded w-16 sm:w-20" />
      </div>
      <div className="h-10 sm:h-14 bg-linear-to-r from-blue-200 to-indigo-200 rounded-xl sm:rounded-2xl w-full" />
    </div>
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 sm:py-32 space-y-4 sm:space-y-6">
    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-linear-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
      <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">لا توجد منتجات</h3>
    <p className="text-gray-500 text-center text-sm sm:text-base max-w-md px-4">
      جرب البحث بكلمات مختلفة أو اختر فئة أخرى
    </p>
  </div>
);

// ── Main grid ─────────────────────────────────────────────────────────────────
/**
 * Renders one of three states:
 *   1. Skeleton placeholders while loading
 *   2. Empty-state illustration when nothing matches
 *   3. Responsive product grid (2 cols on mobile → 4 on XL)
 */
const ProductGrid = ({
  products,
  isLoading,
  addingIds,
  animateProducts,
  onAddToCart,
  onNavigate,
}) => {
  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="h-5 sm:h-6 w-24 sm:w-32 bg-linear-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
        </div>
        {/* 2 cols on mobile, 3 on md, 4 on xl */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} index={i} />
          ))}
        </div>
      </>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (products.length === 0) return <EmptyState />;

  // ── Grid ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <p className="text-sm sm:text-lg text-gray-600 font-medium">
          <span className="text-blue-600 font-bold text-base sm:text-xl">
            {products.length}
          </span>{' '}
          منتج متاح
        </p>
      </div>

      {/* 2 cols on mobile, 3 on md, 4 on xl */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
        {products.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            index={index}
            isAdding={addingIds.includes(product._id)}
            onAddToCart={onAddToCart}
            onNavigate={onNavigate}
            animate={animateProducts}
          />
        ))}
      </div>
    </>
  );
};

export default ProductGrid;