import { Link } from 'react-router-dom';
import { Package, ChevronLeft, X } from 'lucide-react';

const LoginBanner = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="mb-4 lg:mb-6 animate-slide-down">
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-3 lg:p-4 flex items-start gap-2 lg:gap-3">
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-none">
          <Package className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs lg:text-sm text-gray-800 mb-1 lg:mb-2">
            <strong>تم الحفظ محلياً!</strong> سجّل الدخول لمزامنة طلباتك
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-semibold text-cyan-600 hover:text-cyan-700"
          >
            تسجيل الدخول الآن
            <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
          </Link>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4 lg:w-5 lg:h-5" />
        </button>
      </div>
    </div>
  );
};

export default LoginBanner;