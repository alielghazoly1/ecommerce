import { useState } from 'react';
import { Scan, Truck, Copy, Check } from 'lucide-react';

const TrackingBadge = ({ trackingNumber }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-indigo-100 bg-linear-to-r from-indigo-50 to-violet-50">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold">
        <Scan className="w-3.5 h-3.5" /> رقم التتبع / الشحن
      </div>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Truck className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="font-mono text-sm font-bold text-indigo-800 tracking-widest truncate">{trackingNumber}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shrink-0 active:scale-95"
        >
          {copied ? <><Check className="w-3.5 h-3.5" /> تم النسخ</> : <><Copy className="w-3.5 h-3.5" /> نسخ</>}
        </button>
      </div>
    </div>
  );
};

export default TrackingBadge;