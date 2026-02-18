// src/components/users/UserDetailsModal.jsx
import { User, Mail, Phone, Shield, ShoppingCart, DollarSign, Package, Calendar, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { formatPrice, formatDate, formatDateShort, getStatusColor, getStatusLabel } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    blue: 'bg-blue-500/20 border-blue-500/50',
    green: 'bg-green-500/20 border-green-500/50',
    purple: 'bg-purple-500/20 border-purple-500/50',
    cyan: 'bg-cyan-500/20 border-cyan-500/50',
  };
  const iconColorMap = { blue: 'text-blue-400', green: 'text-green-400', purple: 'text-purple-400', cyan: 'text-cyan-400' };

  return (
    <div className={`${colorMap[color]} rounded-2xl border-2 p-5`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-6 h-6 ${iconColorMap[color]}`} />
        <p className="text-sm text-gray-400 font-semibold">{label}</p>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
};

const UserDetailsModal = ({ user, orders, loadingOrders, onClose }) => {
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const cartCount = user.cartData ? Object.values(user.cartData).reduce((s, q) => s + q, 0) : 0;

  return (
    <Modal
      title={user.name || 'مستخدم'}
      subtitle={user.email}
      onClose={onClose}
      headerExtra={
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            : <User className="w-8 h-8 text-white" />}
        </div>
      }
    >
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="إجمالي الطلبات" value={orders.length} color="blue" />
        <StatCard icon={DollarSign} label="إجمالي الإنفاق" value={`${formatPrice(totalRevenue)} ج.م`} color="green" />
        <StatCard icon={Package} label="في السلة" value={cartCount} color="purple" />
        <StatCard icon={Calendar} label="عضو منذ" value={formatDateShort(user.createdAt)} color="cyan" />
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl border-2 border-blue-500/30 p-6">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2"><User className="w-6 h-6 text-blue-400" />المعلومات الشخصية</h3>
          <div className="space-y-3">
            {[
              { label: 'الاسم', value: user.name || 'غير متوفر', icon: User },
              { label: 'البريد الإلكتروني', value: user.email, icon: Mail },
              { label: 'رقم الهاتف', value: user.phone || 'غير متوفر', icon: Phone },
              { label: 'الدور', value: user.role === 'admin' ? 'أدمن' : 'مستخدم', icon: Shield },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <p className="text-sm text-gray-400 font-semibold mb-1 flex items-center gap-2">
                  <Icon className="w-4 h-4" />{label}
                </p>
                <p className="text-white font-bold text-lg">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border-2 border-purple-500/30 p-6">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-purple-400" />السلة الحالية</h3>
          {cartCount > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-gray-300 font-semibold">عدد المنتجات:</p>
                <p className="text-2xl font-black text-purple-400">{cartCount}</p>
              </div>
              {Object.entries(user.cartData || {}).map(([id, qty]) => (
                <div key={id} className="flex justify-between text-gray-300 text-sm">
                  <span>Product: {id.slice(-8)}</span><span className="font-black">×{qty}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-lg font-semibold">السلة فارغة</p>
            </div>
          )}
        </div>
      </div>

      {/* Orders */}
      <div className="bg-slate-800 rounded-2xl border-2 border-green-500/30 p-6">
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2"><Package className="w-6 h-6 text-green-400" />سجل الطلبات ({orders.length})</h3>
        {loadingOrders ? (
          <div className="text-center py-8"><Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-3" /><p className="text-gray-400">جاري التحميل...</p></div>
        ) : orders.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {orders.map((order) => (
              <div key={order._id} className="bg-slate-700 rounded-xl p-4 border-2 border-slate-600 hover:border-purple-500/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-black">#{order.orderNumber || order._id?.slice(-8)}</p>
                      <p className="text-gray-400 text-sm">{formatDateShort(order.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-black border-2 ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-slate-600">
                  <p className="text-gray-400 font-semibold">المبلغ:</p>
                  <p className="text-green-400 font-black text-xl">{formatPrice(order.totalAmount)} ج.م</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8"><Package className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-400 text-lg font-semibold">لا توجد طلبات</p></div>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailsModal;