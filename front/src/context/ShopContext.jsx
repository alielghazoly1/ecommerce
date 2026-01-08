import { createContext, useState, useEffect } from 'react';
import { all_products } from '../assets/data';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const url = import.meta.env.VITE_API_URL;

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
      setProducts(res.data.data || all_products);
    } catch (err) {
      console.log(err);
      setProducts(all_products);
    }
  };

  const loadCartData = async (userToken) => {
    try {
      const res = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (res.data.success && res.data.cartData)
        setCartItems(res.data.cartData);
    } catch (err) {
      console.log(err);
    }
  };

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

  const addToCart = async (id, quantity = 1) => {
    setCartItems((prev) => ({
      ...prev,
      [id]: prev[id] ? prev[id] + quantity : quantity,
    }));
    if (token)
      await axios.post(
        `${url}/api/cart/add`,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  };

  const removeFromCart = async (id, removeAll = false) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (removeAll || updated[id] === 1) delete updated[id];
      else updated[id] -= 1;
      return updated;
    });
    if (token)
      await axios.post(
        `${url}/api/cart/remove`,
        { id, removeAll },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  };

  const clearCart = async () => {
    if (!token) return console.log('No token');
    await axios.post(
      `${url}/api/cart/clear`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setCartItems({});
  };

  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [id, qty]) => {
      const product =
        products.find((p) => p._id === id) ||
        all_products.find((p) => p._id === id);
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
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
