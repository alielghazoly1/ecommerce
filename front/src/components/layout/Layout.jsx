import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ✅ padding-top بيساوي ارتفاع الـ Header */}
      <main className="pt-[75px] md:pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
