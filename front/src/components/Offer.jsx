import React, { useContext, useEffect, useState } from 'react';
import { all_products } from '../assets/data';
import { ShoppingBag } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

const Offer = () => {
  const { addToCart } = useContext(ShopContext);
  const [timeLeft, setTimeLeft] = useState({});
  const [product, setProducts] = useState(all_products.slice(0, 12));
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({days, hours, minutes, seconds})
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  console.log(timeLeft)
  return <div>Off</div>;
};

export default Offer;
