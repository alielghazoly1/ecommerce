import { ShoppingCart, ArrowLeft } from 'lucide-react';
import heroImg from '../assets/Gemini_Generated_Image_q0prhiq0prhiq0pr.png';

const Hero = () => {
  return (
    <section
      dir="rtl"
      style={{
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}
    >
      {/* ====== Background Image ====== */}
      <img
        src={heroImg}
        alt="Totas Magic Nuts"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
        }}
      />

      {/* ====== Gradient Overlay — bottom-up ====== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
          linear-gradient(
            to top,
            rgba(20, 10, 4, 0.92) 0%,
            rgba(20, 10, 4, 0.65) 45%,
            rgba(20, 10, 4, 0.15) 75%,
            transparent 100%
          )
        `,
        }}
      />

      {/* ====== Content ====== */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(32px, 6vw, 80px) clamp(20px, 5vw, 48px)',
        }}
      >
        {/* Brand badge */}
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '100px',
            padding: '6px 16px',
            marginBottom: '20px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#f5d9a8',
            letterSpacing: '0.08em',
          }}
        >
          ✦ Totas Magic Nuts
        </div>

        {/* Headline */}
        <h1
          className=" hidden md:block"
          style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: '900',
            lineHeight: '1.2',
            color: '#fff',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
            maxWidth: '640px',
          }}
        >
          اكتشف أفضل المكسرات
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #f5c96a, #e8a83e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            بلمسة سحرية فاخرة
          </span>
        </h1>

        {/* Description */}
        <p
          className=" hidden md:block"
          style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: '1.8',
            marginBottom: '36px',
            maxWidth: '480px',
          }}
        >
          مكسرات طازجة مختارة بعناية، بأعلى معايير الجودة — لطعم لا يُنسى وتوصيل
          سريع لباب بيتك.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '48px',
          }}
        >
          <button
            onClick={() => (window.location.href = '/categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #d4900a, #a86e08)',
              color: '#fff',
              fontFamily: 'inherit',
              fontWeight: '800',
              fontSize: '1rem',
              padding: '14px 30px',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(168,110,8,0.5)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 14px 36px rgba(168,110,8,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 8px 28px rgba(168,110,8,0.5)';
            }}
          >
            <ShoppingCart size={18} />
            تسوق الآن
          </button>

          <button
            onClick={() => (window.location.href = '/categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              fontFamily: 'inherit',
              fontWeight: '700',
              fontSize: '1rem',
              padding: '14px 24px',
              borderRadius: '14px',
              border: '1.5px solid rgba(255,255,255,0.25)',
              cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            }}
          >
            تصفح الفئات
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            flexWrap: 'wrap',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {[
            { num: '+200', label: 'منتج طازج' },
            { num: '+10K', label: 'عميل سعيد' },
            { num: '100%', label: 'جودة مضمونة' },
          ].map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontSize: '1.6rem',
                  fontWeight: '900',
                  color: '#f5c96a',
                  lineHeight: 1,
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.55)',
                  marginTop: '4px',
                  fontWeight: '600',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====== Discount badge top-left ====== */}
      <div
        style={{
          position: 'absolute',
          top: '28px',
          left: '28px',
          zIndex: 20,
          background: 'linear-gradient(135deg, #d4900a, #a86e08)',
          color: '#fff',
          padding: '8px 18px',
          borderRadius: '100px',
          fontWeight: '800',
          fontSize: '0.82rem',
          fontFamily: "'Cairo', 'Tajawal', sans-serif",
          boxShadow: '0 4px 16px rgba(168,110,8,0.5)',
          letterSpacing: '0.02em',
          animation: 'pulse 2.5s infinite',
        }}
      >
        خصومات حتى 50%
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @media (max-width: 600px) {
          section[dir="rtl"] img {
            object-position: 60% top;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
