import { useMemo } from 'react';
import useStore from '../../store/useStore';
import { useCartProducts, useCartItemCount, useCartActions } from '../../store/selectors';

export const useCart = () => {
  const authLoading = useStore((s) => s.authLoading);
  const products = useStore((s) => s.products);
  const { addToCart, removeFromCart } = useCartActions();

  const cartProducts = useCartProducts();
  const itemCount = useCartItemCount();

  const subtotal = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartProducts],
  );

  const totalProductDiscount = useMemo(
    () =>
      cartProducts.reduce((sum, item) => {
        if (item.originalPrice && item.originalPrice > item.price)
          return sum + (item.originalPrice - item.price) * item.quantity;
        return sum;
      }, 0),
    [cartProducts],
  );

  const loading = authLoading || products.length === 0;

  return { cartProducts, itemCount, subtotal, totalProductDiscount, loading, addToCart, removeFromCart };
};