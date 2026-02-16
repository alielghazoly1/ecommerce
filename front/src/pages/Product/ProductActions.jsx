import { useState } from 'react';
import { ShoppingCart, Check, Minus, Plus, Link2 } from 'lucide-react';

const ProductActions = ({ onAddToCart, onCopyLink, isAdding, isAdded }) => {
  const [qty, setQty] = useState(1);

  const handleAddToCart = async () => {
    await onAddToCart(qty);
  };

  const incrementQty = () => setQty((prev) => Math.min(prev + 1, 99));
  const decrementQty = () => setQty((prev) => Math.max(prev - 1, 1));

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Quantity & Add to Cart */}
      <div className="flex gap-3 lg:gap-4">
        {/* Quantity Selector */}
        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={decrementQty}
            disabled={qty <= 1}
            className="w-10 h-12 lg:w-12 lg:h-16 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <span className="w-12 lg:w-16 h-12 lg:h-16 flex items-center justify-center text-base lg:text-lg font-bold">
            {qty}
          </span>
          <button
            onClick={incrementQty}
            disabled={qty >= 99}
            className="w-10 h-12 lg:w-12 lg:h-16 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || isAdded}
          className={`flex-1 h-12 lg:h-16 rounded-xl font-semibold text-sm lg:text-base shadow-lg transition-all ${
            isAdded
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white'
          } disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          {isAdding ? (
            <>
              <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>جاري الإضافة...</span>
            </>
          ) : isAdded ? (
            <>
              <Check className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>تمت الإضافة ✓</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>أضف للسلة</span>
            </>
          )}
        </button>
      </div>

      {/* Copy Link Button */}
      <button
        onClick={onCopyLink}
        className="w-full lg:w-auto px-6 h-10 lg:h-12 border-2 border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm lg:text-base"
      >
        <Link2 className="w-4 h-4 lg:w-5 lg:h-5" />
        <span>نسخ الرابط</span>
      </button>
    </div>
  );
};

export default ProductActions;