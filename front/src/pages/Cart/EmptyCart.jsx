import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingCart className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        عربة التسوق فارغة
      </h3>
      <p className="text-gray-600 mb-6">لم تقم بإضافة أي منتجات بعد</p>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        تصفح المنتجات
        <ArrowLeft className="w-5 h-5" />
      </button>
    </div>
  );
};

export default EmptyCart;