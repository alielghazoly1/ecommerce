import React from 'react';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Trash2, Plus, Minus, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Cart = () => {
  const {
    cartItems,
    all_products,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
  } = useContext(ShopContext);
 console.log(getTotalCartAmount());
 
  const navigate = useNavigate();
  const total = getTotalCartAmount();

  const cartProducts = Object.keys(cartItems).map((id) => {
    const product = all_products.find((p) => p._id === id);
    return { ...product, quantity: cartItems[id] };
  });
  return (
    <section
      className="w-full min-h-screen bg-linear-to-r
    from-indigo-900 via-purple-900 to-pink-900 text-white py-24 px-6 sm:px-10"
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm
      pointer-events-none"
      ></div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12">
          عربة التسوق الخاصة بك
        </h2>
        {cartProducts.length === 0 ? (
          <div className="text-center text-gray-300 mt-20 space-y-6">
            <p className="text-xl">عربة التسوق الخاصة بك فارغة</p>
            <button
              onClick={() => navigate('/')}
              className="bg-linear-to-r from-cyan-500
            to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
            >
              ابدا بالتسوق
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6 mp-12">
              {cartProducts.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between bg-white/10 flex-col sm:flex-row 
                  border border-white/20 backdrop-blur-md p-6 rounded-3xl shadow-lg
                  hover:shadow-cyan-400/30 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-contain rounded-xl "
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <p className="text-gray-300 text-sm mt-1 line-clamp-1">
                        {item.description}
                      </p>
                      <p className="text-gray-400 text-lg font-bold mt-2">
                        السعر: ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-6 sm:mt-10">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="bg-white/20
                    p-2 rounded-full hover:bg-white/30 transition-all"
                    >
                      <Minus className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-lg font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item._id)}
                      className="bg-white/20
                    p-2 rounded-full hover:bg-white/30 transition-all"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id, true)}
                      className="bg-red-500/70
                    p-2 rounded-full hover:bg-red-600 ml-4 transition-all"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="bg-white/10 border mt-6 border-white/20
            backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col
            sm:flex-row justify-between items-center gap-6"
            >
              <div className="text-2xl font-bold">
                المجموع الكلي :
                <span className="text-cyan-400 ml-3">$ {total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/order')}
                className="flex items-center gap-3 bg-linear-to-r px-8 from-indigo-500
                via-purple-500 to-pink-500 sm:w-auto w-full text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
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
