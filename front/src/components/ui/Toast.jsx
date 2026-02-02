import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const Toast = ({ toast, onClose, duration = 1800 }) => {
  useEffect(() => {
    if (!toast?.message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer); // تنظيف المؤقت لو تغير toast
  }, [toast, duration, onClose]);

  if (!toast?.message) return null;

  const bg =
    toast.type === 'success'
      ? 'bg-green-600'
      : toast.type === 'error'
        ? 'bg-red-600'
        : 'bg-gray-800';

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 ${bg} text-white px-4 py-2 rounded-lg flex items-center gap-3`}
    >
      {toast.type === 'success' && <CheckCircle size={18} />}
      {toast.type === 'error' && <XCircle size={18} />}
      <span className="text-sm">{toast.message}</span>
      <button onClick={onClose} className="ml-3 opacity-90 hover:opacity-100">
        إغلاق
      </button>
    </div>
  );
};

export default Toast;
