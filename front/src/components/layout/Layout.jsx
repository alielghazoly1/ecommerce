import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ✅ padding-top بيساوي ارتفاع الـ Header */}
      <main className="pt-14 md:pt-25">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
