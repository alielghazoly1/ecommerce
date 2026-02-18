// src/components/Add.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package } from 'lucide-react';
import { addProduct } from '../store/slices/productsSlice';
import { validateAllProductFields } from '../utils/helpers';
import ProductForm from './products/ProductForm';
import toast from 'react-hot-toast';

const INITIAL_DATA = {
  name: '', description: '', price: '', category: 'شوكولاتة',
  stock: '0', brand: '', isFeatured: false, tags: '',
};

const Add = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.products.actionLoading.add);

  const [data, setData] = useState(INITIAL_DATA);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setData((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleImageChange = (file) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setErrors((prev) => { const n = { ...prev }; delete n.image; return n; });
  };

  const handleImageRemove = () => {
    setImage(null);
    setImagePreview(null);
    const input = document.getElementById('image-upload');
    if (input) input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validateAllProductFields(data);
    if (!image) fieldErrors.image = 'يرجى اختيار صورة للمنتج';
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error('يرجى تصحيح الأخطاء قبل المتابعة');
      return;
    }

    const result = await dispatch(addProduct({ data, image }));
    if (!result.error) {
      setData(INITIAL_DATA);
      setImage(null);
      setImagePreview(null);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl shadow-purple-500/50">
            <Package className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">إضافة منتج جديد</h1>
            <p className="text-gray-400 text-lg">املأ البيانات لإضافة منتج مميز</p>
          </div>
        </div>

        <ProductForm
          data={data}
          errors={errors}
          image={image}
          imagePreview={imagePreview}
          onChange={handleChange}
          onImageChange={handleImageChange}
          onImageRemove={handleImageRemove}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          loading={!!loading}
          isEdit={false}
        />
      </div>
    </div>
  );
};

export default Add;