// src/components/Edit.jsx - PROFESSIONAL PRODUCT EDIT
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axiosConfig';
import toast from 'react-hot-toast';
import {
  Upload,
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle,
  Box,
  Layers,
  TrendingUp,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'شوكولاتة', label: 'شوكولاتة', icon: '🍫' },
  { value: 'مكسرات', label: 'مكسرات', icon: '🥜' },
  { value: 'يامش', label: 'يامش', icon: '🍬' },
  { value: 'بسكويت', label: 'بسكويت', icon: '🍪' },
  { value: 'حلويات', label: 'حلويات', icon: '🍰' },
  { value: 'جملة', label: 'جملة', icon: '' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [preview, setPreview] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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
    image: '', // Current image URL
  });

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/product/${id}`);
        if (res.data.success) {
          const product = res.data.data;
          setData({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            category: product.category || 'شوكولاتة',
            stock: product.stock?.toString() || '0',
            brand: product.brand || '',
            isFeatured: product.isFeatured || false,
            tags: product.tags?.join(', ') || '',
            image: product.image || '',
          });
          setPreview(product.image);
        } else {
          toast.error('فشل تحميل بيانات المنتج');
          navigate('/admin/list');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('فشل تحميل بيانات المنتج');
        navigate('/admin/list');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchProduct();
    }
  }, [id, token, navigate]);

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

    setNewImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setNewImage(null);
    setPreview(data.image); // Restore original image
    const input = document.getElementById('image-upload');
    if (input) input.value = '';
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

    setUpdating(true);

    try {
      const formData = new FormData();

      // Required fields
      formData.append('name', data.name.trim());
      formData.append('description', data.description.trim());
      formData.append('category', data.category);
      formData.append('price', Number(data.price).toFixed(2));

      // Optional image (only if changed)
      if (newImage) {
        formData.append('image', newImage);
      }

      // Optional fields
      if (data.stock) {
        formData.append('stock', Number(data.stock));
      }

      if (data.brand && data.brand.trim()) {
        formData.append('brand', data.brand.trim());
      }

      formData.append('isFeatured', data.isFeatured);

      if (data.tags && data.tags.trim()) {
        const tagsArray = data.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag);
        formData.append('tags', JSON.stringify(tagsArray));
      }

      const res = await axios.put(`/product/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        toast.success('تم تحديث المنتج بنجاح! 🎉');
        navigate('/admin/list');
      } else {
        toast.error(res.data.message || 'فشل تحديث المنتج');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMsg =
        error.response?.data?.message || 'حدث خطأ أثناء تحديث المنتج';
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل بيانات المنتج...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/list')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>العودة للقائمة</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
              <Package className="w-10 h-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                تعديل المنتج
              </h1>
              <p className="text-gray-400 mt-1">قم بتحديث معلومات المنتج</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler}>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Form Content */}
            <div className="px-6 md:px-8 lg:px-10 pt-8 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    اسم المنتج <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      placeholder="مثال: شوكولاتة كادبوري"
                      value={data.name}
                      onChange={onChangeHandler}
                      className={`w-full px-4 py-4 pr-12 bg-white/10 border ${
                        validationErrors.name
                          ? 'border-red-500'
                          : 'border-white/20'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                    />
                    {validationErrors.name && (
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    وصف المنتج <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    placeholder="اكتب وصفاً تفصيلياً للمنتج..."
                    value={data.description}
                    onChange={onChangeHandler}
                    className={`w-full px-4 py-4 bg-white/10 border ${
                      validationErrors.description
                        ? 'border-red-500'
                        : 'border-white/20'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
                  />
                  {validationErrors.description && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.description}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    السعر (ج.م) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={data.price}
                      onChange={onChangeHandler}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-4 pr-12 bg-white/10 border ${
                        validationErrors.price
                          ? 'border-red-500'
                          : 'border-white/20'
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
                        <option
                          key={cat.value}
                          value={cat.value}
                          className="bg-slate-800"
                        >
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
                        validationErrors.stock
                          ? 'border-red-500'
                          : 'border-white/20'
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
                  <p className="text-xs text-gray-500 mt-2">
                    استخدم الفاصلة (,) للفصل بين الكلمات
                  </p>
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
                    صورة المنتج{' '}
                    {newImage && (
                      <span className="text-purple-400">(جديدة)</span>
                    )}
                  </label>

                  <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-white/5 p-4">
                    <img
                      src={
                        preview ||
                        'https://via.placeholder.com/400x300?text=No+Image'
                      }
                      alt="معاينة المنتج"
                      className="w-full h-80 object-cover rounded-xl"
                    />

                    <div className="absolute top-6 left-6 flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                      >
                        <Upload className="w-4 h-4" />
                        <span>تغيير الصورة</span>
                      </label>

                      {newImage && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                          <span>إلغاء</span>
                        </button>
                      )}
                    </div>

                    {newImage && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                        <ImageIcon className="w-4 h-4" />
                        <span>{newImage.name}</span>
                        <span className="mr-auto text-xs">
                          {(newImage.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      {newImage
                        ? 'سيتم استبدال الصورة الحالية'
                        : 'اضغط "تغيير الصورة" لتحديث الصورة'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 md:px-8 lg:px-10 pb-6 md:pb-8 lg:pb-10 flex gap-4">
              <button
                type="submit"
                disabled={updating}
                className="flex-1 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 text-white font-bold py-5 px-6 rounded-xl hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/40 flex items-center justify-center gap-3 text-lg"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>جاري التحديث...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>حفظ التعديلات</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/list')}
                disabled={updating}
                className="px-8 py-5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
              >
                إلغاء
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit;
