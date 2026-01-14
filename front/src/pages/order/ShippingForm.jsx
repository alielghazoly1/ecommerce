import { Loader2 } from 'lucide-react';

const ShippingForm = ({
  shipping,
  errors,
  updateShipping,
  shippingMethod,
  setShippingMethod,
  coupon,
  setCoupon,
  applyCoupon,
  loading,
  onSubmit,
  navigate,
  cartProducts,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold">بيانات الشحن</h3>

      {/* Name */}
      <input
        value={shipping.name}
        onChange={(e) => updateShipping('name', e.target.value)}
        placeholder="الاسم الكامل"
        className={`px-4 py-2 rounded-lg border ${
          errors.name ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {errors.name && (
        <span className="text-xs text-red-500">{errors.name}</span>
      )}

      {/* Address */}
      <input
        value={shipping.address}
        onChange={(e) => updateShipping('address', e.target.value)}
        placeholder="العنوان"
        className={`px-4 py-2 rounded-lg border ${
          errors.address ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {errors.address && (
        <span className="text-xs text-red-500">{errors.address}</span>
      )}

      {/* City */}
      <input
        value={shipping.city}
        onChange={(e) => updateShipping('city', e.target.value)}
        placeholder="المدينة"
        className={`px-4 py-2 rounded-lg border ${
          errors.city ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {errors.city && (
        <span className="text-xs text-red-500">{errors.city}</span>
      )}

      {/* Phone */}
      <input
        value={shipping.phone}
        onChange={(e) => updateShipping('phone', e.target.value)}
        placeholder="رقم الهاتف"
        className={`px-4 py-2 rounded-lg border ${
          errors.phone ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {errors.phone && (
        <span className="text-xs text-red-500">{errors.phone}</span>
      )}

      {/* Shipping Method */}
      <div>
        <p className="text-sm font-medium mb-2">طريقة الشحن</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShippingMethod('standard')}
            className={`flex-1 py-2 rounded-lg border ${
              shippingMethod === 'standard'
                ? 'border-cyan-600 bg-cyan-50'
                : 'border-gray-200'
            }`}
          >
            عادي
          </button>
          <button
            type="button"
            onClick={() => setShippingMethod('express')}
            className={`flex-1 py-2 rounded-lg border ${
              shippingMethod === 'express'
                ? 'border-cyan-600 bg-cyan-50'
                : 'border-gray-200'
            }`}
          >
            سريع
          </button>
        </div>
      </div>

      {/* Coupon */}
      <div>
        <p className="text-sm font-medium mb-2">كود الخصم (اختياري)</p>
        <div className="flex gap-2">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="ادخل الكوبون"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={applyCoupon}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg"
          >
            تطبيق
          </button>
        </div>
      </div>

      {/* Actions */}
      <button
        type="submit"
        disabled={loading || !cartProducts.length}
        className={`mt-4 flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold ${
          loading
            ? 'bg-gray-400 cursor-wait'
            : 'bg-cyan-600 hover:bg-cyan-700'
        }`}
      >
        {loading && <Loader2 className="animate-spin w-5 h-5" />}
        {loading ? 'جارٍ إنشاء الطلب...' : 'تأكيد وادفع'}
      </button>

      <button
        type="button"
        onClick={() => navigate('/cart')}
        className="text-sm text-gray-600 mt-2"
      >
        العودة للسلة
      </button>
    </form>
  );
};

export default ShippingForm;
