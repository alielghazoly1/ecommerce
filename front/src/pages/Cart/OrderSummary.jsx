import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatEGP } from '../../components/utils';
const OrderSummary = memo(({ itemCount, total, formatPrice }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">ملخص الطلب</h3>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>المنتجات ({itemCount})</span>
          <span className="font-medium">{formatEGP(total)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>الشحن</span>
          <span className="font-medium text-green-600">مجاني</span>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-gray-900">المجموع الكلي</span>
            <span className="font-bold text-gray-900">{formatEGP(total)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/order')}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
      >
        إتمام الشراء
      </button>

      <button
        onClick={() => navigate('/')}
        className="w-full mt-3 bg-gray-100 text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
      >
        مواصلة التسوق
      </button>
    </div>
  );
});

OrderSummary.displayName = 'OrderSummary';

export default OrderSummary;