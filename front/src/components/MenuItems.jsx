// import { useContext, useMemo } from 'react';
// import {
//   Home,
//   FolderOpen,
//   ShoppingBag,
//   Mail,
//   ShoppingCart,
//   CircleUserRound,
// } from 'lucide-react';
// import { Link as ScrollLink, scroller } from 'react-scroll';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { ShopContext } from '../context/ShopContext';

// const menuItemData = [
//   { to: 'home', label: 'الصفحة الرئيسية', Icon: Home },
//   { to: 'categories', label: 'تصفح المنتجات', Icon: FolderOpen },
//   { to: 'shop', label: 'خصومات متجرنا', Icon: ShoppingBag },
//   { to: 'contact', label: 'تواصل معنا', Icon: Mail },
// ];

// const MenuItems = ({ setSidebarOpen, isMobile }) => {
//   const { cartItems, isAuthenticated, logout } = useContext(ShopContext);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const totalItems = useMemo(() => {
//     return Object.values(cartItems).reduce((a, b) => a + b, 0);
//   }, [cartItems]);

//   const handleLogout = async () => {
//     await logout();
//     navigate('/');
//     setSidebarOpen && setSidebarOpen(false);
//   };

//   const handleNavigateAndScroll = (section) => {
//     navigate('/');
//     setTimeout(() => {
//       scroller.scrollTo(section, {
//         smooth: true,
//         duration: 500,
//         offset: -80,
//       });
//     }, 100);
//     setSidebarOpen && setSidebarOpen(false);
//   };

//   return (
//     <div
//       className={`flex md:justify-center lg:justify-end ${
//         isMobile
//           ? 'flex-col space-y-4 items-center px-4 gap-y-2'
//           : 'flex-row w-full items-center gap-4'
//       } font-sans`}
//     >
//       {menuItemData.map(({ to, label, Icon }) => {
//         // ✅ "categories" تروح صفحة /categories مع active state
//         if (to === 'categories') {
//           const isActive = location.pathname === '/categories';
//           return (
//             <button
//               key={to}
//               onClick={() => {
//                 navigate('/categories');
//                 setSidebarOpen && setSidebarOpen(false);
//               }}
//               className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all shrink-0 min-w-20 hover:shadow-md ${
//                 isActive
//                   ? 'bg-cyan-100 text-cyan-700 shadow-lg'
//                   : 'text-gray-800 hover:bg-gray-100'
//               }`}
//             >
//               <Icon className={`w-6 h-6 ${isActive ? 'text-cyan-600' : 'text-gray-700'}`} />
//               <span className="font-medium text-base">{label}</span>
//             </button>
//           );
//         }

//         // باقي العناصر - scroll links أو navigate
//         return location.pathname === '/' ? (
//           <ScrollLink
//             key={to}
//             to={to}
//             smooth
//             duration={500}
//             offset={-80}
//             spy
//             onClick={() => setSidebarOpen && setSidebarOpen(false)}
//             className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all shrink-0 min-w-20 text-gray-800 hover:bg-gray-100 hover:shadow-md cursor-pointer"
//             activeClass="bg-cyan-100 text-cyan-700 shadow-lg"
//           >
//             <Icon className="w-6 h-6 text-gray-700" />
//             <span className="font-medium text-base">{label}</span>
//           </ScrollLink>
//         ) : (
//           <button
//             key={to}
//             onClick={() => handleNavigateAndScroll(to)}
//             className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all shrink-0 min-w-20 text-gray-800 hover:bg-gray-100 hover:shadow-md"
//           >
//             <Icon className="w-6 h-6 text-gray-700" />
//             <span className="font-medium text-base">{label}</span>
//           </button>
//         );
//       })}

//       {/* 🛒 Cart */}
//       <button
//         onClick={() => {
//           navigate('/cart');
//           setSidebarOpen && setSidebarOpen(false);
//         }}
//         className="relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-800 hover:bg-gray-100 hover:shadow-md"
//       >
//         <ShoppingCart className="w-6 h-6 text-gray-700" />
//         {totalItems > 0 && (
//           <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
//             {totalItems}
//           </span>
//         )}
//       </button>

//       {!isAuthenticated ? (
//         <button
//           onClick={() => {
//             navigate('/login');
//             setSidebarOpen && setSidebarOpen(false);
//           }}
//           className="flex items-center gap-2 px-4 py-3 rounded-lg bg-cyan-400 text-white font-semibold hover:bg-cyan-500 transition-all"
//         >
//           تسجيل دخول
//         </button>
//       ) : (
//         <div className="flex items-center gap-4">
//           <div
//             onClick={() => {
//               navigate('/profile');
//               setSidebarOpen && setSidebarOpen(false);
//             }}
//             className="flex flex-col items-center cursor-pointer group"
//           >
//             <CircleUserRound className="w-6 h-6 text-gray-700 group-hover:text-cyan-600" />
//             <span className="text-xs text-gray-600 mt-1 group-hover:text-cyan-600">
//               الحساب
//             </span>
//           </div>

