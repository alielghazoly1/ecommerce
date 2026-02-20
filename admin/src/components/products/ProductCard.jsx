// src/components/products/ProductCard.jsx
import { Eye, Pencil, Trash2, Star, Loader2 } from 'lucide-react';

const ProductCard = ({ product, onView, onEdit, onDelete, deleteLoading, viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-48 h-32 bg-white/5">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=No+Image'; }} />
            {product.isFeatured && (
              <div className="absolute top-2 right-2 bg-yellow-500/90 p-1.5 rounded-lg">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
            )}
          </div>
          <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
              {product.brand && <p className="text-sm text-gray-500 mb-1">{product.brand}</p>}
              <p className="text-sm text-gray-400 line-clamp-1">{product.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">{product.category}</span>
                <span className={`px-3 py-1 text-xs rounded-lg ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {product.stock > 0 ? `متوفر (${product.stock})` : 'نفذ'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right ml-4">
                {product.originalPrice > product.price && (
                  <p className="text-xs text-gray-500 line-through">{product.originalPrice} ج.م</p>
                )}
                <p className="text-2xl font-bold text-purple-400">{product.price} ج.م</p>
              </div>
              <ProductActions product={product} onView={onView} onEdit={onEdit} onDelete={onDelete} deleteLoading={deleteLoading} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all group">
      <div className="relative h-64 bg-white/5 overflow-hidden">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }} />
        {product.isFeatured && (
          <div className="absolute top-3 right-3 bg-yellow-500/90 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Star className="w-4 h-4 text-white fill-white" />
            <span className="text-white text-sm font-semibold">مميز</span>
          </div>
        )}
        <div className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-sm font-semibold ${product.stock > 0 ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
          {product.stock > 0 ? `متوفر (${product.stock})` : 'نفذ'}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
        {product.brand && <p className="text-sm text-gray-500 mb-1">{product.brand}</p>}
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">{product.category}</span>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">{product.originalPrice} ج.م</span>
              )}
              {product.discountPercentage > 0 && (
                <span className="text-xs font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-lg">-{product.discountPercentage}%</span>
              )}
            </div>
            <div className="text-2xl font-bold text-purple-400">{product.price} ج.م</div>
          </div>
        </div>
        <ProductActions product={product} onView={onView} onEdit={onEdit} onDelete={onDelete} deleteLoading={deleteLoading} />
      </div>
    </div>
  );
};

const ProductActions = ({ product, onView, onEdit, onDelete, deleteLoading }) => (
  <div className="flex gap-2 w-full">
    <button onClick={() => onView(product)} className="flex-1 px-3 py-2 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-lg transition-all flex items-center justify-center gap-1">
      <Eye className="w-4 h-4" /><span className="text-sm">عرض</span>
    </button>
    <button onClick={() => onEdit(product._id)} className="flex-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-all flex items-center justify-center gap-1">
      <Pencil className="w-4 h-4" /><span className="text-sm">تعديل</span>
    </button>
    <button onClick={() => onDelete(product._id)} disabled={deleteLoading}
      className="px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all disabled:opacity-50">
      {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  </div>
);

export default ProductCard;