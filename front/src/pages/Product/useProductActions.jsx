import { useState, useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';

export const useProductActions = (product) => {
  const { addToCart } = useContext(ShopContext);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'info' });

  const handleAddToCart = async (qty) => {
    if (isAdding || !product) return;
    setIsAdding(true);

    try {
      const res = await addToCart(product._id, qty);

      if (res === null || res?.success === false) {
        setShowLoginBanner(true);
        setToast({ msg: 'يرجى تسجيل الدخول لإتمام الطلب', type: 'error' });
        setTimeout(() => setShowLoginBanner(false), 4000);
      } else {
        setIsAdded(true);
        setToast({
          msg: `تمت إضافة ${qty} من ${product.name} إلى السلة ✓`,
          type: 'success',
        });
        setTimeout(() => setIsAdded(false), 2000);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      setToast({ msg: 'حدث خطأ أثناء الإضافة', type: 'error' });
    } finally {
      setIsAdding(false);
      setTimeout(() => setToast({ msg: '', type: 'info' }), 3000);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ msg: 'تم نسخ رابط المنتج ✓', type: 'success' });
      setTimeout(() => setToast({ msg: '', type: 'info' }), 2000);
    } catch (err) {
      setToast({ msg: 'فشل نسخ الرابط', type: 'error' });
    }
  };

  const closeToast = () => setToast({ msg: '', type: 'info' });
  const closeLoginBanner = () => setShowLoginBanner(false);

  return {
    isAdding,
    isAdded,
    showLoginBanner,
    toast,
    handleAddToCart,
    handleCopyLink,
    closeToast,
    closeLoginBanner,
  };
};