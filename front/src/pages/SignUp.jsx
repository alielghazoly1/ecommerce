import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { User, Mail, Lock } from 'lucide-react';
import CenterAlert from '../components/ui/CenterAlert';

const SignUp = () => {
  const navigate = useNavigate();
  const { url, setToken } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // حالة التحميل

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isLoading) return; // تجنب الإرسال المتكرر

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('كلمة المرور غير متطابقة');
      setShowErrorAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${url}/api/user/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        // تعيين التوكن وحفظه
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);

        setShowSuccessAlert(true);

        // إبقاء الزر في حالة تحميل قليلاً ثم التنقّل
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
      } else {
        setErrorMessage('حدث خطأ ما');
      }
      setShowErrorAlert(true);
      setIsLoading(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
      {/* ✅ Success Alert */}
      <CenterAlert
        open={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        type="success"
        message={'تم إنشاء الحساب بنجاح\nاهلا بك في عالم توتا 🎉'}
        duration={6000}
        link={'/shop'}
        linkText="الذهاب الي المتجر"
        autoNavigate={true}
      />

      {/* ❌ Error Alert */}
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
          إنشاء حساب جديد
        </h2>

        <form className="flex flex-col gap-5" onSubmit={handleSignUp}>
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="الاسم"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 placeholder-gray-500 text-gray-800
                focus:ring-2 focus:ring-cyan-400 outline-none transition-all shadow-inner"
            />
          </div>

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

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="تأكيد كلمة المرور"
              value={formData.confirmPassword}
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
                : 'bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white hover:scale-105'
            } font-bold text-lg shadow-lg transition-transform flex items-center justify-center gap-3`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 24v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  ></path>
                </svg>
                جاري إنشاء الحساب...
              </>
            ) : (
              'إنشاء حساب'
            )}
          </button>
        </form>

        {/* Redirect */}
        <p className="mt-6 text-gray-700 text-center">
          لديك حساب بالفعل؟{' '}
          <span
            className="text-cyan-500 font-semibold cursor-pointer hover:underline"
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
