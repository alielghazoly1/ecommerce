import { useState } from 'react';
import { Calendar, MapPin, Phone, Banknote, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate, formatEGP } from "../../lib/utils"
import { STATUS_CONFIG } from "./Orderconstants"
import OrderProgress from './Orderprogress';
import OrderLocation from './Orderlocation';
import TrackingBadge from './Trackingbadge';

const OrderCard = ({ order, onLocationUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const visibleItems = expanded ? order.items : order.items?.slice(0, 2);


  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />{formatDate(order.createdAt)}
          </p>
          <p className="text-xs font-mono text-gray-500 truncate">#{order._id?.slice(-8).toUpperCase()}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />{statusCfg.label}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <OrderProgress status={order.status} />

        {/* Items List */}
        <div className="space-y-2">
          {visibleItems?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name || `منتج #${i + 1}`}</p>
                <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-gray-700 shrink-0">{formatEGP(item.price * item.quantity)}</p>
            </div>
          ))}

          {!expanded && order.items?.length > 2 && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full text-xs text-cyan-600 hover:text-cyan-700 font-semibold py-1.5 flex items-center justify-center gap-1 hover:bg-cyan-50 rounded-lg transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />عرض {order.items.length - 2} منتجات أخرى
            </button>
          )}
          {expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="w-full text-xs text-gray-500 hover:text-gray-700 font-semibold py-1.5 flex items-center justify-center gap-1 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />إخفاء
            </button>
          )}
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{order.shippingAddress.street}</p>
              <p className="text-xs text-gray-500">
                {order.shippingAddress.city}{order.shippingAddress.state && `, ${order.shippingAddress.state}`}
              </p>
              {order.shippingAddress.phone && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" />{order.shippingAddress.phone}
                </p>
              )}
            </div>
          </div>
        )}

        <OrderLocation order={order} onLocationUpdate={onLocationUpdate} />
        {order.trackingNumber && <TrackingBadge trackingNumber={order.trackingNumber} />}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            {order.paymentMethod === 'cash'
              ? <><Banknote className="w-3.5 h-3.5" /> دفع عند الاستلام</>
              : <><CreditCard className="w-3.5 h-3.5" /> دفع إلكتروني</>}
          </div>
          <p className="text-xl font-black text-gray-900">{formatEGP(order.totalAmount)}</p>
          {console.log(order)}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;