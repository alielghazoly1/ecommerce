import { useEffect } from 'react';
import { Routes, Route } from 'react-router';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Cart from './pages/Cart/Cart';
import MyOrders from "./pages/MyOrders/MyOrder"
import Product from './pages/Product/Product';
import Order from './pages/order/Order';
import Categories from './pages/Categories';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { useInitApp } from './store/selectors';

const App = () => {
  const initApp = useInitApp();

  useEffect(() => {
    initApp();
  }, [initApp]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<Order />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default App;
