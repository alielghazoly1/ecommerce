// src/components/Edit.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, ArrowLeft } from 'lucide-react';
import { fetchProductById, updateProduct } from '../store/slices/productsSlice';
import { validateAllProductFields } from '../utils/helpers';
import ProductForm from './products/ProductForm';
import LoadingSpinner from './common/LoadingSpinner';
import toast from 'react-hot-toast';

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedProduct, loading, actionLoading } = useSelector((s) => s.products);
  const updating = actionLoading.update;

  const [data, setData] = useState({
    name: '', description: '', price: '', category: 'شوكولاتة',
    stock: '0', brand: '', isFeatured: false, tags: '', image: '',
  });
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedProduct && selectedProduct._id === id) {
      setData({
        name: selectedProduct.name || '',
        description: selectedProduct.description || '',
        price: selectedProduct.price?.toString() || '',
        category: selectedProduct.category || 'شوكولاتة',
        stock: selectedProduct.stock?.toString() || '0',
        brand: selectedProduct.brand || '',
        isFeatured: selectedProduct.isFeatured || false,
        tags: selectedProduct.tags?.join(', ') || '',
        image: selectedProduct.image || '',
      });
      setImagePreview(selectedProduct.image);
    }
  }, [selectedProduct, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setData((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleImageChange = (file) => {
    setNewImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setNewImage(null);
    setImagePreview(data.image);
    const input = document.getElementById('image-upload');
    if (input) input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validateAllProductFields(data);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error('يرجى تصحيح الأخطاء قبل المتابعة');
      return;
    }
    const result = await dispatch(updateProduct({ id, data, image: newImage }));
    if (!result.error) navigate('/admin/list');
  };

  if (loading) return <LoadingSpinner text="جاري تحميل بيانات المنتج..." />;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/admin/list')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" /><span>العودة للقائمة</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
              <Package className="w-10 h-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">تعديل المنتج</h1>
              <p className="text-gray-400 mt-1">قم بتحديث معلومات المنتج</p>
            </div>
          </div>
        </div>

        <ProductForm
          data={data}
          errors={errors}
          image={newImage}
          imagePreview={imagePreview}
          onChange={handleChange}
          onImageChange={handleImageChange}
          onImageRemove={handleImageRemove}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/list')}
          loading={!!updating}
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default Edit;