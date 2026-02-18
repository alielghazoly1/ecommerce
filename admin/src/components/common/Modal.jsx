// src/components/common/Modal.jsx
import { X } from 'lucide-react';

const Modal = ({ title, subtitle, onClose, children, headerExtra }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full border-2 border-purple-500/30 my-8">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between rounded-t-3xl">
        <div>
          <h2 className="text-3xl font-black text-white">{title}</h2>
          {subtitle && <p className="text-white/80 text-lg font-bold mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {headerExtra}
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
      {/* Body */}
      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

export default Modal;