import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const url = import.meta.env.VITE_API_URL;

  // تحميل السلة من LocalStorage أول مرة
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  // حفظ السلة في LocalStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // جلب المنتجات
  const fetchProductsList = async () => {
    try {
      const res = await axios.get(`${url}/api/product/list`);
      setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  // جلب السلة من الـ backend
  const loadCartData = async (userToken) => {
    if (!userToken) return;
    try {
      const res = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (res.data.success && res.data.cartData)
        setCartItems(res.data.cartData);
    } catch (err) {
      console.error('Failed to load cart data', err);
    }
  };

  // Init: جلب المنتجات والسلة وتوكن المستخدم
  useEffect(() => {
    async function init() {
      await fetchProductsList();
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        await loadCartData(storedToken);
      }
    }
    init();
  }, []);

  // إضافة عنصر للسلة
  const addToCart = async (id, quantity = 1) => {
    setCartItems((prev) => ({
      ...prev,
      [id]: prev[id] ? prev[id] + quantity : quantity,
    }));
    if (!token) return;
    try {
      await axios.post(
        `${url}/api/cart/add`,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to add to cart', err);
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
      console.log(res); // حدث state بعد ما backend يرد
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
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
