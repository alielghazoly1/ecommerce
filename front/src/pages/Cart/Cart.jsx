import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import EmptyCart from './EmptyCart';
import { useCart } from './useCart';
import { formatEGP } from '../../lib/utils';

const SHIPPING_FEE = 60;

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartProducts,
    itemCount,
    subtotal,
    totalProductDiscount,
    loading,
    addToCart,
    removeFromCart,
  } = useCart();

  const total = subtotal + SHIPPING_FEE;

  return (
    <section className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            عربة التسوق
          </h1>
          {itemCount > 0 && (
            <p className="text-gray-600">{itemCount} منتج في السلة</p>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        ) : cartProducts.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartProducts.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onAddToCart={addToCart}
                  onRemoveFromCart={removeFromCart}
                />
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">ملخص الطلب</h2>

              <div className="space-y-3 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span className="font-medium">{formatEGP(subtotal)}</span>
                </div>

                {/* Product Discount */}
                {totalProductDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">🏷️ خصم المنتجات</span>
                    <span className="font-bold">-{formatEGP(totalProductDiscount)}</span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">🚚 مصاريف الشحن</span>
                  <span className="font-medium text-orange-600">{formatEGP(SHIPPING_FEE)}</span>
                </div>

                {/* Total */}
                <div className="border-t-2 border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">الإجمالي النهائي</span>
                    <span className="text-2xl font-extrabold text-cyan-600">{formatEGP(total)}</span>
                  </div>
                </div>
              </div>

              {/* Savings Banner */}
              {totalProductDiscount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-center mb-4">
                  <p className="text-sm text-green-700 font-semibold">
                    🎉 وفّرت {formatEGP(totalProductDiscount)} في هذا الطلب!
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/order')}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl font-bold text-lg hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                إتمام الطلب ←
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                الدفع عند الاستلام • توصيل لباب البيت
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;