import { createContext, useState, useEffect } from 'react';
import { all_products } from '../assets/data';
import axios from 'axios';
export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const url = import.meta.env.VITE_API_URL;
  const [allProducts, setAllProducts] = useState(all_products);
  const [token, setToken] = useState('');
  const [products, setProducts] = useState([])
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (id, quantity = 1) => {
    setCartItems((prev) => ({
      ...prev,
      [id]: prev[id] ? prev[id] + quantity : quantity,
    }));
    if (token) {
      await axios.post(
        `${url}/api/cart/add`,
        { id: productId },
        { headers: { token } }
      );
    }
  };
  const removeFromCart = async (id, removeAll = false) => {
    setCartItems((prev) => {
      const updated = { ...prev };

      if (removeAll || updated[id] === 1) {
        delete updated[id];
      } else {
        updated[id] = updated[id] - 1;
      }

      return updated;
    });
    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { id: productId },
          { headers: { token } }
        );
      } catch (err) {
        console.log(err);
      }
    }
  };

  const clearCart = async () => {
    if (!token) console.log('error');
    try {
      const res = await axios.post(
        `${url}/api/cart/clear`,
        {},
        { headers: { token } }
      );
      setCartItems({});
    } catch (err) {
      console.log(err);
    }
  };

  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [id, qty]) => {
      const product = products.find((prod) => prod._id === id);
      return total + (product ? product.price * qty : 0);
    }, 0);
  };

  const fetchProductsList = async () => {
    try {
      const res = await axios.get(`${url}/api/product/list`);
      setProducts(res.data.data || []);
    } catch (err) {
      console.log(err);
      setProducts(all_Products);
    }
  };
  const loadCartData = async (token) => {
    const res = await axios.post(
      `${url}/api/cart/get`,
      {},
      { headers: { token } }
    );
  };
  useEffect(() => {
    async function loadData() {
      await fetchProductsList()
      if (localStorage.getItem('token')) {
        setToken(localStorage.getItem('token'));
        await loadCartData(localStorage.getItem('token'));
      }
    }
    loadData();
  }, []);
  const value = {
    all_products: allProducts,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    url,
    setToken,
    clearCart,
    setCartItems,
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
export default ShopContextProvider;
