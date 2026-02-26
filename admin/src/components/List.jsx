// src/components/List.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package, Grid, List as ListIcon, Edit2, Trash2, Eye,
  TrendingDown, Tag, DollarSign, Layers, Star, AlertTriangle,
  Search, X, ChevronDown, BarChart2, Box,
} from 'lucide-react';
import {
  fetchProducts,
  deleteProduct,
  setFilter,
  setSelectedProduct,
} from '../store/slices/productsSlice';
import PageHeader from './common/PageHeader';
import SearchBar from './common/SearchBar';
import EmptyState from './common/EmptyState';
import LoadingSpinner from './common/LoadingSpinner';
import Modal from './common/Modal';
import StatusBadge from './common/StatusBadge';
import { formatPrice, formatDate } from '../utils/helpers';
import { SORT_OPTIONS } from '../constants';

// ─────────────────────────── Cost / Profit Badge ────────────────────────────
const ProfitBadge = ({ price, costPrice }) => {
  if (!costPrice || costPrice <= 0) return null;
  const profit = price - costPrice;
  const pct = Math.round((profit / costPrice) * 100);
  const positive = profit >= 0;
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${
      positive
        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
        : 'bg-red-500/15 text-red-300 border-red-500/30'
    }`}>
      <TrendingDown className={`w-3 h-3 ${positive ? 'rotate-180' : ''}`} />
      <span>{positive ? '+' : ''}{profit.toFixed(0)} ج ({positive ? '+' : ''}{pct}%)</span>
    </div>
  );
};

// ─────────────────────────── Stock Badge ────────────────────────────────────
const StockBadge = ({ stock }) => {
  if (stock === 0)
    return <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">نفذ</span>;
  if (stock <= 5)
    return <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">⚠ {stock} متبقي</span>;
  return <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{stock} قطعة</span>;
};

// ─────────────────────────── Product Card (Grid) ────────────────────────────
const ProductCardGrid = ({ product, onView, onEdit, onDelete, deleteLoading }) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-[#111827] border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0d1117]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x225?text=No+Image'; }}
        />
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button onClick={() => onView(product)}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-violet-500/70 border border-white/20 flex items-center justify-center backdrop-blur-sm transition-all">
            <Eye className="w-4 h-4 text-white" />
          </button>
          <button onClick={() => onEdit(product._id)}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-blue-500/70 border border-white/20 flex items-center justify-center backdrop-blur-sm transition-all">
            <Edit2 className="w-4 h-4 text-white" />
          </button>
          <button onClick={() => onDelete(product._id)} disabled={deleteLoading}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-red-500/70 border border-white/20 flex items-center justify-center backdrop-blur-sm transition-all disabled:opacity-50">
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-black rounded-lg shadow-lg">-{discountPct}%</span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-0.5 bg-amber-500 text-black text-xs font-black rounded-lg shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3" />مميز
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">{product.category}</span>

        {/* Name */}
        <h3 className="text-white font-bold text-base leading-snug line-clamp-2 min-h-[2.8rem]">{product.name}</h3>

        {/* Price block */}
        <div className="space-y-1.5">
          {/* Selling price */}
          <div className="flex items-baseline gap-2">
            <span className="text-emerald-400 font-black text-lg">{formatPrice(product.price)} ج</span>
            {hasDiscount && (
              <span className="text-gray-500 text-sm line-through">{formatPrice(product.originalPrice)} ج</span>
            )}
          </div>

          {/* Cost price — prominent */}
          {product.costPrice > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-1.5">
              <Box className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-300 text-xs font-semibold">تكلفة توريد:</span>
              <span className="text-amber-200 text-sm font-black ml-auto">{formatPrice(product.costPrice)} ج</span>
              <ProfitBadge price={product.price} costPrice={product.costPrice} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/6">
          <StockBadge stock={product.stock} />
          <div className="flex gap-1.5">
            <button onClick={() => onEdit(product._id)}
              className="px-3 py-1.5 text-xs font-bold bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/30 rounded-lg transition-all">
              تعديل
            </button>
            <button onClick={() => onDelete(product._id)} disabled={deleteLoading}
              className="px-3 py-1.5 text-xs font-bold bg-red-500/15 hover:bg-red-500/35 text-red-300 border border-red-500/25 rounded-lg transition-all disabled:opacity-40">
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────── Product Row (List) ─────────────────────────────
const ProductRowList = ({ product, onView, onEdit, onDelete, deleteLoading }) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const profit = product.costPrice > 0 ? product.price - product.costPrice : null;
  const profitPct = profit !== null && product.costPrice > 0
    ? Math.round((profit / product.costPrice) * 100) : null;

  return (
    <div className="group flex items-center gap-4 bg-[#111827] border border-white/8 rounded-2xl p-4 hover:border-violet-500/40 hover:bg-[#131d2e] transition-all duration-200">
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#0d1117]">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=?'; }} />
      </div>

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-violet-400 text-xs font-semibold">{product.category}</span>
          {product.isFeatured && <span className="text-amber-400 text-xs">⭐ مميز</span>}
        </div>
      </div>

      {/* Prices */}
      <div className="shrink-0 text-right space-y-1 min-w-[130px]">
        <div className="flex items-baseline gap-1.5 justify-end">
          <span className="text-emerald-400 font-black">{formatPrice(product.price)} ج</span>
          {hasDiscount && <span className="text-gray-500 text-xs line-through">{formatPrice(product.originalPrice)}</span>}
        </div>
        {product.costPrice > 0 && (
          <div className="flex items-center gap-1 justify-end">
            <Box className="w-3 h-3 text-amber-400" />
            <span className="text-amber-300 text-xs font-semibold">{formatPrice(product.costPrice)} ج</span>
            {profitPct !== null && (
              <span className={`text-xs font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ({profit >= 0 ? '+' : ''}{profitPct}%)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stock */}
      <div className="shrink-0 w-24 flex justify-center">
        <StockBadge stock={product.stock} />
      </div>

      {/* Actions */}
      <div className="shrink-0 flex gap-2">
        <button onClick={() => onView(product)}
          className="w-8 h-8 rounded-lg bg-white/8 hover:bg-violet-500/30 border border-white/10 hover:border-violet-400/40 flex items-center justify-center transition-all">
          <Eye className="w-3.5 h-3.5 text-gray-300" />
        </button>
        <button onClick={() => onEdit(product._id)}
          className="w-8 h-8 rounded-lg bg-white/8 hover:bg-blue-500/30 border border-white/10 hover:border-blue-400/40 flex items-center justify-center transition-all">
          <Edit2 className="w-3.5 h-3.5 text-gray-300" />
        </button>
        <button onClick={() => onDelete(product._id)} disabled={deleteLoading}
          className="w-8 h-8 rounded-lg bg-white/8 hover:bg-red-500/30 border border-white/10 hover:border-red-400/40 flex items-center justify-center transition-all disabled:opacity-40">
          <Trash2 className="w-3.5 h-3.5 text-gray-300" />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────── Product Modal ──────────────────────────────────
