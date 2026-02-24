import { useState } from 'react';
import { useAuth, useCartActions } from '../../store/selectors';

export const useProductActions = (product) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCartActions();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'info' });

  const showToast = (msg, type = 'info', delay = 3000) => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'info' }), delay);
  };

  const handleAddToCart = async (qty) => {
    if (isAdding || !product) return;
    if (!isAuthenticated) {
      setShowLoginBanner(true);
      showToast('يرجى تسجيل الدخول لإتمام الطلب', 'error');
      setTimeout(() => setShowLoginBanner(false), 4000);
      return;
    }
    setIsAdding(true);
    try {
      const res = await addToCart(product._id, qty);
      if (res?.success === false && !res?.local) {
        showToast('حدث خطأ أثناء الإضافة، حاول مرة أخرى', 'error');
      } else {
        setIsAdded(true);
        showToast(`تمت إضافة ${qty} من ${product.name} إلى السلة ✓`, 'success');
        setTimeout(() => setIsAdded(false), 2000);
      }
    } catch {
      showToast('حدث خطأ أثناء الإضافة', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('تم نسخ رابط المنتج ✓', 'success', 2000);
    } catch {
      showToast('فشل نسخ الرابط', 'error');
    }
  };

  return {
    isAdding, isAdded, showLoginBanner, toast,
    handleAddToCart, handleCopyLink,
    closeToast: () => setToast({ msg: '', type: 'info' }),
    closeLoginBanner: () => setShowLoginBanner(false),
  };
};
