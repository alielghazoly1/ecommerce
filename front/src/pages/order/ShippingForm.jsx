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
      <h3 className="text-xl font-semibold mb-2">بيانات الشحن</h3>

      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          العنوان <span className="text-red-500">*</span>
        </label>
        <input
          value={shipping.street}
          onChange={(e) => updateShipping('street', e.target.value)}
          placeholder="مثال: 15 شارع النيل، الدور الثالث"
          className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
            errors.street
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-300 focus:border-cyan-500'
          } focus:outline-none focus:ring-2 focus:ring-cyan-200`}
        />
        {errors.street && (
          <span className="text-xs text-red-500 mt-1 block">
            {errors.street}
          </span>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          المدينة <span className="text-red-500">*</span>
        </label>
        <input
          value={shipping.city}
          onChange={(e) => updateShipping('city', e.target.value)}
          placeholder="مثال: القاهرة"
          className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
            errors.city
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-300 focus:border-cyan-500'
          } focus:outline-none focus:ring-2 focus:ring-cyan-200`}
        />
        {errors.city && (
          <span className="text-xs text-red-500 mt-1 block">{errors.city}</span>
        )}
      </div>

      {/* State (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          المحافظة (اختياري)
        </label>
        <input
          value={shipping.state}
          onChange={(e) => updateShipping('state', e.target.value)}
          placeholder="مثال: القاهرة"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition-colors"
        />
      </div>

      {/* Zip Code (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الرمز البريدي (اختياري)
        </label>
        <input
          value={shipping.zipCode}
          onChange={(e) => updateShipping('zipCode', e.target.value)}
          placeholder="مثال: 11511"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition-colors"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          رقم الهاتف <span className="text-red-500">*</span>
        </label>
        <input
          value={shipping.phone}
          onChange={(e) => updateShipping('phone', e.target.value)}
          placeholder="مثال: 01012345678"
          type="tel"
          className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
            errors.phone
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-300 focus:border-cyan-500'
          } focus:outline-none focus:ring-2 focus:ring-cyan-200`}
        />
        {errors.phone && (
          <span className="text-xs text-red-500 mt-1 block">
            {errors.phone}
          </span>
        )}
      </div>

      <hr className="my-2" />

      {/* Shipping Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          طريقة الشحن
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setShippingMethod('standard')}
            className={`py-3 px-4 rounded-lg border-2 transition-all font-medium ${
              shippingMethod === 'standard'
                ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">عادي</div>
              <div className="text-xs mt-1">20 ج.م</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShippingMethod('express')}
            className={`py-3 px-4 rounded-lg border-2 transition-all font-medium ${
              shippingMethod === 'express'
                ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">سريع</div>
              <div className="text-xs mt-1">50 ج.م</div>
            </div>
          </button>
        </div>
      </div>

      {/* Coupon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          كود الخصم (اختياري)
        </label>
        <div className="flex gap-2">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="مثال: TAWA10"
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition-colors uppercase"
          />
          <button
            type="button"
            onClick={applyCoupon}
            disabled={!coupon.trim()}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
              coupon.trim()
                ? 'bg-gray-800 text-white hover:bg-gray-900'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            تطبيق
          </button>
        </div>
      </div>

      <hr className="my-2" />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !cartProducts.length}
        className={`mt-2 flex items-center justify-center gap-2 py-3.5 rounded-lg text-white font-bold text-lg transition-all ${
          loading || !cartProducts.length
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-cyan-600 hover:bg-cyan-700 hover:shadow-lg active:scale-[0.98]'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-5 h-5" />
            <span>جارٍ إنشاء الطلب...</span>
          </>
        ) : (
          <>
            <span>تأكيد الطلب</span>
            <span className="text-sm opacity-90">(الدفع عند الاستلام)</span>
          </>
        )}
      </button>

      {/* Back to Cart */}
      <button
        type="button"
        onClick={() => navigate('/cart')}
        className="text-sm text-gray-600 hover:text-gray-800 mt-1 transition-colors"
      >
        ← العودة للسلة
      </button>
    </form>
  );
};

export default ShippingForm;