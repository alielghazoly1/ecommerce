import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import OrderSummary from './OrderSummary';
import ShippingForm from './ShippingForm';
import Toast from '../../components/ui/Toast';

const Order = () => {
  const {
    cartItems = {},
    clearCart,
    all_products = [],
    url,
    token,
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

  const subtotal = useMemo(() => {
    return cartProducts.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0,
    );
  }, [cartProducts]);

  /* ---------------- SHIPPING ---------------- */
  const [shippingMethod, setShippingMethod] = useState('standard');
  const shippingFee = shippingMethod === 'express' ? 50 : 20;

  const [shipping, setShipping] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});

  /* ---------------- COUPON ---------------- */
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  /* ---------------- UI STATE ---------------- */
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setToast({ message: 'الرجاء تسجيل الدخول أولاً', type: 'error' });
      setTimeout(() => navigate('/login', { replace: true }), 1000);
    }
  }, [authLoading, token, navigate]);

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

  const applyCoupon = () => {
    const trimmedCoupon = coupon.trim().toUpperCase();
    if (trimmedCoupon === 'TAWA10') {
      setDiscountPercent(10);
      setToast({ message: 'تم تطبيق خصم 10%', type: 'success' });
    } else if (trimmedCoupon) {
      setDiscountPercent(0);
      setToast({ message: 'كود خصم غير صالح', type: 'error' });
    }
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

    // ✅ حساب المبلغ النهائي
    const discountAmount = (subtotal * discountPercent) / 100;
    const totalAmount = subtotal - discountAmount + shippingFee;

    // ✅ تنسيق البيانات بما يتوافق مع الـ Backend
    const payload = {
      items: cartProducts.map((p) => ({
        id: p._id,           // ✅ Backend expects "id"
        quantity: p.quantity,
      })),
      address: {
        street: shipping.street,       // ✅ Backend expects "street"
        city: shipping.city,
        state: shipping.state || '',
        zipCode: shipping.zipCode || '',
        country: 'Egypt',
        phone: shipping.phone,
      },
      amount: totalAmount,             // ✅ Backend expects "amount"
      paymentMethod: 'cash',
      notes: coupon ? `كوبون: ${coupon} (${discountPercent}% خصم)` : '',
    };

    try {
      const res = await axios.post(`${url}/api/order/place`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        setToast({ message: 'تم إنشاء الطلب بنجاح ✓', type: 'success' });
        await clearCart();
        setTimeout(() => navigate('/myorders'), 800);
      } else {
        setToast({
          message: res.data?.message || 'حدث خطأ في إنشاء الطلب',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Order Error:', err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.message ||
        'فشل الاتصال بالسيرفر. تحقق من الاتصال بالإنترنت';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <section className="min-h-screen bg-gray-50 py-12 px-4">
      <Toast
        toast={toast}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      <div className="mt-15 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">مراجعة الطلب</h2>
          <OrderSummary
            cartProducts={cartProducts}
            subtotal={subtotal}
            shippingFee={shippingFee}
            shippingMethod={shippingMethod}
            discountPercent={discountPercent}
            url={url}
            navigate={navigate}
          />
        </div>

        {/* Shipping */}
        <aside className="bg-white rounded-2xl p-6 shadow">
          <ShippingForm
            shipping={shipping}
            errors={errors}
            updateShipping={updateShipping}
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            coupon={coupon}
            setCoupon={setCoupon}
            applyCoupon={applyCoupon}
            loading={loading}
            onSubmit={placeOrder}
            navigate={navigate}
            cartProducts={cartProducts}
          />
        </aside>
      </div>
    </section>
  );
};

export default Order;