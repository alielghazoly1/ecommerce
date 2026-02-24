import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { useAuth } from '../store/selectors';

/**
 * Hook مشترك لجلب وإدارة الطلبات
 * يُستخدم في MyOrders وأي مكان تاني محتاج الطلبات
 */
export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/api/order/userorders');
      if (res.data?.success) {
        const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        setOrders(data);
      } else {
        setError('فشل تحميل الطلبات');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('حدث خطأ في تحميل الطلبات');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const updateOrderLocation = useCallback(async (orderId, location) => {
    try {
      await api.post('/api/order/update-location', { orderId, location });
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  }, [fetchOrders]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchOrders();
  }, [isAuthenticated, authLoading, navigate, fetchOrders]);

  return { orders, loading, error, fetchOrders, updateOrderLocation };
};
