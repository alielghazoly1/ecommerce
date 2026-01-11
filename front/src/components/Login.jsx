import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { url, setToken } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/api/user/login`, formData);
      if (res.data.success) {
        console.log(res.data);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        navigate('/');
      } else {
        alert(res.data.message || 'خطأ في تسجيل الدخول');
      }
    } catch (err) {
      alert('حدث خطأ، حاول مرة أخرى');
      console.log(err);
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
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
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500
              text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform"
          >
            تسجيل الدخول
          </button>
        </form>

        {/* Redirect to signup */}
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
