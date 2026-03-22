import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone } from 'lucide-react';
import CenterAlert from '../components/ui/CenterAlert';
import { useAuth } from '../store/selectors';

const fields = [
  { name: 'name', placeholder: 'الاسم', type: 'text', Icon: User },
  {
    name: 'email',
    placeholder: 'البريد الإلكتروني',
    type: 'email',
    Icon: Mail,
  },
  { name: 'phone', placeholder: 'رقم الهاتف', type: 'tel', Icon: Phone },
  {
    name: 'password',
    placeholder: 'كلمة المرور',
    type: 'password',
    Icon: Lock,
    minLength: 8,
  },
  {
    name: 'confirmPassword',
    placeholder: 'تأكيد كلمة المرور',
    type: 'password',
    Icon: Lock,
  },
];

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
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

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('كلمة المرور غير متطابقة');
      setShowErrorAlert(true);
      return;
    }
    if (formData.password.length < 8) {
      setErrorMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      setShowErrorAlert(true);
      return;
    }
    setIsLoading(true);
    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
      );
      if (result.success) {
        setShowSuccessAlert(true);
        setTimeout(() => {
          setIsLoading(false);
          navigate('/');
        }, 1500);
      } else {
        setErrorMessage(result.message || 'فشل إنشاء الحساب');
        setShowErrorAlert(true);
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('حدث خطأ ما');
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
        link="/categories"
        linkText="الذهاب الي المتجر"
        autoNavigate
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
          {fields.map(({ name, placeholder, type, Icon, minLength }) => (
            <div key={name} className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
                required
                minLength={minLength}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-cyan-400 outline-none"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-2xl font-bold text-lg shadow-lg transition-all ${isLoading ? 'bg-gray-300 text-gray-700 cursor-wait' : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white hover:scale-105'}`}
          >
            {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-700">
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
