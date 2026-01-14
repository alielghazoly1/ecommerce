// ShopContext.js
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // ✅ new
  const url = 'https://ecommerce-d4caul1f6-alielghazoly1s-projects.vercel.app';

  // تحميل السلة من LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const fetchProductsList = async () => {
    try {
      const res = await axios.get(`${url}/api/product/list`);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const loadCartData = async (userToken) => {
    if (!userToken) return;
    try {
      const res = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (res.data.success && res.data.cartData) {
        setCartItems(res.data.cartData);
      }
    } catch (err) {
      console.error('Failed to load cart data', err);
    }
  };

  // Init minimal change
  useEffect(() => {
    async function init() {
      await fetchProductsList();

      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        await loadCartData(storedToken);
      }
      setAuthLoading(false); // ✅ finished loading token
    }
    init();
  }, []);

  // إضافة عنصر للسلة (optimistic + async, يرجع Promise)
  const addToCart = async (id, quantity = 1) => {
    if (!id) return { success: false, message: 'Invalid id' };

    // حفظ نسخة سابقة للاسترجاع عند الفشل
    const previous = { ...cartItems };

    // تحديث فوري للـ UI (optimistic)
    setCartItems((prev) => ({
      ...prev,
      [id]: prev[id] ? prev[id] + quantity : quantity,
    }));

    // إذا لا يوجد توكن ننتظر مدة صغيرة ليشاهد المستخدم الـ loading (حتى لو لم تريد طلب للسيرفر)
    if (!token) {
      // نُرجع Promise بعد تأخير صغير (300ms) لعرض الـ loading في الواجهة
      await new Promise((r) => setTimeout(r, 300));
      return { success: false, message: 'No token, saved locally' };
    }

    // عندما يكون هناك توكن، أرسل للـ backend
    try {
      const res = await axios.post(
        `${url}/api/cart/add`,
        { id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // لو السيرفر رجع كارت محدث، نستخدمه كحالة موثوقة
      if (res.data && res.data.success && res.data.cartData) {
        setCartItems(res.data.cartData);
      }

      return res.data || { success: true };
    } catch (err) {
      console.error('Failed to add to cart', err);
      // استرجاع الحالة السابقة عند الفشل
      setCartItems(previous);
      throw err;
    }
  };

  // إزالة عنصر من السلة أو تصفيره
  const removeFromCart = async (id, removeAll = false) => {
    if (!token) return;

    try {
      const res = await axios.post(
        `${url}/api/cart/${removeAll ? 'remove-all' : 'remove-one'}`,
        { id, removeAll },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setCartItems(res.data.cartData);
      }
    } catch (err) {
      console.error('Failed to remove from cart', err);
    }
  };

  // تصفير السلة
  const clearCart = async () => {
    if (!token) return console.log('No token found');
    try {
      await axios.post(
        `${url}/api/cart/clear`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems({});
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  // حساب إجمالي السلة
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
        token,
        url,
        setToken,
        setCartItems,
        loadCartData,
        authLoading,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
