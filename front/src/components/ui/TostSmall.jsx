// Toast Component
import { Check, X } from 'lucide-react';
 const ToastSmall = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const configs = {
    success: { bg: 'bg-green-500', icon: Check },
    error: { bg: 'bg-red-500', icon: X },
    info: { bg: 'bg-cyan-500', icon: Check },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 top-8 z-50 ${config.bg} text-white px-6 py-3 rounded-xl shadow-2xl animate-slide-down`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div className="text-sm font-medium">{message}</div>
        <button
          onClick={onClose}
          className="opacity-80 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default ToastSmall;