//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
//           >
//             تسجيل خروج
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MenuItems;
// -----------------------------------
import { useContext, useMemo } from 'react';
import {
  Home, FolderOpen, ShoppingBag, Mail, ShoppingCart, CircleUserRound,
} from 'lucide-react';
import { Link as ScrollLink, scroller } from 'react-scroll';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const menuItemData = [
  { to: 'home',       label: 'الرئيسية',       Icon: Home },
  { to: 'categories', label: 'المنتجات',       Icon: FolderOpen },
  { to: 'shop',       label: 'الخصومات',       Icon: ShoppingBag },
  { to: 'contact',    label: 'تواصل معنا',     Icon: Mail },
];

const MenuItems = ({ setSidebarOpen, isMobile }) => {
  const { cartItems, isAuthenticated, logout } = useContext(ShopContext);
  const location = useLocation();
  const navigate  = useNavigate();

  const totalItems = useMemo(
    () => Object.values(cartItems).reduce((a, b) => a + b, 0),
    [cartItems]
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setSidebarOpen?.('close');
  };

  const handleNavigateAndScroll = (section) => {
    navigate('/');
    setTimeout(() => scroller.scrollTo(section, { smooth: true, duration: 500, offset: -80 }), 100);
    setSidebarOpen?.(false);
  };

  /* ── shared class builders ── */
  const desktopItem = (isActive) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
     ${isActive
       ? 'bg-cyan-50 text-cyan-700'
       : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-600'}`;

  const mobileItem = (isActive) =>
    `flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold transition-all
     ${isActive
       ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
       : 'text-gray-700 hover:bg-gray-50'}`;

  /* ── mobile layout ── */
  if (isMobile) {
    return (
      <div className="flex flex-col gap-1" style={{ fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>

        {menuItemData.map(({ to, label, Icon }) => {
          if (to === 'categories') {
            const active = location.pathname === '/categories';
            return (
              <button key={to} onClick={() => { navigate('/categories'); setSidebarOpen?.(false); }}
                className={mobileItem(active)}>
                <Icon size={19} className={active ? 'text-cyan-600' : 'text-gray-500'} />
                {label}
              </button>
            );
          }
          return location.pathname === '/' ? (
            <ScrollLink key={to} to={to} smooth duration={500} offset={-80} spy
              onClick={() => setSidebarOpen?.(false)}
              className={mobileItem(false) + ' cursor-pointer'}
              activeClass="!bg-cyan-50 !text-cyan-700 border border-cyan-200">
              <Icon size={19} className="text-gray-500" />
              {label}
            </ScrollLink>
          ) : (
            <button key={to} onClick={() => handleNavigateAndScroll(to)} className={mobileItem(false)}>
              <Icon size={19} className="text-gray-500" />
              {label}
            </button>
          );
        })}

        {/* divider */}
        <div style={{ height: 1, background: 'rgba(6,182,212,0.15)', margin: '8px 0' }} />

        {/* Cart */}
        <button onClick={() => { navigate('/cart'); setSidebarOpen?.(false); }}
          className="relative flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all">
          <ShoppingCart size={19} className="text-gray-500" />
          السلة
          {totalItems > 0 && (
            <span className="mr-auto min-w-[22px] h-[22px] px-1 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>

        {/* Auth */}
        {!isAuthenticated ? (
          <button onClick={() => { navigate('/login'); setSidebarOpen?.(false); }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl
                       bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-base
                       hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-md mt-1">
            تسجيل دخول
          </button>
        ) : (
          <div className="flex flex-col gap-2 mt-1">
            <button onClick={() => { navigate('/profile'); setSidebarOpen?.(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-semibold">
              <CircleUserRound size={19} className="text-gray-500" />
              الحساب الشخصي
            </button>
            <button onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl
                         bg-red-500 hover:bg-red-600 text-white font-bold transition-all">
              تسجيل خروج
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── desktop layout — nav links only ── */
  return (
    <div className="flex items-center gap-1 flex-nowrap" style={{ fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      {menuItemData.map(({ to, label, Icon }) => {
        if (to === 'categories') {
          const active = location.pathname === '/categories';
          return (
            <button key={to} onClick={() => navigate('/categories')} className={desktopItem(active)}>
              <Icon size={15} />
              {label}
            </button>
          );
        }
        return location.pathname === '/' ? (
          <ScrollLink key={to} to={to} smooth duration={500} offset={-80} spy
            className={desktopItem(false) + ' cursor-pointer'}
            activeClass="!bg-cyan-50 !text-cyan-700">
            <Icon size={15} />
            {label}
          </ScrollLink>
        ) : (
          <button key={to} onClick={() => handleNavigateAndScroll(to)} className={desktopItem(false)}>
            <Icon size={15} />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default MenuItems;