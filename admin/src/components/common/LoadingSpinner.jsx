// src/components/common/LoadingSpinner.jsx
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'جاري التحميل...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
      <p className="text-white text-xl font-bold">{text}</p>
    </div>
  </div>
);

export default LoadingSpinner;