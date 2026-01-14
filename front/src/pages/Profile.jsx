import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { Loader2, ShoppingCart, User } from 'lucide-react';
import Toast from '../components/ui/Toast';
import { formatEGP } from "../pages/order/utils";
import { useNavigate } from 'react-router-dom';
import LazyImage from '../components/LazyImage';

const ProfilePage = () => {
  const { token, url, all_products: products } = useContext(ShopContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${url}/api/user/test-auth`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) setUser(res.data.user);
      } catch (err) {
        console.error(err);
        setToast({ message: 'فشل تحميل بيانات البروفايل', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, url]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loader2 className="animate-spin w-12 h-12 text-cyan-600" />
      </div>
    );

  if (!user)
    return (
      <p className="text-center mt-24 text-gray-600 text-lg">
        الرجاء تسجيل الدخول لعرض البروفايل
      </p>
    );

  const cartItems = user.cartData || {};

  return (
    <section className="min-h-screen bg-gray-100 py-10 px-4">
      <Toast
        toast={toast}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      <div className="mt-26 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
          <div className="bg-cyan-600 w-24 h-24 rounded-full flex items-center justify-center text-white mb-4">
            <User size={48} />
          </div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          <span className="mt-2 inline-block px-3 py-1 text-sm font-semibold text-white bg-indigo-600 rounded-full">
            {user.role.toUpperCase()}
          </span>
          <p className="mt-4 text-gray-400 text-sm">
            آخر تحديث: {new Date(user.updatedAt).toLocaleString('ar-EG')}
          </p>

          <button
            onClick={() => navigate('/myorders')}
            className="mt-6 flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl hover:bg-cyan-700 transition shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            عرض الطلبات
          </button>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <ShoppingCart size={24} /> السلة الحالية
          </h2>

          {Object.keys(cartItems).length === 0 ? (
            <p className="text-gray-500 text-lg">السلة فارغة</p>
          ) : (
            <ul className="divide-y">
              {Object.entries(cartItems).map(([productId, qty]) => {
                const product = products.find(p => p._id === productId);
                if (!product) return null;

                return (
                  <li
                    key={productId}
                    className="flex justify-between items-center py-4 hover:bg-gray-50 transition rounded-lg px-2"
                  >
                    <div className="flex items-center gap-4">
                      <LazyImage
                        src={`${url}/images/${product.image}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-gray-400 text-sm">
                          الكمية: {qty}
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold text-cyan-600">
                      {formatEGP(product.price * qty)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Total */}
          {Object.keys(cartItems).length > 0 && (
            <div className="mt-6 border-t pt-4 flex justify-between font-bold text-lg">
              <span>الإجمالي</span>
              <span>
                {formatEGP(
                  Object.entries(cartItems).reduce((total, [id, qty]) => {
                    const p = products.find(pr => pr._id === id);
                    return total + (p ? p.price * qty : 0);
                  }, 0)
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
