// src/components/Add.jsx - COMPLETE PROFESSIONAL VERSION
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { 
  Upload, Package, DollarSign, Tag, Image as ImageIcon, 
  X, AlertCircle, CheckCircle, Box, Layers, TrendingUp 
} from 'lucide-react';

const CATEGORIES = [
  { value: 'شوكولاتة', label: 'شوكولاتة', icon: '🍫' },
  { value: 'مكسرات', label: 'مكسرات', icon: '🥜' },
  { value: 'يامش', label: 'يامش', icon: '🍬' },
  { value: 'بسكويت', label: 'بسكويت', icon: '🍪' },
  { value: 'حلويات', label: 'حلويات', icon: '🍰' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

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

  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'اسم المنتج مطلوب';
        } else if (value.trim().length < 3) {
          errors.name = 'اسم المنتج يجب أن يكون 3 أحرف على الأقل';
        } else if (value.trim().length > 100) {
          errors.name = 'اسم المنتج يجب ألا يتجاوز 100 حرف';
        }
        break;

      case 'description':
        if (!value.trim()) {
          errors.description = 'الوصف مطلوب';
        } else if (value.trim().length < 10) {
          errors.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
        } else if (value.trim().length > 2000) {
          errors.description = 'الوصف يجب ألا يتجاوز 2000 حرف';
        }
        break;

      case 'price':
        const price = Number(value);
        if (!value) {
          errors.price = 'السعر مطلوب';
        } else if (isNaN(price) || price <= 0) {
          errors.price = 'السعر يجب أن يكون رقماً موجباً';
        } else if (price > 999999) {
          errors.price = 'السعر مرتفع جداً';
        }
        break;

      case 'stock':
        const stock = Number(value);
        if (value !== '' && (isNaN(stock) || stock < 0)) {
          errors.stock = 'الكمية يجب أن تكون رقماً موجباً';
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setData((prev) => ({ ...prev, [name]: fieldValue }));

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    if (type !== 'checkbox') {
      const fieldErrors = validateField(name, value);
      if (Object.keys(fieldErrors).length > 0) {
        setValidationErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    }
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 5MB');
      e.target.value = '';
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('نوع الصورة غير مدعوم. JPG, PNG, GIF, WebP فقط');
      e.target.value = '';
      return;
    }

    setImage(file);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });
  };

  const validateAllFields = () => {
    const errors = {};

    const nameErrors = validateField('name', data.name);
    Object.assign(errors, nameErrors);

    const descErrors = validateField('description', data.description);
    Object.assign(errors, descErrors);

    const priceErrors = validateField('price', data.price);
    Object.assign(errors, priceErrors);

    const stockErrors = validateField('stock', data.stock);
    Object.assign(errors, stockErrors);

    if (!image) {
      errors.image = 'يرجى اختيار صورة للمنتج';
    }

    return errors;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    const errors = validateAllFields();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('يرجى تصحيح الأخطاء قبل المتابعة');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      // Required fields
      formData.append('name', data.name.trim());
      formData.append('description', data.description.trim());
      formData.append('category', data.category);
      formData.append('price', Number(data.price).toFixed(2));
      formData.append('image', image);
      
      // Optional fields
      if (data.stock) {
        formData.append('stock', Number(data.stock));
      }
      
      if (data.brand && data.brand.trim()) {
        formData.append('brand', data.brand.trim());
      }
      
      formData.append('isFeatured', data.isFeatured);
      
      if (data.tags && data.tags.trim()) {
        const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formData.append('tags', JSON.stringify(tagsArray));
      }

      const res = await axios.post('/product/add', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
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
        
        toast.success('تم إضافة المنتج بنجاح! 🎉');
      } else {
        toast.error(res.data.message || 'فشل إضافة المنتج');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'حدث خطأ أثناء إضافة المنتج';
      toast.error(message);
      console.error('Add product error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    const input = document.getElementById('image-upload');
    if (input) input.value = '';
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-right">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
              <Package className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              إضافة منتج جديد
            </h1>
          </div>
          <p className="text-gray-400 text-lg">أضف منتجاً جديداً إلى المتجر بكل سهولة</p>
        </div>

        {/* Form Card */}
        <form onSubmit={onSubmitHandler} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  اسم المنتج <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    placeholder="مثال: شوكولاتة كيت كات"
                    value={data.name}
                    onChange={onChangeHandler}
                    className={`w-full px-4 py-4 pr-12 bg-white/10 border ${
                      validationErrors.name ? 'border-red-500' : 'border-white/20'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  />
                  {validationErrors.name && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.name}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {data.name.length}/100 حرف
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  الوصف <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="وصف تفصيلي للمنتج..."
                  value={data.description}
                  onChange={onChangeHandler}
                  rows="4"
                  className={`w-full px-4 py-4 bg-white/10 border ${
                    validationErrors.description ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
                />
                {validationErrors.description && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.description}</span>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  {data.description.length}/2000 حرف
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  السعر (جنيه) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    name="price"
                    placeholder="99.99"
                    value={data.price}
                    onChange={onChangeHandler}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-4 pr-12 bg-white/10 border ${
                      validationErrors.price ? 'border-red-500' : 'border-white/20'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  />
                  {validationErrors.price && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.price}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  الفئة <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  <select
                    name="category"
                    value={data.category}
                    onChange={onChangeHandler}
                    className="w-full px-4 py-4 pr-12 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-slate-800">
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  الكمية المتاحة
                </label>
                <div className="relative">
                  <Box className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    name="stock"
                    placeholder="0"
                    value={data.stock}
                    onChange={onChangeHandler}
                    min="0"
                    className={`w-full px-4 py-4 pr-12 bg-white/10 border ${
                      validationErrors.stock ? 'border-red-500' : 'border-white/20'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  />
                  {validationErrors.stock && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.stock}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  العلامة التجارية
                </label>
                <div className="relative">
                  <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="brand"
                    placeholder="مثال: Cadbury"
                    value={data.brand}
                    onChange={onChangeHandler}
                    className="w-full px-4 py-4 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  الكلمات المفتاحية (افصل بفاصلة)
                </label>
                <input
                  type="text"
                  name="tags"
                  placeholder="مثال: حلو, لذيذ, مستورد"
                  value={data.tags}
                  onChange={onChangeHandler}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">استخدم الفاصلة (,) للفصل بين الكلمات</p>
              </div>

              {/* Featured */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={data.isFeatured}
                    onChange={onChangeHandler}
                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                    منتج مميز (يظهر في الصفحة الرئيسية)
                  </span>
                </label>
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
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.image}</span>
                      </div>
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
              className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 text-white font-bold py-5 px-6 rounded-xl hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/40 flex items-center justify-center gap-3 text-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative flex items-center gap-3">
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
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;