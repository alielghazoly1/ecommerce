import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { User, Mail, Lock, Phone } from 'lucide-react';
import CenterAlert from '../components/ui/CenterAlert';

const SignUp = () => {
  const navigate = useNavigate();
  const { url, setToken } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('كلمة المرور غير متطابقة');
      setShowErrorAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${url}/api/users/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      if (res.data.token) {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);

        setShowSuccessAlert(true);

        setTimeout(() => {
          setIsLoading(false);
          navigate('/');
        }, 1500);
      } else {
        setErrorMessage(res.data.message || 'فشل إنشاء الحساب');
        setShowErrorAlert(true);
        setIsLoading(false);
      }
    } catch (err) {
      const status = err.response?.status;

      if (status === 409) {
        setErrorMessage('البريد الإلكتروني مستخدم بالفعل');
      } else if (status === 400) {
        setErrorMessage('بيانات غير صالحة');
      } else {
        setErrorMessage('حدث خطأ ما');
      }

      setShowErrorAlert(true);
      setIsLoading(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
      <CenterAlert
        open={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        type="success"
        message={'تم إنشاء الحساب بنجاح\nاهلا بك في عالم توتا 🎉'}
        duration={6000}
        link={'/categories'}
        linkText="الذهاب الي المتجر"
        autoNavigate={true}
      />

      <CenterAlert
        open={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        type="error"
        message={errorMessage}
        duration={2000}
      />

      <div className="relative z-10 w-full max-w-md bg-white/30 backdrop-blur-xl p-10 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
          إنشاء حساب جديد
        </h2>

        <form className="flex flex-col gap-5" onSubmit={handleSignUp}>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="الاسم"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="phone"
              placeholder="رقم الهاتف"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="تأكيد كلمة المرور"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-2xl ${
              isLoading
                ? 'bg-gray-300 cursor-wait'
                : 'bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white'
            }`}
          >
            {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <p className="mt-6 text-center">
          لديك حساب بالفعل؟{' '}
          <span
            className="text-cyan-500 cursor-pointer"
            onClick={() => navigate('/login')}
          >
            تسجيل دخول
          </span>
        </p>
      </div>
    </section>
  );
};

export default SignUp;
