// src/components/Add.jsx - CLEAN VERSION WITH UTILS
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { 
  Upload, Package, DollarSign, Tag, Image as ImageIcon, 
  X, CheckCircle, Box, Layers, TrendingUp 
} from 'lucide-react';
import { 
  validateProduct, 
  validateImage, 
  prepareProductFormData,
  isEmpty 
} from '../utils/validation';
import FormField from './common/FormField';

const CATEGORIES = [
  { value: 'شوكولاتة', label: 'شوكولاتة', icon: '🍫' },
  { value: 'مكسرات', label: 'مكسرات', icon: '🥜' },
  { value: 'يامش', label: 'يامش', icon: '🍬' },
  { value: 'بسكويت', label: 'بسكويت', icon: '🍪' },
  { value: 'حلويات', label: 'حلويات', icon: '🍰' },
];

const Add = () => {
  const { token, isAuthenticated } = useAuth();
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'شوكولاتة',
    stock: '0',
    brand: '',
    isFeatured: false,
    tags: '',
  });

  useEffect(() => {
    if (!token || !isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
    }
  }, [token, isAuthenticated]);

  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setData((prev) => ({ ...prev, [name]: fieldValue }));

    // Clear error for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { valid, error } = validateImage(file);
    
    if (!valid) {
      toast.error(error);
      e.target.value = '';
      return;
    }

    setImage(file);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    const input = document.getElementById('image-upload');
    if (input) input.value = '';
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    // Validate all fields
    const errors = validateProduct(data);
    
    if (!image) {
      errors.image = 'يرجى اختيار صورة للمنتج';
    }

    if (!isEmpty(errors)) {
      setValidationErrors(errors);
      toast.error('يرجى تصحيح الأخطاء قبل المتابعة');
      return;
    }

    setLoading(true);

    try {
      const formData = prepareProductFormData(data, image);

      const res = await axios.post('/product/add', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        toast.success('تم إضافة المنتج بنجاح! 🎉');
        
        // Reset form
        setData({
          name: '',
          description: '',
          price: '',
          category: 'شوكولاتة',
          stock: '0',
          brand: '',
          isFeatured: false,
          tags: '',
        });
        setImage(null);
        setPreview(null);
        setValidationErrors({});
      } else {
        toast.error(res.data.message || 'فشل إضافة المنتج');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء إضافة المنتج';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
              <Package className="w-10 h-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                إضافة منتج جديد
              </h1>
              <p className="text-gray-400 mt-1">
                أضف منتجاً جديداً إلى المتجر
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler}>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="px-6 md:px-8 lg:px-10 pt-8 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Product Name */}
                <FormField
                  label="اسم المنتج"
                  name="name"
                  value={data.name}
                  onChange={onChangeHandler}
                  placeholder="مثال: شوكولاتة كادبوري"
                  icon={Package}
                  error={validationErrors.name}
                  required
                />

                {/* Description */}
                <div className="md:col-span-2">
                  <FormField
                    label="وصف المنتج"
                    name="description"
                    type="textarea"
                    value={data.description}
                    onChange={onChangeHandler}
                    placeholder="اكتب وصفاً تفصيلياً للمنتج..."
                    rows={4}
                    error={validationErrors.description}
                    required
                  />
                </div>

                {/* Price */}
                <FormField
                  label="السعر (ج.م)"
                  name="price"
                  type="number"
                  value={data.price}
                  onChange={onChangeHandler}
                  placeholder="0.00"
                  icon={DollarSign}
                  step="0.01"
                  min="0"
                  error={validationErrors.price}
                  required
                />

                {/* Category */}
                <FormField
                  label="الفئة"
                  name="category"
                  type="select"
                  value={data.category}
                  onChange={onChangeHandler}
                  icon={Layers}
                  options={CATEGORIES}
                  required
                />

                {/* Stock */}
                <FormField
                  label="الكمية المتاحة"
                  name="stock"
                  type="number"
                  value={data.stock}
                  onChange={onChangeHandler}
                  placeholder="0"
                  icon={Box}
                  min="0"
                  error={validationErrors.stock}
                />

                {/* Brand */}
                <FormField
                  label="العلامة التجارية"
                  name="brand"
                  value={data.brand}
                  onChange={onChangeHandler}
                  placeholder="مثال: Cadbury"
                  icon={TrendingUp}
                />

                {/* Tags */}
                <div className="md:col-span-2">
                  <FormField
                    label="الكلمات المفتاحية (افصل بفاصلة)"
                    name="tags"
                    value={data.tags}
                    onChange={onChangeHandler}
                    placeholder="مثال: حلو, لذيذ, مستورد"
                  />
                  <p className="text-xs text-gray-500 mt-2">استخدم الفاصلة (,) للفصل بين الكلمات</p>
                </div>

                {/* Featured */}
                <div className="md:col-span-2">
                  <FormField
                    label="منتج مميز"
                    name="isFeatured"
                    type="checkbox"
                    value={data.isFeatured}
                    onChange={onChangeHandler}
                    placeholder="منتج مميز (يظهر في الصفحة الرئيسية)"
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    صورة المنتج <span className="text-red-400">*</span>
                  </label>
                  
                  {!preview ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex flex-col items-center justify-center gap-4 px-6 py-10 bg-white/5 border-2 border-dashed ${
                          validationErrors.image ? 'border-red-500' : 'border-white/30'
                        } rounded-2xl hover:border-purple-500 hover:bg-white/10 transition-all cursor-pointer group`}
                      >
                        <div className="p-4 bg-purple-500/20 rounded-full group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-gray-300 mb-1">
                            اضغط لاختيار صورة
                          </p>
                          <p className="text-sm text-gray-500">
                            JPG, PNG, GIF, WebP - حد أقصى 5MB
                          </p>
                        </div>
                      </label>
                      {validationErrors.image && (
                        <p className="text-red-400 text-sm mt-2">{validationErrors.image}</p>
                      )}
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-white/5 p-4">
                      <img
                        src={preview}
                        alt="معاينة المنتج"
                        className="w-full h-80 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-6 left-6 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg hover:scale-110"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                        <ImageIcon className="w-4 h-4" />
                        <span>{image?.name}</span>
                        <span className="mr-auto text-xs">
                          {(image?.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-6 md:px-8 lg:px-10 pb-6 md:pb-8 lg:pb-10">
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 text-white font-bold py-5 px-6 rounded-xl hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/40 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الإضافة...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>إضافة المنتج</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;