// import { useEffect, useState } from 'react';
// import { Menu, X } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import MenuItems from './MenuItems';
// import { useContext, useMemo } from 'react';
// import { ShopContext } from '../context/ShopContext';
// import { ShoppingCart } from 'lucide-react';

// const Header = () => {
//   const { cartItems } = useContext(ShopContext); // ✅ إزالة token
//   const navigate = useNavigate();
//   const [open, setOpen] = useState(false);
  
//   const totalItems = useMemo(() => {
//     return Object.values(cartItems).reduce((a, b) => a + b, 0);
//   }, [cartItems]);

//   // اقفل السايدبار لو كبرت الشاشة
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 768) setOpen(false);
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // ✅ منع scroll لما السايدبار مفتوح
//   useEffect(() => {
//     if (open) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [open]);

//   return (
//     <>
//       {/* ================= Desktop Header ================= */}
//       <header className="hidden md:flex fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl shadow-md px-8 lg:px-12 py-4 items-center justify-between">
//         <h1
//           onClick={() => navigate('/')}
//           className="cursor-pointer text-xl lg:text-2xl font-extrabold tracking-wide text-gray-800 hover:text-cyan-600 transition-colors"
//         >
//           Tota's Magic Choco 🍫
//         </h1>

//         <MenuItems isMobile={false} />
//       </header>

//       {/* ================= Mobile Header ================= */}
//       <header className="md:hidden fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg shadow-md px-4 py-3 flex items-center justify-between">
//         {/* Logo */}
//         <h1
//           onClick={() => navigate('/')}
//           className="cursor-pointer text-lg font-bold text-gray-800 hover:text-cyan-600 transition-colors"
//         >
//           Tota's Magic Choco 🍫
//         </h1>

//         {/* Right Actions */}
//         <div className="flex items-center gap-2">
//           {/* 🛒 Cart */}
//           <button
//             onClick={() => navigate('/cart')}
//             aria-label="سلة المشتريات"
//             className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
//           >
//             <ShoppingCart className="w-5 h-5 text-gray-700" />

//             {totalItems > 0 && (
//               <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
//                 {totalItems}
//               </span>
//             )}
//           </button>

//           {/* ☰ Menu */}
//           <button
//             onClick={() => setOpen(true)}
//             aria-label="فتح القائمة"
//             className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
//           >
//             <Menu size={22} className="text-gray-700" />
//           </button>
//         </div>
//       </header>

//       {/* ================= Overlay ================= */}
//       {open && (
//         <div
//           onClick={() => setOpen(false)}
//           className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-fade-in"
//           aria-hidden="true"
//         />
//       )}

//       {/* ================= Sidebar ================= */}
//       <aside
//         className={`fixed top-0 right-0 h-full w-80 bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out
//         ${open ? 'translate-x-0' : 'translate-x-full'}`}
//         aria-hidden={!open}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
//           <span className="font-bold text-xl text-gray-800">
//             القائمة الرئيسية
//           </span>
//           <button
//             onClick={() => setOpen(false)}
//             aria-label="إغلاق القائمة"
//             className="p-2 rounded-lg hover:bg-white/80 transition-colors"
//           >
//             <X size={24} className="text-gray-700" />
//           </button>
//         </div>

//         {/* Menu */}
//         <div className="px-6 py-6 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
//           <MenuItems isMobile setSidebarOpen={setOpen} />
//         </div>
//       </aside>

//       {/* ✅ Custom Styles for animations */}
//       <style jsx>{`
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
//         .animate-fade-in {
//           animation: fade-in 0.2s ease-out;
//         }
//       `}</style>
//     </>
//   );
// };

// export default Header;
// --------------------------------
import { useEffect, useState, useContext, useMemo } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MenuItems from './MenuItems';
import { ShopContext } from '../context/ShopContext';

