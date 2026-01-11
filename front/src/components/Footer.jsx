import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`${formData.name} شكراً لتواصلك معنا`);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section className="relative w-full bg-gray-50 text-gray-800 py-24 px-6 sm:px-10">
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center">
          تواصل معنا
        </h2>
        <p className="text-gray-600 mb-12 text-center text-lg sm:text-xl">
          نحن هنا لمساعدتك في أي وقت، أرسل لنا رسالة وسنعود إليك قريباً!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* left side: contact info */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              <MapPin className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-semibold text-lg">العنوان</h4>
                <p className="text-gray-600">القاهرة، رمسيس</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              <Phone className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-semibold text-lg">الهاتف</h4>
                <p className="text-gray-600">01035225735</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              <Mail className="w-8 h-8 text-purple-600" />
              <div>
                <h4 className="font-semibold text-lg">البريد الإلكتروني</h4>
                <p className="text-gray-600">support@gmail.com</p>
              </div>
            </div>
          </div>

          {/* right side: contact form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-3xl shadow-md flex flex-col gap-6"
          >
            <input
              type="text"
              name="name"
              placeholder="اسمك"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-100 p-4 rounded-xl text-gray-800 placeholder-gray-500 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-100 p-4 rounded-xl text-gray-800 placeholder-gray-500 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
            <textarea
              name="message"
              placeholder="اترك رسالتك"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full bg-gray-100 p-4 rounded-xl text-gray-800 placeholder-gray-500 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            ></textarea>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all mt-2"
            >
              إرسال الرسالة
            </button>
          </form>
        </div>

        <footer className="mt-24 text-center text-gray-500">
          <p className="mb-4">جميع الحقوق محفوظة © E-Commerce 2025</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-gray-800 transition-colors">
              فيسبوك
            </a>
            <a href="#" className="hover:text-gray-800 transition-colors">
              تويتر
            </a>
            <a href="#" className="hover:text-gray-800 transition-colors">
              لينكدإن
            </a>
            <a href="#" className="hover:text-gray-800 transition-colors">
              إنستجرام
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default Footer;
