// src/components/Add.jsx - ULTRA PROFESSIONAL VERSION 🚀
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { 
  Upload, Package, DollarSign, Tag, Image as ImageIcon, 
  X, CheckCircle, Box, Layers, TrendingUp, Sparkles,
  AlertCircle, Info, Star, Zap, Award, Crown
} from 'lucide-react';
import FormField from './common/FormField';

const CATEGORIES = [
  { value: 'شوكولاتة', label: 'شوكولاتة', icon: '🍫', gradient: 'from-amber-500 to-orange-600' },
  { value: 'مكسرات', label: 'مكسرات', icon: '🥜', gradient: 'from-yellow-500 to-amber-600' },
  { value: 'يامش', label: 'يامش', icon: '🍬', gradient: 'from-pink-500 to-rose-600' },
  { value: 'بسكويت', label: 'بسكويت', icon: '🍪', gradient: 'from-orange-500 to-red-600' },
  { value: 'حلويات', label: 'حلويات', icon: '🍰', gradient: 'from-purple-500 to-pink-600' },
  { value: 'جملة', label: 'جملة', icon: '📦', gradient: 'from-blue-500 to-cyan-600' },
];

const Add = () => {
  const { isAuthenticated } = useAuth();
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
    }
  }, [isAuthenticated]);

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'name':
        if (!value.trim()) errors.name = 'اسم المنتج مطلوب';
        else if (value.trim().length < 3) errors.name = 'اسم المنتج يجب أن يكون 3 أحرف على الأقل';
        break;
      case 'description':
        if (!value.trim()) errors.description = 'وصف المنتج مطلوب';
        else if (value.trim().length < 10) errors.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
        break;
      case 'price':
        if (!value) errors.price = 'السعر مطلوب';
        else if (parseFloat(value) <= 0) errors.price = 'السعر يجب أن يكون أكبر من صفر';
        break;
      case 'stock':
        if (value !== '' && parseFloat(value) < 0) errors.stock = 'الكمية لا يمكن أن تكون سالبة';
        break;
    }
    
    return errors;
  };

  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setData((prev) => ({ ...prev, [name]: fieldValue }));

    // Real-time validation
    const errors = validateField(name, fieldValue);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (Object.keys(errors).length === 0) {
        delete newErrors[name];
      } else {
        Object.assign(newErrors, errors);
      }
      return newErrors;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const processImageFile = (file) => {
    // Validate image
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('نوع الملف غير مدعوم. استخدم JPG, PNG, GIF, أو WebP');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 5MB');
      return;
    }

    setImage(file);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });

    // Create preview with progress simulation
    const reader = new FileReader();
    reader.onloadstart = () => setUploadProgress(0);
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress((e.loaded / e.total) * 100);
      }
    };
    reader.onloadend = () => {
      setPreview(reader.result);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    };
    reader.readAsDataURL(file);
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    setUploadProgress(0);
    const input = document.getElementById('image-upload');
    if (input) input.value = '';
    toast.success('تم حذف الصورة');
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate all fields
    const allErrors = {};
    Object.keys(data).forEach(key => {
      const errors = validateField(key, data[key]);
      Object.assign(allErrors, errors);
    });
    
    if (!image) {
      allErrors.image = 'يرجى اختيار صورة للمنتج';
    }

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      toast.error('يرجى تصحيح الأخطاء قبل المتابعة');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('description', data.description.trim());
      formData.append('price', data.price);
      formData.append('category', data.category);
      formData.append('stock', data.stock || '0');
      formData.append('brand', data.brand.trim());
      formData.append('isFeatured', data.isFeatured);
      if (data.tags) {
        formData.append('tags', data.tags);
      }
      formData.append('image', image);

      const res = await axios.post('/product/add', formData);

      if (res.data.success) {
        // Success animation
        toast.success('✨ تم إضافة المنتج بنجاح!', {
          duration: 4000,
          icon: '🎉',
        });
        
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
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 p-4 md:p-6 lg:p-10">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-slideDown">
          <div className="relative inline-block">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
            
            <div className="relative flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl shadow-purple-500/50 animate-pulse">
                <Package className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-2">
                  إضافة منتج جديد
                </h1>
                <p className="text-gray-400 text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  املأ البيانات بعناية لإضافة منتج مميز
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={onSubmitHandler} className="space-y-8">
          {/* Basic Info Card */}
          <div className="group relative animate-slideUp">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl"></div>
            
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-2xl border border-slate-700 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">المعلومات الأساسية</h2>
                  <p className="text-sm text-gray-400 font-semibold">بيانات المنتج الرئيسية</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    اسم المنتج <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={onChangeHandler}
                    placeholder="مثال: شوكولاتة كادبوري"
                    className={`w-full px-5 py-4 bg-slate-800/50 border-2 ${
                      validationErrors.name ? 'border-red-500' : 'border-slate-700'
                    } rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all duration-300 font-semibold`}
                  />
                  {validationErrors.name && (
                    <p className="text-red-400 text-sm font-semibold flex items-center gap-1 mt-2">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    العلامة التجارية
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={data.brand}
                    onChange={onChangeHandler}
                    placeholder="مثال: Cadbury"
                    className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all duration-300 font-semibold"
                  />
                </div>

                {/* Description - Full Width */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-pink-400" />
                    وصف المنتج <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={data.description}
                    onChange={onChangeHandler}
                    placeholder="اكتب وصفاً تفصيلياً للمنتج..."
                    rows={5}
                    className={`w-full px-5 py-4 bg-slate-800/50 border-2 ${
                      validationErrors.description ? 'border-red-500' : 'border-slate-700'
                    } rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-all duration-300 font-semibold resize-none`}
                  />
                  {validationErrors.description && (
                    <p className="text-red-400 text-sm font-semibold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Category Card */}
          <div className="group relative animate-slideUp" style={{ animationDelay: '100ms' }}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl"></div>
            
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-2xl border border-slate-700 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">التسعير والتصنيف</h2>
                  <p className="text-sm text-gray-400 font-semibold">السعر والفئة والمخزون</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    السعر (ج.م) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={data.price}
                    onChange={onChangeHandler}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full px-5 py-4 bg-slate-800/50 border-2 ${
                      validationErrors.price ? 'border-red-500' : 'border-slate-700'
                    } rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all duration-300 font-semibold`}
                  />
                  {validationErrors.price && (
                    <p className="text-red-400 text-sm font-semibold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.price}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                    <Box className="w-4 h-4 text-blue-400" />
                    الكمية المتاحة
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={data.stock}
                    onChange={onChangeHandler}
                    placeholder="0"
                    min="0"
                    className={`w-full px-5 py-4 bg-slate-800/50 border-2 ${
                      validationErrors.stock ? 'border-red-500' : 'border-slate-700'
                    } rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all duration-300 font-semibold`}
                  />
                  {validationErrors.stock && (
                    <p className="text-red-400 text-sm font-semibold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.stock}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    الفئة <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={data.category}
                    onChange={onChangeHandler}
                    className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-white focus:outline-none focus:border-purple-500 transition-all duration-300 font-semibold appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'left 1rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags - Full Width */}
                <div className="md:col-span-3 space-y-2">
                  <label className="block text-sm font-bold text-gray-300 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-yellow-400" />
                    الكلمات المفتاحية
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={data.tags}
                    onChange={onChangeHandler}
                    placeholder="مثال: حلو, لذيذ, مستورد (افصل بفاصلة)"
                    className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-all duration-300 font-semibold"
                  />
                  <p className="text-xs text-gray-500 font-semibold mt-2">استخدم الفاصلة (,) للفصل بين الكلمات</p>
                </div>

                {/* Featured Toggle */}
                <div className="md:col-span-3">
                  <label className="flex items-center gap-4 p-5 bg-slate-800/30 border-2 border-slate-700 hover:border-yellow-500/50 rounded-2xl cursor-pointer transition-all duration-300 group">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={data.isFeatured}
                      onChange={onChangeHandler}
                      className="w-6 h-6 rounded-lg accent-yellow-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">منتج مميز</p>
                        <p className="text-sm text-gray-400 font-semibold">يظهر في الصفحة الرئيسية للمتجر</p>
                      </div>
                    </div>
                    {data.isFeatured && (
                      <Crown className="w-6 h-6 text-yellow-400 animate-bounce" />
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Card */}
          <div className="group relative animate-slideUp" style={{ animationDelay: '200ms' }}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl"></div>
            
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-2xl border border-slate-700 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">صورة المنتج</h2>
                  <p className="text-sm text-gray-400 font-semibold">اختر صورة عالية الجودة للمنتج</p>
                </div>
              </div>

              {!preview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="relative"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`group/upload flex flex-col items-center justify-center gap-6 px-8 py-16 bg-slate-800/30 border-2 border-dashed ${
                      isDragging ? 'border-cyan-500 bg-cyan-500/10' : 
                      validationErrors.image ? 'border-red-500' : 'border-slate-600'
                    } rounded-3xl hover:border-cyan-500 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer`}
                  >
                    <div className="relative">
                      <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl group-hover/upload:scale-110 transition-transform duration-300">
                        <Upload className="w-16 h-16 text-cyan-400" />
                      </div>
                      {isDragging && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Zap className="w-12 h-12 text-yellow-400 animate-bounce" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center space-y-3">
                      <p className="text-2xl font-black text-white">
                        {isDragging ? 'أفلت الصورة هنا' : 'اضغط لاختيار صورة'}
                      </p>
                      <p className="text-base text-gray-400 font-semibold">
                        أو اسحب وأفلت الصورة هنا
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-4">
                        <div className="px-4 py-2 bg-slate-700/50 rounded-xl">
                          <p className="text-sm text-gray-400 font-bold">JPG</p>
                        </div>
                        <div className="px-4 py-2 bg-slate-700/50 rounded-xl">
                          <p className="text-sm text-gray-400 font-bold">PNG</p>
                        </div>
                        <div className="px-4 py-2 bg-slate-700/50 rounded-xl">
                          <p className="text-sm text-gray-400 font-bold">WebP</p>
                        </div>
                        <div className="px-4 py-2 bg-slate-700/50 rounded-xl">
                          <p className="text-sm text-gray-400 font-bold">Max 5MB</p>
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  {validationErrors.image && (
                    <p className="text-red-400 text-sm font-semibold flex items-center gap-2 mt-4">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.image}
                    </p>
                  )}
                </div>
              ) : (
                <div className="relative group/preview">
                  <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-800/30 p-6">
                    <img
                      src={preview}
                      alt="معاينة المنتج"
                      className="w-full h-96 object-contain rounded-2xl"
                    />
                    
                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                        <div className="text-center space-y-4">
                          <div className="w-32 h-32 relative">
                            <svg className="w-32 h-32 transform -rotate-90">
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-slate-700"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 56}`}
                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - uploadProgress / 100)}`}
                                className="text-cyan-500 transition-all duration-300"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-black text-white">{Math.round(uploadProgress)}%</span>
                            </div>
                          </div>
                          <p className="text-gray-300 font-bold">جاري التحميل...</p>
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-8 left-8 p-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-all duration-300 shadow-xl hover:scale-110 group-hover/preview:scale-100 scale-0"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    {/* Image Info */}
                    <div className="mt-6 flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-xl">
                          <ImageIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{image?.name}</p>
                          <p className="text-xs text-gray-400 font-semibold">
                            {(image?.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 animate-slideUp" style={{ animationDelay: '300ms' }}>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border-2 border-slate-700 hover:border-slate-600 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105"
            >
              إلغاء
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="group/submit relative px-12 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:via-purple-600 hover:to-pink-500 text-white rounded-2xl font-black text-lg transition-all duration-300 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover/submit:opacity-30 transition-opacity"></div>
              
              <div className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الإضافة...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>إضافة المنتج</span>
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-30px, 30px) rotate(240deg); }
        }

        .animate-float {
          animation: float 15s ease-in-out infinite;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.8s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Add;