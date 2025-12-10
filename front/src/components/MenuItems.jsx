import React from 'react';
import {
  Home,
  FolderOpen,
  ShoppingBag,
  Mail,
  ShoppingCart,
  User,
} from 'lucide-react';
import { useState, useContext } from 'react';
import { Link as ScrollLink } from 'react-scroll';

export const menuItemData = [
  { to: 'home', label: 'Home', icon: Home },
  { to: 'categories', label: 'Categories', icon: FolderOpen },
  { to: 'shopping', label: 'Shop', icon: ShoppingBag },
  { to: 'contact', label: 'Contact', icon: Mail },
];
const MenuItems = ({ setSideBarOpen, isMobile }) => {
  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const handeleLogout = () => {
    localStorage.removeItem('token');
    setToken(false);
    navigate('/');
    setSideBarOpen && setSideBarOpen(false);
  };
  const navigate = useNavigate();
  return (
    <div
      className={`flex md:justify-center lg:justify-end ${
        isMobile
          ? 'flex space-y-6 items-center px-4 gap-y-2'
          : 'flex-row w-full items-center gap-4'
      }`}
    >
      {menuItemData.map(({ to, label, Icon }) => {
        window.location.pathname === '/' ? (
          <ScrollLink
            key={to}
            to={to}
            smooth={true}
            duration={500}
            offset={-70}
            spy={true}
            onClick={() => {
              setSideBarOpen && setSideBarOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg h-[35px] transition-all shrink-0 w-auto min-w-20 text-gray-200 hover:bg-white/10 hover:text-white
            hover:shadow-md cursor-pointer"
            acriveClass="bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg"
          ></ScrollLink>
        ) : (
          <button
            key={to}
            onClick={() => {
              navigate('/');
              setSideBarOpen && setSideBarOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg h-[35px] transition-all shrink-0 w-auto min-w-20 text-gray-200 hover:bg-white/10 hover:shadow-md "
          >
            <Icon className="w-6 h-6" />
            <span className=" font-semibold text-base">{label}</span>
          </button>
        );
      })}
      <button
        onClick={() => {
          navigate('/cart');
          setSideBarOpen && setSideBarOpen(false);
        }}
        className=" relative flex items-center gap-3 px-4 py-3 rounded-lg h-[35px] transition-all  text-gray-200 hover:bg-white/10 hover:shadow-md "
      ></button>
    </div>
  );
};

export default MenuItems;
