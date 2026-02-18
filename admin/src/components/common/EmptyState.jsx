// src/components/common/EmptyState.jsx

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="bg-slate-800 rounded-3xl border-2 border-purple-500/20 p-20 text-center shadow-2xl">
    {Icon && <Icon className="w-24 h-24 text-gray-500 mx-auto mb-6" />}
    <h3 className="text-3xl font-bold text-white mb-3">{title}</h3>
    {subtitle && <p className="text-gray-300 text-xl">{subtitle}</p>}
  </div>
);

export default EmptyState;