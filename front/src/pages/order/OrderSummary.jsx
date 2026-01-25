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
        <p className="mb-4 text-lg">عربة التسوق فارغة</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg"
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
    <>
      {/* Products */}
      <ul className="divide-y">
        {cartProducts.map((it) => (
          <li
            key={it._id}
            className="flex items-center gap-4 py-4"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              <LazyImage
                src={it.image}
                alt={it.name}
                className="object-contain w-full h-full"
              />
            </div>

            <div className="flex-1">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{it.name}</h3>
                  <p className="text-sm text-gray-500">
                    الكمية: {it.quantity}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    {formatEGP(it.price * it.quantity)}
                  </div>
                  <button
                    onClick={() => navigate('/cart')}
                    className="text-xs text-cyan-600 mt-1"
                  >
                    تعديل في السلة
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Price Breakdown */}
      <div className="mt-6 border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>المجموع الفرعي</span>
          <span>{formatEGP(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>الخصم</span>
          <span>
            {discountPercent
              ? `-${discountPercent}% (${formatEGP(discountAmount)})`
              : '-'}
          </span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>
            الشحن ({shippingMethod === 'express' ? 'سريع' : 'عادي'})
          </span>
          <span>{formatEGP(shippingFee)}</span>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-lg font-bold">الإجمالي</span>
          <span className="text-xl font-extrabold">
            {formatEGP(total)}
          </span>
        </div>
      </div>
    </>
  );
};

export default OrderSummary;
