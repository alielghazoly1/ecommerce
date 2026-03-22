import { useEffect, useState } from 'react';
import { Menu, X, ShoppingCart,Nut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MenuItems from './MenuItems';
import { useCartItemCount } from '../../store/selectors';

const Header = () => {
  const navigate = useNavigate();
  const totalItems = useCartItemCount();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  return (
    <>
      {/* Desktop */}
      <header className="hidden md:flex fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl shadow-md px-8 lg:px-12 py-4 items-center justify-between">
        <h1
          onClick={() => navigate('/')}
          className="cursor-pointer hidden xl:block lg:text-2xl lg:w-full font-extrabold tracking-wide text-gray-800 hover:text-cyan-600 transition-colors"
        >
          Tota's Magic Nuts 🌰🍫
        </h1>
        <MenuItems isMobile={false} />
      </header>

      {/* Mobile */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg shadow-md px-4 py-3 flex items-center justify-between">
        <h1
          onClick={() => navigate('/')}
          className="cursor-pointer text-lg font-bold text-gray-800 hover:text-cyan-600 transition-colors"
        >
          Tota's Magic Nuts 🌰🍫
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/cart')}
            aria-label="سلة المشتريات"
            className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen(true)}
            aria-label="فتح القائمة"
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60 animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-white z-70 shadow-2xl transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-linear-to-r from-cyan-50 to-blue-50">
          <span className="font-bold text-xl text-gray-800">القائمة الرئيسية</span>
          <button onClick={() => setOpen(false)} aria-label="إغلاق القائمة" className="p-2 rounded-lg hover:bg-white/80 transition-colors">
            <X size={24} className="text-gray-700" />
          </button>
        </div>
        <div className="px-6 py-6 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          <MenuItems isMobile setSidebarOpen={setOpen} />
        </div>
      </aside>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </>
  );
};

export default Header;
