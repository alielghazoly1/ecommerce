import { Package, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * QuickActions
 * ------------
 * Two shortcut buttons: "My Orders" and "Current Cart".
 *
 * Props:
 *  - totalOrders {number} – badge count shown on the orders button
 *  - totalItems  {number} – badge count shown on the cart button
 */
const QuickActions = ({ totalOrders = 0, totalItems = 0 }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h3>

      <div className="space-y-3">
        <button
          onClick={() => navigate('/myorders')}
          className="w-full flex items-center justify-between p-4 bg-linear-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition shadow-lg"
        >
          <span className="flex items-center gap-3">
            <Package className="w-5 h-5" />
            <span className="font-semibold">عرض طلباتي</span>
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{totalOrders}</span>
        </button>

        <button
          onClick={() => navigate('/cart')}
          className="w-full flex items-center justify-between p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
        >
          <span className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">السلة الحالية</span>
          </span>
          <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-bold">{totalItems}</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;