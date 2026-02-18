// src/components/products/ProductModal.jsx
import { X, Star, Pencil } from 'lucide-react';

const ProductModal = ({ product, onClose, onEdit }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}>
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}>
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">تفاصيل المنتج</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition">
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <img src={product.image} alt={product.name}
          className="w-full h-64 object-cover rounded-xl"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; }} />
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{product.name}</h3>
          {product.brand && <p className="text-gray-400">{product.brand}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">{product.category}</span>
          {product.isFeatured && (
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm flex items-center gap-1">
              <Star className="w-4 h-4" /> مميز
            </span>
          )}
          <span className={`px-3 py-1 rounded-lg text-sm ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {product.stock > 0 ? `متوفر (${product.stock})` : 'نفذ من المخزون'}
          </span>
        </div>
        <p className="text-gray-300 leading-relaxed">{product.description}</p>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-gray-500 text-sm mb-1">السعر</p>
            <p className="text-2xl font-bold text-purple-400">{product.price} ج.م</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">رقم المنتج</p>
            <p className="text-lg text-white">{product.sku || 'غير متوفر'}</p>
          </div>
        </div>
        {product.tags?.length > 0 && (
          <div>
            <p className="text-gray-500 text-sm mb-2">الكلمات المفتاحية</p>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-sm">{tag}</span>
              ))}
            </div>
          </div>
        )}
        <div className="pt-4 border-t border-white/10">
          <button onClick={() => { onClose(); onEdit(product._id); }}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
            <Pencil className="w-5 h-5" /><span>تعديل المنتج</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ProductModal;