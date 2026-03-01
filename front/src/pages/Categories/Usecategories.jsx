import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useCartActions, useAllProducts } from "../../store/selectors"
import { TOAST_DURATION } from "./Categoryconstants"

/**
 * Encapsulates all state + business logic for the Categories page.
 * Components stay pure-UI; they just call what this hook exposes.
 */
const useCategories = () => {
  const navigate            = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart }       = useCartActions();
  const allProducts         = useAllProducts();

  const [toast,            setToast]           = useState(null);
  const [addingIds,        setAddingIds]        = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm,       setSearchTerm]       = useState('');
  const [debouncedSearch,  setDebouncedSearch]  = useState('');
  const [animateProducts,  setAnimateProducts]  = useState(false);

  const debounceRef  = useRef(null);
  const navTimerRef  = useRef(null);   // FIX 1 — track navigate timeout for cleanup
  const mountedRef   = useRef(true);   // FIX 2 — prevent setState after unmount

  // ── Cleanup on unmount (FIX 2) ────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // FIX 1 — cancel pending navigation so it doesn't fire after unmount
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  // ── Debounce search input ──────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setDebouncedSearch(searchTerm.trim()),
      300,
    );
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // ── Trigger product grid re-animation on filter change ────────────────────
  useEffect(() => {
    setAnimateProducts(false);
    const timer = setTimeout(() => setAnimateProducts(true), 50);
    return () => clearTimeout(timer);
  }, [selectedCategory, debouncedSearch]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const isLoading = !allProducts || allProducts.length === 0;

  const categories = useMemo(() => {
    if (!allProducts) return [];
    const cats = [...new Set(allProducts.map((p) => p.category).filter(Boolean))];
    return ['All', ...cats];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    let list =
      selectedCategory === 'All'
        ? allProducts
        : allProducts.filter((p) => p.category === selectedCategory);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [selectedCategory, allProducts, debouncedSearch]);

  // ── Cart action ────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(
    async (id) => {
      if (!isAuthenticated) {
        setToast({ type: 'error', message: 'يرجى تسجيل الدخول لإضافة منتجات للسلة' });
        // FIX 1 — store timer ref so it can be cancelled on unmount
        navTimerRef.current = setTimeout(() => navigate('/login'), TOAST_DURATION);
        return;
      }

      // FIX 3 — read latest state via functional updater instead of closing
      //         over `addingIds` directly, which caused a stale-closure bug
      //         where rapid clicks on different cards could bypass the guard.
      let alreadyAdding = false;
      setAddingIds((prev) => {
        if (prev.includes(id)) { alreadyAdding = true; return prev; }
        return [...prev, id];
      });
      if (!id || alreadyAdding) return;

      try {
        await addToCart(id);
        if (!mountedRef.current) return; // FIX 2 — component unmounted mid-await
        setToast({ type: 'success', message: 'تمت إضافة المنتج إلى السلة 🛒' });
        setTimeout(() => {
          if (mountedRef.current) setAddingIds((s) => s.filter((x) => x !== id));
        }, 700);
      } catch {
        if (!mountedRef.current) return; // FIX 2
        setToast({ type: 'error', message: 'حدث خطأ أثناء إضافة المنتج' });
        setAddingIds((s) => s.filter((x) => x !== id));
      }
    },
    // FIX 3 — `addingIds` removed from deps; guard now uses functional updater
    [addToCart, isAuthenticated, navigate],
  );

  return {
    // data
    allProducts,
    categories,
    filteredProducts,
    isLoading,
    // ui state
    toast, setToast,
    addingIds,
    selectedCategory, setSelectedCategory,
    searchTerm, setSearchTerm,
    animateProducts,
    // actions
    handleAddToCart,
    navigate,
  };
};

export default useCategories;