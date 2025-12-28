import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  List,
  ClipboardCheck,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const menuItems = [
    { to: '/admin/add', label: 'إضافة منتج', Icon: PlusCircle },
    { to: '/admin/list', label: 'قائمة المنتجات', Icon: List },
    { to: '/admin/orders', label: 'طلبات العملاء', Icon: ClipboardCheck },
  ];
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
    md:hidden fixed top-4 left-4 z-50 bg-indigo-600 p-3 rounded-xl text-white
    shadow-lg transition-transform duration-300 hover:scale-105 focus:outline-none"
      >
        {isOpen ? (
          <X className="w-5 h-5 cursor-pointer" />
        ) : (
          <Menu className="w-5 h-5 cursor-pointer" />
        )}
      </button>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-linear-to-b 
        from-indigo-900 via-purple-900 to-pink-900 text-white
        shadow-lg z-40 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full justify-between py-10 px-6 ">
          <div className=" space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">لوحة التحكم</h2>
            {menuItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                   ${
                     isActive
                       ? 'bg-linear-to-r from-cyan-400 to-blue-400 text-white shadow-lg scale-105'
                       : 'hover: bg-white/10 hover:shadow-md text-gray-200'
                   }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{label}</span>
              </NavLink>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2
           justify-center mt-6 w-full px-4 py-3 bg-red-600 rounded-xl hover:bg-red-700"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
