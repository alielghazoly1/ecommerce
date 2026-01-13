import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { url, token } = useContext(ShopContext);

  const fetchOrders = async () => {
    try {
      const res = await axios.post(
        `${url}/api/order/userorders`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data.data;
      const ordersData = Array.isArray(data) ? data : [data];
      setOrders(ordersData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setOrders([]);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  if (loading)
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
        <div className="flex flex-col items-center">
          <Loader2 className="w-20 h-20 animate-spin text-gray-400 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700">جاري تحميل الطلبات...</h2>
          <p className="text-gray-500 mt-2">انتظر قليلاً من فضلك</p>
        </div>
      </section>
    );

  return (
    <section className="bg-gray-100 min-h-screen px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-10 text-center">
        طلباتي
      </h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-xl mt-20">لا توجد طلبات بعد.</p>
      ) : (
        <div className=" grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => {
            const total =
              order.items?.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0) || 0;
            return (
              <div
                key={order._id}
                className="relative bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between
                  hover:shadow-lg transition-all duration-300"
              >
                {/* Decorative top bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 rounded-t-2xl"></div>

                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Order ID: {order._id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {order.items?.length || 0} منتج{order.items && order.items.length > 1 ? 's' : ''}
                  </p>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                    {order.items?.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center bg-gray-50 rounded-lg p-2"
                      >
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={`${url}/images/${item.image}`}
                              alt={item.name}
                              className="w-14 h-14 object-cover rounded-lg shadow-sm"
                            />
                          )}
                          <p className="text-gray-700 font-medium">{item.name} x {item.quantity || 1}</p>
                        </div>
                        <p className="text-gray-800 font-semibold">${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <span
                    className={`flex items-center gap-2 font-semibold text-sm
                      ${
                        order.status === 'delivered'
                          ? 'text-green-500'
                          : order.status === 'pending'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                  >
                    {order.status === 'delivered' && <CheckCircle className="w-5 h-5" />}
                    {order.status === 'pending' && <Loader2 className="w-5 h-5 animate-spin" />}
                    {order.status === 'canceled' && <XCircle className="w-5 h-5" />}
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </span>

                  <span className="font-bold text-gray-800 text-lg bg-gray-200 px-4 py-2 rounded-lg shadow-sm">
                    Total: ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MyOrders;
