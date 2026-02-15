import { useContext, useEffect, useMemo, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';

export const useProductData = (productId) => {
  const { all_products = [], authLoading } = useContext(ShopContext);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Find product
  const product = useMemo(
    () => all_products.find((p) => String(p._id) === String(productId)),
    [all_products, productId]
  );

  // Related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return (all_products || [])
      .filter((p) => p._id !== product._id && p.category === product.category)
      .slice(0, 8);
  }, [all_products, product]);

  // Calculate discount
  const hasDiscount = product?.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  // Handle loading state
  useEffect(() => {
    if (!authLoading && all_products.length > 0) {
      setTimeout(() => setIsPageLoading(false), 300);
    }
  }, [authLoading, all_products]);

  return {
    product,
    relatedProducts,
    hasDiscount,
    discountPercent,
    isPageLoading,
    authLoading,
  };
};