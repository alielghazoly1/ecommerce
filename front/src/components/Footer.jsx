import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
const Footer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    massage: '',
  });
  const handeleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`${formData.name} شكرا لتواصكم معنا`);
    setFormData({ name: '', email: '', massage: '' });
  };
  return (
    <section
      className="relative w-full min-h-screen bg-linear-to-r
    from-indigo-900 via-purple-900 to-pink-900 text-white py-24 px-6
    sm:px-10"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-none"></div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center">
          تواصل معنا
        </h2>
        <p className="text-gray-300 mb-12 text-center text-lg sm:text-xl">
          نحن هنا لمساعدتك فس اي وقت ارسل لنا رساله وسنعود اليك قريبا!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* left side */}
          <div className="space-y-8">
            {/* العنوان وتفاصيلو */}
            <div
              className="flex items-center gap-4 bg-white/10 backdrop-blur-md
                  p-6 rounded-3xl shadow-lg hover:shadow-cyan-400/30 transition-all"
            >
              <MapPin className="w-8 h-8 text-cyan-400" />
              <div>
                <div>
                  <h4 className="font-semibold text-lg">العنوان</h4>
                  <p className="text-gray-300">القاهرة, رمسيس</p>
                </div>
              </div>
            </div>
            {/* الهاتف وتفاصيلو  */}
            <div
              className="flex items-center gap-4 bg-white/10 backdrop-blur-md
              p-6 rounded-3xl shadow-lg hover:shadow-cyan-400/30 transition-all"
            >
              <Phone className="w-8 h-8 text-cyan-400" />
              <div>
                <h4 className="font-semibold text-lg">الهاتف</h4>
                <p className="text-gray-300">01035225735</p>
              </div>
            </div>
            {/* البريد الاليكتروني وتفاصيلو */}
            <div
              className="flex items-center gap-4 bg-white/10 backdrop-blur-md
              p-6 rounded-3xl shadow-lg hover:shadow-cyan-400/30 transition-all"
            >
              <Phone className="w-8 h-8 text-cyan-400" />
              <div>
                <h4 className="font-semibold text-lg">البريد الإلكتروني</h4>
                <p className="text-gray-300">support@gmail.com</p>
              </div>
            </div>
          </div>
          {/* right side */}
          <form
            onClick={handleSubmit}
            className="bg-white/10 backdrop-blur-md
          p-8 rounded-3xl shadow-2xl flex flex-col gap-6"
          >
            <input
              type="text"
              name="name"
              placeholder="اسمك"
              value={formData.name}
              onChange={handeleChange}
              required
              className="bg-white/10 p-4 rounded-xl text-black placeholder-gray-600
              font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            />
            <input
              type="email"
              name="email"
              placeholder="الايميل"
              value={formData.email}
              onChange={handeleChange}
              required
              className="bg-white/10 p-4 rounded-xl text-black placeholder-gray-600
              font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            />
            <textarea
              name="massage"
              placeholder="اترك رسالتك"
              value={formData.massage}
              onChange={handeleChange}
              required
              rows={5}
              className="bg-white/10 p-4 rounded-xl text-black placeholder-gray-600
              font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            ></textarea>
            <button
              type="submit"
              className="bg-linear-to-r from-indigo-500
            via-purple-600 to-pink-500 px-6 py-3 rounded-2xl font-semibold
            text-white hover:opacity-90 transition-all shadow-lg"
            >
              ارسال الرسالة
            </button>
          </form>
        </div>
      </div>
      <footer className="mt-24 relative z-10 max-w-7xl mx-auto text-center text-gray-300">
        <p className="mb-4">جميع الحقوق محفوظة. E-Commerce 2025 </p>
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-white transition-colors">
            فيسبوك
          </a>
          <a href="#" className="hover:text-white transition-colors">
            تويتر{' '}
          </a>
          <a href="#" className="hover:text-white transition-colors">
            لينكدإن
          </a>
          <a href="#" className="hover:text-white transition-colors">
            إنستجرام
          </a>
        </div>
      </footer>
    </section>
  );
};

export default Footer;
