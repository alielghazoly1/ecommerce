import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import CenterAlert from '../components/ui/CenterAlert';
import { useAuth } from '../store/selectors';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        setTimeout(() => { setIsLoading(false); navigate('/'); }, 1500);
      } else {
        setErrorMessage('كلمة المرور أو البريد الإلكتروني غير صحيحة');
        setShowErrorAlert(true);
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('حدث خطأ في الاتصال بالسيرفر');
      setShowErrorAlert(true);
      setIsLoading(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
      <CenterAlert open={showErrorAlert} onClose={() => setShowErrorAlert(false)} type="error" message={errorMessage} duration={2000} />
      <div className="relative z-10 w-full max-w-md bg-white/30 backdrop-blur-xl p-10 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">تسجيل الدخول</h2>
        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" name="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-cyan-400 outline-none transition-all shadow-inner" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" name="password" placeholder="كلمة المرور" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-cyan-400 outline-none transition-all shadow-inner" />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-2xl ${isLoading ? 'bg-gray-300 text-gray-700 cursor-wait' : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white hover:scale-105'} font-bold text-lg shadow-lg transition-transform flex items-center justify-center gap-3`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 24v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
                جاري تسجيل الدخول...
              </>
            ) : 'تسجيل الدخول'}
          </button>
        </form>
        <p className="mt-6 text-gray-700 text-center">
          ليس لديك حساب؟{' '}
          <span className="text-cyan-500 font-semibold cursor-pointer hover:underline" onClick={() => navigate('/signup')}>
            إنشاء حساب جديد
          </span>
        </p>
      </div>
    </section>
  );
};

export default Login;
