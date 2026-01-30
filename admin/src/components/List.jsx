// src/components/List.jsx - LUXURY PROFESSIONAL VERSION
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axiosConfig';
import toast from 'react-hot-toast';
import {
  Trash2,
  Package,
  Loader2,
  Search,
  Eye,
  Edit,
  Star,
  TrendingUp,
  Box,
  Filter,
  X,
  ChevronDown,
  Grid,
  List as ListIcon,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Tag,
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث', icon: Calendar },
  { value: 'oldest', label: 'الأقدم', icon: Calendar },
  { value: 'price-high', label: 'الأعلى سعراً', icon: DollarSign },
  { value: 'price-low', label: 'الأقل سعراً', icon: DollarSign },
  { value: 'name-asc', label: 'الاسم (أ-ي)', icon: Tag },
  { value: 'name-desc', label: 'الاسم (ي-أ)', icon: Tag },
];

const List = () => {
  const { token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/product/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setProducts(res.data.data || []);
      } else {
        toast.error('فشل تحميل المنتجات');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'فشل تحميل المنتجات');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProducts();
    }
  }, [token, isAuthenticated]);

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setDeleteLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await axios.post(
        '/product/remove',
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        toast.success('تم حذف المنتج بنجاح');
      } else {
        toast.error(res.data.message || 'فشل حذف المنتج');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'فشل حذف المنتج');
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(products.map((p) => p.category))];

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name, 'ar'));
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  // Stats
  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock > 0).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    featured: products.filter((p) => p.isFeatured).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                  <Package className="w-8 h-8 text-purple-400" />
                </div>
                قائمة المنتجات
              </h1>
              <p className="text-gray-400">
                إدارة وعرض جميع المنتجات في المتجر
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Package className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl rounded-xl border border-green-500/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Box className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">متوفر</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.inStock}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-xl rounded-xl border border-red-500/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">نفذ من المخزون</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.outOfStock}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-xl rounded-xl border border-yellow-500/20 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">مميز</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.featured}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="بحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative min-w-[200px]">
              <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-slate-800"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span>فلترة</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <p className="text-sm text-gray-400 mb-3">الفئة:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === cat
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'الكل' : cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Display */}
        {products.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد منتجات حالياً</p>
            <p className="text-gray-500 text-sm mt-2">ابدأ بإضافة منتج جديد</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد نتائج</p>
            <p className="text-gray-500 text-sm mt-2">
              جرب تغيير معايير البحث أو الفلترة
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 bg-white/5 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <div className="bg-purple-500/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium text-white">
                      {product.category}
                    </div>
                    {product.isFeatured && (
                      <div className="bg-yellow-500/90 backdrop-blur-sm p-1.5 rounded-lg">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Stock Badge */}
                  <div className="absolute bottom-2 left-2">
                    {product.stock > 0 ? (
                      <div className="bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium text-white">
                        متوفر ({product.stock})
                      </div>
                    ) : (
                      <div className="bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium text-white">
                        نفذ من المخزون
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 truncate">
                    {product.name}
                  </h3>

                  {product.brand && (
                    <p className="text-xs text-gray-500 mb-2">
                      {product.brand}
                    </p>
                  )}

                  <p className="text-sm text-gray-400 mb-3 line-clamp-2 h-10">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-purple-400">
                        {product.price}
                      </span>
                      <span className="text-sm text-gray-400 mr-1">ج.م</span>
                    </div>
                    {product.sku && (
                      <span className="text-xs text-gray-500">
                        #{product.sku}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-lg transition-all group"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">عرض</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deleteLoading[product._id]}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteLoading[product._id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-48 h-32 bg-white/5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/200x150?text=No+Image';
                      }}
                    />
                    {product.isFeatured && (
                      <div className="absolute top-2 right-2 bg-yellow-500/90 backdrop-blur-sm p-1.5 rounded-lg">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {product.name}
                      </h3>
                      {product.brand && (
                        <p className="text-sm text-gray-500 mb-2">
                          {product.brand}
                        </p>
                      )}
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">
                          {product.category}
                        </span>
                        {product.stock > 0 ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
                            متوفر ({product.stock})
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg">
                            نفذ
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end gap-3">
                      <div className="text-center md:text-right">
                        <div className="text-2xl font-bold text-purple-400">
                          {product.price} ج.م
                        </div>
                        {product.sku && (
                          <div className="text-xs text-gray-500 mt-1">
                            #{product.sku}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deleteLoading[product._id]}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteLoading[product._id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Details Modal */}
        {selectedProduct && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">تفاصيل المنتج</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                  onError={(e) => {
                    e.target.src =
                      'https://via.placeholder.com/600x400?text=No+Image';
                  }}
                />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedProduct.name}
                    </h3>
                    {selectedProduct.brand && (
                      <p className="text-gray-400">{selectedProduct.brand}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                      {selectedProduct.category}
                    </span>
                    {selectedProduct.isFeatured && (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm flex items-center gap-1">
                        <Star className="w-4 h-4" /> مميز
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-lg text-sm ${
                        selectedProduct.stock > 0
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {selectedProduct.stock > 0
                        ? `متوفر (${selectedProduct.stock})`
                        : 'نفذ من المخزون'}
                    </span>
                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">السعر</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {selectedProduct.price} ج.م
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">
                        رقم المنتج (SKU)
                      </p>
                      <p className="text-lg text-white">
                        {selectedProduct.sku || 'غير متوفر'}
                      </p>
                    </div>
                  </div>

                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div>
                      <p className="text-gray-500 text-sm mb-2">
                        الكلمات المفتاحية
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
