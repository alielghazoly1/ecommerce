import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import LazyImage from '../components/LazyImage';
import CenterAlert from '../components/ui/CenterAlert';

const Product = () => {
  const { addToCart, all_products, url } = useContext(ShopContext);
  const { productId } = useParams();

  const product = all_products.find((p) => p._id === productId);

  const [quantity, setQuantity] = useState(1);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  if (!product) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <p className="text-2xl font-bold">المنتج غير موجود</p>
      </section>
    );
  }

  // ================= Add To Cart =================
  const handleAddToCart = async () => {    const res = await addToCart(product._id, quantity);
    console.log('Add to cart response:', res);
    if (res?.success) setShowSuccessAlert(true);
    else if (res === null) setShowLoginAlert(true);
  };

  // ================= Copy Product Link =================
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  return (
    <section className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 py-24 px-4 flex justify-center">
      {/* Success Alert */}
      <CenterAlert
        open={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        type="success"
        message="تم إضافة المنتج إلى السلة بنجاح"
        link="/cart"
        linkText="اذهب إلى السلة"
        className="z-50"
      />

      {/* Login Alert */}
      <CenterAlert
        open={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        type="warning"
        message="تم إضافة المنتج إلى السلة. الرجاء تسجيل الدخول للمتابعة."
        link="/login"
        linkText="تسجيل الدخول"
        className="z-50"
      />

      {/* Copy Link Alert */}
      <CenterAlert
        open={showCopyAlert}
        onClose={() => setShowCopyAlert(false)}
        type="info"
        message="تم نسخ رابط المنتج 📋"
        className="z-50"
      />

      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* Image */}
        <div className="bg-gray-50 flex items-center justify-center p-10">
          <LazyImage
            src={`${url}/images/${product.image}`}
            alt={product.name}
            className="w-80 h-80 object-contain hover:scale-105 transition duration-300"
          />
        </div>

        {/* Details */}
        <div className="p-10 flex flex-col gap-6">
          <div>
            <h2 className="text-4xl font-extrabold mb-2">{product.name}</h2>
            <p className="text-gray-500 leading-relaxed">
              {product.description}
            </p>
          </div>

          <p className="text-4xl font-bold text-green-600">
            جنية {product.price}
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">الكمية:</span>

            <div className="flex items-center border rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                −
              </button>

              <span className="px-6 font-bold">{quantity}</span>

              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-4 rounded-2xl font-semibold transition"
            >
              Add to Cart
            </button>

            <button
              onClick={handleCopyLink}
              className="w-14 h-14 flex items-center justify-center rounded-2xl border hover:bg-gray-100 active:scale-95 transition"
              title="Copy product link"
            >
              🔗
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;
