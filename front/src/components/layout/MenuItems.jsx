import { useMemo } from 'react';
import { Home, FolderOpen, ShoppingBag, Mail, ShoppingCart, CircleUserRound } from 'lucide-react';
import { Link as ScrollLink, scroller } from 'react-scroll';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useCartItemCount } from '../../store/selectors';

const menuItemData = [
  { to: 'home',       label: 'الصفحة الرئيسية', Icon: Home },
  { to: 'categories', label: 'تصفح المنتجات',   Icon: FolderOpen },
  { to: 'shop',       label: 'خصومات متجرنا',   Icon: ShoppingBag },
  { to: 'contact',    label: 'تواصل معنا',       Icon: Mail },
];

const MenuItems = ({ setSidebarOpen, isMobile }) => {
  const { isAuthenticated, logout } = useAuth();
  const totalItems = useCartItemCount();
  const location = useLocation();
  const navigate = useNavigate();

  const closeSidebar = () => setSidebarOpen?.(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    closeSidebar();
  };

  const handleNavigateAndScroll = (section) => {
    navigate('/');
    setTimeout(() => {
      scroller.scrollTo(section, { smooth: true, duration: 500, offset: -80 });
    }, 100);
    closeSidebar();
  };

  return (
    <div
      className={`flex md:justify-center lg:justify-end ${
        isMobile ? 'flex-col space-y-4 items-center px-4 gap-y-2' : 'flex-row w-full items-center gap-4'
      } font-sans`}
    >
      {menuItemData.map(({ to, label, Icon }) => {
        if (to === 'categories') {
          const isActive = location.pathname === '/categories';
          return (
            <button
              key={to}
              onClick={() => { navigate('/categories'); closeSidebar(); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all shrink-0 min-w-20 hover:shadow-md ${
                isActive ? 'bg-cyan-100 text-cyan-700 shadow-lg' : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-cyan-600' : 'text-gray-700'}`} />
              <span className="font-medium text-base">{label}</span>
            </button>
          );
        }

        return location.pathname === '/' ? (
          <ScrollLink
            key={to}
            to={to}
            smooth
            duration={500}
            offset={-80}
            spy
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all shrink-0 min-w-20 text-gray-800 hover:bg-gray-100 hover:shadow-md cursor-pointer"
            activeClass="bg-cyan-100 text-cyan-700 shadow-lg"
          >
            <Icon className="w-6 h-6 text-gray-700" />
            <span className="font-medium text-base">{label}</span>
          </ScrollLink>
        ) : (
          <button
            key={to}
            onClick={() => handleNavigateAndScroll(to)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all shrink-0 min-w-20 text-gray-800 hover:bg-gray-100 hover:shadow-md"
          >
            <Icon className="w-6 h-6 text-gray-700" />
            <span className="font-medium text-base">{label}</span>
          </button>
        );
      })}

      {/* Cart */}
      <button
        onClick={() => { navigate('/cart'); closeSidebar(); }}
        className="relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-800 hover:bg-gray-100 hover:shadow-md"
      >
        <ShoppingCart className="w-6 h-6 text-gray-700" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {!isAuthenticated ? (
        <button
          onClick={() => { navigate('/login'); closeSidebar(); }}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-cyan-400 text-white font-semibold hover:bg-cyan-500 transition-all"
        >
          تسجيل دخول
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <div
            onClick={() => { navigate('/profile'); closeSidebar(); }}
            className="flex flex-col items-center cursor-pointer group"
          >
            <CircleUserRound className="w-6 h-6 text-gray-700 group-hover:text-cyan-600" />
            <span className="text-xs text-gray-600 mt-1 group-hover:text-cyan-600">الحساب</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
          >
            تسجيل خروج
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuItems;
