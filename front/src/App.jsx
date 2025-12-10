// import React
import React from 'react';
// import Routes 
import { Routes, Route } from 'react-router';
// import components
import Categories from './components/Categories';
import Features from './components/Features';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Item from './components/Item';
import Login from './components/Login';
import MenuItems from './components/MenuItems';
import Offer from './components/Offer';
import ProductDisplay from './components/ProductDisplay';
import SignUp from './components/SignUp';
import Header from './components/Header';
// import pages
import Home from './pages/Home';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Product from './pages/Product';
import Verify from './pages/Verify';
import Order from './pages/Order';
const App = () => {
  return (
    <div>
      <Header />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/product/productId' element={<Product/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/order' element={<Order/>}/>
        <Route path='/verify' element={<Verify/>}/>
        <Route path='/myorders' element={<MyOrders/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<SignUp/>}/>
      </Routes>
    </div>
  )
};

export default App;
