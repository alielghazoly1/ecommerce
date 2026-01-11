// documentation: A centered alert component that displays messages of various types (success, error, warning, info) with corresponding icons and background colors. The alert automatically disappears after a specified duration.
// how to use
// * Example Usage:
//  * --------------
//  * <CenterAlert
//  *   open={open}
//  *   onClose={() => setOpen(false)}
//  *   type="success"
//  *   message="تم تنفيذ العملية بنجاح ✅"
//  *   duration={2500}
//  * />
//  *
//  * Example With Redirect:
//  * ----------------------
//  * <CenterAlert
//  *   open={open}
//  *   onClose={() => setOpen(false)}
//  *   type="error"
//  *   message="انتهت الجلسة، برجاء تسجيل الدخول مرة أخرى"
//  *   link="/login"
//  *   linkText="تسجيل الدخول"
//     autoNavigate
//  *   autoNavigate
//  * />
//  */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ArrowRight,
} from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-8 h-8 text-emerald-500" />,
  error: <XCircle className="w-8 h-8 text-red-500" />,
  warning: <AlertTriangle className="w-8 h-8 text-amber-500" />,
  info: <Info className="w-8 h-8 text-sky-500" />,
};

const bgColors = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-sky-200 bg-sky-50',
};

const buttonColors = {
  success: 'bg-emerald-600 hover:bg-emerald-700',
  error: 'bg-red-600 hover:bg-red-700',
  warning: 'bg-amber-600 hover:bg-amber-700',
  info: 'bg-sky-600 hover:bg-sky-700',
};

const CenterAlert = ({
  open,
  message,
  type = 'info',
  duration = 2000,
  onClose,
  link,            // 👉 لينك الانتقال
  linkText = 'الانتقال', // 👉 نص الزرار
  autoNavigate = false,  // 👉 انتقال تلقائي
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose();

      if (link && autoNavigate) {
        navigate(link);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [open, duration, onClose, link, autoNavigate, navigate]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`w-[90%] max-w-md rounded-2xl border p-6 shadow-2xl
        animate-scaleIn ${bgColors[type]}`}
      >
        <div className="flex items-start gap-4">
          {icons[type]}
          <div className="flex-1">
            <p className="text-gray-800 text-lg font-medium leading-relaxed">
              {message}
            </p>

            {/* زرار الانتقال */}
            {link && (
              <button
                onClick={() => {
                  onClose();
                  navigate(link);
                }}
                className={`mt-5 inline-flex items-center gap-2 text-white px-5 py-2.5
                rounded-xl font-semibold transition-all ${buttonColors[type]}`}
              >
                {linkText}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterAlert;
