import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ToastSmall from '../../components/ui/TostSmall';
import ProductDetailsSkeleton from './ProductDetailsSkeleton';
import ProductNotFound from './ProductNotFound';
import ProductBreadcrumb from './ProductBreadcrumb';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductActions from './ProductActions';
import LoginBanner from './LoginBanner';
import ProductFeatures from './ProductFeatures';
import ProductTags from './ProductTags';
import RelatedProducts from './RelatedProducts';
import { useProductData } from './useProductData';
import { useProductActions } from './useProductActions';

const Product = () => {
  const { productId } = useParams();

  // Custom hooks for data and actions
  const {
    product,
    relatedProducts,
    hasDiscount,
    discountPercent,
    isPageLoading,
    authLoading,
  } = useProductData(productId);

  const {
    isAdding,
    isAdded,
    showLoginBanner,
    toast,
    handleAddToCart,
    handleCopyLink,
    closeToast,
    closeLoginBanner,
  } = useProductActions(product);

  // Reset scroll on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  // Loading state
  if (isPageLoading || authLoading) {
    return <ProductDetailsSkeleton />;
  }

  // Product not found
  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <section className="min-h-screen py-8 md:py-12 px-4 bg-linear-to-br from-gray-50 via-white to-gray-50">
      <ToastSmall message={toast.msg} type={toast.type} onClose={closeToast} />

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <ProductBreadcrumb category={product.category} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 bg-white rounded-2xl lg:rounded-3xl shadow-xl overflow-hidden">
          {/* LEFT: Gallery */}
          <ProductGallery
            product={product}
            hasDiscount={hasDiscount}
            discountPercent={discountPercent}
          />

          {/* RIGHT: Details */}
          <div className="p-4 lg:p-8">
            <ProductInfo
              product={product}
              hasDiscount={hasDiscount}
              discountPercent={discountPercent}
            />

            <ProductActions
              product={product}
              onAddToCart={handleAddToCart}
              onCopyLink={handleCopyLink}
              isAdding={isAdding}
              isAdded={isAdded}
            />

            {/* Login Banner */}
            <LoginBanner show={showLoginBanner} onClose={closeLoginBanner} />

            {/* Features */}
            <ProductFeatures />

            {/* Tags */}
            <ProductTags tags={product.tags} />
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </section>
  );
};

export default Product;