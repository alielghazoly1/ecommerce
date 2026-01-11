import { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();
  
  const { url, clearCart, token } = useContext(ShopContext);

  useEffect(() => {
    if (!token) return;
    const verifyPayment = async () => {
      try {
        const res = await axios.post(
          `${url}/api/order/verify`,
          { success, orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          await clearCart();
          setStatus('success');
          setTimeout(() => navigate('/myorders'), 2000);
        } else {
          setStatus('error');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (err) {
        console.log(err);
        setStatus('error');
        setTimeout(() => navigate('/'), 2000);
      }
    };
    verifyPayment();
  }, [success, orderId, url, navigate, token]);

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="w-16 h-16 text-gray-400 animate-spin" />,
          title: 'يرجى الانتظار',
          message: 'جاري التحقق من الدفع الخاص بك...',
          color: 'text-gray-700',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: 'تم الدفع بنجاح!',
          message: 'تم تأكيد طلبك وسيتم توجيهك قريباً.',
          color: 'text-green-600',
        };
      case 'error':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'فشلت العملية',
          message: 'حدث خطأ أثناء الدفع. حاول مرة أخرى.',
          color: 'text-red-600',
        };
      default:
        return {};
    }
  };

  const { icon, title, message, color } = getStatusContent();

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white shadow-2xl rounded-3xl p-10 flex flex-col items-center gap-6 w-full max-w-md">
        {icon}
        <h2 className={`text-2xl font-bold ${color}`}>{title}</h2>
        <p className="text-gray-600 text-center">{message}</p>

        {status === 'error' && (
          <button
            onClick={() => navigate('/cart')}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl shadow-lg transition-all"
          >
            العودة للسلة
          </button>
        )}
      </div>
    </section>
  );
};

export default Verify;
