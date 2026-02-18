// src/components/Orders.jsx
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Filter } from 'lucide-react';
import { fetchOrders, updateOrderStatus, setFilter, setSelectedOrder } from '../store/slices/ordersSlice';
import PageHeader from './common/PageHeader';
import SearchBar from './common/SearchBar';
import FilterBar from './common/FilterBar';
import EmptyState from './common/EmptyState';
import LoadingSpinner from './common/LoadingSpinner';
import OrderCard from './orders/OrderCard';
import OrderDetailsModal from './orders/OrderDetailsModal';
import { ORDER_STATUSES } from '../constants';

const Orders = () => {
  const dispatch = useDispatch();
  const { items: orders, selectedOrder, loading, updating, filters } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filters.status !== 'all') result = result.filter((o) => o.status === filters.status);
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter((o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.userName?.toLowerCase().includes(q) ||
        o.userEmail?.toLowerCase().includes(q) ||
        o.userPhone?.includes(q) ||
        o._id?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, filters]);

  const getStatusCount = (val) => val === 'all' ? orders.length : orders.filter((o) => o.status === val).length;

  if (loading) return <LoadingSpinner text="جاري تحميل الطلبات..." />;

  return (
    <div className="min-h-screen">
      <PageHeader icon={ShoppingCart} title="إدارة الطلبات" subtitle={`إجمالي الطلبات: ${orders.length}`} />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {orders.length > 0 && (
          <SearchBar
            value={filters.search}
            onChange={(v) => dispatch(setFilter({ search: v }))}
            onClear={() => dispatch(setFilter({ search: '' }))}
            placeholder="ابحث برقم الطلب، اسم العميل، البريد الإلكتروني..."
          />
        )}

        {orders.length > 0 && (
          <FilterBar
            title="تصفية حسب الحالة"
            icon={Filter}
            options={ORDER_STATUSES}
            activeValue={filters.status}
            onSelect={(v) => dispatch(setFilter({ status: v }))}
            getCount={getStatusCount}
          />
        )}

        {orders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="لا توجد طلبات" subtitle="لم يتم تقديم أي طلبات حتى الآن" />
        ) : filteredOrders.length === 0 ? (
          <EmptyState icon={Filter} title="لا توجد نتائج" subtitle="جرب تغيير معايير البحث أو التصفية" />
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onViewDetails={() => dispatch(setSelectedOrder(order))}
              />
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => dispatch(setSelectedOrder(null))}
          onUpdateStatus={(orderId, status, trackingNumber) =>
            dispatch(updateOrderStatus({ orderId, status, trackingNumber }))
          }
          updating={updating}
        />
      )}
    </div>
  );
};

export default Orders;