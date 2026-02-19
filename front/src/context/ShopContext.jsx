// ShopContext.js - COOKIE-BASED VERSION 🍪
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ShopContext = createContext();

// ✅ axios instance واحد برا الـ component - مش بيتعمل في كل render
const api = axios.create({
  withCredentials: true,
});

const ShopContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // const url ='https://back-7cc728syx-alielghazoly1s-projects.vercel.app';
  const url = 'http://localhost:4000';

  // ✅ تحميل السلة من LocalStorage للـ guest users فقط عند أول تحميل
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('cartItems');
      }
    }
  }, []);

  // ✅ حفظ السلة في LocalStorage فقط للـ guest users
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // ✅ Fetch products list
  const fetchProductsList = async () => {
    try {
      const res = await api.get(`${url}/api/product/list`);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  // ✅ loadCartData - بتاخد authenticated كـ parameter عشان تشتغل صح في init()
  // وبتفضل تشتغل بـ isAuthenticated state للاستخدام العادي
  const loadCartData = async (authenticated = isAuthenticated) => {
    if (!authenticated) return;

    try {
      const res = await api.post(`${url}/api/cart/get`);
      if (res.data.success && res.data.cartData) {
        setCartItems(res.data.cartData);
        // ✅ امسح الـ local storage لما نحمل من السيرفر
        localStorage.removeItem('cartItems');
      }
    } catch (err) {
      console.error('Failed to load cart data', err);
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  };

  // ✅ Check authentication status
  const checkAuth = async () => {
    try {
      const res = await api.get(`${url}/api/users/profile`);
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  // ✅ Initialize app - بدون double loading
  useEffect(() => {
    async function init() {
      setAuthLoading(true);

      // 1. Fetch products
      await fetchProductsList();

      // 2. Check authentication
      const authenticated = await checkAuth();

      // 3. لو authenticated، حمّل السلة من السيرفر
      // بنبعت authenticated مباشرة عشان isAuthenticated state لسه ما اتحدثتش
      if (authenticated) {
        await loadCartData(true);
      }

      setAuthLoading(false);
    }

    init();
  }, []); // ✅ [] مرة واحدة بس عند الـ mount

  // ✅ Login
  const login = async (email, password) => {
    try {
      const res = await api.post(`${url}/api/users/login`, { email, password });

      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        // ✅ حمّل السلة من السيرفر بعد الـ login مباشرة
        await loadCartData(true);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      };
    }
  };

  // ✅ Register
  const register = async (name, email, password) => {
    try {
      const res = await api.post(`${url}/api/users/register`, {
        name,
        email,
        password,
      });

      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return { success: true, message: res.data.message };
      }
      return {
        success: false,
        message: res.data.message || 'Registration failed',
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
      };
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await api.post(`${url}/api/users/logout`);
    } catch (err) {
      console.error('Logout request failed', err);
    } finally {
      // ✅ امسح كل حاجة حتى لو الـ request فشل
      setUser(null);
      setIsAuthenticated(false);
      setCartItems({});
      localStorage.removeItem('cartItems');
    }
    return { success: true };
  };

  // ✅ Add to cart
  const addToCart = async (id, quantity = 1) => {
    if (!id) return { success: false, message: 'Invalid id' };

    // ✅ لو مش authenticated، ضيف محلياً بس وارجع الحالة
    if (!isAuthenticated) {
      setCartItems((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + quantity,
      }));
      return { success: false, local: true, message: 'Saved locally' };
    }

    // ✅ حفظ نسخة للاسترجاع عند الفشل
    const previous = { ...cartItems };

    // ✅ Optimistic update
    setCartItems((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + quantity,
    }));

    try {
      const res = await api.post(`${url}/api/cart/add`, { id, quantity });

      if (res.data?.success && res.data.cartData) {
        setCartItems(res.data.cartData);
      }

      return res.data || { success: true };
    } catch (err) {
      console.error('Failed to add to cart', err);

      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
      }

      // ✅ استرجاع الحالة السابقة عند الفشل
      setCartItems(previous);
      throw err;
    }
  };

  // ✅ Remove from cart
  const removeFromCart = async (id, removeAll = false) => {
    if (!isAuthenticated) {
      setCartItems((prev) => {
        const updated = { ...prev };
        if (removeAll || updated[id] <= 1) {
          delete updated[id];
        } else {
          updated[id]--;
        }
        return updated;
      });
      return;
    }

    try {
      const res = await api.post(
        `${url}/api/cart/${removeAll ? 'remove-all' : 'remove-one'}`,
        { id, removeAll },
      );
      if (res.data.success) {
        setCartItems(res.data.cartData);
      }
    } catch (err) {
      console.error('Failed to remove from cart', err);
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  };

  // ✅ Clear cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      setCartItems({});
      localStorage.removeItem('cartItems');
      return;
    }
    try {
      await api.post(`${url}/api/cart/clear`);
      setCartItems({});
    } catch (err) {
      console.error('Failed to clear cart', err);
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  };

  // ✅ Calculate total
  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [id, qty]) => {
      const product = products.find((p) => p._id === id);
      return total + (product ? product.price * qty : 0);
    }, 0);
  };

  return (
    <ShopContext.Provider
      value={{
        all_products: products,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalCartAmount,
        setCartItems,
        loadCartData,
        user,
        isAuthenticated,
        authLoading,
        login,
        register,
        logout,
        checkAuth,
        url,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
