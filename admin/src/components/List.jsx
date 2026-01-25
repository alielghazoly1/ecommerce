// src/components/List.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { Trash2, Package, Loader2, Search } from 'lucide-react';

const List = () => {
  const { token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const fetchProducts = async () => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/product/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

    setDeleteLoading(prev => ({ ...prev, [id]: true }));

    try {
      const res = await axios.post('/product/remove', 
        { id },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
        toast.success('تم حذف المنتج بنجاح');
      } else {
        toast.error(res.data.message || 'فشل حذف المنتج');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'فشل حذف المنتج');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-400" />
            قائمة المنتجات
          </h1>
          <p className="text-gray-400">
            إجمالي المنتجات: <span className="text-white font-semibold">{products.length}</span>
          </p>
        </div>

        {/* Search Bar */}
        {products.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="بحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد منتجات حالياً</p>
            <p className="text-gray-500 text-sm mt-2">ابدأ بإضافة منتج جديد</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد نتائج للبحث</p>
            <p className="text-gray-500 text-sm mt-2">جرب كلمات بحث أخرى</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 bg-white/5 overflow-hidden">
                  <img
                    src={`${url}/images/${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-purple-500 px-3 py-1 rounded-lg text-xs font-medium text-white">
                    {product.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2 h-10">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-purple-400">
                      {product.price} ج.م
                    </span>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deleteLoading[product._id]}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {deleteLoading[product._id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default List;