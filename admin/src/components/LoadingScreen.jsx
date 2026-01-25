// src/components/LoadingScreen.jsx
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="flex flex-col items-center">
        <Loader2 className="w-16 h-16 animate-spin text-cyan-400 mb-4" />
        <h2 className="text-2xl font-bold text-white">جاري التحميل...</h2>
      </div>
    </div>
  );
};

export default LoadingScreen;