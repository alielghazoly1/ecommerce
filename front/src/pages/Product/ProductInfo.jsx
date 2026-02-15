import { formatEGP } from '../../components/utils';

const ProductInfo = ({ product, hasDiscount, discountPercent }) => {
    console.log('Rendering ProductInfo with:', { product, hasDiscount, discountPercent });
  return (
    
    <div>
      {/* Title */}
      <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4 leading-tight">
        {product.name}
      </h1>

      {/* Price */}
      <div className="mb-4 lg:mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl lg:text-4xl font-bold text-cyan-600">
            {formatEGP(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-lg lg:text-xl text-gray-400 line-through">
              {formatEGP(product.originalPrice)}
            </span>
          )}
        </div>
        {hasDiscount && (
          <p className="text-xs lg:text-sm text-green-600 font-semibold mt-1">
            وفّر {formatEGP(product.originalPrice - product.price)} ({discountPercent}
            % خصم)
          </p>
        )}
      </div>

      {/* Description */}
      <div className="mb-4 lg:mb-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">
          الوصف:
        </h3>
        <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
          {product.description}
        </p>
      </div>
    </div>
  );
};

export default ProductInfo;