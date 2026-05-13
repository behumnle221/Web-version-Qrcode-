import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── CONFIG ─────────────────────────────────────────────────────────────── */
const SLIDE_DURATION = 20000; // 20 seconds per slide
const TRANSITION_DURATION = 1400; // ms for fade transition

/**
 * HeroBanner – Fullscreen cinematic carousel for PayQR
 *
 * Props:
 *   slides: Array<{ image: string, gradient: string }>
 *     - image: URL/path to background image (optional, falls back to gradient)
 *     - gradient: CSS gradient string used as fallback / overlay base
 *
 * If no slides are passed, two premium gradient slides are used.
 */

const DEFAULT_SLIDES = [
  {
    // Slide 1 – teinte chaude orange/violette
    image: '/images/banner.png',
    bgPosition: 'center center',
    tint: 'linear-gradient(to right, rgba(120,40,0,.70) 0%, rgba(80,20,80,.50) 55%, rgba(15,10,40,.25) 100%)',
    accentColor: '#f97316',
  },
  {
    // Slide 2 – teinte bleue officielle PayQR
    image: '/images/banner2.png',
    bgPosition: 'center 60%',
    tint: 'linear-gradient(to right, rgba(30,58,138,.78) 0%, rgba(37,99,235,.52) 55%, rgba(15,23,42,.22) 100%)',
    accentColor: '#3B82F6',
  },
];

/* ─── CSS injected once ───────────────────────────────────────────────────── */
const HERO_CSS = `
  @keyframes payqr-zoom-in-out {
    0%   { transform: scale(1.15); }
    40%  { transform: scale(1.22); }
    100% { transform: scale(1.08); }
  }

  @keyframes payqr-slide-fade-in {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes payqr-slide-fade-out {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes payqr-content-rise {
    0%   { opacity: 0; transform: translateY(28px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes payqr-glow-pulse {
    0%, 100% { opacity: .55; transform: scale(1); }
    50%       { opacity: .85; transform: scale(1.08); }
  }

  @keyframes payqr-scan-line {
    0%   { top: 8%; opacity: .7; }
    50%  { top: 88%; opacity: 1; }
    100% { top: 8%; opacity: .7; }
  }

  @keyframes payqr-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }

  @keyframes payqr-dot-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: .3; }
  }

  @keyframes payqr-progress {
    from { width: 0%; }
    to   { width: 100%; }
  }

  .payqr-hero-slide-bg {
    position: absolute; inset: 0;
    background-size: cover;
    background-position: center;
    will-change: transform, opacity;
    transform-origin: center center;
  }

  .payqr-hero-slide-bg.active {
    animation:
      payqr-zoom-in-out 20s ease-in-out forwards,
      payqr-slide-fade-in ${TRANSITION_DURATION}ms ease forwards;
  }

  .payqr-hero-slide-bg.exiting {
    animation: payqr-slide-fade-out ${TRANSITION_DURATION}ms ease forwards;
  }

  .payqr-content-animate {
    animation: payqr-content-rise .9s cubic-bezier(.22,1,.36,1) both;
  }

  .payqr-indicator-btn {
    background: rgba(255,255,255,.22);
    border: 1.5px solid rgba(255,255,255,.35);
    border-radius: 50%;
    cursor: pointer;
    transition: all .3s ease;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(6px);
  }
  .payqr-indicator-btn:hover,
  .payqr-indicator-btn.payqr-active-dot {
    background: rgba(255,255,255,.9);
    border-color: #fff;
    transform: scale(1.15);
  }

  .payqr-pill-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 7px 16px;
    border-radius: 100px;
    font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,.22);
    background: rgba(255,255,255,.12);
    color: #fff;
    font-family: 'Inter', sans-serif;
  }

  /* Glassmorphism card */
  .payqr-glass-card {
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 18px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 8px 32px rgba(0,0,0,.22);
  }

  .payqr-cta-primary {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 15px 30px; border-radius: 12px;
    font-size: 15px; font-weight: 700;
    background: #fff; color: #0f172a;
    border: none; cursor: pointer; text-decoration: none;
    transition: all .25s ease;
    box-shadow: 0 4px 24px rgba(0,0,0,.22);
    font-family: 'Inter', sans-serif;
  }
  .payqr-cta-primary:hover {
    background: #f0f9ff;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 32px rgba(0,0,0,.30);
  }

  .payqr-cta-ghost {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 15px 30px; border-radius: 12px;
    font-size: 15px; font-weight: 600;
    background: rgba(255,255,255,.12);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,.35);
    cursor: pointer; text-decoration: none;
    transition: all .25s ease;
    backdrop-filter: blur(10px);
    font-family: 'Inter', sans-serif;
  }
  .payqr-cta-ghost:hover {
    background: rgba(255,255,255,.22);
    border-color: rgba(255,255,255,.6);
    transform: translateY(-2px);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .payqr-hero-section { height: 75vh !important; min-height: 520px !important; }
    .payqr-hero-title   { font-size: clamp(26px, 7vw, 40px) !important; }
    .payqr-hero-sub     { font-size: 15px !important; }
    .payqr-hero-btns    { flex-direction: column !important; align-items: flex-start !important; }
    .payqr-cta-primary, .payqr-cta-ghost { width: 100% !important; justify-content: center !important; }
    .payqr-qr-float     { display: none !important; }
    .payqr-stats-row    { gap: 16px !important; }
    .payqr-content-inner { padding: 0 24px !important; max-width: 100% !important; }
  }
  @media (max-width: 480px) {
    .payqr-hero-section { height: 75vh !important; }
    .payqr-hero-title   { font-size: 26px !important; }
  }
`;

