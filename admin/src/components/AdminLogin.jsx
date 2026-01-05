import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/list');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${url}/api/admin/login`, {
        email,
        password,
      });
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/list');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* خلفيات متحركة */}
      <div className="absolute w-72 h-72 bg-pink-500 rounded-full blur-3xl opacity-20 top-20 left-20 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-indigo-500 rounded-full blur-3xl opacity-20 bottom-20 right-20 animate-pulse"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8 rounded-2xl text-white w-96 flex flex-col items-center transition-all duration-300 hover:scale-[1.02]"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-white/20 border border-white/20 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-white"
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-white/20 border border-white/20 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-white"
          required
          autoComplete="current-password"
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:scale-[1.03]
            ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-pink-500/30'
            }`}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
