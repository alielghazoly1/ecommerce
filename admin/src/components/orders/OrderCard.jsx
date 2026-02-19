// src/components/orders/OrderCard.jsx
import { Package, Calendar, User, Mail, Phone, Eye } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatPrice, formatDate } from '../../utils/helpers';

const OrderCard = ({ order, onViewDetails }) => (
  <div className="group bg-slate-800 rounded-2xl border-2 border-purple-500/20 overflow-hidden hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b-2 border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-1">
              طلب #{order.orderNumber || order._id?.slice(-8) || 'N/A'}
            </h3>
            <p className="text-base text-gray-300 flex items-center gap-2 font-semibold">
              <Calendar className="w-4 h-4 text-purple-400" />
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={order.status} />
          <div className="text-right">
            <p className="text-4xl font-black text-green-400">{formatPrice(order.totalAmount)} ج.م</p>
            <p className="text-sm text-gray-400 font-bold">{order.itemsCount || order.items?.length || 0} منتج</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-gray-200 font-semibold"><User className="w-5 h-5 text-purple-400" />{order.userName || 'غير متوفر'}</span>
          <span className="flex items-center gap-2 text-gray-200 font-semibold"><Mail className="w-5 h-5 text-blue-400" />{order.userEmail || 'غير متوفر'}</span>
          <span className="flex items-center gap-2 text-gray-200 font-semibold"><Phone className="w-5 h-5 text-green-400" />{order.userPhone || order.shippingAddress?.phone || 'غير متوفر'}</span>
        </div>
        <button onClick={onViewDetails}
          className="flex items-center gap-3 px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50">
          <Eye className="w-6 h-6" /> عرض التفاصيل
        </button>
      </div>
    </div>
  </div>
);

export default OrderCard;