import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazyImage from '../components/LazyImage';

const Cart = () => {
  const {
    cartItems,
    all_products,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    loadCartData,
    token,
  } = useContext(ShopContext);
  const navigate = useNavigate();
  const total = getTotalCartAmount();
  const [loading, setLoading] = useState(false);

  const cartProducts = Object.keys(cartItems)
    .map((id) => {
      const product = all_products.find(
        (p) => p._id.toString() === id.toString()
      );
      return product ? { ...product, quantity: cartItems[id] } : null;
    })
    .filter(Boolean);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    loadCartData(token).finally(() => setLoading(false));
  }, [token]);

  const itemCount = cartProducts.reduce((sum, item) => sum + item.quantity, 0);
  const formatPrice = (price) => `${price.toFixed(2)} ج.م`;

  return (
    <section className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            عربة التسوق
          </h1>
          {itemCount > 0 && (
            <p className="text-gray-600">
              {itemCount} منتج في السلة
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">جارٍ التحميل...</p>
          </div>
        ) : cartProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              عربة التسوق فارغة
            </h3>
            <p className="text-gray-600 mb-6">
              لم تقم بإضافة أي منتجات بعد
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              تصفح المنتجات
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartProducts.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
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
                          onClick={() => removeFromCart(item._id, true)}
                          className="flex-shrink-0 h-9 w-9 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item._id)}
                            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  ملخص الطلب
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>المنتجات ({itemCount})</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>الشحن</span>
                    <span className="font-medium text-green-600">مجاني</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-gray-900">المجموع الكلي</span>
                      <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/order')}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  إتمام الشراء
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full mt-3 bg-gray-100 text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  مواصلة التسوق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;