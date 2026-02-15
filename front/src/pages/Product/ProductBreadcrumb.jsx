import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const ProductBreadcrumb = ({ category }) => {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <Link to="/" className="hover:text-cyan-600 transition-colors">
        الرئيسية
      </Link>
      <ChevronLeft className="w-4 h-4" />
      <Link to="/categories" className="hover:text-cyan-600 transition-colors">
        المنتجات
      </Link>
      <ChevronLeft className="w-4 h-4" />
      <span className="text-gray-900 font-medium">{category}</span>
    </nav>
  );
};

export default ProductBreadcrumb;