/* ─── SUB-COMPONENTS ─────────────────────────────────────────────────────── */

/** Animated QR Code SVG visual */
function QrFloat({ accentColor }) {
  return (
    <div className="payqr-qr-float payqr-glass-card"
      style={{
        padding: 20,
        animation: 'payqr-float 4s ease-in-out infinite',
        minWidth: 180,
      }}
    >
      {/* QR matrix */}
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ display: 'block', margin: '0 auto 10px' }}>
        {/* Corner squares */}
        <rect x="8"   y="8"   width="38" height="38" rx="5" fill="#fff" opacity=".95"/>
        <rect x="14"  y="14"  width="26" height="26" rx="3" fill="#0f172a"/>
        <rect x="18"  y="18"  width="18" height="18" rx="2" fill="#fff"/>

        <rect x="94"  y="8"   width="38" height="38" rx="5" fill="#fff" opacity=".95"/>
        <rect x="100" y="14"  width="26" height="26" rx="3" fill="#0f172a"/>
        <rect x="104" y="18"  width="18" height="18" rx="2" fill="#fff"/>

        <rect x="8"   y="94"  width="38" height="38" rx="5" fill="#fff" opacity=".95"/>
        <rect x="14"  y="100" width="26" height="26" rx="3" fill="#0f172a"/>
        <rect x="18"  y="104" width="18" height="18" rx="2" fill="#fff"/>

        {/* Data modules */}
        {[
          [56,8],[68,8],[80,8],[56,20],[74,20],[62,26],[80,26],
          [8,56],[26,56],[38,56],[8,68],[20,68],[8,80],[32,80],
          [56,56],[74,56],[92,56],[110,56],[56,68],[80,68],[56,80],[68,80],[98,80],
          [56,92],[74,92],[86,92],[56,104],[68,104],[110,104],
          [56,116],[80,116],[98,116],[74,128],[104,128],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="6" height="6" rx="1.5" fill="rgba(255,255,255,.88)"/>
        ))}

        {/* Scan line animation */}
        <line
          x1="8" y1="70" x2="132" y2="70"
          stroke={accentColor} strokeWidth="2"
          strokeDasharray="6 3" opacity=".8"
          style={{ animation: 'payqr-scan-line 3s ease-in-out infinite' }}
        />
      </svg>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 20,
          background: `${accentColor}22`,
          border: `1px solid ${accentColor}55`,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: accentColor,
            animation: 'payqr-dot-blink 1.5s ease infinite',
          }}/>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: "'Inter', sans-serif", letterSpacing: '.04em' }}>
            QR Actif
          </span>
        </div>
      </div>
    </div>
  );
}

