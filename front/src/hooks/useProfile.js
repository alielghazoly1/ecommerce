import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { useAuth } from '../store/selectors';

/**
 * Hook خاص بصفحة البروفايل
 */
export const useProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });

  const { isAuthenticated, authLoading } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'info') => setToast({ message, type });
  const closeToast = () => setToast({ message: '', type: 'info' });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users/profile');
      if (res.data.success) {
        setUser(res.data.user);
        setEditData({ name: res.data.user.name, phone: res.data.user.phone || '' });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        showToast('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', 'error');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      } else {
        showToast('فشل تحميل بيانات البروفايل', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const updateProfile = useCallback(async () => {
    try {
      const res = await api.put('/api/users/profile', editData);
      if (res.data.success) {
        setUser((prev) => ({ ...prev, ...editData }));
        setIsEditing(false);
        showToast('تم تحديث البروفايل بنجاح ✓', 'success');
      }
    } catch {
      showToast('فشل التحديث', 'error');
    }
  }, [editData]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login', { replace: true }); return; }
    fetchProfile();
  }, [isAuthenticated, authLoading, navigate, fetchProfile]);

  return {
    user,
    loading,
    toast,
    isEditing,
    editData,
    setEditData,
    setIsEditing,
    closeToast,
    updateProfile,
    fetchProfile,
    authLoading,
  };
};
