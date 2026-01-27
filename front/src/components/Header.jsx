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

  // ✅ منع scroll لما السايدبار مفتوح
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <>
      {/* ================= Desktop Header ================= */}
      <header className="hidden md:flex fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl shadow-md px-8 lg:px-12 py-4 items-center justify-between">
        <h1
          onClick={() => navigate('/')}
          className="cursor-pointer text-xl lg:text-2xl font-extrabold tracking-wide text-gray-800 hover:text-cyan-600 transition-colors"
        >
          Tota's Magic Choco 🍫
        </h1>

        <MenuItems isMobile={false} />
      </header>

      {/* ================= Mobile Header ================= */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg shadow-md px-4 py-3 flex items-center justify-between">
        <h1
          onClick={() => navigate('/')}
          className="cursor-pointer text-lg font-bold text-gray-800 hover:text-cyan-600 transition-colors"
        >
          Tota's Magic 🍫
        </h1>

        <button
          onClick={() => setOpen(true)}
          aria-label="فتح القائمة"
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
      </header>

      {/* ================= Overlay ================= */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* ================= Sidebar ================= */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <span className="font-bold text-xl text-gray-800">القائمة الرئيسية</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
            className="p-2 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>

        {/* Menu */}
        <div className="px-6 py-6 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          <MenuItems isMobile setSidebarOpen={setOpen} />
        </div>
      </aside>

      {/* ✅ Custom Styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;