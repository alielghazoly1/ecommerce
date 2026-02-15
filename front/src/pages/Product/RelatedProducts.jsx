import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import LazyImage from '../../components/LazyImage';
import { formatEGP } from '../../components/utils';

const RelatedProducts = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-cyan-600" />
        <h2 className="text-2xl font-bold text-gray-900">منتجات مشابهة</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="group bg-white rounded-xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="relative w-full h-32 mb-3 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
              <LazyImage
                src={product.image}
                alt={product.name}
                className="max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[40px]">
              {product.name}
            </h3>
            <div className="text-lg font-bold text-cyan-600">
              {formatEGP(product.price)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;