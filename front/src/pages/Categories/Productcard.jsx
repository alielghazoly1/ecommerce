import { memo } from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import LazyImage from "../../components/LazyImage"
import { formatEGP } from "../../lib/utils"

/**
 * Single product card.
 * memo() prevents re-renders when siblings change (big perf win in large grids).
 */
const ProductCard = memo(({ product, index, isAdding, onAddToCart, onNavigate, animate }) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className={`group relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100 ${
        animate ? 'animate-scaleIn opacity-100' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* ── Discount badge ─────────────────────────────────────────────── */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-linear-to-r from-red-500 to-pink-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg rotate-12 hover:rotate-0 transition-transform duration-300">
          -{discountPct}%
        </div>
      )}

      {/* ── Product image ───────────────────────────────────────────────── */}
      <div
        onClick={() => onNavigate(product._id)}
        className="relative w-full h-44 sm:h-72 bg-linear-to-br from-gray-50 to-gray-100 cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-3 sm:p-6 group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-blue-600/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 sm:pb-6">
          <span className="text-white font-bold text-sm sm:text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            عرض التفاصيل
          </span>
        </div>
      </div>

      {/* ── Card body ───────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-6 space-y-2 sm:space-y-4">
        {/* Name + description */}
        <div className="space-y-1">
          <h3 className="text-sm sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1 leading-tight">
            {product.name}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-2 hidden sm:block h-10">
            {product.description}
          </p>
        </div>

        {/* Star rating */}
        {product.ratings?.average > 0 && (
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    i < Math.floor(product.ratings.average)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              ({product.ratings.count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <p className="text-lg sm:text-3xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formatEGP(product.price)}
          </p>
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">
              {formatEGP(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(product._id); }}
          disabled={isAdding}
          aria-busy={isAdding}
          className={`w-full flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-md transition-all duration-300 hover:scale-105 ${
            isAdding
              ? 'bg-gray-300 text-gray-600 cursor-wait shadow-none'
              : 'bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/40 hover:shadow-blue-500/60'
          }`}
        >
          {isAdding ? (
            <>
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>جاري الإضافة...</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
              <span>أضف للسلة</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;