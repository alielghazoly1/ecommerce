import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ShopContext } from '../../context/ShopContext';

export const useCart = () => {
  const {
    cartItems,
    all_products,
    addToCart,
    removeFromCart,
    loadCartData,
    token,
  } = useContext(ShopContext);

  const [cartLoading, setCartLoading] = useState(false);

  // Get cart products - memoized
  const cartProducts = useMemo(() => {
    return Object.keys(cartItems)
      .map((id) => {
        const product = all_products.find((p) => p._id.toString() === id.toString());
        return product ? { ...product, quantity: cartItems[id] } : null;
      })
      .filter(Boolean);
  }, [cartItems, all_products]);

  // Calculate totals - memoized
  const itemCount = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.quantity, 0),
    [cartProducts]
  );

  const total = useMemo(() => {
    return Object.entries(cartItems).reduce((total, [id, qty]) => {
      const product = all_products.find((p) => p._id === id);
      return total + (product ? product.price * qty : 0);
    }, 0);
  }, [cartItems, all_products]);

  // Load cart on mount
  useEffect(() => {
    if (!token) return;
    setCartLoading(true);
    loadCartData(token).finally(() => setCartLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Loading is true only if products are not yet loaded
  const loading = all_products.length === 0 || cartLoading;

  return {
    cartProducts,
    itemCount,
    total,
    loading,
    addToCart,
    removeFromCart,
  };
};