import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import LazyImage from '../components/LazyImage';
import axios from 'axios';
const Order = () => {
  // Get data from ShopContext
  const { cartItems, clearCart, all_products, getTotalCartAmount, url, token } =
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

  const placeOrder = async (e) => {
    e.preventDefault();
    let orderItems = [];
    all_products.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo['quantity'] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });
    let orderData = {
      address: shipping,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
    };
    // تأكد من إرسال الهيدر token
    let res = await axios.post(`${url}/api/order/place`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`, // هذا الشكل الصحيح
      },
    });
    if (res.data.success) {
      if (res.data.session_url) {
        // لو الدفع أونلاين
        window.location.replace(res.data.session_url);
      } else if (res.data.orderId) {
        // COD: نقدر نروح لصفحة تأكيد الطلب
        alert('تم إنشاء الطلب بنجاح!');
        navigate(`/myorders`);
        await clearCart();
      }
    }
  };
  useEffect(() => {
    // إذا token === null ===> ما زال جارٍ تهيئته من الـ context، ننتظر
    if (token === null) return;
    if (!token) {
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token]);
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
        {/* بقية الملف كما هو */}
        {cartProducts.length === 0 ? (
          <div className="text-center text-gray-300 mt-20 space-y-5">
            <p className="text-xl">السلة فارغة الآن</p>
            <button
              onClick={() => navigate('/')}
              className="bg-linear-to-r from-cyan-500 to-blue-500
              px-8 py-3 rounded-2xl font-semibold text-white
              hover:opacity-90 transition-all"
            >
              العودة للتسوق
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-10">
            {/* Cart list */}
            <div className="space-y-6">
              {cartProducts.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 bg-white/10
                  rounded-2xl shadow-xl border border-white/20 p-4"
                >
                  <LazyImage
                    src={`${url}/images/${item.image}`}
                    alt={item.name}
                    className="w-20 h-20 object-contain rounded-xl"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-300">
                      الكمية: {item.quantity}
                    </p>
                    <p className="text-cyan-400 font-bold">
                      ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="text-xl font-bold mt-6">
                المجموع الكلي :
                <span className="text-cyan-400 ml-2">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping form */}
            <form
              onSubmit={placeOrder}
              className="bg-white/10 p-8 rounded-3xl
              backdrop-blur-md border border-white/20 shadow-xl"
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
                  placeholder="العنوان بالكامل"
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

                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-indigo-500
                  via-purple-500 to-pink-500 text-white font-semibold
                  py-3 rounded-xl hover:opacity-90 transition-all mt-4"
                >
                  تأكيد الطلب
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default Order;
