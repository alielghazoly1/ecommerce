import LazyImage from '../../components/LazyImage';
import { formatEGP } from './utils';

const OrderSummary = ({
  cartProducts,
  subtotal,
  shippingFee,
  shippingMethod,
  discountPercent,
  url,
  navigate,
}) => {
  if (!cartProducts.length) {
    return (
      <div className="py-20 text-center text-gray-600">
        <div className="mb-4">
          <svg
            className="w-24 h-24 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <p className="mb-4 text-lg font-medium">عربة التسوق فارغة</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
        >
          العودة للتسوق
        </button>
      </div>
    );
  }

  const discountAmount =
    Math.round(((subtotal * discountPercent) / 100) * 100) / 100;

  const total =
    Math.round(
      (subtotal - discountAmount + shippingFee + Number.EPSILON) * 100
    ) / 100;

  return (
    <div>
      {/* Products List */}
      <div className="max-h-[400px] overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {cartProducts.map((item) => (
            <li
              key={item._id}
              className="flex items-center gap-4 py-4 hover:bg-gray-50 transition-colors rounded-lg px-2"
            >
              {/* Product Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                <LazyImage
                  src={item.image}
                  alt={item.name}
                  className="object-contain w-full h-full p-1"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">
                        الكمية: <span className="font-medium">{item.quantity}</span>
                      </p>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm text-gray-500">
                        السعر: <span className="font-medium">{formatEGP(item.price)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Price & Edit */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-gray-900">
                      {formatEGP(item.price * item.quantity)}
                    </div>
                    <button
                      onClick={() => navigate('/cart')}
                      className="text-xs text-cyan-600 hover:text-cyan-700 mt-1 transition-colors"
                    >
                      تعديل →
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Breakdown */}
      <div className="mt-6 border-t border-gray-200 pt-5 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-gray-700">
          <span className="text-sm">المجموع الفرعي</span>
          <span className="font-semibold">{formatEGP(subtotal)}</span>
        </div>

        {/* Discount */}
        {discountPercent > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span className="text-sm">الخصم ({discountPercent}%)</span>
            <span className="font-semibold">-{formatEGP(discountAmount)}</span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between items-center text-gray-700">
          <span className="text-sm">
            الشحن{' '}
            <span className="text-xs text-gray-500">
              ({shippingMethod === 'express' ? 'سريع' : 'عادي'})
            </span>
          </span>
          <span className="font-semibold">{formatEGP(shippingFee)}</span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
          <span className="text-lg font-bold text-gray-900">الإجمالي النهائي</span>
          <span className="text-2xl font-extrabold text-cyan-600">
            {formatEGP(total)}
          </span>
        </div>

        {/* Item Count */}
        <div className="text-center text-xs text-gray-500 pt-2">
          إجمالي المنتجات:{' '}
          <span className="font-medium">
            {cartProducts.reduce((sum, item) => sum + item.quantity, 0)} قطعة
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;