import { useEffect, useState } from 'react';
import MenuItems from './MenuItems';
import { Rocket, Menu, X } from 'lucide-react';


const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Desktop Header */}
      <header
        className="hidden md:flex items-center justify-between px-12 py-5 w-full fixed top-0 left-0 
                   bg-white/80 backdrop-blur-xl shadow-lg z-50"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-gray-800 font-extrabold text-2xl tracking-widest drop-shadow-sm">
            Tota’s Magic Choco🍫🍬
          </h1>
        </div>
        <div className="flex-1 flex justify-end">
          <MenuItems isMobile={false} />
        </div>
      </header>

      {/* Mobile Header */}
      <header
        className="md:hidden flex justify-between items-center px-6 py-4 w-full fixed top-0
                   bg-white/90 backdrop-blur-lg shadow-md z-50"
      >
        <div className="flex items-center gap-2">
          <h1 className="text-gray-800 font-extrabold text-lg tracking-widest drop-shadow-sm">
            Tota’s Magic Choco🍫🍬
          </h1>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-800 p-2 rounded-lg shadow hover:scale-110 transition-transform duration-300"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar Mobile */}
      <aside
        className={`fixed top-16 right-0 h-full w-72 bg-white/90 backdrop-blur-2xl shadow-xl transform
                   transition-transform duration-500 z-40 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-800 p-3 hover:bg-gray-200 rounded-lg transition-all duration-300"
          >
            <X className="w-7 h-7" />
          </button>
        </div>
        <div className="mt-6 px-6 space-y-6">
          <MenuItems setSidebarOpen={setSidebarOpen} isMobile={true} />
        </div>
      </aside>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Header;
