// import { useState } from 'react';
import Add from './components/Add';
import List from './components/List';
import Orders from './components/Orders';
import Sidebar from './components/Sidebar';
import ProductedRoute from './components/ProductedRoute';
import { Route, Routes } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
const App = () => {
  return (
    <>
      <Sidebar />
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/add"
          element={
            <ProductedRoute>
              <Add />
            </ProductedRoute>
          }
        />
        <Route
          path="/admin/list"
          element={
            <ProductedRoute>
              <List />
            </ProductedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProductedRoute>
              <Orders />
            </ProductedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
