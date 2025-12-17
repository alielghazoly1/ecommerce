import React from 'react';
import { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
const Order = () => {
  const { cartItems, all_products, getTotalCartAmount } =
    useContext(ShopContext);
  const navigate = useNavigate();
  const total = getTotalCartAmount();

  const cartProducts = Object.keys(cartItems)
    .map((id) => {
      const product = all_products.find((p) => p._id === id);
      return product ? { ...product, quantity: cartItems[id] } : null;
    })
    .filter(Boolean);
  //  use state for Form
  const [shipping, setShipping] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
  });
  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };
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
  return <div></div>;
};

export default Order;
