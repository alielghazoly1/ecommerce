import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import LazyImage from '../components/LazyImage';
import axios from 'axios';
import CenterAlert from '../components/ui/CenterAlert';

const Order = () => {
  const { cartItems, clearCart, all_products, getTotalCartAmount, url, token } =
    useContext(ShopContext);
  const navigate = useNavigate();
  const total = getTotalCartAmount();

  const [alert, setAlert] = useState({ open: false, type: '', message: '', link: '' });
  const [loading, setLoading] = useState(false);

  const cartProducts = Object.keys(cartItems)
    .map((id) => {
      const product = all_products.find((p) => p._id === id);
      return product ? { ...product, quantity: cartItems[id] } : null;
    })
    .filter(Boolean);

  const [shipping, setShipping] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
  });

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const validateShipping = () => {
    if (!shipping.name || !shipping.address || !shipping.city || !shipping.phone) {
      setAlert({ open: true, type: 'error', message: 'برجاء ملء جميع البيانات', link: '' });
      return false;
    }
    return true;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!token) {
      setAlert({ open: true, type: 'error', message: 'برجاء تسجيل الدخول لإتمام الطلب', link: '/login' });
      return;
    }
    if (!validateShipping()) return;

    setLoading(true);

    const orderItems = all_products
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({ ...item, quantity: cartItems[item._id] }));

    const orderData = {
      address: shipping,
      items: orderItems,
      amount: total + 2,
    };

    try {
      const res = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        if (res.data.session_url) {
          window.location.replace(res.data.session_url);
        } else if (res.data.orderId) {
          setAlert({ open: true, type: 'success', message: 'تم إنشاء الطلب بنجاح!', link: '' });
          setTimeout(async () => {
            await clearCart();
            navigate('/myorders');
          }, 1500);
        }
      } else {
        setAlert({ open: true, type: 'error', message: res.data.message || 'حصل خطأ أثناء إنشاء الطلب', link: '' });
      }
    } catch (error) {
      setAlert({ open: true, type: 'error', message: 'حصل خطأ أثناء إنشاء الطلب', link: '' });
      console.error('Order Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || total === 0) navigate('/cart');
  }, [token, total, navigate]);

  return (
    <>
      {alert.open && (
        <CenterAlert
          open={alert.open}
          onClose={() => setAlert({ ...alert, open: false })}
          type={alert.type}
          message={alert.message}
          link={alert.link}
          linkText={alert.link ? 'انتقال' : ''}
          duration={5000}
          autoNavigate={!!alert.link}
        />
      )}

      <section className="relative w-full min-h-screen bg-gray-50 text-gray-800 py-24 px-6 sm:px-10">
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-center">
            إتمام الطلب
          </h2>

          {cartProducts.length === 0 ? (
            <div className="text-center text-gray-600 mt-20 space-y-5">
              <p className="text-xl">السلة فارغة الآن</p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-2xl font-semibold transition-all"
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
                    className="flex items-center gap-4 bg-white rounded-2xl shadow-md p-4 border border-gray-200"
                  >
                    <LazyImage
                      src={`${url}/images/${item.image}`}
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded-xl shadow-sm"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-gray-600 text-sm">الكمية: {item.quantity}</p>
                      <p className="text-blue-700 font-bold">${Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                <div className="text-xl font-bold mt-6">
                  المجموع الكلي :
                  <span className="text-blue-700 ml-2">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping form */}
              <form
                onSubmit={placeOrder}
                className="bg-white p-8 rounded-3xl border border-gray-200 shadow-md"
              >
                <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                  بيانات الشحن
                </h3>

                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="الاسم بالكامل"
                    value={shipping.name}
                    onChange={handleChange}
                    className="w-full bg-gray-100 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="العنوان بالكامل"
                    value={shipping.address}
                    onChange={handleChange}
                    className="w-full bg-gray-100 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="المدينة"
                    value={shipping.city}
                    onChange={handleChange}
                    className="w-full bg-gray-100 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="الهاتف"
                    value={shipping.phone}
                    onChange={handleChange}
                    className="w-full bg-gray-100 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full ${
                      loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                    } text-white font-semibold py-3 rounded-xl transition-all mt-4`}
                  >
                    {loading ? 'جارٍ إنشاء الطلب...' : 'تأكيد الطلب'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Order;
