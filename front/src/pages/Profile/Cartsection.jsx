import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazyImage from "../../components/LazyImage";
import { formatEGP } from "../../lib/utils"

// ─── Private sub-components ────────────────────────────────────────────────────

/**
 * EmptyCart
 * ---------
 * Placeholder shown when the user's cart has no items.
 */
const EmptyCart = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center py-16">
      <div className="w-32 h-32 mx-auto mb-6 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
        <ShoppingCart className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">السلة فارغة</h3>
      <p className="text-gray-600 mb-6">ابدأ التسوق الآن واستمتع بعروضنا المميزة</p>
      <button
        onClick={() => navigate('/')}
        className="px-8 py-3 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg"
      >
        تصفح المنتجات
      </button>
    </div>
  );
};

/**
 * CartItem
 * --------
 * A single row inside the cart list.
 *
 * Props:
 *  - product {object} – product with an extra `quantity` field
 */
const CartItem = ({ product }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0 shadow-sm">
      <LazyImage src={product.image} alt={product.name} className="w-full h-full object-contain p-2" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
      <p className="text-sm text-gray-500 mt-1">الكمية: {product.quantity}</p>
    </div>
    <div className="text-right">
      <p className="text-lg font-bold text-cyan-600">{formatEGP(product.price * product.quantity)}</p>
      <p className="text-xs text-gray-500">{formatEGP(product.price)} للواحدة</p>
    </div>
  </div>
);

/**
 * CartSummary
 * -----------
 * Shows the total price and the checkout button.
 *
 * Props:
 *  - total {number} – sum of all cart items
 */
const CartSummary = ({ total }) => {
  const navigate = useNavigate();
  return (
    <div className="mt-6 pt-6 border-t-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-bold text-gray-900">الإجمالي</span>
        <span className="text-3xl font-extrabold bg-linear-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
          {formatEGP(total)}
        </span>
      </div>
      <button
        onClick={() => navigate('/order')}
        className="w-full py-4 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-xl font-bold text-lg hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg"
      >
        إتمام الطلب
      </button>
    </div>
  );
};

// ─── Public component ──────────────────────────────────────────────────────────

/**
 * CartSection
 * -----------
 * Full cart panel rendered in the right column of the profile page.
 *
 * Props:
 *  - cartProducts {Array}  – products with an added `quantity` field
 *  - cartTotal    {number} – pre-calculated total price
 */
const CartSection = ({ cartProducts, cartTotal }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <ShoppingCart className="w-7 h-7 text-cyan-600" />
        السلة الحالية
      </h2>
      {cartProducts.length > 0 && (
        <span className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-bold">
          {cartProducts.length} منتج
        </span>
      )}
    </div>

    {/* Body */}
    {cartProducts.length === 0 ? (
      <EmptyCart />
    ) : (
      <>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {cartProducts.map((product) => (
            <CartItem key={product._id} product={product} />
          ))}
        </div>
        <CartSummary total={cartTotal} />
      </>
    )}
  </div>
);

export default CartSection;