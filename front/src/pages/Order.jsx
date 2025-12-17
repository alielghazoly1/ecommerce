import React from 'react';
import { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

const Order = () => {
  // Get data from ShopContext
  const { cartItems, all_products, getTotalCartAmount } =
    useContext(ShopContext);

  const navigate = useNavigate();
  const total = getTotalCartAmount();

  // Build cart products with quantity
  const cartProducts = Object.keys(cartItems)
    .map((id) => {
      const product = all_products.find((p) => p._id === id);
      return product ? { ...product, quantity: cartItems[id] } : null;
    })
    .filter(Boolean);

  // Shipping form state
  const [shipping, setShipping] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
  });

  // Handle input change
  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  // Confirm order logic
  const handleConfirmOrder = () => {
    if (
      !shipping.name ||
      !shipping.address ||
      !shipping.city ||
      !shipping.phone
    ) {
      alert('يرجي ملئ جميع بيانات الشحن');
      return;
    }
    alert('تم ارسال الطلب بنجاح');
    navigate('/');
  };

  return (
    <section
      className="relative w-full min-h-screen bg-linear-to-r
  from-indigo-900 via-purple-900 to-pink-900 text-white py-24 px-6
  sm:px-10"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-center">
          اتمام الطلب
        </h2>

        {/* Empty cart state */}
        {cartProducts.length === 0 ? (
          <div className="text-center text-gray-300 mt-20 space-y-5">
            <p className="text-xl">السلة فارغة الان</p>
            <button
              onClick={() => navigate('/')}
              className="bg-linear-to-r 
                  from-cyan-500 to-blue-500 px-8 py-3 rounded-2xl
                  font-semibold text-white hover:opacity-90 transition-all"
            >
              العودة للتسوق
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-10">
            {/* Cart items list */}
            <div className="space-y-6">
              {cartProducts.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 bg-white/10
                          rounded-2xl shadow-xl border border-white/20"
                >
                  <img
                    src={item.image}
                    alt="photo"
                    className="w-20 h-20
                            object-contain rounded-xl"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-300">
                      الكمية: {item.quantity}
                    </p>
                    <p className="text-cyan-400 font-bold">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Total price */}
              <div className="text-xl font-bold mt-6">
                المجموع الكلي :
                <span className="text-cyan-400 ml-2">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Shipping form */}
            <div
              className="bg-white/10 p-8 rounded-3xl h-[450px] backdrop-blur-md
            border border-white/20 shadow-xl"
            >
              <h3 className="text-2xl font-semibold mb-6 text-center">
                بيانات الشحن
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="الاسم بالكامل"
                  value={shipping.name}
                  onChange={handleChange}
                  className="w-full bg-white/15 text-white placeholder-gray-300
                  px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                  type="text"
                  name="address"
                  placeholder=" العنوان بالكامل"
                  value={shipping.address}
                  onChange={handleChange}
                  className="w-full bg-white/15 text-white placeholder-gray-300
                  px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="المدينة"
                  value={shipping.city}
                  onChange={handleChange}
                  className="w-full bg-white/15 text-white placeholder-gray-300
                  px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="الهاتف"
                  value={shipping.phone}
                  onChange={handleChange}
                  className="w-full bg-white/15 text-white placeholder-gray-300
                  px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400"
                />

                {/* Confirm order button */}
                <button
                  onClick={handleConfirmOrder}
                  className="
                        w-full bg-linear-to-r from-indigo-500 via-purple-500
                        to-pink-500 text-white font-semibold py-3 rounded-xl
                        hover:opacity-90 transition-all mt-4
                "
                >
                  تاكيد الطلب
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Order;
