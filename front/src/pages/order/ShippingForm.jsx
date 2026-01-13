const ShippingForm = ({
  data,
  errors,
  onChange,
  onSubmit,
  loading,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl p-5 shadow space-y-3"
    >
      <h3 className="text-lg font-bold mb-2">بيانات الشحن</h3>

      {['name', 'address', 'city', 'phone'].map((f) => (
        <input
          key={f}
          value={data[f]}
          onChange={(e) => onChange(f, e.target.value)}
          placeholder={f}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors[f] ? 'border-red-400' : 'border-gray-200'
          }`}
        />
      ))}

      <button
        disabled={loading}
        className="w-full py-3 bg-cyan-600 text-white rounded-lg"
      >
        {loading ? 'جاري التنفيذ...' : 'تأكيد الطلب'}
      </button>
    </form>
  );
};

export default ShippingForm;
