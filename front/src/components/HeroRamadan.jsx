import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import Logo from '../assets/logo.svg';

const FALLING = [
  { content: '☽',  size: 22, left: '8%',  dur: 6,   delay: 0    },
  { content: '✦',  size: 13, left: '18%', dur: 7.5, delay: 1.2  },
  { content: '☽',  size: 14, left: '30%', dur: 8,   delay: 0.4  },
  { content: '✦',  size: 10, left: '42%', dur: 6.5, delay: 2.1  },
  { content: '✿',  size: 15, left: '55%', dur: 9,   delay: 0.8  },
  { content: '☽',  size: 18, left: '65%', dur: 7,   delay: 1.7  },
  { content: '✦',  size: 11, left: '75%', dur: 8.5, delay: 0.3  },
  { content: '✿',  size: 12, left: '85%', dur: 6.8, delay: 2.5  },
  { content: '✦',  size: 9,  left: '93%', dur: 7.2, delay: 1.0  },
  { content: '☽',  size: 12, left: '4%',  dur: 9.5, delay: 3.0  },
  { content: '✿',  size: 10, left: '48%', dur: 6.2, delay: 1.5  },
  { content: '✦',  size: 16, left: '22%', dur: 8.8, delay: 3.5  },
];

const LanternSVG = ({ w, h }) => (
  <svg viewBox="0 0 60 130" style={{ width: w, height: h }} fill="none">
    <line x1="30" y1="0" x2="30" y2="14" stroke="#06b6d4" strokeWidth="2" />
    <path d="M22 14 Q17 16 16 23 L11 76 Q10 83 30 85 Q50 83 49 76 L44 23 Q43 16 38 14 Z"
      fill="#f0fdff" stroke="#06b6d4" strokeWidth="1.5" />
    <path d="M22 14 Q30 18 38 14" stroke="#06b6d4" strokeWidth="1.8" fill="none" />
    <path d="M15 44 Q30 47 45 44" stroke="#06b6d4" strokeWidth="0.7" opacity="0.5" fill="none" />
    <path d="M12 63 Q30 66 48 63" stroke="#06b6d4" strokeWidth="0.7" opacity="0.5" fill="none" />
    <ellipse cx="30" cy="85" rx="19" ry="5" fill="#f0fdff" stroke="#06b6d4" strokeWidth="1.2" />
    <rect x="25" y="90" width="10" height="6" rx="2" fill="#06b6d4" opacity="0.5" />
    <ellipse cx="30" cy="52" rx="7" ry="9" fill="#22d3ee" opacity="0.6" />
    <ellipse cx="30" cy="52" rx="4" ry="6" fill="#ecfeff" opacity="0.9" />
    <ellipse cx="30" cy="52" rx="13" ry="15" fill="#06b6d4" opacity="0.08" />
  </svg>
);

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;600;700;900&display=swap');

        @keyframes fallDown {
          0%   { transform:translateY(-70px) rotate(0deg);   opacity:0; }
          8%   { opacity:1; }
          88%  { opacity:0.7; }
          100% { transform:translateY(105vh) rotate(300deg); opacity:0; }
        }
        @keyframes slideInR {
          from { opacity:0; transform:translateX(22px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes slideInL {
          from { opacity:0; transform:translateX(-22px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes logoFloat {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-8px); }
        }
        @keyframes pdot {
          0%,100% { opacity:1; transform:scale(1);    }
          50%     { opacity:.3; transform:scale(.55); }
        }
        @keyframes rspin { to { transform:rotate(360deg); } }
        @keyframes hpulse {
          0%,100% { transform:scale(1);     opacity:.6; }
          50%     { transform:scale(1.06);  opacity:1;  }
        }
        @keyframes lsway {
          0%,100% { transform:rotate(-5deg); }
          50%     { transform:rotate(5deg) translateY(-4px); }
        }
        @keyframes lglow {
          0%,100% { opacity:.6;  transform:translateX(-50%) scaleX(1);    }
          50%     { opacity:1;   transform:translateX(-50%) scaleX(1.15); }
        }
        @keyframes odot {
          0%,100% { opacity:.4; transform:scale(.8); }
          50%     { opacity:1;  transform:scale(1.3); }
        }

        /* ─── section ─── */
        .hro {
          font-family:'Cairo',sans-serif;
          direction:rtl;
          min-height:88vh;
          max-height:100vh;
          background:
            radial-gradient(ellipse 90% 50% at 50% -8%, rgba(6,182,212,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 55% 40% at 100% 90%, rgba(6,182,212,0.06) 0%, transparent 55%),
            linear-gradient(160deg,#ffffff 0%,#f0fdff 50%,#ecfeff 100%);
          position:relative;
          overflow:hidden;
          display:flex;
          align-items:center;
        }
        .hro::before {
          content:'';
          position:absolute; inset:0;
          background-image:
            repeating-linear-gradient( 45deg,rgba(6,182,212,.033) 0,rgba(6,182,212,.033) 1px,transparent 0,transparent 50%),
            repeating-linear-gradient(-45deg,rgba(6,182,212,.033) 0,rgba(6,182,212,.033) 1px,transparent 0,transparent 50%);
          background-size:34px 34px;
          pointer-events:none;
        }
        .hro::after {
          content:'';
          position:absolute; top:-120px; left:50%; transform:translateX(-50%);
          width:100%; height:270px;
          background:radial-gradient(ellipse,rgba(6,182,212,0.1) 0%,transparent 70%);
          border-radius:50%; pointer-events:none;
        }

        .arch {
          position:absolute; pointer-events:none; z-index:1;
          left:50%; transform:translateX(-50%);
          border-radius:50% 50% 0 0; border-style:solid;
        }
        .a1 { top:-65px;width:780px;height:270px;border-width:1px;border-color:rgba(6,182,212,0.13); }
        .a2 { top:-48px;width:560px;height:200px;border-width:1px;border-color:rgba(6,182,212,0.08); }

        .wm {
          position:absolute; bottom:16px; left:50%; transform:translateX(-50%);
          font-family:'Amiri',serif;
          font-size:clamp(50px,9vw,105px);
          color:rgba(6,182,212,0.052);
          white-space:nowrap; pointer-events:none; z-index:0; letter-spacing:16px;
        }
        .bline {
          position:absolute; bottom:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,rgba(6,182,212,0.28),transparent);
        }

        /* falling items — fixed to cross full viewport */
        .fall {
          position:fixed; top:-70px; pointer-events:none; z-index:9999;
          animation:fallDown linear infinite;
          color:#0891b2; user-select:none;
          filter:drop-shadow(0 0 4px rgba(6,182,212,0.5));
        }

        /* layout */
        .hin {
          position:relative; z-index:10;
          width:100%; max-width:1200px;
          margin:0 auto; padding:36px 44px;
          display:grid;
          grid-template-columns:1fr 1fr;
          align-items:center;
          gap:44px;
        }

        /* TEXT */
        .ts { display:flex; flex-direction:column; gap:18px; }

        .si1 { animation:slideInR .6s .08s ease both; }
        .si2 { animation:slideInR .6s .20s ease both; }
        .si3 { animation:slideInR .6s .32s ease both; }
        .si4 { animation:slideInR .6s .44s ease both; }
        .si5 { animation:slideInR .6s .56s ease both; }

        .bdg {
          display:inline-flex; align-items:center; gap:9px;
          background:linear-gradient(135deg,rgba(6,182,212,0.1),rgba(6,182,212,0.02));
          border:1px solid rgba(6,182,212,0.28);
          border-radius:100px; padding:6px 20px; width:fit-content;
        }
        .bdg span { font-family:'Amiri',serif; color:#0891b2; font-size:15px; letter-spacing:1.5px; }
        .bd { width:7px;height:7px; background:#06b6d4; border-radius:50%; animation:pdot 2s ease-in-out infinite; }

        .rh {
          font-family:'Amiri',serif;
          font-size:clamp(30px,3.8vw,55px);
          font-weight:700; line-height:1.25; color:#164e63;
        }
        .rh .hl { color:#0891b2; position:relative; display:inline-block; }
        .rh .hl::after {
          content:''; position:absolute; bottom:1px; right:0;
          width:100%; height:2px;
          background:linear-gradient(90deg,transparent,#22d3ee,transparent);
          border-radius:2px;
        }

        .rsub { font-size:14px; color:#4e7a85; line-height:1.85; max-width:420px; font-weight:300; }

        .disc {
          display:flex; align-items:center; gap:14px;
          background:linear-gradient(135deg,rgba(6,182,212,0.09),rgba(6,182,212,0.02));
          border:1px solid rgba(6,182,212,0.18);
          border-radius:16px; padding:12px 20px; width:fit-content;
        }
        .dn {
          font-family:'Cairo',sans-serif; font-size:48px; font-weight:900; line-height:1;
          background:linear-gradient(135deg,#0891b2,#22d3ee);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .dd { width:1px;height:38px;background:linear-gradient(180deg,transparent,#06b6d4,transparent); }
        .dl strong { display:block; color:#164e63; font-size:14px; font-weight:700; }
        .dl span   { color:#4e7a85; font-size:12px; }

        .btns { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

        .bp {
          display:inline-flex; align-items:center; gap:8px;
          background:linear-gradient(135deg,#0891b2,#06b6d4);
          color:#fff; font-weight:700; font-size:14px;
          padding:12px 28px; border-radius:13px; border:none; cursor:pointer;
          font-family:'Cairo',sans-serif;
          transition:all .3s;
          box-shadow:0 4px 18px rgba(6,182,212,0.35);
          position:relative; overflow:hidden;
        }
        .bp::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,.15) 0%,transparent 60%);
          opacity:0; transition:opacity .25s;
        }
        .bp:hover { transform:translateY(-2px); box-shadow:0 7px 22px rgba(6,182,212,0.45); }
        .bp:hover::before { opacity:1; }

        .bs {
          display:inline-flex; align-items:center; gap:8px;
          background:#fff; color:#0891b2; font-weight:600; font-size:14px;
          padding:11px 26px; border-radius:13px;
          border:1px solid rgba(6,182,212,0.3); cursor:pointer;
          font-family:'Cairo',sans-serif;
          transition:all .3s;
          box-shadow:0 2px 8px rgba(6,182,212,0.08);
        }
        .bs:hover { background:rgba(6,182,212,0.06); border-color:#06b6d4; transform:translateY(-2px); }

        /* VISUAL */
        .vs {
          position:relative; display:flex; align-items:center; justify-content:center;
          animation:slideInL .8s .3s ease both;
        }

        .halo {
          position:absolute; width:320px;height:320px; border-radius:50%;
          background:radial-gradient(circle,rgba(6,182,212,0.14) 0%,transparent 68%);
          animation:hpulse 4s ease-in-out infinite;
        }

        .rg { position:absolute; border-radius:50%; pointer-events:none; }
        .rg1 { width:270px;height:270px; border:1px dashed rgba(6,182,212,0.22); animation:rspin 20s linear infinite; }
        .rg2 { width:326px;height:326px; border:1px solid rgba(6,182,212,0.1);  animation:rspin 32s linear infinite reverse; }

        .odot {
          position:absolute; width:6px;height:6px; border-radius:50%;
          background:radial-gradient(circle,#22d3ee,#0891b2);
          box-shadow:0 0 6px rgba(34,211,238,0.55);
          animation:odot 2.5s ease-in-out infinite;
          top:50%; left:50%;
        }

        .lc {
          position:relative; z-index:2;
          width:220px;height:220px; border-radius:50%;
          background:linear-gradient(145deg,#fff 0%,#f0fdff 60%,#ecfeff 100%);
          border:1px solid rgba(6,182,212,0.2);
          display:flex; align-items:center; justify-content:center; padding:26px;
          box-shadow:
            0 6px 28px rgba(6,182,212,0.15),
            0 1px 6px rgba(6,182,212,0.07),
            inset 0 2px 8px rgba(255,255,255,0.9);
          animation:logoFloat 5s ease-in-out infinite;
        }
        .lc img { width:100%; height:auto; }

        .co { position:absolute; width:36px;height:36px; border-style:solid; border-color:rgba(6,182,212,0.28); }
        .cotl { top:7px;right:7px; border-width:2px 0 0 2px; border-radius:0 0 0 8px; }
        .cobr { bottom:7px;left:7px; border-width:0 2px 2px 0; border-radius:8px 0 0 0; }

        .ln { position:absolute; z-index:3; transform-origin:top center; }
        .lnr { top:-22px;right:2px;  animation:lsway 5s .6s ease-in-out infinite; }
        .lnl { top:-8px; left:-14px; animation:lsway 6.5s 1.8s ease-in-out infinite; }
        .lg {
          position:absolute; bottom:8px; left:50%; transform:translateX(-50%);
          width:28px;height:40px;
          background:radial-gradient(ellipse,rgba(6,182,212,0.22) 0%,transparent 70%);
          filter:blur(7px); animation:lglow 3s ease-in-out infinite;
        }

        @media(max-width:820px){
          .hin{ grid-template-columns:1fr; padding:55px 20px 44px; gap:28px; }
          .vs{ order:-1; }
          .halo{width:230px;height:230px}
          .rg1{width:195px;height:195px} .rg2{width:240px;height:240px}
          .lc{width:170px;height:170px}
          .wm{font-size:46px}
        }
      `}</style>

      {/* falling Ramadan symbols */}
      {FALLING.map((f, i) => (
        <span
          key={i}
          className="fall"
          style={{
            left: f.left,
            fontSize: f.size,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          {f.content}
        </span>
      ))}

      <section className="hro">
        <div className="arch a1" />
        <div className="arch a2" />
        <div className="wm">رمضان كريم</div>
        <div className="bline" />

        <div className="hin">

          {/* TEXT */}
          <div className="ts">

            <div className="bdg si1">
              <div className="bd" />
              <span>رمضان كريم ١٤٤٦</span>
              <div className="bd" />
            </div>

            <h1 className="rh si2">
              اكتشف أفضل<br />
              عروض <span className="hl">رمضان</span><br />
              بأفضل الأسعار
            </h1>

            <p className="rsub si3">
              تسوق من مجموعتنا المميزة في هذا الشهر الفضيل.
              عروض حصرية وتوصيل سريع لتجربة لا تُنسى.
            </p>

            <div className="disc si4">
              <div className="dn">٥٠٪</div>
              <div className="dd" />
              <div className="dl">
                <strong>خصومات رمضانية قد تصل ل 50%</strong>
                <span>لفترة محدودة فقط</span>
              </div>
            </div>

            <div className="btns si5">
              <button className="bp" onClick={() => window.location.href = '/categories'}>
                <ShoppingCart size={17} />
                تسوق الآن
              </button>
              <button className="bs" onClick={() => window.location.href = '/categories'}>
                تصفح العروض
              </button>
            </div>

          </div>

          {/* VISUAL */}
          <div className="vs">

            <div className="ln lnr">
              <LanternSVG w={44} h={96} />
              <div className="lg" />
            </div>
            <div className="ln lnl">
              <LanternSVG w={34} h={78} />
              <div className="lg" />
            </div>

            <div className="halo" />
            <div className="rg rg1" />
            <div className="rg rg2" />

            {[0, 72, 144, 216, 288].map((angle, i) => {
              const r = 163;
              const x = Math.cos(angle * Math.PI / 180) * r;
              const y = Math.sin(angle * Math.PI / 180) * r;
              return (
                <div key={i} className="odot"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              );
            })}

            <div className="lc">
              <div className="co cotl" />
              <div className="co cobr" />
              <img src={Logo} alt="شعار المتجر" />
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;