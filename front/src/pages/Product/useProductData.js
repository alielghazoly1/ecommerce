import { useMemo } from 'react';
import useStore from '../../store/useStore';
import { useProduct, useRelatedProducts } from '../../store/selectors';

export const useProductData = (productId) => {
  const authLoading = useStore((s) => s.authLoading);
  const products = useStore((s) => s.products);

  const product = useProduct(productId);
  const relatedProducts = useRelatedProducts(productId, product?.category);

  const isPageLoading = authLoading || products.length === 0;

  const hasDiscount = !!product?.originalPrice && product.originalPrice > product.price;

  const discountPercent = useMemo(
    () =>
      hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0,
    [hasDiscount, product],
  );

  return { product, relatedProducts, hasDiscount, discountPercent, isPageLoading, authLoading };
};
