import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import OrderSummary from './OrderSummary';
import ShippingForm from './ShippingForm';
import Toast from '../../components/ui/Toast';

const api = axios.create({ withCredentials: true });

const SHIPPING_FEE = 60; // ✅ مصاريف الشحن الثابتة 60 ج

const Order = () => {
  const {
    cartItems = {},
    clearCart,
    all_products = [],
    url,
    isAuthenticated,
    authLoading,
  } = useContext(ShopContext);

  const navigate = useNavigate();

  /* ---------------- CART PRODUCTS ---------------- */
  const cartProducts = useMemo(() => {
    return Object.keys(cartItems || {})
      .map((id) => {
        const product = all_products.find((p) => String(p._id) === String(id));
        return product ? { ...product, quantity: cartItems[id] } : null;
      })
      .filter(Boolean);
  }, [cartItems, all_products]);

  // ✅ Subtotal بسعر البيع الفعلي (price بعد الخصم)
  const subtotal = useMemo(() => {
    return cartProducts.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0,
    );
  }, [cartProducts]);

  // ✅ إجمالي وفورات المنتجات (originalPrice - price) × quantity
  const totalProductDiscount = useMemo(() => {
    return cartProducts.reduce((sum, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return sum + (item.originalPrice - item.price) * item.quantity;
      }
      return sum;
    }, 0);
  }, [cartProducts]);

  /* ---------------- SHIPPING ---------------- */
  const [shipping, setShipping] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});

  /* ---------------- LOCATION ---------------- */
  const [location, setLocation] = useState(null);

  /* ---------------- UI STATE ---------------- */
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setToast({ message: 'الرجاء تسجيل الدخول أولاً', type: 'error' });
      setTimeout(() => navigate('/login', { replace: true }), 1000);
    }
  }, [authLoading, isAuthenticated, navigate]);

  /* ---------------- HELPERS ---------------- */
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

  /* ---------------- PLACE ORDER ---------------- */
  const placeOrder = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;

    if (!cartProducts.length) {
      setToast({ message: 'السلة فارغة', type: 'error' });
      return;
    }
    if (!validate()) {
      setToast({ message: 'راجع بيانات الشحن', type: 'error' });
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    // ✅ الـ backend يحسب الخصومات والشحن من المنتجات نفسها
    const payload = {
      items: cartProducts.map((p) => ({ id: p._id, quantity: p.quantity })),
      address: {
        street: shipping.street,
        city: shipping.city,
        state: shipping.state || '',
        zipCode: shipping.zipCode || '',
        country: 'Egypt',
        phone: shipping.phone,
        ...(location?.latitude && location?.longitude && {
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy || null,
            placeName: location.placeName || null,
          },
        }),
      },
      amount: subtotal + SHIPPING_FEE,
      paymentMethod: 'cash',
    };

    try {
      const res = await api.post(`${url}/api/order/place`, payload);
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

  /* ---------------- UI ---------------- */
  return (
    <section className="min-h-screen bg-gray-50 py-12 px-4">
      <Toast toast={toast} onClose={() => setToast({ message: '', type: 'info' })} />
      <div className="mt-15 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">مراجعة الطلب</h2>
          <OrderSummary
            cartProducts={cartProducts}
            subtotal={subtotal}
            totalProductDiscount={totalProductDiscount}
            shippingFee={SHIPPING_FEE}
            url={url}
            navigate={navigate}
          />
        </div>
        <aside className="bg-white rounded-2xl p-6 shadow">
          <ShippingForm
            shipping={shipping}
            errors={errors}
            updateShipping={updateShipping}
            loading={loading}
            onSubmit={placeOrder}
            navigate={navigate}
            cartProducts={cartProducts}
            location={location}
            onLocationChange={setLocation}
          />
        </aside>
      </div>
    </section>
  );
};

export default Order;