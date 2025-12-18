// import React, { useState } from 'react';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
const Login = () => {
  const navigate = useNavigate();
  const [state, useStatee] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  return (
    <section
      className="relative w-full min-h-screen bg-linear-to-r
    from-indigo-900 via-purple-900 to-pink-900 text-white py-24
    px-6 sm:px-10 flex items-center justify-center"
    >
      {/* Main form container */}
      <div
        className="relative z-10 w-full max-w-md bg-white/10
        backdrop-blur-md p-10 rounded-3xl shadow-2xl"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center">
          تسجيل الدخول
        </h2>
        <form className="flex flex-col gap-6">
          {/* Email input */}
          <input
            type="email"
            name="email"
            placeholder="البريد الإليكتروني"
            value={formData.email}
            required
            className="w-full bg-white/15 text-white placeholder-gray-300
              px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {/* Password input */}
          <input
            type="password"
            name="password"
            placeholder="كلمة المرور "
            value={formData.password}
            required
            className="w-full bg-white/15 text-white placeholder-gray-300
              px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {/* Submit button */}
          <button
            type="submit"
            className="bg-linear-to-r from-cyan-400
        to-blue-500 px-6 py-3 rounded-2xl font-semibold text-white hover:opacity-90
        transition-all shadow-lg"
          >
            تسجيل الدخول
          </button>
        </form>

        {/* Redirect to login */}
        <p className="mt-6 text-gray-300 text-center">
          ليس لديك حساب؟{' '}
          <span
            className=" text-cyan-400 cursor-pointer font-semibold hover:underline"
            onClick={() => navigate('/signup')}
          >
            انشاء حساب جديد
          </span>
        </p>
      </div>
    </section>
  );
};

export default Login;
