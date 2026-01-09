import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Shield, User } from 'lucide-react';

const Users = () => {
  const url = import.meta.env.VITE_API_URL;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({}); // لتتبع كل زرار

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  // =====================
  // Fetch Users
  // =====================
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${url}/api/users/list`, { headers });
      if (res.data && res.data.success) {
        setUsers(res.data.data || []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // Delete User
  // =====================
  const deleteUser = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      const res = await axios.delete(`${url}/api/users/delete/${id}`, {
        headers,
      });
      if (res.data?.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        alert('✅ تم حذف المستخدم بنجاح');
      } else {
        alert(res.data?.message || '❌ لم يتم الحذف');
      }
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      alert(err.response?.data?.message || 'فشل في الحذف');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // =====================
  // Promote to Admin
  // =====================
  const promoteToAdmin = async (id) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      const res = await axios.put(
        `${url}/api/users/make-admin/${id}`,
        {},
        { headers }
      );
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, role: 'admin' } : u))
        );
        alert('✅ تم ترقية المستخدم إلى أدمن بنجاح');
      } else {
        alert(res.data?.message || '❌ فشل الترقية');
      }
    } catch (err) {
      console.error('❌ Error promoting user:', err);
      alert(err.response?.data?.message || 'فشل الترقية');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // =====================
  // Demote to User
  // =====================
  const demoteToUser = async (id) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      const res = await axios.put(
        `${url}/api/users/demote/${id}`,
        {},
        { headers }
      );
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, role: 'user' } : u))
        );
        alert('✅ تم إعادة المستخدم إلى مستخدم عادي بنجاح');
      } else {
        alert(res.data?.message || '❌ فشل إعادة الدور');
      }
    } catch (err) {
      console.error('❌ Error demoting user:', err);
      alert(err.response?.data?.message || 'فشل إعادة الدور');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <section className="md:ml-64 min-h-screen bg-linear-to-r from-indigo-900 via-purple-900 to-pink-900 text-white py-24 sm:px-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-center">
          إدارة المستخدمين
        </h2>

        {loading ? (
          <div className="text-center text-gray-300 text-lg">
            جاري التحميل...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-300 text-lg">
            لا يوجد مستخدمين
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white/10 border border-white/20 backdrop:blur-md p-6 rounded-3xl shadow-lg flex flex-col items-center text-center hover:scale-[1.03] hover:shadow-indigo-500/40 transition-all"
              >
                <div className="w-20 h-20 rounded-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mb-4 overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  {user.name || 'مستخدم بدون اسم'}
                </h3>
                <p className="text-gray-300 text-sm mb-3">{user.email}</p>

                <div
                  className={`px-3 py-1 rounded-full mb-4 text-sm font-semibold ${
                    user.role === 'admin'
                      ? 'bg-yellow-400/80 text-black flex items-center gap-1'
                      : 'bg-cyan-500/30 text-white'
                  }`}
                >
                  {user.role === 'admin' && <Shield className="w-4 h-4" />}
                  {user.role === 'admin' ? 'أدمن' : 'مستخدم عادي'}
                </div>

                <div className="flex flex-col gap-2 w-44">
                  {/* Delete User */}
                  <button
                    onClick={() => deleteUser(user._id)}
                    disabled={user.role !== 'user' || actionLoading[user._id]}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      user.role !== 'user'
                        ? 'bg-gray-700/40 text-gray-400 cursor-not-allowed'
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {actionLoading[user._id] ? 'جارٍ...' : 'حذف المستخدم'}
                  </button>

                  {/* Promote */}
                  <button
                    onClick={() => promoteToAdmin(user._id)}
                    disabled={user.role !== 'user' || actionLoading[user._id]}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      user.role !== 'user'
                        ? 'bg-gray-700/40 text-gray-400 cursor-not-allowed'
                        : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    {actionLoading[user._id] ? 'جارٍ...' : 'ترقية إلى أدمن'}
                  </button>

                  {/* Demote */}
                  <button
                    onClick={() => demoteToUser(user._id)}
                    disabled={user.role !== 'admin' || actionLoading[user._id]}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      user.role !== 'admin'
                        ? 'bg-gray-700/40 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    {actionLoading[user._id] ? 'جارٍ...' : 'إعادة إلى مستخدم'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Users;
