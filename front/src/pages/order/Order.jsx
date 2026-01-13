import { useContext, useMemo, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import OrderSummary from '../order/OrderSummary';
import ShippingForm from '../order/ShippingForm';

const Order = () => {
  const { cartItems, all_products, url, token, clearCart } =
    useContext(ShopContext);

  const navigate = useNavigate();

  // ================= Build cart products =================
  const cartProducts = useMemo(() => {
    return Object.keys(cartItems || {})
      .map((id) => {
        const p = all_products.find((x) => x._id === id);
        return p ? { ...p, quantity: cartItems[id] } : null;
      })
      .filter(Boolean);
  }, [cartItems, all_products]);

  // ================= Shipping =================
  const [shipping, setShipping] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateShipping = (field, value) => {
    setShipping((s) => ({ ...s, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  };

  // ================= Validation =================
  const validate = () => {
    const e = {};
    if (!shipping.name) e.name = true;
    if (!shipping.address) e.address = true;
    if (!shipping.city) e.city = true;
    if (!shipping.phone) e.phone = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ================= Place Order =================
  const placeOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const items = cartProducts.map((p) => ({
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      }));

      const res = await axios.post(
        `${url}/api/order/place`,
        { items, address: shipping },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        clearCart();
        navigate('/myorders');
      }
    } catch (err) {
      alert('حصل خطأ، حاول مرة تانية');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= Render =================
  return (
    <section className="mt-20 max-w-5xl mx-auto grid md:grid-cols-2 gap-6 py-10">
      <OrderSummary
        items={cartProducts}
        url={url}
        onEdit={() => navigate('/cart')}
      />

      <ShippingForm
        data={shipping}
        errors={errors}
        onChange={updateShipping}
        onSubmit={placeOrder}
        loading={loading}
      />
    </section>
  );
};

export default Order;
