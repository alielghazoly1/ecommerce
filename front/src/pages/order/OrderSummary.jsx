import LazyImage from '../../components/LazyImage';
import { formatEGP } from '../../components/utils';

// ✅ Props بسيطة — بدون coupon/discountPercent لأن الخصم جاي من المنتجات نفسها
const OrderSummary = ({
  cartProducts,
  subtotal,
  totalProductDiscount,
  shippingFee,
  url,
  navigate,
}) => {
  if (!cartProducts.length) {
    return (
      <div className="py-20 text-center text-gray-600">
        <div className="mb-4">
          <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="mb-4 text-lg font-medium">عربة التسوق فارغة</p>
        <button onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors">
          العودة للتسوق
        </button>
      </div>
    );
  }

  const total = Math.round((subtotal + shippingFee + Number.EPSILON) * 100) / 100;

  return (
    <div>
      {/* ── قائمة المنتجات ─────────────────────────────────────── */}
      <div className="max-h-[400px] overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {cartProducts.map((item) => {
            const hasDiscount = item.originalPrice && item.originalPrice > item.price;
            const discountPct = hasDiscount
              ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
              : 0;
            const savedAmount = hasDiscount
              ? Math.round((item.originalPrice - item.price) * item.quantity * 100) / 100
              : 0;

            return (
              <li key={item._id}
                className="flex items-center gap-4 py-4 hover:bg-gray-50 transition-colors rounded-lg px-2">
                {/* صورة المنتج */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative">
                  <LazyImage src={item.image} alt={item.name} className="object-contain w-full h-full p-1" />
                  {/* ✅ Badge الخصم على الصورة */}
                  {hasDiscount && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-tight">
                      -{discountPct}%
                    </span>
                  )}
                </div>

                {/* تفاصيل المنتج */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-sm text-gray-500">
                          الكمية: <span className="font-medium">{item.quantity}</span>
                        </p>
                        <span className="text-gray-300">•</span>

                        {hasDiscount ? (
                          /* ✅ سعر مع خصم */
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-400 line-through">{formatEGP(item.originalPrice)}</span>
                            <span className="text-sm font-bold text-green-600">{formatEGP(item.price)}</span>
                            <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              خصم {discountPct}%
                            </span>
                          </div>
                        ) : (
                          /* سعر عادي */
                          <p className="text-sm text-gray-500">
                            السعر: <span className="font-medium">{formatEGP(item.price)}</span>
                          </p>
                        )}
                      </div>

                      {/* ✅ رسالة التوفير */}
                      {hasDiscount && (
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          💰 وفّرت {formatEGP(savedAmount)}
                        </p>
                      )}
                    </div>

                    {/* السعر الكلي للمنتج */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-gray-900">{formatEGP(item.price * item.quantity)}</div>
                      {hasDiscount && (
                        <div className="text-xs text-gray-400 line-through">{formatEGP(item.originalPrice * item.quantity)}</div>
                      )}
                      <button onClick={() => navigate('/cart')}
                        className="text-xs text-cyan-600 hover:text-cyan-700 mt-1 transition-colors">
                        تعديل →
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── ملخص الأسعار ──────────────────────────────────────── */}
      <div className="mt-6 border-t border-gray-200 pt-5 space-y-3">

        {/* المجموع الفرعي */}
        <div className="flex justify-between items-center text-gray-700">
          <span className="text-sm">المجموع الفرعي</span>
          <span className="font-semibold">{formatEGP(subtotal)}</span>
        </div>

        {/* ✅ خصم المنتجات — يظهر بس لو فيه خصم */}
        {totalProductDiscount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span className="text-sm flex items-center gap-1">
              🏷️ خصم المنتجات
            </span>
            <span className="font-bold">-{formatEGP(totalProductDiscount)}</span>
          </div>
        )}

        {/* ✅ مصاريف الشحن الثابتة 60 ج */}
        <div className="flex justify-between items-center text-gray-700">
          <span className="text-sm flex items-center gap-1">
            🚚 مصاريف الشحن
            <span className="text-xs text-gray-400">(توصيل لباب البيت)</span>
          </span>
          <span className="font-semibold text-orange-600">{formatEGP(shippingFee)}</span>
        </div>

        {/* الإجمالي النهائي */}
        <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
          <span className="text-lg font-bold text-gray-900">الإجمالي النهائي</span>
          <span className="text-2xl font-extrabold text-cyan-600">{formatEGP(total)}</span>
        </div>

        {/* ✅ بانر التوفير الكلي */}
        {totalProductDiscount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-center">
            <p className="text-sm text-green-700 font-semibold">
              🎉 وفّرت {formatEGP(totalProductDiscount)} في هذا الطلب!
            </p>
          </div>
        )}

        {/* عدد القطع */}
        <div className="text-center text-xs text-gray-500 pt-1">
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