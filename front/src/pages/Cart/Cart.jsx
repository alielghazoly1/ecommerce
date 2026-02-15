import CartItem from './CartItem';
import EmptyCart from './EmptyCart';
import OrderSummary from './OrderSummary';
import { useCart } from './useCart';

const Cart = () => {
  const {
    cartProducts,
    itemCount,
    total,
    loading,
    addToCart,
    removeFromCart,
  } = useCart();

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

            {/* Order Summary */}
            <OrderSummary
              itemCount={itemCount}
              total={total}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;