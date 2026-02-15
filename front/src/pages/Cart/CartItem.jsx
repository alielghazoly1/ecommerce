import { memo, useCallback } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import LazyImage from '../../components/LazyImage';
import { formatEGP } from '../../components/utils';
const CartItem = memo(({ item, onAddToCart, onRemoveFromCart }) => {
  const handleRemove = useCallback(() => {
    onRemoveFromCart(item._id, true);
  }, [item._id, onRemoveFromCart]);

  const handleDecrease = useCallback(() => {
    onRemoveFromCart(item._id);
  }, [item._id, onRemoveFromCart]);

  const handleIncrease = useCallback(() => {
    onAddToCart(item._id);
  }, [item._id, onAddToCart]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-lg overflow-hidden">
            <LazyImage
              src={item.image}
              alt={item.name}
              className="w-full h-full object-contain p-2"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {item.description}
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="shrink-0 h-9 w-9 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrease}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={item.quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium text-gray-900">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">
                {formatEGP(item.price)} × {item.quantity}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatEGP(item.price * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;