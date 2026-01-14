import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MenuItems from './MenuItems';

const Header = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // اقفل السايدبار لو كبرت الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* ================= Desktop Header ================= */}
      <header className="hidden md:flex fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-md px-12 py-4 items-center justify-between">
        <h1
          onClick={() => navigate('/')}
          className="cursor-pointer text-2xl font-extrabold tracking-wide text-gray-800 hover:text-cyan-600 transition"
        >
          Tota’s Magic Choco 🍫
        </h1>

        <MenuItems isMobile={false} />
      </header>

      {/* ================= Mobile Header ================= */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg shadow px-4 py-3 flex items-center justify-between">
        <h1
          onClick={() => navigate('/')}
          className="cursor-pointer text-lg font-bold text-gray-800"
        >
          Tota’s Magic 🍫
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl bg-gray-100 active:scale-95 transition"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* ================= Overlay ================= */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        />
      )}

      {/* ================= Sidebar ================= */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="font-bold text-gray-700">القائمة</span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <div className="px-6 py-6 space-y-4">
          <MenuItems isMobile setSidebarOpen={setOpen} />
        </div>
      </aside>
    </>
  );
};

export default Header;
