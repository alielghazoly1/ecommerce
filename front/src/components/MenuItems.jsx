import React, { useContext } from 'react';
import {
  Home,
  FolderOpen,
  ShoppingBag,
  Mail,
  ShoppingCart,
  User,
} from 'lucide-react';
import { Link as ScrollLink, scroller } from 'react-scroll';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const menuItemData = [
  { to: 'home', label: 'Home', Icon: Home },
  { to: 'categories', label: 'Categories', Icon: FolderOpen },
  { to: 'shop', label: 'Shop', Icon: ShoppingBag },
  { to: 'contact', label: 'Contact', Icon: Mail },
];

const MenuItems = ({ setSidebarOpen, isMobile }) => {
  const { cartItems, token, setToken } = useContext(ShopContext);
  const location = useLocation();
  const navigate = useNavigate();

  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(false);
    navigate('/');
    setSidebarOpen && setSidebarOpen(false);
  };

  const handleNavigateAndScroll = (section) => {
    navigate('/');
    setTimeout(() => {
      scroller.scrollTo(section, {
        smooth: true,
        duration: 500,
        offset: -80,
      });
    }, 100);
    setSidebarOpen && setSidebarOpen(false);
  };

  return (
    <div
      className={`flex md:justify-center lg:justify-end ${
        isMobile
          ? 'flex-col space-y-6 items-center px-4 gap-y-2'
          : 'flex-row w-full items-center gap-4'
      }`}
    >
      {menuItemData.map(({ to, label, Icon }) =>
        location.pathname === '/' ? (
          <ScrollLink
            key={to}
            to={to}
            smooth
            duration={500}
            offset={-80}
            spy
            onClick={() => setSidebarOpen && setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg h-[35px] transition-all shrink-0 min-w-20 text-gray-200 hover:bg-white/10 hover:text-white hover:shadow-md cursor-pointer"
            activeClass="bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg"
          >
            <Icon key={Icon} className="w-6 h-6" />
            <span className="font-semibold text-base">{label}</span>
          </ScrollLink>
        ) : (
          <button
            key={to}
            onClick={() => handleNavigateAndScroll(to)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg h-[35px] transition-all shrink-0 min-w-20 text-gray-200 hover:bg-white/10 hover:shadow-md"
          >
            <Icon className="w-6 h-6" />
            <span className="font-semibold text-base">{label}</span>
          </button>
        )
      )}

      {/* Cart */}
      <button
        onClick={() => {
          navigate('/cart');
          setSidebarOpen && setSidebarOpen(false);
        }}
        className="relative flex items-center gap-3 px-4 py-3 rounded-lg h-[35px] transition-all text-gray-200 hover:bg-white/10 hover:shadow-md"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {!token ? (
        <button
          onClick={() => {
            navigate('/login');
            setSidebarOpen && setSidebarOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-lg h-[35px] bg-cyan-400 text-white font-semibold hover:bg-cyan-500 transition-all"
        >
          Login
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <User className="w-6 h-6 text-white" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 rounded-lg h-[35px] bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuItems;
