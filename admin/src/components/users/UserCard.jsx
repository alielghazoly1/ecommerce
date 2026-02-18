// src/components/users/UserCard.jsx
import { Eye, Trash2, Shield, User, Loader2, ShoppingCart, DollarSign } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';
import { ROLE_CONFIG } from '../../constants';

const UserCard = ({ user, currentUser, actionLoading, onDelete, onPromote, onDemote, onViewDetails }) => {
  const isCurrentUser = currentUser?.email === user.email;
  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
  const RoleIcon = user.role === 'admin' ? Shield : User;
  const isLoading = actionLoading[user._id];

  return (
    <div className={`group bg-slate-800 rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-2xl ${
      isCurrentUser ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-purple-500/20 hover:border-purple-500/50'
    }`}>
      {/* Avatar & Info */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b-2 border-slate-700">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-black text-white truncate flex items-center gap-2">
            {user.name || 'مستخدم'}
            {isCurrentUser && <span className="text-xs bg-purple-600 px-2 py-1 rounded-lg font-bold">أنت</span>}
          </h3>
          <p className="text-base text-gray-300 truncate font-semibold">{user.email}</p>
          {user.phone && <p className="text-sm text-gray-400">{user.phone}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">الطلبات</p>
          </div>
          <p className="text-xl font-black text-white">{user.metadata?.totalOrders || 0}</p>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">الإنفاق</p>
          </div>
          <p className="text-xl font-black text-green-400">{formatPrice(user.metadata?.totalSpent || 0)}</p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-black border-2 ${roleConfig.color}`}>
          <RoleIcon className="w-5 h-5" />{roleConfig.label}
        </span>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button onClick={() => onViewDetails(user)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all">
          <Eye className="w-5 h-5" /> عرض التفاصيل
        </button>

        <button onClick={() => onDelete(user._id)}
          disabled={user.role !== 'user' || isLoading || isCurrentUser}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
            user.role !== 'user' || isCurrentUser
              ? 'bg-slate-700 text-gray-500 cursor-not-allowed border-2 border-slate-600'
              : 'bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white border-2 border-red-500/50'
          }`}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          {isCurrentUser ? 'لا يمكن حذف نفسك' : 'حذف'}
        </button>

        {user.role === 'user' ? (
          <button onClick={() => onPromote(user._id)} disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500 hover:text-black border-2 border-yellow-500/50 transition-all">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
            ترقية لأدمن
          </button>
        ) : (
          <button onClick={() => onDemote(user._id)}
            disabled={isLoading || isCurrentUser}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
              isCurrentUser ? 'bg-slate-700 text-gray-500 cursor-not-allowed border-2 border-slate-600'
                : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500 hover:text-white border-2 border-blue-500/50'
            }`}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />}
            {isCurrentUser ? 'لا يمكن تغيير دورك' : 'إعادة لمستخدم'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;