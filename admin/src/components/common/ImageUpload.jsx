// src/components/common/ImageUpload.jsx
import { useState } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, Zap, AlertCircle } from 'lucide-react';
import { validateImageFile } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ImageUpload = ({ preview, onImageChange, onRemove, error, isEditMode = false, label = 'صورة المنتج' }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    const err = validateImageFile(file);
    if (err) { toast.error(err); return; }
    onImageChange(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-200 mb-3">{label}</label>

      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
        >
          <input type="file" accept="image/*" onChange={handleInputChange} className="hidden" id="image-upload" />
          <label
            htmlFor="image-upload"
            className={`group/upload flex flex-col items-center justify-center gap-6 px-8 py-16 bg-slate-800/30 border-2 border-dashed ${
              isDragging ? 'border-cyan-500 bg-cyan-500/10' : error ? 'border-red-500' : 'border-slate-600'
            } rounded-3xl hover:border-cyan-500 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer`}
          >
            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl">
              {isDragging ? <Zap className="w-16 h-16 text-yellow-400 animate-bounce" /> : <Upload className="w-16 h-16 text-cyan-400" />}
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-black text-white">
                {isDragging ? 'أفلت الصورة هنا' : 'اضغط لاختيار صورة'}
              </p>
              <p className="text-sm text-gray-400">أو اسحب وأفلت الصورة هنا</p>
              <div className="flex justify-center gap-2 pt-2">
                {['JPG', 'PNG', 'WebP', 'Max 5MB'].map((t) => (
                  <span key={t} className="px-3 py-1 bg-slate-700/50 rounded-xl text-xs text-gray-400 font-bold">{t}</span>
                ))}
              </div>
            </div>
          </label>
          {error && (
            <p className="text-red-400 text-sm font-semibold flex items-center gap-2 mt-3">
              <AlertCircle className="w-4 h-4" />{error}
            </p>
          )}
        </div>
      ) : (
        <div className="relative group/preview rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-800/30 p-4">
          <img src={preview} alt="معاينة" className="w-full h-80 object-contain rounded-2xl" />

          <div className="absolute top-6 left-6 flex gap-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
            <input type="file" accept="image/*" onChange={handleInputChange} className="hidden" id="image-upload" />
            {isEditMode && (
              <label htmlFor="image-upload" className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg cursor-pointer flex items-center gap-2 shadow-lg transition-colors">
                <Upload className="w-4 h-4" />
                <span>تغيير</span>
              </label>
            )}
            <button type="button" onClick={onRemove} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            <p className="text-sm font-bold text-white flex-1">الصورة محددة</p>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;