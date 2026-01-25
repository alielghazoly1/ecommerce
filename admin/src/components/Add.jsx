// src/components/Add.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { Upload, Package, DollarSign, Tag } from 'lucide-react';

const Add = () => {
  const { token, isAuthenticated } = useAuth();
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'شوكولاتة',
  });

  // التحقق من وجود Token
  useEffect(() => {
    if (!token || !isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
    }
  }, [token, isAuthenticated]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // التحقق من حجم الصورة (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('حجم الصورة كبير جداً. الحد الأقصى 5MB');
        return;
      }

      // التحقق من نوع الصورة
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('نوع الصورة غير مدعوم. يرجى اختيار JPG, PNG, GIF أو WebP');
        return;
      }

      setImage(file);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // التحقق من Token
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);

    try {
      // التحقق من البيانات
      if (!data.name.trim() || !data.description.trim() || !data.price) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }

      // التحقق من وجود الصورة
      if (!image) {
        toast.error('يرجى اختيار صورة للمنتج');
        setLoading(false);
        return;
      }

      // التحقق من السعر
      const price = Number(data.price);
      if (isNaN(price) || price <= 0) {
        toast.error('يرجى إدخال سعر صحيح');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('description', data.description.trim());
      formData.append('category', data.category);
      formData.append('price', price.toString());
      formData.append('image', image);

      // إرسال الطلب مع Token (سيُضاف تلقائياً من axios interceptor)
      const res = await axios.post('/product/add', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // لا نضيف Content-Type لأن axios سيضيفه تلقائياً مع boundary
        }
      });

      if (res.data.success) {
        // Reset form
        setData({ name: '', description: '', price: '', category: 'شوكولاتة' });
        setImage(null);
        setPreview(null);
        toast.success('تم إضافة المنتج بنجاح! 🎉');
      } else {
        toast.error(res.data.message || 'فشل إضافة المنتج');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'حدث خطأ أثناء إضافة المنتج';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Image preview
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-400" />
            إضافة منتج جديد
          </h1>
          <p className="text-gray-400">أضف منتجاً جديداً إلى المتجر</p>
        </div>

        {/* Form Card */}
        <form onSubmit={onSubmitHandler} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                اسم المنتج <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  placeholder="مثال: شوكولاتة كيت كات"
                  value={data.name}
                  onChange={onChangeHandler}
                  required
                  className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الوصف <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                placeholder="وصف تفصيلي للمنتج..."
                value={data.description}
                onChange={onChangeHandler}
                required
                rows="3"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                السعر (جنيه) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  name="price"
                  placeholder="99.99"
                  value={data.price}
                  onChange={onChangeHandler}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الفئة <span className="text-red-400">*</span>
              </label>
              <select
                name="category"
                value={data.category}
                onChange={onChangeHandler}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none cursor-pointer"
              >
                <option value="شوكولاتة" className="bg-slate-800">شوكولاتة</option>
                <option value="مكسرات" className="bg-slate-800">مكسرات</option>
                <option value="ياميش" className="bg-slate-800">ياميش</option>
              </select>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                صورة المنتج <span className="text-red-400">*</span>
              </label>
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
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-purple-500 hover:text-purple-400 transition cursor-pointer group"
                >
                  <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">
                    {image ? image.name : 'اختر صورة المنتج (حد أقصى 5MB)'}
                  </span>
                </label>
              </div>
              {!image && (
                <p className="text-xs text-gray-500 mt-2">الصيغ المدعومة: JPG, PNG, GIF, WebP</p>
              )}
            </div>

            {/* Image Preview */}
            {preview && (
              <div className="md:col-span-2">
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 p-4">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreview(null);
                    }}
                    className="absolute top-6 left-6 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                  >
                    حذف
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الإضافة...</span>
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
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