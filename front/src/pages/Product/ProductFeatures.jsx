import { Truck, ShieldCheck, Package } from 'lucide-react';

const ProductFeatures = () => {
  const features = [
    {
      icon: Truck,
      title: 'توصيل سريع',
      subtitle: '2-7 أيام',
      bgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
    },
    {
      icon: ShieldCheck,
      title: 'دفع آمن',
      subtitle: '100% محمي',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: Package,
      title: 'ضمان الجودة',
      subtitle: 'منتج أصلي',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 lg:gap-4 py-4 lg:py-6 border-y border-gray-200">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-right"
          >
            <div
              className={`w-10 h-10 lg:w-12 lg:h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-1 sm:mb-0`}
            >
              <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${feature.iconColor}`} />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-xs lg:text-sm">
                {feature.title}
              </div>
              <div className="text-[10px] lg:text-xs text-gray-500">
                {feature.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductFeatures;