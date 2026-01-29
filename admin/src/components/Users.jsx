import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Trash2,
  Shield,
  User,
  Users as UsersIcon,
  Loader2,
  Search,
  XCircle,
  Eye,
  X,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  Package,
  DollarSign,
  MapPin,
  TrendingUp,
} from 'lucide-react';

// ============================================
// CONSTANTS
// ============================================
const ROLE_CONFIG = {
  admin: {
    label: 'أدمن',
    color: 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50',
    icon: Shield,
  },
  user: {
    label: 'مستخدم',
    color: 'bg-blue-500/30 text-blue-300 border-blue-400/50',
    icon: User,
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatPrice = (price) => {
  const num = Number(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const formatDate = (date) => {
  if (!date) return 'غير متوفر';
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ============================================
// MAIN COMPONENT
// ============================================
const Users = () => {
  const { token, isAuthenticated, user: currentUser } = useAuth();
  const url = 'https://low-hayley-totasheco-426426a6.koyeb.app/api';

  // State Management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // ============================================
  // API FUNCTIONS
  // ============================================
  const fetchUsers = async () => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${url}/api/users/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.success) {
        setUsers(res.data.data || []);
      } else {
        setUsers([]);
        toast.error(res.data?.message || 'فشل تحميل المستخدمين');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      toast.error(error.response?.data?.message || 'فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId) => {
    setLoadingOrders(true);
    try {
      const res = await axios.get(`${url}/api/order/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        // Filter orders for this user
        const orders = res.data.data.filter((order) => order.userId === userId);
        setUserOrders(orders);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast.error('فشل تحميل طلبات المستخدم');
    } finally {
      setLoadingOrders(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await axios.delete(`${url}/api/users/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        toast.success('تم حذف المستخدم بنجاح');
      } else {
        toast.error(res.data?.message || 'فشل الحذف');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'فشل الحذف');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const promoteToAdmin = async (id) => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await axios.put(
        `${url}/api/users/make-admin/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, role: 'admin' } : u)),
        );
        toast.success('تم الترقية بنجاح');
      } else {
        toast.error(res.data?.message || 'فشل الترقية');
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error(error.response?.data?.message || 'فشل الترقية');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const demoteToUser = async (id) => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await axios.put(
        `${url}/api/users/demote/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, role: 'user' } : u)),
        );
        toast.success('تم إعادة الدور بنجاح');
      } else {
        toast.error(res.data?.message || 'فشل إعادة الدور');
      }
    } catch (error) {
      console.error('Error demoting user:', error);
      toast.error(error.response?.data?.message || 'فشل إعادة الدور');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const openUserDetails = async (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    await fetchUserOrders(user._id);
  };

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUsers();
    }
  }, [token, isAuthenticated]);

  // ============================================
  // FILTERING
  // ============================================
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm);

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // ============================================
  // STATS
  // ============================================
  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      users: users.filter((u) => u.role === 'user').length,
    }),
    [users],
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white text-xl font-bold">
            جاري تحميل المستخدمين...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              <UsersIcon className="w-10 h-10 text-purple-400" />
              إدارة المستخدمين
            </h1>
            <p className="text-gray-300 text-lg font-semibold">
              إجمالي: <span className="text-purple-400">{stats.total}</span> •{' '}
              أدمن: <span className="text-yellow-400">{stats.admins}</span> •{' '}
              مستخدمين: <span className="text-blue-400">{stats.users}</span>
            </p>
          </div>

          {/* Search */}
          {users.length > 0 && (
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم المستخدم، البريد الإلكتروني، أو رقم الهاتف..."
                className="w-full pr-14 pl-14 py-4 bg-slate-800 border-2 border-purple-500/30 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition bg-slate-700 rounded-lg p-1.5"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto p-6">
        {/* ROLE FILTERS */}
        {users.length > 0 && (
          <div className="mb-8 bg-slate-800 rounded-2xl border-2 border-purple-500/20 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <Shield className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">تصفية حسب الدور</h3>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-6 py-3.5 rounded-xl font-bold text-base transition-all transform hover:scale-105 border-2 ${
                  roleFilter === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-2xl shadow-purple-500/50'
                    : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600 hover:border-purple-500/50'
                }`}
              >
                الكل{' '}
                <span className="ml-2 font-black text-lg">({stats.total})</span>
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-6 py-3.5 rounded-xl font-bold text-base transition-all transform hover:scale-105 border-2 ${
                  roleFilter === 'admin'
                    ? 'bg-yellow-500 text-black border-yellow-400 shadow-2xl shadow-yellow-500/50'
                    : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600 hover:border-yellow-500/50'
                }`}
              >
                أدمن{' '}
                <span className="ml-2 font-black text-lg">
                  ({stats.admins})
                </span>
              </button>
              <button
                onClick={() => setRoleFilter('user')}
                className={`px-6 py-3.5 rounded-xl font-bold text-base transition-all transform hover:scale-105 border-2 ${
                  roleFilter === 'user'
                    ? 'bg-blue-500 text-white border-blue-400 shadow-2xl shadow-blue-500/50'
                    : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600 hover:border-blue-500/50'
                }`}
              >
                مستخدمين{' '}
                <span className="ml-2 font-black text-lg">({stats.users})</span>
              </button>
            </div>
          </div>
        )}

        {/* USERS GRID */}
        <UsersGrid
          users={filteredUsers}
          currentUser={currentUser}
          actionLoading={actionLoading}
          onDelete={deleteUser}
          onPromote={promoteToAdmin}
          onDemote={demoteToUser}
          onViewDetails={openUserDetails}
        />
      </div>

      {/* USER DETAILS MODAL */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          orders={userOrders}
          loadingOrders={loadingOrders}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
            setUserOrders([]);
          }}
        />
      )}
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

