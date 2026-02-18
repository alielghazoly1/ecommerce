// src/components/List.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Grid, List as ListIcon } from 'lucide-react';
import { fetchProducts, deleteProduct, setFilter, setSelectedProduct } from '../store/slices/productsSlice';
import PageHeader from './common/PageHeader';
import SearchBar from './common/SearchBar';
import StatsCard from './common/StatsCard';
import EmptyState from './common/EmptyState';
import LoadingSpinner from './common/LoadingSpinner';
import ProductCard from './products/ProductCard';
import ProductModal from './products/ProductModal';
import { SORT_OPTIONS } from '../constants';

const List = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, loading, actionLoading, selectedProduct, filters } = useSelector((s) => s.products);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  const handleDelete = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    dispatch(deleteProduct(id));
  };

  const categories = useMemo(() => ['all', ...new Set(products.map((p) => p.category))], [products]);

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
    if (filters.category !== 'all') result = result.filter((p) => p.category === filters.category);
    switch (filters.sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'oldest': result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name, 'ar')); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name, 'ar')); break;
    }
    return result;
  }, [products, filters]);

  if (loading) return <LoadingSpinner text="جاري تحميل المنتجات..." />;

  return (
    <div className="min-h-screen">
      <PageHeader
        icon={Package}
        title="قائمة المنتجات"
        subtitle={`إجمالي: ${products.length} منتج`}
        actions={
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            {[{ mode: 'grid', Icon: Grid }, { mode: 'list', Icon: ListIcon }].map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        }
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="إجمالي المنتجات" value={products.length} />
          <StatsCard label="متوفر" value={products.filter((p) => p.stock > 0).length} color="green" />
          <StatsCard label="نفذ" value={products.filter((p) => p.stock === 0).length} color="red" />
          <StatsCard label="مميز" value={products.filter((p) => p.isFeatured).length} color="yellow" />
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={filters.search}
                onChange={(v) => dispatch(setFilter({ search: v }))}
                onClear={() => dispatch(setFilter({ search: '' }))}
                placeholder="ابحث عن منتج..."
              />
            </div>
            <select value={filters.category} onChange={(e) => dispatch(setFilter({ category: e.target.value }))}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
              <option value="all" className="bg-slate-800">جميع الفئات</option>
              {categories.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c} className="bg-slate-800">{c}</option>
              ))}
            </select>
            <select value={filters.sortBy} onChange={(e) => dispatch(setFilter({ sortBy: e.target.value }))}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>
              ))}
            </select>
          </div>
          <p className="text-gray-400 text-sm mt-4 pt-4 border-t border-white/10">
            عرض {filteredProducts.length} من {products.length} منتج
          </p>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <EmptyState icon={Package} title="لا توجد منتجات" subtitle="جرب تغيير البحث أو الفلترة" />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                viewMode={viewMode}
                onView={(p) => dispatch(setSelectedProduct(p))}
                onEdit={(id) => navigate(`/admin/edit/${id}`)}
                onDelete={handleDelete}
                deleteLoading={!!actionLoading[product._id]}
              />
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => dispatch(setSelectedProduct(null))}
          onEdit={(id) => navigate(`/admin/edit/${id}`)}
        />
      )}
    </div>
  );
};

export default List;