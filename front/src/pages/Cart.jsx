import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazyImage from '../components/LazyImage';

const Cart = () => {
  const { cartItems, all_products, addToCart, removeFromCart, getTotalCartAmount, url, loadCartData, token } =
    useContext(ShopContext);
  const navigate = useNavigate();
  const total = getTotalCartAmount();
  const [loading, setLoading] = useState(false);

  const cartProducts = Object.keys(cartItems)
    .map((id) => {
      const product = all_products.find((p) => p._id.toString() === id.toString());
      return product ? { ...product, quantity: cartItems[id] } : null;
    })
    .filter(Boolean);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    loadCartData(token).finally(() => setLoading(false));
  }, [token]);

  return (
    <section className="relative w-full min-h-screen bg-gray-50 text-gray-800 py-24 px-6 sm:px-10">
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-center">
          عربة التسوق الخاصة بك
        </h2>

        {loading ? (
          <div className="text-center mt-20 text-gray-600 text-xl">جارٍ تحميل البيانات...</div>
        ) : cartProducts.length === 0 ? (
          <div className="text-center mt-20 space-y-6">
            <p className="text-xl font-semibold">عربة التسوق الخاصة بك فارغة</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-cyan-400 to-blue-500
                text-white px-6 py-3 rounded-xl font-semibold
                hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 shadow-lg"
            >
              ابدأ بالتسوق
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 mb-12">
              {cartProducts.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-center gap-6
                  bg-white shadow-2xl border border-gray-200 rounded-3xl p-6
                  hover:shadow-cyan-400/30 transition-all duration-300"
                >
                  <LazyImage
                    src={`${url}/images/${item.image}`}
                    alt={item.name}
                    className="w-32 h-32 object-contain rounded-2xl"
                  />

                  <div className="flex-1 flex flex-col justify-between w-full">
                    <div>
                      <h3 className="text-xl font-bold">{item.name}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                      <p className="text-cyan-600 text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-all"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="text-gray-800 font-semibold">{item.quantity}</span>
                      <button
                        
                        onClick={() => addToCart(item._id)}
                        className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-all"
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>

                      <button
                        onClick={() => removeFromCart(item._id, true)}
                        className="bg-red-500 p-2 rounded-full hover:bg-red-600 transition-all ml-4"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white shadow-2xl border border-gray-200 p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-2xl font-bold text-gray-800">
                المجموع الكلي : <span className="text-cyan-500 ml-3">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/order')}
                className="flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-indigo-400
                         text-white font-semibold px-8 py-4 rounded-2xl text-lg shadow-lg
                         transition-transform transform hover:scale-105 hover:shadow-xl"
              >
                إتمام الشراء
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Cart;
