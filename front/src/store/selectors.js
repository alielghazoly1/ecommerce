import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useStore from './useStore';
// ─── Auth ──────────────────────────────────────────────────────────────────────
export const useAuth = () =>
  useStore(
    useShallow((s) => ({
      user: s.user,
      isAuthenticated: s.isAuthenticated,
      authLoading: s.authLoading,
      login: s.login,
      register: s.register,
      logout: s.logout,
      checkAuth: s.checkAuth,
    })),
  );
// ─── Products ─────────────────────────────────────────────────────────────────
// get all products
export const useAllProducts = () => useStore((s) => s.products);
// get product by id
export const useProduct = (productId) => {
  const products = useStore((s) => s.products);
  return useMemo(
    () => products.find((p) => String(p._id) === String(productId)) ?? null,
    [products, productId],
  );
};

export const useRelatedProducts = (productId, category, limit = 8) => {
  const products = useStore((s) => s.products);
  return useMemo(
    () =>
      products
        .filter(
          (p) => String(p._id) !== String(productId) && p.category === category,
        )
        .slice(0, limit),
    [products, productId, category, limit],
  );
};

export const useFeaturedProducts = (limit = 8) => {
  const products = useStore((s) => s.products);
  return useMemo(() => {
    if (!products?.length) return null;
    return [...products]
      .filter((p) => p.isActive && p.inStock && p.isFeatured)
      .sort((a, b) => {
        const aD = a.originalPrice && a.originalPrice > a.price ? 1 : 0;
        const bD = b.originalPrice && b.originalPrice > b.price ? 1 : 0;
        if (aD !== bD) return bD - aD;
        if (a.createdAt && b.createdAt)
          return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      })
      .slice(0, limit);
  }, [products, limit]);
};

// ─── Cart ──────────────────────────────────────────────────────────────────────
export const useCartActions = () =>
  useStore(
    useShallow((s) => ({
      addToCart: s.addToCart,
      removeFromCart: s.removeFromCart,
      clearCart: s.clearCart,
      loadCartData: s.loadCartData,
    })),
  );

export const useCartItems = () => useStore((s) => s.cartItems);

export const useCartProducts = () => {
  const cartItems = useStore((s) => s.cartItems);
  const products = useStore((s) => s.products);
  return useMemo(
    () =>
      Object.keys(cartItems)
        .map((id) => {
          const product = products.find((p) => String(p._id) === String(id));
          return product ? { ...product, quantity: cartItems[id] } : null;
        })
        .filter(Boolean),
    [cartItems, products],
  );
};
//  total number items in cart
export const useCartItemCount = () => {
  const cartItems = useStore((s) => s.cartItems);
  return useMemo(
    () => Object.values(cartItems).reduce((a, b) => a + b, 0),
    [cartItems],
  );
};

export const useCartTotal = () => {
  const cartItems = useStore((s) => s.cartItems);
  const products = useStore((s) => s.products);
  return useMemo(
    () =>
      Object.entries(cartItems).reduce((sum, [id, qty]) => {
        const product = products.find((p) => String(p._id) === String(id));
        return sum + (product ? product.price * qty : 0);
      }, 0),
    [cartItems, products],
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
export const useInitApp = () => useStore((s) => s.initApp);