const ProductDetailModal = ({ product, onClose, onEdit }) => {
  if (!product) return null;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const profit = product.costPrice > 0 ? product.price - product.costPrice : null;
  const profitPct = profit !== null && product.costPrice > 0
    ? Math.round((profit / product.costPrice) * 100) : null;

  return (
    <Modal
      title={product.name}
      subtitle={product.category}
      onClose={onClose}
      headerExtra={
        <button onClick={() => { onEdit(product._id); onClose(); }}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
          <Edit2 className="w-4 h-4" /> تعديل
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-[#0d1117] border border-white/10 aspect-square">
          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }} />
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Pricing */}
          <div className="bg-[#0d1117] rounded-2xl border border-white/10 p-4 space-y-3">
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">الأسعار</h4>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">سعر البيع</span>
              <span className="text-emerald-400 font-black text-xl">{formatPrice(product.price)} ج</span>
            </div>

            {hasDiscount && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">السعر قبل الخصم</span>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold text-sm bg-red-500/15 px-2 py-0.5 rounded-lg">-{discountPct}%</span>
                  <span className="text-gray-500 line-through">{formatPrice(product.originalPrice)} ج</span>
                </div>
              </div>
            )}

            {product.costPrice > 0 && (
              <>
                <div className="border-t border-white/8 pt-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 text-sm font-semibold">سعر التوريد</span>
                  </div>
                  <span className="text-amber-200 font-black text-lg">{formatPrice(product.costPrice)} ج</span>
                </div>
                {profit !== null && (
                  <div className={`flex justify-between items-center rounded-xl px-3 py-2 ${
                    profit >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    <span className="text-gray-300 text-sm">هامش الربح</span>
                    <div className="text-right">
                      <span className={`font-black text-lg ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {profit >= 0 ? '+' : ''}{formatPrice(profit)} ج
                      </span>
                      <span className={`text-xs font-bold mr-2 ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        ({profit >= 0 ? '+' : ''}{profitPct}%)
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0d1117] rounded-xl border border-white/10 p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">المخزون</p>
              <StockBadge stock={product.stock} />
            </div>
            <div className="bg-[#0d1117] rounded-xl border border-white/10 p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">المبيعات</p>
              <p className="text-violet-400 font-black">{product.sold || 0}</p>
            </div>
            {product.ratings?.average > 0 && (
              <div className="bg-[#0d1117] rounded-xl border border-white/10 p-3 text-center col-span-2">
                <p className="text-gray-500 text-xs mb-1">التقييم</p>
                <p className="text-amber-400 font-black">⭐ {product.ratings.average} ({product.ratings.count} تقييم)</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-[#0d1117] rounded-xl border border-white/10 p-3">
            <p className="text-gray-500 text-xs mb-2 font-bold uppercase tracking-widest">الوصف</p>
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-violet-500/15 text-violet-300 text-xs rounded-lg border border-violet-500/25">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-600 text-center">أُضيف: {formatDate(product.createdAt)}</div>
    </Modal>
  );
};

// ─────────────────────────── MAIN COMPONENT ─────────────────────────────────
const List = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, loading, actionLoading, selectedProduct, filters } =
    useSelector((s) => s.products);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  const handleDelete = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    dispatch(deleteProduct(id));
  };

  const categories = useMemo(() =>
    ['all', ...new Set(products.map((p) => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    if (filters.category !== 'all')
      result = result.filter((p) => p.category === filters.category);
    switch (filters.sortBy) {
      case 'newest':     result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'oldest':     result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'price-low':  result.sort((a, b) => a.price - b.price); break;
      case 'name-asc':   result.sort((a, b) => a.name.localeCompare(b.name, 'ar')); break;
      case 'name-desc':  result.sort((a, b) => b.name.localeCompare(a.name, 'ar')); break;
    }
    return result;
  }, [products, filters]);

  // Stats
  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter((p) => p.stock > 0).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    featured: products.filter((p) => p.isFeatured).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    withCost: products.filter((p) => p.costPrice > 0).length,
  }), [products]);

  if (loading) return <LoadingSpinner text="جاري تحميل المنتجات..." />;

  return (
    <div className="min-h-screen bg-[#080d14]">
      {/* Header */}
      <PageHeader
        icon={Package}
        title="قائمة المنتجات"
        subtitle={`إجمالي: ${products.length} منتج`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/add')}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-500/20">
              + إضافة منتج
            </button>
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {[{ mode: 'grid', Icon: Grid }, { mode: 'list', Icon: ListIcon }].map(({ mode, Icon }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto p-6 space-y-5">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'إجمالي', value: stats.total, color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' },
            { label: 'متوفر', value: stats.inStock, color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/20' },
            { label: 'نفذ', value: stats.outOfStock, color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/20' },
            { label: 'مخزون منخفض', value: stats.lowStock, color: 'text-amber-400', bg: 'bg-amber-500/8', border: 'border-amber-500/20' },
            { label: 'مميز', value: stats.featured, color: 'text-yellow-400', bg: 'bg-yellow-500/8', border: 'border-yellow-500/20' },
            { label: 'بسعر توريد', value: stats.withCost, color: 'text-violet-400', bg: 'bg-violet-500/8', border: 'border-violet-500/20' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-3 text-center`}>
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className={`${s.color} font-black text-2xl`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-[#0e1520] border border-white/8 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => dispatch(setFilter({ search: e.target.value }))}
                placeholder="ابحث عن منتج بالاسم أو الفئة..."
                className="w-full pr-11 pl-10 py-3 bg-[#0d1117] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
              {filters.search && (
                <button onClick={() => dispatch(setFilter({ search: '' }))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category */}
            <div className="relative">
              <select value={filters.category}
                onChange={(e) => dispatch(setFilter({ category: e.target.value }))}
                className="appearance-none pl-8 pr-4 py-3 bg-[#0d1117] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer min-w-[160px]">
                <option value="all" className="bg-[#0d1117]">جميع الفئات</option>
                {categories.filter((c) => c !== 'all').map((c) => (
                  <option key={c} value={c} className="bg-[#0d1117]">{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select value={filters.sortBy}
                onChange={(e) => dispatch(setFilter({ sortBy: e.target.value }))}
                className="appearance-none pl-8 pr-4 py-3 bg-[#0d1117] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer min-w-[160px]">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#0d1117]">{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/6">
            <p className="text-gray-500 text-xs">
              عرض <span className="text-white font-bold">{filteredProducts.length}</span> من <span className="text-white font-bold">{products.length}</span> منتج
            </p>
            {(filters.search || filters.category !== 'all') && (
              <button
                onClick={() => dispatch(setFilter({ search: '', category: 'all' }))}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                مسح الفلاتر ×
              </button>
            )}
          </div>
        </div>

        {/* ── Products ── */}
        {filteredProducts.length === 0 ? (
          <EmptyState icon={Package} title="لا توجد منتجات" subtitle="جرب تغيير البحث أو الفلترة" />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCardGrid
                key={product._id}
                product={product}
                onView={(p) => dispatch(setSelectedProduct(p))}
                onEdit={(id) => navigate(`/admin/edit/${id}`)}
                onDelete={handleDelete}
                deleteLoading={!!actionLoading[product._id]}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <ProductRowList
                key={product._id}
                product={product}
                onView={(p) => dispatch(setSelectedProduct(p))}
                onEdit={(id) => navigate(`/admin/edit/${id}`)}
                onDelete={handleDelete}
                deleteLoading={!!actionLoading[product._id]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => dispatch(setSelectedProduct(null))}
          onEdit={(id) => navigate(`/admin/edit/${id}`)}
        />
      )}
    </div>
  );
};

export default List;