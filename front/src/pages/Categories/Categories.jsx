import Toast from "../../components/ui/Toast";
import useCategories from './useCategories';
import { GRID_STYLES } from "./Categoryconstants"
import PageBackground from "./Pagebackground"
import CategoryPageHeader from "./Categorypageheader"
import ProductSearchBar from "./Productsearchbar"
import CategoryFilterBar from "./Categoryfilterbar"
import ProductGrid from './ProductGrid';

/**
 * Categories page — lean orchestrator.
 *
 * All state / logic lives in `useCategories`.
 * All UI lives in the sub-components above.
 * This file just wires them together.
 */
const Categories = () => {
  const {
    categories,
    filteredProducts,
    isLoading,
    toast, setToast,
    addingIds,
    selectedCategory, setSelectedCategory,
    searchTerm, setSearchTerm,
    animateProducts,
    handleAddToCart,
    navigate,
  } = useCategories();

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div
        className="relative w-full min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-6 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
        dir="rtl"
      >
        <PageBackground />

        <div className="relative z-10 max-w-7xl mx-auto">
          <CategoryPageHeader />

          <ProductSearchBar value={searchTerm} onChange={setSearchTerm} />

          <CategoryFilterBar
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            isLoading={isLoading}
          />

          <ProductGrid
            products={filteredProducts}
            isLoading={isLoading}
            addingIds={addingIds}
            animateProducts={animateProducts}
            onAddToCart={handleAddToCart}
            onNavigate={(id) => navigate(`/product/${id}`)}
          />
        </div>

        <style>{GRID_STYLES}</style>
      </div>
    </>
  );
};

export default Categories;