// Users Grid Component
const UsersGrid = ({
  users,
  currentUser,
  actionLoading,
  onDelete,
  onPromote,
  onDemote,
  onViewDetails,
}) => {
  if (users.length === 0) {
    return (
      <div className="bg-slate-800 rounded-3xl border-2 border-purple-500/20 p-20 text-center shadow-2xl">
        <Search className="w-24 h-24 text-gray-500 mx-auto mb-6" />
        <h3 className="text-3xl font-bold text-white mb-3">لا توجد نتائج</h3>
        <p className="text-gray-300 text-xl">جرب تغيير معايير البحث</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => {
        const isCurrentUser = currentUser?.email === user.email;
        const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
        const Icon = roleConfig.icon;

        return (
          <div
            key={user._id}
            className={`group bg-slate-800 rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-2xl ${
              isCurrentUser
                ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-2xl shadow-purple-500/30'
                : 'border-purple-500/20 hover:border-purple-500/50'
            }`}
          >
            {/* Avatar & Info */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b-2 border-slate-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-black text-white truncate flex items-center gap-2">
                  {user.name || 'مستخدم'}
                  {isCurrentUser && (
                    <span className="text-xs bg-purple-600 px-2 py-1 rounded-lg font-bold">
                      أنت
                    </span>
                  )}
                </h3>
                <p className="text-base text-gray-300 truncate font-semibold">
                  {user.email}
                </p>
                {user.phone && (
                  <p className="text-sm text-gray-400 font-semibold">
                    {user.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4 text-blue-400" />
                  <p className="text-xs text-gray-400 font-semibold">الطلبات</p>
                </div>
                <p className="text-xl font-black text-white">
                  {user.metadata?.totalOrders || 0}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-gray-400 font-semibold">الإنفاق</p>
                </div>
                <p className="text-xl font-black text-green-400">
                  {formatPrice(user.metadata?.totalSpent || 0)}
                </p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="mb-4">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-black border-2 ${roleConfig.color} shadow-lg`}
              >
                <Icon className="w-5 h-5" />
                {roleConfig.label}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {/* View Details */}
              <button
                onClick={() => onViewDetails(user)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50"
              >
                <Eye className="w-5 h-5" />
                <span>عرض التفاصيل</span>
              </button>

              {/* Delete */}
              <button
                onClick={() => onDelete(user._id)}
                disabled={
                  user.role !== 'user' ||
                  actionLoading[user._id] ||
                  isCurrentUser
                }
                className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  user.role !== 'user' || isCurrentUser
                    ? 'bg-slate-700 text-gray-500 cursor-not-allowed border-2 border-slate-600'
                    : 'bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white border-2 border-red-500/50'
                }`}
              >
                {actionLoading[user._id] ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                <span>{isCurrentUser ? 'لا يمكن حذف نفسك' : 'حذف'}</span>
              </button>

              {/* Promote/Demote */}
              {user.role === 'user' ? (
                <button
                  onClick={() => onPromote(user._id)}
                  disabled={actionLoading[user._id]}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-base font-bold bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500 hover:text-black border-2 border-yellow-500/50 transition-all"
                >
                  {actionLoading[user._id] ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                  <span>ترقية لأدمن</span>
                </button>
              ) : (
                <button
                  onClick={() => onDemote(user._id)}
                  disabled={actionLoading[user._id] || isCurrentUser}
                  className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    isCurrentUser
                      ? 'bg-slate-700 text-gray-500 cursor-not-allowed border-2 border-slate-600'
                      : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500 hover:text-white border-2 border-blue-500/50'
                  }`}
                >
                  {actionLoading[user._id] ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span>
                    {isCurrentUser ? 'لا يمكن تغيير دورك' : 'إعادة لمستخدم'}
                  </span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, orders, loadingOrders, onClose }) => {
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0,
  );
  const cartItemsCount = user.cartData
    ? Array.from(Object.values(user.cartData)).reduce(
        (sum, qty) => sum + qty,
        0,
      )
    : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-6xl w-full border-2 border-purple-500/30 my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">
                {user.name || 'مستخدم'}
              </h2>
              <p className="text-white/80 text-lg font-bold">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-7 h-7 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard
              icon={ShoppingCart}
              label="إجمالي الطلبات"
              value={orders.length}
              color="blue"
            />
            <StatCard
              icon={DollarSign}
              label="إجمالي الإنفاق"
              value={`${formatPrice(totalRevenue)} ج.م`}
              color="green"
            />
            <StatCard
              icon={Package}
              label="في السلة"
              value={cartItemsCount}
              color="purple"
            />
            <StatCard
              icon={Calendar}
              label="عضو منذ"
              value={formatDate(user.createdAt)}
              color="cyan"
              isDate
            />
          </div>

          {/* User Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <InfoCard
              title="المعلومات الشخصية"
              icon={User}
              iconColor="blue"
              items={[
                { label: 'الاسم', value: user.name || 'غير متوفر', icon: User },
                { label: 'البريد الإلكتروني', value: user.email, icon: Mail },
                {
                  label: 'رقم الهاتف',
                  value: user.phone || 'غير متوفر',
                  icon: Phone,
                },
                {
                  label: 'الدور',
                  value: user.role === 'admin' ? 'أدمن' : 'مستخدم',
                  icon: Shield,
                },
              ]}
            />

            {/* Cart Info */}
            <div className="bg-slate-800 rounded-2xl border-2 border-purple-500/30 p-6">
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-purple-400" />
                السلة الحالية
              </h3>
              {cartItemsCount > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-base text-gray-300 font-semibold">
                      عدد المنتجات:
                    </p>
                    <p className="text-2xl font-black text-purple-400">
                      {cartItemsCount}
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-2 font-semibold">
                      المنتجات في السلة:
                    </p>
                    <div className="space-y-2">
                      {Object.entries(user.cartData || {}).map(
                        ([productId, quantity]) => (
                          <div
                            key={productId}
                            className="flex justify-between text-gray-300"
                          >
                            <span className="text-sm font-semibold">
                              Product ID: {productId.slice(-8)}
                            </span>
                            <span className="text-sm font-black">
                              ×{quantity}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-lg font-semibold">
                    السلة فارغة
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-slate-800 rounded-2xl border-2 border-green-500/30 p-6">
            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-green-400" />
              سجل الطلبات ({orders.length})
            </h3>
            {loadingOrders ? (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-3" />
                <p className="text-gray-400 text-lg">جاري تحميل الطلبات...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-lg font-semibold">
                  لا توجد طلبات
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, isDate }) => {
  const colors = {
    blue: 'bg-blue-500/20 border-blue-500/50',
    green: 'bg-green-500/20 border-green-500/50',
    purple: 'bg-purple-500/20 border-purple-500/50',
    cyan: 'bg-cyan-500/20 border-cyan-500/50',
  };

  const iconColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };

  return (
    <div className={`${colors[color]} rounded-2xl border-2 p-5`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-6 h-6 ${iconColors[color]}`} />
        <p className="text-sm text-gray-400 font-semibold">{label}</p>
      </div>
      <p
        className={`text-2xl font-black text-white ${isDate ? 'text-lg' : ''}`}
      >
        {value}
      </p>
    </div>
  );
};

// Info Card Component
const InfoCard = ({ title, icon: Icon, iconColor, items }) => (
  <div className="bg-slate-800 rounded-2xl border-2 border-blue-500/30 p-6">
    <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
      <Icon className={`w-6 h-6 text-${iconColor}-400`} />
      {title}
    </h3>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index}>
          <p className="text-sm text-gray-400 font-semibold mb-1 flex items-center gap-2">
            <item.icon className="w-4 h-4" />
            {item.label}
          </p>
          <p className="text-white font-bold text-lg">{item.value}</p>
        </div>
      ))}
    </div>
  </div>
);

// Order Card Component
const OrderCard = ({ order }) => {
  const STATUS_COLORS = {
    pending: 'bg-yellow-500/30 text-yellow-300',
    processing: 'bg-blue-500/30 text-blue-300',
    shipped: 'bg-purple-500/30 text-purple-300',
    delivered: 'bg-green-500/30 text-green-300',
    cancelled: 'bg-red-500/30 text-red-300',
  };

  const STATUS_LABELS = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };

  return (
    <div className="bg-slate-700 rounded-xl p-4 border-2 border-slate-600 hover:border-purple-500/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-lg">
              #{order.orderNumber || order._id?.slice(-8)}
            </p>
            <p className="text-gray-400 text-sm font-semibold">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`px-4 py-2 rounded-lg text-sm font-black border-2 ${STATUS_COLORS[order.status]}`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>
      <div className="flex justify-between items-center pt-3 border-t-2 border-slate-600">
        <p className="text-gray-400 font-semibold">المبلغ:</p>
        <p className="text-green-400 font-black text-xl">
          {formatPrice(order.totalAmount)} ج.م
        </p>
      </div>
    </div>
  );
};

export default Users;
