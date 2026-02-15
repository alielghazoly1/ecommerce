import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';

const ProductNotFound = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6 bg-linear-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
          <Package className="w-16 h-16 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          المنتج غير موجود
        </h2>
        <p className="text-gray-600 mb-6">
          عذراً، لم نتمكن من العثور على هذا المنتج
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg"
        >
          العودة للتسوق
        </button>
      </div>
    </section>
  );
};

export default ProductNotFound;