import { useContext, useMemo } from 'react';
import { ShopContext } from '../../context/ShopContext';

export const useCart = () => {
  const {
    cartItems,
    all_products,
    addToCart,
    removeFromCart,
    authLoading,
  } = useContext(ShopContext);

  // ✅ حذف loadCartData من هنا - ShopContext بيعملها تلقائياً عند login أو init
  // كان بيعمل double loading قبل كده

  const cartProducts = useMemo(() => {
    return Object.keys(cartItems)
      .map((id) => {
        const product = all_products.find(
          (p) => p._id.toString() === id.toString()
        );
        return product ? { ...product, quantity: cartItems[id] } : null;
      })
      .filter(Boolean);
  }, [cartItems, all_products]);

  const itemCount = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.quantity, 0),
    [cartProducts]
  );

  const total = useMemo(() => {
    return cartProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartProducts]);

  // ✅ loading فقط لما المنتجات لسه اتحملتش
  const loading = authLoading || all_products.length === 0;

  return {
    cartProducts,
    itemCount,
    total,
    loading,
    addToCart,
    removeFromCart,
  };
};