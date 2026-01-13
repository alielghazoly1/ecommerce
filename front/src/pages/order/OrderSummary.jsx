const OrderSummary = ({ items, url, onEdit }) => {
  if (!items.length)
    return <p className="text-center py-10 text-gray-500">السلة فارغة</p>;

  return (
    <div className="bg-white rounded-xl p-5 shadow">
      <h3 className="text-lg font-bold mb-4">مراجعة الطلب</h3>

      <ul className="divide-y">
        {items.map((p) => (
          <li key={p._id} className="flex gap-4 py-4">
            <img
              src={`${url}/images/${p.image}`}
              className="w-16 h-16 object-contain"
              alt={p.name}
            />
            <div className="flex-1">
              <h4 className="font-semibold">{p.name}</h4>
              <p className="text-sm text-gray-500">
                الكمية: {p.quantity}
              </p>
            </div>
            <button
              onClick={onEdit}
              className="text-sm text-cyan-600"
            >
              تعديل
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderSummary;
