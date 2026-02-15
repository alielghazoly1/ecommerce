import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import LazyImage from '../../components/LazyImage';
import ProductBadges from './ProductBadges';
import ProductLightbox from './ProductLightbox';

const ProductGallery = ({ product, hasDiscount, discountPercent }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className="p-4 lg:p-8 flex flex-col">
        <ProductBadges
          hasDiscount={hasDiscount}
          discountPercent={discountPercent}
          isFeatured={product.isFeatured}
        />

        {/* Main Image */}
        <div className="relative w-full flex-1 min-h-[300px] lg:min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl lg:rounded-2xl overflow-hidden group">
          <LazyImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 lg:p-6"
          />

          {/* Zoom Button */}
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ZoomIn className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Lightbox */}
      <ProductLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        image={product.image}
        name={product.name}
      />
    </>
  );
};

export default ProductGallery;