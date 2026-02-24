import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OrderSummary from './OrderSummary';
import ShippingForm from './ShippingForm';
import Toast from '../../components/ui/Toast';
import { useAuth, useCartProducts, useCartActions } from '../../store/selectors';
import { api } from '../../config/api';


const SHIPPING_FEE = 60;

const Order = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authLoading } = useAuth();
  const { clearCart } = useCartActions();
  const cartProducts = useCartProducts();
  

  const subtotal = useMemo(
    () => cartProducts.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [cartProducts],
  );

  const totalProductDiscount = useMemo(
    () => cartProducts.reduce((sum, item) => {
      if (item.originalPrice && item.originalPrice > item.price)
        return sum + (item.originalPrice - item.price) * item.quantity;
      return sum;
    }, 0),
    [cartProducts],
  );

  const [shipping, setShipping] = useState({ street: '', city: '', state: '', zipCode: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const submittingRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setToast({ message: 'الرجاء تسجيل الدخول أولاً', type: 'error' });
      setTimeout(() => navigate('/login', { replace: true }), 1000);
    }
  }, [authLoading, isAuthenticated, navigate]);

  const updateShipping = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!shipping.street?.trim()) e.street = 'العنوان مطلوب';
    if (!shipping.city?.trim()) e.city = 'المدينة مطلوبة';
    if (!/^\+?\d{7,15}$/.test(shipping.phone)) e.phone = 'رقم هاتف غير صحيح';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!cartProducts.length) { setToast({ message: 'السلة فارغة', type: 'error' }); return; }
    if (!validate()) { setToast({ message: 'راجع بيانات الشحن', type: 'error' }); return; }

    submittingRef.current = true;
    setLoading(true);

    const payload = {
      items: cartProducts.map((p) => ({ id: p._id, quantity: p.quantity })),
      address: {
        street: shipping.street, city: shipping.city,
        state: shipping.state || '', zipCode: shipping.zipCode || '',
        country: 'Egypt', phone: shipping.phone,
        ...(location?.latitude && location?.longitude && {
          location: { latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy || null, placeName: location.placeName || null },
        }),
      },
      amount: subtotal + SHIPPING_FEE,
      paymentMethod: 'cash',
    };

    try {
      const res = await api.post('/api/order/place', payload);
      if (res.data?.success) {
        setToast({ message: 'تم إنشاء الطلب بنجاح ✓', type: 'success' });
        await clearCart();
        setTimeout(() => navigate('/myorders'), 800);
      } else {
        setToast({ message: res.data?.message || 'حدث خطأ في إنشاء الطلب', type: 'error' });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setToast({ message: 'انتهت الجلسة، الرجاء تسجيل الدخول مرة أخرى', type: 'error' });
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      setToast({ message: err.response?.data?.message || 'فشل الاتصال بالسيرفر', type: 'error' });
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-12 px-4">
      <Toast toast={toast} onClose={() => setToast({ message: '', type: 'info' })} />
      <div className="mt-15 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">مراجعة الطلب</h2>
          <OrderSummary  cartProducts={cartProducts} subtotal={subtotal} totalProductDiscount={totalProductDiscount} shippingFee={SHIPPING_FEE} navigate={navigate} />
        </div>
        <aside className="bg-white rounded-2xl p-6 shadow">
          <ShippingForm shipping={shipping} errors={errors} updateShipping={updateShipping} loading={loading} onSubmit={placeOrder} navigate={navigate} cartProducts={cartProducts} location={location} onLocationChange={setLocation} />
        </aside>
      </div>
    </section>
  );
};

export default Order;
