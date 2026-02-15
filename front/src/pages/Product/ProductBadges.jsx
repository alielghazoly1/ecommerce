import { Tag, Star } from 'lucide-react';

const ProductBadges = ({ hasDiscount, discountPercent, isFeatured }) => {
  if (!hasDiscount && !isFeatured) return null;

  return (
    <div className="flex gap-2 mb-3 lg:mb-4">
      {hasDiscount && (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 lg:px-3 lg:py-1 bg-red-500 text-white text-xs lg:text-sm font-bold rounded-full shadow-lg">
          <Tag className="w-3 h-3" />
          خصم {discountPercent}%
        </div>
      )}
      {isFeatured && (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 lg:px-3 lg:py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs lg:text-sm font-bold rounded-full shadow-lg">
          <Star className="w-3 h-3 fill-white" />
          مميز
        </div>
      )}
    </div>
  );
};

export default ProductBadges;