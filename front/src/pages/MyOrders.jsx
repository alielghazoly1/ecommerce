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
        { headers: { token } }
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
  if (loading) {
    return (
      <section
        className="min-h-screen flex items-center justify-center justify-center
      bg-linear-to-r from-indigo-900 via-purple-900 to-pink-900 text-white px-6"
      >
        <div className="flex flex-col items-center">
          <Loader2 className="w-20 h-20 animate-spin text-cyan-400 mb-6" />
          <h2 className="text-2xl font-semibold">Loading your orders...</h2>
          <p className="text-gray-300 mt-2">Please wait a moment</p>
        </div>
      </section>
    );
  }
  return (
    <section
      className="bg-linear-to-r from-indigo-900 via-purple-900
    to-pink-900 min-h-screen px-6 py-10"
    >
      <h1 className="text-3xl font-bold text-white mt-10 mb-8 text-center">
        My Orders
      </h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-xl">No Orders yet..</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => {
            const total =
              order.items?.reduce(
                (sum, item) => sum + item.price * (item.quantity || 1),
                0
              ) || 0;
              return(
                <div key={order._id}>

                </div>
              )
          })}
        </div>
      )}
    </section>
  );
};

export default MyOrders;