/** Mini wallet card */
function WalletFloat({ accentColor }) {
  return (
    <div className="payqr-glass-card"
      style={{
        padding: '16px 20px',
        animation: 'payqr-float 5s ease-in-out infinite .8s',
        minWidth: 200,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
          Portefeuille PayQR
        </span>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', animation: 'payqr-dot-blink 1.5s ease infinite .3s' }}/>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>
        47 500 <span style={{ fontSize: 13, color: accentColor }}>FCFA</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {[
          { label: 'Orange', color: '#f97316' },
          { label: 'MTN', color: '#eab308' },
        ].map(op => (
          <div key={op.label} style={{
            flex: 1, padding: '5px 0', borderRadius: 8, textAlign: 'center',
            background: `${op.color}22`, border: `1px solid ${op.color}44`,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: op.color, fontFamily: "'Inter', sans-serif" }}>
              {op.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Floating toast notification */
function ToastFloat() {
  return (
    <div className="payqr-glass-card"
      style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'payqr-float 3.5s ease-in-out infinite 1.2s',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
      }}>
        ✓
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif" }}>
          Paiement reçu !
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', fontFamily: "'Inter', sans-serif", marginTop: 1 }}>
          + 15 000 FCFA · Il y a 2s
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function HeroBanner({ slides = DEFAULT_SLIDES, onCtaClick, onLearnMore }) {
  const [current, setCurrent]   = useState(0);
  const [exiting, setExiting]   = useState(null);
  const [progress, setProgress] = useState(0);

  const timerRef    = useRef(null);
  const progRef     = useRef(null);
  const progStart   = useRef(Date.now());

  // Inject CSS once
  useEffect(() => {
    const tag = document.createElement('style');
    tag.id = 'payqr-hero-css';
    if (!document.getElementById('payqr-hero-css')) {
      tag.textContent = HERO_CSS;
      document.head.appendChild(tag);
    }
    return () => {
      const el = document.getElementById('payqr-hero-css');
      if (el) el.remove();
    };
  }, []);

  // Progress bar animation
  const startProgress = useCallback(() => {
    progStart.current = Date.now();
    setProgress(0);
    if (progRef.current) clearInterval(progRef.current);
    progRef.current = setInterval(() => {
      const elapsed = Date.now() - progStart.current;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(progRef.current);
    }, 50);
  }, []);

  // Slide transition logic
  const goTo = useCallback((next) => {
    if (next === current) return;
    setExiting(current);
    setCurrent(next);
    startProgress();
    setTimeout(() => setExiting(null), TRANSITION_DURATION + 100);
  }, [current, startProgress]);

  const advance = useCallback(() => {
    const next = (current + 1) % slides.length;
    goTo(next);
  }, [current, slides.length, goTo]);

  // Auto-advance every 20s
  useEffect(() => {
    startProgress();
    timerRef.current = setInterval(advance, SLIDE_DURATION);
    return () => {
      clearInterval(timerRef.current);
      clearInterval(progRef.current);
    };
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  const slide = slides[current];

  return (
    <section
      className="payqr-hero-section"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: 600,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── SLIDE BACKGROUNDS ── */}
      {slides.map((s, i) => {
        const isActive  = i === current;
        const isExiting = i === exiting;
        if (!isActive && !isExiting) return null;

        return (
          <div
            key={i}
            className={`payqr-hero-slide-bg ${isActive ? 'active' : 'exiting'}`}
            style={{
              backgroundImage: s.image ? `url(${s.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: s.bgPosition || 'center center',
              backgroundColor: '#0a0a1a',
              zIndex: isActive ? 1 : 2,
            }}
          >
            {/* Per-slide color tint */}
            <div style={{ position: 'absolute', inset: 0, background: s.tint || 'rgba(0,0,0,.55)' }} />
          </div>
        );
      })}

      {/* ── LAYERED OVERLAYS ── */}
      {/* Subtle unified dark vignette (lighter — per-slide tints handle main darkness) */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: 'linear-gradient(to right, rgba(0,0,0,.38) 0%, rgba(0,0,0,.20) 55%, rgba(0,0,0,.08) 100%)',
      }}/>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '35%', zIndex: 4,
        background: 'linear-gradient(to top, rgba(0,0,0,.55), transparent)',
      }}/>

      {/* Ambient glow blob */}
      <div style={{
        position: 'absolute',
        top: '10%', right: '8%',
        width: 420, height: 420,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${slide.accentColor}20 0%, transparent 70%)`,
        zIndex: 4,
        animation: 'payqr-glow-pulse 6s ease-in-out infinite',
        pointerEvents: 'none',
      }}/>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          position: 'absolute', inset: 0,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="payqr-content-inner"
          style={{
            width: '100%',
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 56px',
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: 48,
            alignItems: 'center',
          }}
          key={current} // re-trigger animation on slide change
        >
          {/* LEFT – Text content */}
          <div className="payqr-content-animate" style={{ animationDelay: '0ms' }}>
            {/* Badge */}
            <div style={{ marginBottom: 24 }}>
              <span className="payqr-pill-badge">
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: slide.accentColor,
                  animation: 'payqr-dot-blink 1.5s ease infinite',
                  flexShrink: 0,
                }}/>
                Fintech Africaine · Cameroun
              </span>
            </div>

            {/* Title */}
            <h1
              className="payqr-hero-title"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(32px, 4.5vw, 62px)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.08,
                letterSpacing: '-.025em',
                marginBottom: 22,
                textShadow: '0 2px 24px rgba(0,0,0,.3)',
              }}
            >
              Paiements QR{' '}
              <span style={{
                background: `linear-gradient(90deg, #3B82F6, #dedde3ff)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                instantanés
              </span>
              <br />
              pour l&apos;Afrique
            </h1>

            {/* Sub */}
            <p
              className="payqr-hero-sub"
              style={{
                fontSize: 17,
                color: 'rgba(255,255,255,.78)',
                lineHeight: 1.78,
                maxWidth: 520,
                marginBottom: 38,
                textShadow: '0 1px 8px rgba(0,0,0,.2)',
              }}
            >
              PayQR unifie{' '}
              <strong style={{ color: '#f97316', fontWeight: 700 }}>Orange Money</strong> et{' '}
              <strong style={{ color: '#eab308', fontWeight: 700 }}>MTN MoMo</strong>{' '}
              dans un portefeuille virtuel unique. Générez vos QR Codes, encaissez
              instantanément, gérez vos fonds.
            </p>

            {/* CTAs */}
            <div className="payqr-hero-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
              <a href="/register" className="payqr-cta-primary" id="hero-cta-register">
                Créer un compte gratuit
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#flux" className="payqr-cta-ghost" id="hero-cta-learn">
                Comment ça marche
              </a>
            </div>

            {/* Operator badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}>Compatible :</span>
              {[
                { letter: 'O', bg: '#f97316', color: '#fff', label: 'Orange Money' },
                { letter: 'M', bg: '#eab308', color: '#000', label: 'MTN MoMo'    },
              ].map(op => (
                <div key={op.label} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,.09)',
                  border: '1px solid rgba(255,255,255,.18)',
                  backdropFilter: 'blur(8px)',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: op.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 900, color: op.color,
                    fontFamily: "'Sora', sans-serif",
                  }}>{op.letter}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>{op.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT – Floating cards stack */}
          <div
            className="payqr-content-animate payqr-qr-float"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              animationDelay: '160ms',
            }}
            key={`cards-${current}`}
          >
            <QrFloat accentColor={slide.accentColor} />
            <WalletFloat accentColor={slide.accentColor} />
            <ToastFloat />
          </div>
        </div>
      </div>

      {/* ── BOTTOM CONTROLS ── */}
      <div style={{
        position: 'absolute',
        bottom: 36,
        left: 0, right: 0,
        zIndex: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        padding: '0 20px',
      }}>
        {/* Progress bar */}
        <div style={{
          width: 220, height: 2,
          background: 'rgba(255,255,255,.2)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: slide.accentColor,
            borderRadius: 2,
            transition: 'width .1s linear',
            boxShadow: `0 0 8px ${slide.accentColor}`,
          }}/>
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 10 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              id={`hero-dot-${i}`}
              className={`payqr-indicator-btn ${i === current ? 'payqr-active-dot' : ''}`}
              style={{
                width: i === current ? 28 : 10,
                height: 10,
                borderRadius: i === current ? 5 : '50%',
                transition: 'all .35s ease',
              }}
              onClick={() => goTo(i)}
              aria-label={`Aller au slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── SCROLL INDICATOR ── */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        right: 56,
        zIndex: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        opacity: .55,
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', letterSpacing: '.1em', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>
          Défiler
        </span>
        <div style={{
          width: 1.5,
          height: 40,
          background: 'linear-gradient(to bottom, rgba(255,255,255,.7), transparent)',
          borderRadius: 2,
        }}/>
      </div>
    </section>
  );
}
