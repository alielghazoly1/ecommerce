import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { Mail, Lock } from 'lucide-react';
import CenterAlert from '../components/ui/CenterAlert';

const Login = () => {
  const navigate = useNavigate();
  const { url, setToken } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // حالة التحميل

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return; // تجنب إرسال متكرر
    setIsLoading(true);

    try {
      const res = await axios.post(`${url}/api/users/login`, formData);

      if (res.data.success) {
        console.log('Login successful:', res.data);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);

        // إبقاء الزر في حالة "جاري تسجيل الدخول" قليلاً ثم التنقّل
        setTimeout(() => {
          setIsLoading(false);
          navigate('/');
        }, 1500);
      } else {
        // حالة فشل غير متوقعة من السيرفر
        setErrorMessage(res.data.message || 'فشل تسجيل الدخول');
        setShowErrorAlert(true);
        setIsLoading(false);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 400) {
        setErrorMessage('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        setErrorMessage('حدث خطأ في الاتصال بالسيرفر');
      }
      setShowErrorAlert(true);
      setIsLoading(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
      {/* Error Alert */}
      <CenterAlert
        open={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        type="error"
        message={errorMessage}
        duration={2000}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/30 backdrop-blur-xl p-10 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
          تسجيل الدخول
        </h2>

        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 placeholder-gray-500 text-gray-800
                focus:ring-2 focus:ring-cyan-400 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 placeholder-gray-500 text-gray-800
                focus:ring-2 focus:ring-cyan-400 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-2xl ${
              isLoading
                ? 'bg-gray-300 text-gray-700 cursor-wait'
                : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white hover:scale-105'
            } font-bold text-lg shadow-lg transition-transform flex items-center justify-center gap-3`}
          >
            {isLoading ? (
              <>
                {/* سبينر صغير */}
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 24v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                </svg>
                جاري تسجيل الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        {/* Redirect */}
        <p className="mt-6 text-gray-700 text-center">
          ليس لديك حساب؟{' '}
          <span
            className="text-cyan-500 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate('/signup')}
          >
            إنشاء حساب جديد
          </span>
        </p>
      </div>
    </section>
  );
};

export default Login;