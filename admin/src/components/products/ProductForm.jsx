// src/components/products/ProductForm.jsx
import { Package, Tag, DollarSign, Box, Layers, Award, Star, Crown, CheckCircle, Loader2, AlertCircle, TrendingDown, ShoppingBag, Lock } from 'lucide-react';
import ImageUpload from '../common/ImageUpload';

const InputField = ({ label, icon: Icon, error, required, hint, children }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
      {Icon && <Icon className="w-4 h-4 text-purple-400 flex-shrink-0" />}
      <span>{label}</span>
      {required && <span className="text-red-400">*</span>}
      {hint && <span className="text-xs text-gray-500 font-normal mr-auto">{hint}</span>}
    </label>
    {children}
    {error && (
      <p className="text-red-400 text-sm font-semibold flex items-center gap-1">
        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
      </p>
    )}
  </div>
);

// ── Price Section ─────────────────────────────────────────────────────────────
const PriceSection = ({ data, errors, onChange }) => {
  const price         = Number(data.price)         || 0;
  const originalPrice = Number(data.originalPrice) || 0;
  const costPrice     = Number(data.costPrice)      || 0;

  const discountPct = originalPrice > price && originalPrice > 0
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const profitMargin = costPrice > 0
    ? Math.round(price - costPrice)
    : null;

  const profitPct = costPrice > 0 && price > 0
    ? Math.round(((price - costPrice) / costPrice) * 100)
    : null;

  return (
    <div className="md:col-span-2">
      <div className="bg-slate-800/40 border-2 border-slate-700 rounded-2xl p-6 space-y-5">
        <p className="text-sm font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-400" />
          إدارة الأسعار
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* سعر البيع الفعلي */}
          <InputField
            label="سعر البيع"
            icon={DollarSign}
            error={errors.price}
            required
            hint="ج.م — يظهر للعميل"
          >
            <div className="relative">
              <input
                type="number" name="price" value={data.price} onChange={onChange}
                placeholder="0.00" step="0.01" min="0"
                className={`w-full px-5 py-4 bg-slate-800/50 border-2 ${errors.price ? 'border-red-500' : 'border-slate-700'} rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-all pr-12`}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 font-bold text-sm">ج.م</span>
            </div>
          </InputField>

          {/* السعر قبل الخصم */}
          <InputField
            label="السعر قبل الخصم"
            icon={TrendingDown}
            error={errors.originalPrice}
            hint="ج.م — اختياري"
          >
            <div className="relative">
              <input
                type="number" name="originalPrice" value={data.originalPrice} onChange={onChange}
                placeholder="0.00" step="0.01" min="0"
                className={`w-full px-5 py-4 bg-slate-800/50 border-2 ${errors.originalPrice ? 'border-red-500' : 'border-slate-700'} rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all pr-12`}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-sm">ج.م</span>
            </div>
            <p className="text-xs text-gray-500">يظهر مشطوباً بجانب سعر البيع</p>
          </InputField>

          {/* سعر التكلفة */}
          <InputField
            label="سعر التكلفة / الاستيراد"
            icon={Lock}
            error={errors.costPrice}
            hint="سري — للأدمن فقط"
          >
            <div className="relative">
              <input
                type="number" name="costPrice" value={data.costPrice} onChange={onChange}
                placeholder="0.00" step="0.01" min="0"
                className={`w-full px-5 py-4 bg-slate-800/50 border-2 ${errors.costPrice ? 'border-red-500' : 'border-slate-700'} rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-all pr-12`}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-sm">ج.م</span>
            </div>
            <p className="text-xs text-gray-500">لا يظهر للعملاء أبداً</p>
          </InputField>
        </div>

        {/* ── Live Summary ──────────────────────────────────────────────────── */}
        {(discountPct || profitMargin !== null) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-700">
            {discountPct !== null && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">نسبة الخصم</p>
                <p className="text-xl font-black text-orange-400">{discountPct}%</p>
              </div>
            )}
            {profitMargin !== null && (
              <div className={`border rounded-xl p-3 text-center ${profitMargin >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <p className="text-xs text-gray-500 mb-1">هامش الربح</p>
                <p className={`text-xl font-black ${profitMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {profitMargin >= 0 ? '+' : ''}{profitMargin} ج.م
                </p>
              </div>
            )}
            {profitPct !== null && (
              <div className={`border rounded-xl p-3 text-center ${profitPct >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <p className="text-xs text-gray-500 mb-1">نسبة الربح</p>
                <p className={`text-xl font-black ${profitPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {profitPct >= 0 ? '+' : ''}{profitPct}%
                </p>
              </div>
            )}
            {costPrice > 0 && price > 0 && (
              <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">سعر البيع</p>
                <p className="text-xl font-black text-white">{price} <span className="text-sm">ج.م</span></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Form ─────────────────────────────────────────────────────────────────
const ProductForm = ({ data, errors, image, imagePreview, onChange, onImageChange, onImageRemove, onSubmit, onCancel, loading, isEdit = false }) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="bg-linear-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-3xl p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Name */}
        <InputField label="اسم المنتج" icon={Package} error={errors.name} required>
          <input
            type="text" name="name" value={data.name} onChange={onChange}
            placeholder="مثال: شوكولاتة كادبوري"
            className={`w-full px-5 py-4 bg-slate-800/50 border-2 ${errors.name ? 'border-red-500' : 'border-slate-700'} rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all`}
          />
        </InputField>

        {/* Brand */}
        <InputField label="العلامة التجارية" icon={Award}>
          <input
            type="text" name="brand" value={data.brand} onChange={onChange}
            placeholder="مثال: Cadbury"
            className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </InputField>

        {/* Description */}
        <div className="md:col-span-2">
          <InputField label="وصف المنتج" icon={Tag} error={errors.description} required>
            <textarea
              name="description" value={data.description} onChange={onChange}
              placeholder="اكتب وصفاً تفصيلياً للمنتج..." rows={4}
              className={`w-full px-5 py-4 bg-slate-800/50 border-2 ${errors.description ? 'border-red-500' : 'border-slate-700'} rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-all resize-none`}
            />
          </InputField>
        </div>

        {/* ✅ 3 أسعار في قسم واحد */}
        <PriceSection data={data} errors={errors} onChange={onChange} />

        {/* Stock */}
        <InputField label="الكمية المتاحة" icon={Box} error={errors.stock}>
          <input
            type="number" name="stock" value={data.stock} onChange={onChange}
            placeholder="0" min="0"
            className={`w-full px-5 py-4 bg-slate-800/50 border-2 ${errors.stock ? 'border-red-500' : 'border-slate-700'} rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all`}
          />
        </InputField>

        {/* Category */}
        <InputField label="الفئة" icon={Layers} required>
          <input
            type="text" name="category" value={data.category} onChange={onChange}
            placeholder="مثال: حلويات، مشروبات..."
            className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </InputField>

        {/* Tags */}
        <div className="md:col-span-2">
          <InputField label="الكلمات المفتاحية">
            <input
              type="text" name="tags" value={data.tags} onChange={onChange}
              placeholder="مثال: حلو, لذيذ, مستورد (افصل بفاصلة)"
              className="w-full px-5 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-all"
            />
          </InputField>
        </div>

        {/* Featured */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-4 p-5 bg-slate-800/30 border-2 border-slate-700 hover:border-yellow-500/50 rounded-2xl cursor-pointer transition-all group">
            <input
              type="checkbox" name="isFeatured" checked={data.isFeatured} onChange={onChange}
              className="w-6 h-6 rounded-lg accent-yellow-500 cursor-pointer"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-linear-to-br from-yellow-500 to-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">منتج مميز</p>
                <p className="text-sm text-gray-400">يظهر في الصفحة الرئيسية للمتجر</p>
              </div>
            </div>
            {data.isFeatured && <Crown className="w-6 h-6 text-yellow-400 animate-bounce" />}
          </label>
        </div>

        {/* Image */}
        <div className="md:col-span-2">
          <ImageUpload
            preview={imagePreview}
            onImageChange={onImageChange}
            onRemove={onImageRemove}
            error={errors.image}
            isEditMode={isEdit}
          />
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="flex justify-end gap-4">
      <button type="button" onClick={onCancel}
        className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border-2 border-slate-700 hover:border-slate-600 text-white rounded-2xl font-bold transition-all">
        إلغاء
      </button>
      <button type="submit" disabled={loading}
        className="px-12 py-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3">
        {loading ? (
          <><Loader2 className="w-6 h-6 animate-spin" /><span>جارٍ...</span></>
        ) : (
          <><CheckCircle className="w-6 h-6" /><span>{isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}</span></>
        )}
      </button>
    </div>
  </form>
);

export default ProductForm;