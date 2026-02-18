// src/components/Users.jsx
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users as UsersIcon, Shield } from 'lucide-react';
import { fetchUsers, fetchUserOrders, deleteUser, promoteUser, demoteUser, setFilter, setSelectedUser } from '../store/slices/usersSlice';
import { useAuth } from '../context/AuthContext';
import PageHeader from './common/PageHeader';
import SearchBar from './common/SearchBar';
import FilterBar from './common/FilterBar';
import EmptyState from './common/EmptyState';
import LoadingSpinner from './common/LoadingSpinner';
import UserCard from './users/UserCard';
import UserDetailsModal from './users/UserDetailsModal';

const ROLE_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'admin', label: 'أدمن' },
  { value: 'user', label: 'مستخدمين' },
];

const Users = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { items: users, selectedUser, userOrders, loading, actionLoading, loadingOrders, filters } = useSelector((s) => s.users);

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    users: users.filter((u) => u.role === 'user').length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = !filters.search ||
        u.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.phone?.includes(filters.search);
      const matchRole = filters.role === 'all' || u.role === filters.role;
      return matchSearch && matchRole;
    });
  }, [users, filters]);

  const getRoleCount = (val) => {
    if (val === 'all') return stats.total;
    if (val === 'admin') return stats.admins;
    return stats.users;
  };

  const handleDelete = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    dispatch(deleteUser(id));
  };

  const handleViewDetails = async (user) => {
    dispatch(setSelectedUser(user));
    dispatch(fetchUserOrders(user._id));
  };

  if (loading) return <LoadingSpinner text="جاري تحميل المستخدمين..." />;

  return (
    <div className="min-h-screen">
      <PageHeader
        icon={UsersIcon}
        title="إدارة المستخدمين"
        subtitle={`إجمالي: ${stats.total} • أدمن: ${stats.admins} • مستخدمين: ${stats.users}`}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {users.length > 0 && (
          <SearchBar
            value={filters.search}
            onChange={(v) => dispatch(setFilter({ search: v }))}
            onClear={() => dispatch(setFilter({ search: '' }))}
            placeholder="ابحث باسم المستخدم، البريد الإلكتروني، أو رقم الهاتف..."
          />
        )}

        {users.length > 0 && (
          <FilterBar
            title="تصفية حسب الدور"
            icon={Shield}
            options={ROLE_OPTIONS}
            activeValue={filters.role}
            onSelect={(v) => dispatch(setFilter({ role: v }))}
            getCount={getRoleCount}
          />
        )}

        {filteredUsers.length === 0 ? (
          <EmptyState icon={UsersIcon} title="لا توجد نتائج" subtitle="جرب تغيير معايير البحث" />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                currentUser={currentUser}
                actionLoading={actionLoading}
                onDelete={handleDelete}
                onPromote={(id) => dispatch(promoteUser(id))}
                onDemote={(id) => dispatch(demoteUser(id))}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          orders={userOrders}
          loadingOrders={loadingOrders}
          onClose={() => dispatch(setSelectedUser(null))}
        />
      )}
    </div>
  );
};

export default Users;