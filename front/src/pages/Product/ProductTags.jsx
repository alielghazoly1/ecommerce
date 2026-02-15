const ProductTags = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="mt-4 lg:mt-6">
      <div className="text-xs lg:text-sm font-semibold text-gray-700 mb-2">
        الوسوم:
      </div>
      <div className="flex flex-wrap gap-1.5 lg:gap-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="px-2.5 lg:px-3 py-1 bg-gray-100 text-gray-700 text-[10px] lg:text-xs rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProductTags;