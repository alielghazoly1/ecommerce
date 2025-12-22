import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');
  const storedToken = localStorage.getItem('token');

  const {
    url,
    clearCart,
    removeFromCart,
    setCartItems,
    token,
    getTotalCartAmount,
  } = useContext(ShopContext);

  const navigate = useNavigate();

  const [status, setStatus] = useState('loading');

  return (
    <section
      className="min-h-screen flex items-center
   justify-center bg-linear-to-r from-indigo-900 via-purple-900
   to-pink-900 text-white px-6"
    >
      <div className="text-center flex-col items-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-20 h-20 animate-spin text-cyan-400 mb-6" />
            <h2 className="text-2xl font-semibold">
              ..... يرجي الانتظار حتي يتم التاكيد علي الاوردر
            </h2>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-pulse">
            <CheckCircle className="w-20 h-20 animate-spin text-cyan-400 mb-6" />
            <h2 className="text-2xl font-semibold">تم الدفع</h2>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-pulse">
            <XCircle className="w-20 h-20 animate-spin text-cyan-400 mb-6" />
            <h2 className="text-2xl font-semibold">فشلت العملية</h2>
          </div>
        )}
      </div>
    </section>
  );
};

export default Verify;
