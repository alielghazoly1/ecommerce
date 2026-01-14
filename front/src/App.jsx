// import React
import React from 'react';
// import Routes
import { Routes, Route } from 'react-router';
// import components

import Login from './pages/Login';

import SignUp from './pages/SignUp';
import Header from './components/Header';
// import pages
import Home from './pages/Home';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Product from './pages/Product';
import Verify from './pages/Verify';
import Order from './pages/order/Order';
import Categories from './pages/Categories';
import Profile from './pages/Profile';

// context
import ShopContextProvider from './context/ShopContext';
const App = () => {
  return (
    <ShopContextProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<Order />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/profile" element={<Profile />} />


      </Routes>
    </ShopContextProvider>
  );
};

export default App;
