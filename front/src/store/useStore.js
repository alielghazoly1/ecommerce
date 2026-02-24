import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { createAuthSlice } from './slices/authSlice';
import { createCartSlice } from './slices/cartSlice';
import { createProductsSlice } from './slices/productsSlice';

const useStore = create(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          ...createAuthSlice(set, get),
          ...createCartSlice(set, get),
          ...createProductsSlice(set, get),

          /**
           * initApp — يُنادى مرة واحدة في App.jsx
           * fetchProducts + checkAuth بيشتغلوا بالتوازي → أسرع
           */
          initApp: async () => {
            set({ authLoading: true });

            const [, authenticated] = await Promise.all([
              get().fetchProducts(),
              get().checkAuth(),
            ]);

            if (authenticated) await get().loadCartData(true);

            set({ authLoading: false });
          },
        }),
        {
          name: 'tota-store',
          // حفظ سلة الـ guest فقط في localStorage
          partialize: (state) =>
            state.isAuthenticated ? {} : { cartItems: state.cartItems },
        },
      ),
    ),
  ),
);

export default useStore;
