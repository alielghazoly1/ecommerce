import { Loader2 } from 'lucide-react';
import LocationPicker from '../../components/Locationpicker';

const ShippingForm = ({
  shipping,
  errors,
  updateShipping,
  loading,
  onSubmit,
  navigate,
  cartProducts,
  location,
  onLocationChange,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold mb-2">بيانات الشحن</h3>

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

      <LocationPicker
        value={location}
        onChange={onLocationChange}
        disabled={false}
      />

      {/* ✅ ملاحظة الشحن */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center gap-2">
        <span className="text-lg">🚚</span>
        <div>
          <p className="text-sm font-semibold text-orange-700">
            مصاريف الشحن: 60 ج
          </p>
          <p className="text-xs text-orange-600">
            توصيل لباب البيت في كل المحافظات
          </p>
        </div>
      </div>

      <hr className="my-1" />

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
