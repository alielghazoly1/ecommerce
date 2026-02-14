// 🔥 Product Details Skeleton Component
import { ChevronLeft } from 'lucide-react';
import CardSkeleton from '../../components/ui/CardSkeleton';
const ProductDetailsSkeleton = () => {
  return (
    <section className="min-h-screen py-8 md:py-12 px-4 bg-linear-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <ChevronLeft className="w-4 h-4 text-gray-300" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          <ChevronLeft className="w-4 h-4 text-gray-300" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* LEFT: Gallery Skeleton */}
          <div className="p-6 lg:p-8">
            {/* Main Image Skeleton */}
            <div className="w-full aspect-square bg-gray-200 rounded-2xl animate-pulse mb-4"></div>
          </div>

          {/* RIGHT: Details Skeleton */}
          <div className="p-6 lg:p-8">
            {/* Title */}
            <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-pulse mb-4"></div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4 mb-6">
              <div className="h-16 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-16 flex-1 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-12">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton
                key={i}
                width={200}
                height={280}
                imageHeight={140}
                radius={12}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default ProductDetailsSkeleton;