const Header = () => {
  const { cartItems, isAuthenticated, logout } = useContext(ShopContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const totalItems = useMemo(
    () => Object.values(cartItems).reduce((a, b) => a + b, 0),
    [cartItems]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Cairo:wght@600;700;900&display=swap');

        /* ── ramadan strip ── */
        .r-strip {
          background: linear-gradient(90deg,#0891b2,#06b6d4,#22d3ee,#06b6d4,#0891b2);
          background-size: 300% 100%;
          animation: stripMove 7s linear infinite;
          padding: 5px 0; text-align: center;
          font-family: 'Amiri', serif; font-size: 13px;
          letter-spacing: 3px; color: #fff; line-height: 1.4;
        }
        .r-strip-sm { font-size: 11px; letter-spacing: 2px; padding: 4px 0; }
        @keyframes stripMove {
          0%   { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        /* ── shared header shell ── */
        .hdr-shell {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
          transition: box-shadow .3s;
          font-family: 'Cairo', sans-serif; direction: rtl;
        }
        .hdr-shell.sc {
          box-shadow: 0 2px 20px rgba(6,182,212,0.14), 0 1px 4px rgba(0,0,0,0.05);
        }

        /* ── desktop inner row ── */
        .hdr-d-row {
          display: flex;
          flex-direction: row-reverse;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 10px 36px;
          min-width: 0;
        }

        /* logo */
        .logo {
          display: flex; align-items: center; gap: 9px;
          cursor: pointer; flex-shrink: 0;
        }
        .logo-ic {
          width: 34px; height: 34px; border-radius: 9px;
          background: linear-gradient(135deg,#0891b2,#22d3ee);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(6,182,212,0.3);
          transition: transform .3s;
        }
        .logo:hover .logo-ic { transform: rotate(-8deg) scale(1.08); }
        .logo-name { font-weight: 900; font-size: 16px; color: #164e63; white-space: nowrap; }
        .logo-sub  { font-family:'Amiri',serif; font-size:11px; color:#06b6d4; letter-spacing:1px; display:block; }

        /* nav items في النص */
        .hdr-center {
          display: flex; align-items: center; gap: 4px;
          flex: 1; justify-content: center;
          flex-shrink: 1; min-width: 0;
        }

        /* السلة + خروج على أقصى اليمين */
        .hdr-far-right {
          display: flex; align-items: center; gap: 6px;
          flex-shrink: 0;
        }

        .cart-btn {
          position: relative; display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg,#0891b2,#06b6d4);
          color: #fff; border: none; border-radius: 11px;
          padding: 9px 18px; cursor: pointer;
          font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 13px;
          white-space: nowrap; flex-shrink: 0;
          transition: all .3s;
          box-shadow: 0 3px 14px rgba(6,182,212,0.3);
        }
        .cart-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(6,182,212,0.42); }
        .c-badge {
          position:absolute; top:-6px; left:-6px;
          min-width:18px; height:18px; padding:0 3px;
          background:#ef4444; color:#fff; border-radius:100px;
          font-size:10px; font-weight:900;
          display:flex; align-items:center; justify-content:center;
          border:2px solid #fff;
          animation:bpop .3s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes bpop{from{transform:scale(0)}to{transform:scale(1)}}

        /* ── mobile inner row ── */
        .hdr-m-row {
          display: flex; align-items: center; justify-content: space-between;
          flex-direction: row-reverse;
          padding: 8px 14px;
        }
        .logo-m {
          display: flex; align-items: center; gap: 7px;
          cursor: pointer; font-weight: 900; font-size: 13px; color: #164e63;
        }
        .logo-m-ic {
          width:27px; height:27px; border-radius:7px;
          background:linear-gradient(135deg,#0891b2,#22d3ee);
          display:flex; align-items:center; justify-content:center;
          font-size:13px; flex-shrink:0;
          box-shadow:0 2px 7px rgba(6,182,212,0.28);
        }
        .m-acts { display:flex; align-items:center; gap:7px; }
        .m-ic-btn {
          position:relative; padding:7px; border-radius:10px;
          background:#f0fdff; border:1px solid rgba(6,182,212,0.2);
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          color:#0891b2; transition:all .22s;
        }
        .m-ic-btn:hover { background:rgba(6,182,212,0.1); }
        .m-ic-btn:active { transform:scale(.92); }
        .m-badge {
          position:absolute; top:-5px; right:-5px;
          min-width:16px; height:16px; padding:0 3px;
          background:#ef4444; color:#fff; border-radius:100px;
          font-size:9px; font-weight:900;
          display:flex; align-items:center; justify-content:center;
          border:2px solid #fff;
        }

        /* ── overlay ── */
        .ov {
          position:fixed; inset:0; background:rgba(0,0,0,0.35);
          backdrop-filter:blur(3px); z-index:60;
          animation:fadeOv .2s ease;
        }
        @keyframes fadeOv{from{opacity:0}to{opacity:1}}

        /* ── sidebar ── */
        .sb {
          position:fixed; top:0; right:0; height:100%;
          width:285px; background:#fff; z-index:70;
          box-shadow:-4px 0 28px rgba(0,0,0,0.11);
          transform:translateX(100%);
          transition:transform .28s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column;
          font-family:'Cairo',sans-serif; direction:rtl;
        }
        .sb.open { transform:translateX(0); }
        .sb-head {
          display:flex; align-items:center; justify-content:space-between;
          padding:15px 18px 13px;
          background:linear-gradient(135deg,#f0fdff,#ecfeff);
          border-bottom:1px solid rgba(6,182,212,0.15);
          flex-shrink:0;
        }
        .sb-title { font-weight:900; font-size:16px; color:#164e63; }
        .sb-sub { font-family:'Amiri',serif; font-size:12px; color:#06b6d4; letter-spacing:1px; }
        .sb-xbtn {
          width:32px; height:32px; border-radius:9px;
          background:#fff; border:1px solid rgba(6,182,212,0.2);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:#0891b2; transition:all .25s;
        }
        .sb-xbtn:hover { background:rgba(6,182,212,0.08); transform:rotate(90deg); }
        .sb-decor {
          display:flex; justify-content:center; gap:14px;
          padding:11px 0 9px;
          border-bottom:1px solid rgba(6,182,212,0.1);
          font-size:17px;
        }
        .sb-decor span { animation:sbf 3s ease-in-out infinite; }
        .sb-decor span:nth-child(2){animation-delay:.5s;}
        .sb-decor span:nth-child(3){animation-delay:1s;}
        .sb-decor span:nth-child(4){animation-delay:1.5s;}
        @keyframes sbf{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .sb-body { flex:1; overflow-y:auto; padding:12px 14px; }
        .sb-body::-webkit-scrollbar{width:3px;}
        .sb-body::-webkit-scrollbar-thumb{background:rgba(6,182,212,0.3);border-radius:3px;}
        .sb-foot {
          padding:11px 18px;
          border-top:1px solid rgba(6,182,212,0.12);
          background:linear-gradient(135deg,#f0fdff,#ecfeff);
          text-align:center; flex-shrink:0;
          font-family:'Amiri',serif; font-size:13px;
          color:#06b6d4; letter-spacing:1.5px;
        }
      `}</style>

      <header className={`hdr-shell${scrolled ? ' sc' : ''}`}>
        {/* ── Ramadan Strip ── */}
        <div className={`r-strip${isMobileView ? ' r-strip-sm' : ''}`}>
          {isMobileView
            ? '☽ رمضان كريم ١٤٤٦ ✦ عروض حصرية ☽'
            : '☽ رمضان كريم ١٤٤٦ \u00A0✦\u00A0 عروض حصرية طوال الشهر الكريم \u00A0✦\u00A0 ☽'}
        </div>

        {/* ── Desktop Row ── */}
        {!isMobileView && (
          <div className="hdr-d-row">
            {/* اليمين: السلة + تسجيل دخول/خروج */}
            <div className="hdr-far-right">
              <button className="cart-btn" onClick={() => navigate('/cart')} aria-label="السلة">
                <ShoppingCart size={15} />
                السلة
                {totalItems > 0 && <span className="c-badge">{totalItems}</span>}
              </button>

              {!isAuthenticated ? (
                <button onClick={() => navigate('/login')}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:6,
                    background:'linear-gradient(135deg,#0891b2,#06b6d4)',
                    color:'#fff', border:'none', borderRadius:11,
                    padding:'9px 18px', cursor:'pointer',
                    fontFamily:"'Cairo',sans-serif", fontWeight:700, fontSize:13,
                    whiteSpace:'nowrap', transition:'all .3s',
                    boxShadow:'0 3px 14px rgba(6,182,212,0.3)',
                  }}>
                  تسجيل دخول
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/profile')}
                    style={{
                      display:'inline-flex', alignItems:'center', gap:6,
                      background:'#f0fdff', color:'#0891b2',
                      border:'1px solid rgba(6,182,212,0.25)',
                      borderRadius:11, padding:'9px 14px', cursor:'pointer',
                      fontFamily:"'Cairo',sans-serif", fontWeight:700, fontSize:13,
                      whiteSpace:'nowrap', transition:'all .3s',
                    }}>
                    الحساب
                  </button>
                  <button onClick={handleLogout}
                    style={{
                      display:'inline-flex', alignItems:'center', gap:6,
                      background:'#ef4444', color:'#fff',
                      border:'none', borderRadius:11,
                      padding:'9px 14px', cursor:'pointer',
                      fontFamily:"'Cairo',sans-serif", fontWeight:700, fontSize:13,
                      whiteSpace:'nowrap', transition:'all .3s',
                    }}>
                    خروج
                  </button>
                </>
              )}
            </div>

            {/* الوسط: nav items */}
            <div className="hdr-center">
              <MenuItems isMobile={false} />
            </div>

            {/* الشمال: اللوجو */}
            <div className="logo" onClick={() => navigate('/')}>
              <div className="logo-ic">🍫</div>
              <div>
                <div className="logo-name">Tota's Magic Choco</div>
                <span className="logo-sub">رمضان كريم</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile Row ── */}
        {isMobileView && (
          <div className="hdr-m-row">
            <div className="logo-m" onClick={() => navigate('/')}>
              <div className="logo-m-ic">🍫</div>
              Tota's Magic Choco
            </div>
            <div className="m-acts">
              <button className="m-ic-btn" onClick={() => navigate('/cart')} aria-label="السلة">
                <ShoppingCart size={18} />
                {totalItems > 0 && <span className="m-badge">{totalItems}</span>}
              </button>
              <button className="m-ic-btn" onClick={() => setOpen(true)} aria-label="القائمة">
                <Menu size={20} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Overlay ── */}
      {open && <div className="ov" onClick={() => setOpen(false)} aria-hidden="true" />}

      {/* ── Sidebar ── */}
      <aside className={`sb${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="sb-head">
          <div>
            <div className="sb-title">القائمة الرئيسية</div>
            <div className="sb-sub">☽ رمضان كريم</div>
          </div>
          <button className="sb-xbtn" onClick={() => setOpen(false)} aria-label="إغلاق">
            <X size={17} />
          </button>
        </div>
        <div className="sb-decor">
          <span>🌙</span><span>✨</span><span>🪔</span><span>✨</span><span>🌙</span>
        </div>
        <div className="sb-body">
          <MenuItems isMobile setSidebarOpen={setOpen} />
        </div>
        <div className="sb-foot">☽ كل عام وأنتم بخير ☽</div>
      </aside>
    </>
  );
};

export default Header;