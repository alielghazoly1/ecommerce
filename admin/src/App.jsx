// import { useState } from 'react';
import Add from './components/Add';
import List from './components/List';
import Orders from './components/Orders';
import Sidebar from './components/Sidebar';
import { Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <>
      <Sidebar />
      <Routes>
        <Route path="/add" element={<Add />} />
        <Route path="/list" element={<List />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </>
  );
};

export default App;
