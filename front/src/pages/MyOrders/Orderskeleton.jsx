const OrderSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 animate-pulse space-y-4">
    <div className="flex justify-between">
      <div className="space-y-1.5">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-5 bg-gray-200 rounded w-36" />
      </div>
      <div className="h-7 bg-gray-100 rounded-full w-24" />
    </div>
    <div className="flex gap-2 mt-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-8 h-8 bg-gray-100 rounded-full" />
          <div className="h-2 bg-gray-100 rounded w-8" />
        </div>
      ))}
    </div>
    <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-14 h-14 bg-gray-200 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
    <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
      <div className="h-3 bg-gray-100 rounded w-12" />
      <div className="h-7 bg-gray-200 rounded w-28" />
    </div>
  </div>
);

export default OrderSkeleton;