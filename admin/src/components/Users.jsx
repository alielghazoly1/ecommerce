import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Shield, User } from 'lucide-react';

const Users = () => {
  const url = import.meta.env.VITE_API_URL;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const demoteToUser = async (id) => {
    try {
      await axios.put(`${url}/api/users/demote/${id}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: 'user' } : u))
      );
      alert('✅ تم إعادة المستخدم إلى مستخدم عادي بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إعادة الدور', error);
      alert('حدث خطأ أثناء إعادة الدور');
    }
  };
  const promoteToAdmin = async (id) => {
    try {
      await axios.put(`${url}/api/user/make-admin/${id}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: 'amin' } : u))
      );
      alert('✅ تم ترقية المستخدم إلى أدمن بنجاح');
    } catch (error) {
      console.error('❌ خطأ في الترقية', error);
      alert('حدث خطأ أثناء الترقية');
    }
  };
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${url}/api/user/list`);
      if (res.data && res.data.success) {
        setUsers(res.data.data.data || []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  const deleteUser = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      const response = await axios.delete(`${url}/api/users/delete/${id}`);

      if (response.data && response.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        alert('✅ تم حذف المستخدم بنجاح');
      } else {
        alert('لم يتم الحذف، تحقق من السيرفر');
      }
    } catch (error) {
      console.error('❌ خطأ في حذف المستخدم', error);
      alert('فشل في الحذف');
    }
  };
  useEffect(()=>{
    fetchUsers();
  },[])
  return <div>Users</div>;
};

export default Users;
