import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { PlusCircle, List, ClipboardCheck, Menu, X, LogOut, Users } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { to: '/admin/add', label: 'إضافة منتج', Icon: PlusCircle },
    { to: '/admin/list', label: 'قائمة المنتجات', Icon: List },
    { to: '/admin/orders', label: 'طلبات العملاء', Icon: ClipboardCheck },
    { to: '/admin/users', label: 'المستخدمين', Icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          md:hidden fixed top-4 left-4 z-50 bg-indigo-600 p-3 rounded-xl text-white
          shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none
        "
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gradient-to-b 
          from-indigo-900 via-purple-900 to-pink-900 text-white
          shadow-2xl z-40 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full justify-between py-10 px-6">
          {/* Logo / Title */}
          <div className="space-y-8">
            <h2 className="text-3xl font-extrabold text-center tracking-wider drop-shadow-lg">
              لوحة التحكم
            </h2>

            {/* Menu Items */}
            <div className="flex flex-col gap-4">
              {menuItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                    ${isActive
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg scale-105'
                      : 'hover:bg-white/20 hover:shadow-md text-gray-200'
                    }`
                  }
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-semibold text-lg">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 justify-center mt-6 w-full px-4 py-3 
            bg-red-600 rounded-xl hover:bg-red-700 shadow-md transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold text-lg">تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
