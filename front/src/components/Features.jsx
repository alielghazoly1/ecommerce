import { Truck, ShieldCheck, RefreshCcw, Headphones } from 'lucide-react';

const featuresData = [
  {
    Icon: Truck,
    title: 'توصيل مجاني',
    desc: 'استمتع بالتوصيل المجاني على جميع الطلبات فوق 500 جنيه.',
    color: 'from-cyan-300 to-blue-400',
  },
  {
    Icon: ShieldCheck,
    title: 'دفع آمن',
    desc: 'نضمن لك تجربة دفع آمنة ومحمية بالكامل.',
    color: 'from-green-300 to-emerald-400',
  },
  {
    Icon: RefreshCcw,
    title: 'إرجاع سهل',
    desc: 'إرجاع المنتجات بسهولة خلال 30 يومًا من الشراء.',
    color: 'from-purple-300 to-pink-400',
  },
  {
    Icon: Headphones,
    title: 'دعم 24/7',
    desc: 'فريق الدعم لدينا متاح لمساعدتك في أي وقت.',
    color: 'from-yellow-300 to-orange-400',
  },
];

const Features = () => {
  return (
    <section className="relative w-full bg-white py-20 text-gray-800">
      {/* Overlay خفيف عشان يبقى فيه عمق */}
      <div className="absolute inset-0 bg-gray-50/50 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 text-gray-900">
          لماذا تختارنا؟
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map(({ Icon, title, desc, color }, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-3xl p-8 flex flex-col items-center text-center
              transition-transform transform hover:scale-105 hover:shadow-xl"
            >
              <div
                className={`w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}
              >
                <Icon className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-gray-900">{title}</h3>
              <p className="text-gray-600 text-base">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
