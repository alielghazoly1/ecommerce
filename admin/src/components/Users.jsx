// src/components/Users.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { Trash2, Shield, User, Users as UsersIcon, Loader2, Search } from 'lucide-react';

const Users = () => {
  const { token, isAuthenticated, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/users/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  const deleteUser = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setActionLoading(prev => ({ ...prev, [id]: true }));

    try {
      const res = await axios.delete(`/users/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.data?.success) {
        setUsers(prev => prev.filter(u => u._id !== id));
        toast.success('تم حذف المستخدم بنجاح');
      } else {
        toast.error(res.data?.message || 'فشل الحذف');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'فشل الحذف');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const promoteToAdmin = async (id) => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setActionLoading(prev => ({ ...prev, [id]: true }));

    try {
      const res = await axios.put(`/users/make-admin/${id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.data?.success) {
        setUsers(prev =>
          prev.map(u => (u._id === id ? { ...u, role: 'admin' } : u))
        );
        toast.success('تم الترقية بنجاح');
      } else {
        toast.error(res.data?.message || 'فشل الترقية');
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error(error.response?.data?.message || 'فشل الترقية');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const demoteToUser = async (id) => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setActionLoading(prev => ({ ...prev, [id]: true }));

    try {
      const res = await axios.put(`/users/demote/${id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.data?.success) {
        setUsers(prev =>
          prev.map(u => (u._id === id ? { ...u, role: 'user' } : u))
        );
        toast.success('تم إعادة الدور بنجاح');
      } else {
        toast.error(res.data?.message || 'فشل إعادة الدور');
      }
    } catch (error) {
      console.error('Error demoting user:', error);
      toast.error(error.response?.data?.message || 'فشل إعادة الدور');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUsers();
    }
  }, [token, isAuthenticated]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل المستخدمين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-purple-400" />
            إدارة المستخدمين
          </h1>
          <p className="text-gray-400">
            إجمالي المستخدمين: <span className="text-white font-semibold">{users.length}</span>
            {' '}•{' '}
            أدمن: <span className="text-yellow-400 font-semibold">{users.filter(u => u.role === 'admin').length}</span>
            {' '}•{' '}
            مستخدمين: <span className="text-blue-400 font-semibold">{users.filter(u => u.role === 'user').length}</span>
          </p>
        </div>

        {/* Search & Filter */}
        {users.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="بحث عن مستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            {/* Role Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  roleFilter === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  roleFilter === 'admin'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                أدمن
              </button>
              <button
                onClick={() => setRoleFilter('user')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  roleFilter === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                مستخدمين
              </button>
            </div>
          </div>
        )}

        {/* Users Grid */}
        {users.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا يوجد مستخدمين</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد نتائج للبحث</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const isCurrentUser = currentUser?.email === user.email;
              
              return (
                <div
                  key={user._id}
                  className={`bg-white/5 backdrop-blur-xl rounded-2xl border p-6 transition-all ${
                    isCurrentUser 
                      ? 'border-purple-500/50 ring-2 ring-purple-500/20' 
                      : 'border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-white" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-white truncate flex items-center gap-2">
                        {user.name || 'مستخدم'}
                        {isCurrentUser && (
                          <span className="text-xs bg-purple-500 px-2 py-0.5 rounded">أنت</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        user.role === 'admin'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {user.role === 'admin' && <Shield className="w-4 h-4" />}
                      {user.role === 'admin' ? 'أدمن' : 'مستخدم عادي'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {/* Delete */}
                    <button
                      onClick={() => deleteUser(user._id)}
                      disabled={user.role !== 'user' || actionLoading[user._id] || isCurrentUser}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        user.role !== 'user' || isCurrentUser
                          ? 'bg-gray-700/20 text-gray-500 cursor-not-allowed'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20'
                      }`}
                    >
                      {actionLoading[user._id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>{isCurrentUser ? 'لا يمكن حذف نفسك' : 'حذف المستخدم'}</span>
                    </button>

                    {/* Promote */}
                    <button
                      onClick={() => promoteToAdmin(user._id)}
                      disabled={user.role !== 'user' || actionLoading[user._id]}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        user.role !== 'user'
                          ? 'bg-gray-700/20 text-gray-500 cursor-not-allowed'
                          : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black border border-yellow-500/20'
                      }`}
                    >
                      {actionLoading[user._id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      <span>ترقية لأدمن</span>
                    </button>

                    {/* Demote */}
                    <button
                      onClick={() => demoteToUser(user._id)}
                      disabled={user.role !== 'admin' || actionLoading[user._id] || isCurrentUser}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        user.role !== 'admin' || isCurrentUser
                          ? 'bg-gray-700/20 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20'
                      }`}
                    >
                      {actionLoading[user._id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span>{isCurrentUser ? 'لا يمكن تغيير دورك' : 'إعادة لمستخدم'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;