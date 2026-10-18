import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

/* ═══════════════════════════════════════════════════════════
   SCRAMBLE TEXT  —  starts visible, then scrambles in
═══════════════════════════════════════════════════════════ */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!$%&';

function ScrambleText({ text, delay = 0 }) {
  const [display, setDisplay] = useState(text);   // start with real text so layout is stable

  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => {
      let iter = 0;
      const interval = setInterval(() => {
        setDisplay(
          text.split('').map((char, i) => {
            if (char === ' ') return ' ';
            if (i < iter) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join('')
        );
        iter += 0.5;
        if (iter >= text.length) { setDisplay(text); clearInterval(interval); }
      }, 30);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span aria-label={text}>{display}</span>;
}

/* ═══════════════════════════════════════════════════════════
   LIVE TERMINAL WIDGET
═══════════════════════════════════════════════════════════ */
function Terminal({ livePrices }) {
  const btcStr = livePrices?.btc || '$81,487.00';
  const btcChg = livePrices?.btcChange || '-1.50%';
  const ethStr = livePrices?.eth || '$2,432.50';
  const ethChg = livePrices?.ethChange || '-2.10%';
  const solStr = livePrices?.sol || '$104.53';
  const solChg = livePrices?.solChange || '-2.20%';

  const termLines = [
    { tag: 'SYS',    text: 'CryptoSpark Engine v2.4 — INITIALIZED',  col: '#A2E037' },
    { tag: 'STREAM', text: `BTC/USD → ${btcStr}  Δ ${btcChg}`,       col: '#00C288' },
    { tag: 'STREAM', text: `ETH/USD → ${ethStr}   Δ ${ethChg}`,       col: '#00C288' },
    { tag: 'STREAM', text: `SOL/USD → ${solStr}     Δ ${solChg}`,       col: '#00C288' },
    { tag: 'ML',     text: 'XGBoost inference — COMPLETE',            col: '#A2E037' },
    { tag: 'ML',     text: `Predicted: ${btcStr}  [R²: 99.3% | RMSE: $1,126]`, col: '#A2E037' },
    { tag: 'SIGNAL', text: '▲ ACCUMULATE  |  Risk: MODERATE',        col: '#F7C94E' },
    { tag: 'SPARK',  text: '5.2M records processed  |  42ms',         col: '#00C288' },
    { tag: 'AWS',    text: 'EC2 FastAPI endpoint — HEALTHY',           col: '#A2E037' },
    { tag: 'PIPE',   text: 'CoinGecko Live Feed + Cache — ACTIVE',    col: '#00C288' },
  ];

  const [lines, setLines] = useState([termLines[0]]);
  const idxRef = useRef(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setLines(prev => {
        const next = [...prev, termLines[idxRef.current % termLines.length]];
        idxRef.current++;
        return next.length > 7 ? next.slice(-7) : next;
      });
    }, 1100);
    return () => clearInterval(t);
  }, [btcStr, btcChg, ethStr, ethChg, solStr, solChg]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background: '#050807', border: '1px solid rgba(44,110,89,0.35)', boxShadow: '0 0 60px rgba(44,110,89,0.10)' }}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b"
           style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(186,26,26,0.6)' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(162,224,55,0.6)' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(0,194,136,0.6)' }} />
        </div>
        <p className="flex-1 text-center text-[10px] font-mono font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>
          ml-engine@cryptospark ~ inference
        </p>
        <span className="live-dot" style={{ background: '#A2E037' }} />
      </div>

      {/* Output */}
      <div ref={containerRef} className="p-5 font-mono text-[11px] leading-relaxed space-y-2 overflow-hidden" style={{ minHeight: 200 }}>
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2.5 animate-fade-in">
            <span className="shrink-0 font-black text-[10px]" style={{ color: line.col }}>[{line.tag}]</span>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{line.text}</span>
          </div>
        ))}
        <span className="text-primary animate-blink text-base">█</span>
      </div>

      {/* Metric chips */}
      <div className="px-5 pb-5 grid grid-cols-3 gap-2">
        {[
          { label: 'Accuracy', val: '99.3%', col: '#A2E037' },
          { label: 'Latency',  val: '42ms',  col: '#00C288' },
          { label: 'Records',  val: '5.2M+', col: '#2C6E59' },
        ].map(m => (
          <div key={m.label} className="rounded-xl px-2 py-2.5 text-center"
               style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-black text-xl numerical" style={{ color: m.col }}>{m.val}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3D TILT CARD
═══════════════════════════════════════════════════════════ */
function TiltCard({ children, className = '', style = {} }) {
  const ref = useRef(null);
  const raf = useRef(null);

  const onMove = useCallback((e) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const x = (e.clientX - r.left)  / r.width  - 0.5;
      const y = (e.clientY - r.top)   / r.height - 0.5;
      ref.current.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) scale(1.015)`;
      ref.current.style.boxShadow  = `${-x * 20}px ${-y * 14}px 40px rgba(44,110,89,0.10)`;
    });
  }, []);

  const onLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = '';
    ref.current.style.boxShadow = '';
  }, []);

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
         className={`tilt-card ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════════ */
function Counter({ to, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / duration, 1);
          setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) requestAnimationFrame(tick); else setVal(to);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const DEFAULT_TICKERS = [
  { sym: 'BTC',   price: '$81,487.00', chg: '-1.50%', pos: false, bg: '#F7931A', letter: '₿' },
  { sym: 'ETH',   price: '$2,432.50',  chg: '-2.10%', pos: false, bg: '#627EEA', letter: 'Ξ' },
  { sym: 'SOL',   price: '$104.53',    chg: '-2.20%', pos: false, bg: '#14f195', letter: 'S', dark: true },
  { sym: 'BNB',   price: '$625.40',    chg: '+0.50%', pos: true,  bg: '#F3BA2F', letter: 'B' },
  { sym: 'ADA',   price: '$0.2228',    chg: '-4.30%', pos: false, bg: '#0D47A1', letter: 'A' },
  { sym: 'MATIC', price: '$0.382',     chg: '+1.20%', pos: true,  bg: '#8247E5', letter: 'M' },
  { sym: 'DOT',   price: '$4.22',      chg: '+1.40%', pos: true,  bg: '#e6007a', letter: 'D' },
];

const PIPELINE = [
  { n: '01', label: 'Raw Ingestion',  sub: 'CoinGecko + Kaggle', detail: 'Live REST + 5.2M CSV', icon: 'cloud_download', badge: 'LIVE FEED' },
  { n: '02', label: 'Amazon S3',      sub: 'Parquet Data Lake',  detail: 'Compressed historical store', icon: 'storage', badge: 'AWS CLOUD' },
  { n: '03', label: 'AWS EMR Spark',  sub: 'Distributed Cluster', detail: 'Feature engineering & MAs', icon: 'hub', badge: '42ms SPARK' },
  { n: '04', label: 'ML Inference',   sub: '6 Ensembled Models', detail: 'XGBoost (99.3% R²) + Groq', icon: 'neurology', badge: 'TOP ACCURACY' },
  { n: '05', label: 'Dashboard',      sub: 'FastAPI + React',    detail: 'Real-time telemetry & explain', icon: 'monitoring', highlight: true, badge: 'SUB-45MS' },
];

/* ═══════════════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tickers, setTickers] = useState(DEFAULT_TICKERS);
  const [livePrices, setLivePrices] = useState({
    btc: '$81,487.00',
    btcChange: '-1.50%',
    eth: '$2,432.50',
    ethChange: '-2.10%',
    sol: '$104.53',
    solChange: '-2.20%',
  });

  const { isDark } = useTheme();
  const heroRef  = useRef(null);
  const statsRef = useScrollReveal();
  const featRef  = useScrollReveal();
  const pipeRef  = useScrollReveal();
  const ctaRef   = useScrollReveal();



  /* Live market data polling for Home tickers and terminal stream */
  useEffect(() => {
    let mounted = true;
    const fetchLive = () => {
      api.getWatchlist()
        .then((items) => {
          if (!mounted || !Array.isArray(items) || items.length === 0) return;
          const map = {};
          items.forEach(it => {
            map[it.sym] = {
              price: it.price,
              chg: it.change,
              pos: it.pos
            };
          });

          setTickers(prev => prev.map(t => {
            if (map[t.sym]) {
              return {
                ...t,
                price: map[t.sym].price,
                chg: map[t.sym].chg,
                pos: map[t.sym].pos
              };
            }
            return t;
          }));

          if (map['BTC']) {
            setLivePrices(lp => ({
              ...lp,
              btc: map['BTC'].price,
              btcChange: map['BTC'].chg,
              eth: map['ETH'] ? map['ETH'].price : lp.eth,
              ethChange: map['ETH'] ? map['ETH'].chg : lp.ethChange,
              sol: map['SOL'] ? map['SOL'].price : lp.sol,
              solChange: map['SOL'] ? map['SOL'].chg : lp.solChange,
            }));
          }
        })
        .catch(() => {});
    };

    fetchLive();
    const interval = setInterval(fetchLive, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  /* Ensure top of page on load / refresh */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  /* cursor glow */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e) => {
      hero.style.setProperty('--mx', `${e.clientX}px`);
      hero.style.setProperty('--my', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const homeNavItems = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/predictions', label: 'Predictions' },
    { to: '/model-metrics', label: 'Metrics' },
    { to: '/infrastructure', label: 'Pipeline' },
    { to: '/about', label: 'About' },
  ];

  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── FLOATING CAPSULE NAVBAR (Attached Design) ── */}
      <header className="fixed top-4 sm:top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav
          className="pointer-events-auto w-full max-w-4xl rounded-full px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between transition-all duration-300 backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(12, 16, 14, 0.72)' : 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: isDark ? '#ffffff' : '#000000',
            border: isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.6)',
            boxShadow: isDark
              ? '0 16px 40px -8px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.18)'
              : '0 16px 40px -8px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.95)',
          }}
        >
          {/* Left Circular Badge */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="CryptoSpark AI Home"
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm tracking-tighter transition-transform duration-200 group-hover:scale-105 shadow-sm"
              style={{
                background: isDark ? '#ffffff' : '#000000',
                color: isDark ? '#000000' : '#ffffff',
              }}
            >
              CS
            </div>
            <span className="font-extrabold text-sm tracking-tight hidden lg:block pr-2">
              CryptoSpark
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 px-2">
            {homeNavItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="text-xs sm:text-sm font-semibold transition-opacity duration-200 hover:opacity-65"
                style={{
                  color: isDark ? '#ffffff' : '#000000',
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Action Pill Button + Mobile Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/dashboard"
              className="rounded-full px-4 sm:px-6 py-2 sm:py-2.5 font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm flex items-center gap-1.5 min-h-[38px]"
              style={{
                background: isDark ? '#ffffff' : '#000000',
                color: isDark ? '#000000' : '#ffffff',
              }}
            >
              <span>Launch App</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                color: isDark ? '#ffffff' : '#000000',
              }}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              <span className="material-symbols-outlined text-xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="fixed top-20 sm:top-24 left-4 right-4 z-50 max-w-md mx-auto rounded-3xl p-4 shadow-2xl backdrop-blur-2xl border animate-fade-in-up"
          style={{
            background: isDark ? 'rgba(10,12,11,0.96)' : 'rgba(255,255,255,0.96)',
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            color: isDark ? '#ffffff' : '#000000',
          }}
        >
          <div className="flex flex-col gap-1">
            {homeNavItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center justify-between min-h-[44px]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  color: isDark ? '#ffffff' : '#000000',
                }}
              >
                <span>{item.label}</span>
                <span className="material-symbols-outlined text-xs opacity-50">arrow_forward_ios</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── HERO ───────────────────────────────── */}
      <section
        ref={heroRef}
        className="hero-bg hero-cursor-glow relative flex items-center min-h-screen px-4 sm:px-6 lg:px-16 overflow-hidden"
        style={{ paddingTop: 110, paddingBottom: 70 }}   /* generous offset for fixed nav */
      >
        {/* Decorative rings */}
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full border ring-drift pointer-events-none"
             style={{ borderColor: 'rgba(44,110,89,0.10)' }} />
        <div className="absolute -top-12 -right-12 w-[380px] h-[380px] rounded-full border pointer-events-none"
             style={{ borderColor: 'rgba(162,224,55,0.06)', animation: 'ring-drift 22s ease-in-out infinite reverse' }} />
        <div className="absolute bottom-32 -left-32 w-[300px] h-[300px] rounded-full border ring-drift pointer-events-none"
             style={{ borderColor: 'rgba(44,110,89,0.07)', animationDelay: '5s' }} />

        {/* Orbs */}
        <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full animate-float pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(44,110,89,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* ── Left: copy ── */}
          <div className="space-y-6 sm:space-y-8">
            <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                 style={{ background: 'rgba(44,110,89,0.12)', borderColor: 'rgba(44,110,89,0.35)' }}>
              <span className="live-dot" style={{ background: '#A2E037' }} />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                Spark Clusters — Active
              </span>
            </div>

            {/* Headline */}
            <div style={{ lineHeight: 0.95, letterSpacing: '-0.042em', fontWeight: 900 }}>
              <div className="block text-white animate-fade-in-up" style={{ fontSize: 'clamp(36px, 7.5vw, 96px)', animationDelay: '60ms' }}>
                <ScrambleText text="PREDICT" delay={180} />
              </div>
              <div className="block text-white animate-fade-in-up" style={{ fontSize: 'clamp(36px, 7.5vw, 96px)', animationDelay: '150ms' }}>
                <ScrambleText text="THE FUTURE" delay={380} />
              </div>
              <div className="block animate-fade-in-up" style={{ fontSize: 'clamp(36px, 7.5vw, 96px)', animationDelay: '240ms' }}>
                <span style={{
                  WebkitTextStroke: '2px rgba(162,224,55,0.70)',
                  color: 'transparent',
                  display: 'inline-block',
                }}>
                  <ScrambleText text="OF CRYPTO" delay={580} />
                </span>
              </div>
            </div>

            <p className="text-white/50 text-sm sm:text-base lg:text-lg max-w-md leading-relaxed animate-fade-in-up"
               style={{ animationDelay: '340ms' }}>
              Distributed computing meets ensemble machine learning.
              <br />CoinGecko Live · AWS S3 · Apache Spark · 6 ML Models · React
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: '420ms' }}>
              <Link to="/dashboard"
                    className="btn-primary px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-bold flex items-center gap-2.5 shadow-glow min-h-[44px]">
                <span className="material-symbols-outlined">rocket_launch</span>
                Launch Dashboard
              </Link>
              <Link to="/predictions"
                    className="btn-ghost px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-semibold flex items-center gap-2.5 min-h-[44px]"
                    style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)' }}>
                <span className="material-symbols-outlined">online_prediction</span>
                Try Predictions
              </Link>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-white/8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              {[
                { val: '5.2M+', label: 'Records' },
                { val: '99.3%', label: 'Top Accuracy' },
                { val: '<42ms', label: 'Latency' },
                { val: '6 Models', label: 'Benchmarked' },
              ].map(s => (
                <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="font-black text-white numerical leading-none" style={{ fontSize: 'clamp(16px, 2vw, 22px)' }}>{s.val}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: terminal ── */}
          <div className="animate-scale-in" style={{ animationDelay: '280ms' }}>
            <Terminal livePrices={livePrices} />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float opacity-25">
          <span className="text-white text-[9px] font-black uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white to-transparent rounded-full" />
        </div>
      </section>

      {/* ── TICKER ─────────────────────────────── */}
      <div className="py-4 border-y overflow-hidden ticker-wrap"
           style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="ticker-track">
          {[0, 1].map((copyIdx) => (
            <div key={copyIdx} className="flex items-center gap-4 shrink-0 pr-4">
              {[...tickers, ...tickers].map((t, i) => (
                <div key={`${copyIdx}-${t.sym}-${i}`}
                     className="flex items-center gap-3 px-4 py-2.5 rounded-xl border min-w-[185px] shrink-0 cursor-default transition-all duration-200 hover:-translate-y-0.5"
                     style={{ background: 'var(--surface-low)', borderColor: 'var(--border)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0"
                       style={{ background: t.bg, color: t.dark ? '#000' : '#fff' }}>
                    {t.letter}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{t.sym}</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${t.pos ? 'text-mint-green bg-mint-green/10' : 'text-error bg-error/10'}`}>
                        {t.chg}
                      </span>
                    </div>
                    <span className="numerical text-xs font-semibold" style={{ color: 'var(--text)' }}>{t.price}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── MARQUEE BRAND STRIP ─────────────────── */}
      <div className="overflow-hidden py-5 border-b ticker-wrap" style={{ background: '#0a0c0b', borderColor: 'rgba(255,255,255,0.04)' }}>
        {/* Row 1 → left */}
        <div className="overflow-hidden mb-2">
          <div className="ticker-track">
            {[0, 1].map((copyIdx) => (
              <div key={copyIdx} className="flex items-center shrink-0 pr-8" style={{ gap: '2rem' }}>
                {Array(4).fill(null).map((_, i) => (
                  <span key={i} className="shrink-0 font-black text-white uppercase select-none"
                        style={{ fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1 }}>
                    PREDICT <span style={{ color: '#2C6E59' }}>·</span> ANALYZE <span style={{ color: '#2C6E59' }}>·</span> DOMINATE <span style={{ color: '#2C6E59' }}>·</span> AUTOMATE <span style={{ color: '#2C6E59' }}>·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Row 2 → right */}
        <div className="overflow-hidden">
          <div className="ticker-reverse">
            {[0, 1].map((copyIdx) => (
              <div key={copyIdx} className="flex items-center shrink-0 pr-8" style={{ gap: '2rem' }}>
                {Array(4).fill(null).map((_, i) => (
                  <span key={i} className="shrink-0 font-black uppercase select-none"
                        style={{ fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1, WebkitTextStroke: '1.5px rgba(162,224,55,0.30)', color: 'transparent' }}>
                    FORECAST · COMPETE · INNOVATE · EVOLVE ·&nbsp;
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ──────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: '#0a0c0b' }}>
        <div ref={statsRef} className="reveal max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary whitespace-nowrap">By the numbers</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden"
               style={{ background: 'rgba(255,255,255,0.04)' }}>
            {[
              { to: 5,   suf: '.2M+', label: 'Processed Records', sub: 'Kaggle Spark Ingestion', icon: 'database' },
              { to: 99,  suf: '.3%',  label: 'Top Model Accuracy', sub: 'XGBoost Production R²', icon: 'neurology' },
              { to: 42,  suf: 'ms',   label: 'Pipeline Latency',  sub: 'End-to-end Inference', icon: 'speed' },
              { to: 6,   suf: ' Models', label: 'Benchmarked Algos', sub: 'XGBoost, LSTM, Ensemble+', icon: 'candlestick_chart' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-10 text-center"
                   style={{ background: '#0a0c0b' }}>
                <span className="material-symbols-outlined text-primary text-xl mb-4 opacity-50">{s.icon}</span>
                <p className="font-black text-white numerical mb-2" style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', lineHeight: 1 }}>
                  <Counter to={s.to} suffix={s.suf} />
                </p>
                <p className="font-bold text-white/70 text-sm">{s.label}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.22)' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ─────────────────────── */}
      <section className="py-24 px-6" style={{ background: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto">

          <div ref={featRef} className="reveal mb-16 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Platform Capabilities</span>
            <h2 className="font-extrabold mt-4 mb-4"
                style={{ fontSize: 'clamp(26px, 4.5vw, 48px)', letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1 }}>
              Enterprise tools.<br />
              <span className="text-gradient">Open to everyone.</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              From real-time data ingestion to ML inference — the full stack in one dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Large card */}
            <TiltCard className="md:col-span-7 glass-card grad-border rounded-2xl p-8 cursor-default">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(44,110,89,0.10)' }}>
                  <span className="material-symbols-outlined text-primary text-2xl">neurology</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>MACHINE LEARNING</span>
                  <h3 className="font-extrabold text-xl mt-0.5" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
                    XGBoost & Multi-Model Benchmarks
                  </h3>
                </div>
              </div>
              <p className="leading-relaxed mb-7" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Production ensemble of gradient boosting and deep neural architectures trained on distributed market datasets. Achieves 99.3% R² precision with ~$1,126 RMSE on Bitcoin forecasting.
              </p>
              <div className="space-y-3">
                {[
                  { name: 'XGBoost', acc: 99.3, col: '#2C6E59' },
                  { name: 'Random Forest', acc: 98.9, col: '#5a9e1f' },
                  { name: 'Ensemble Blend', acc: 98.1, col: '#3d8f74' },
                  { name: 'LSTM Network', acc: 97.4, col: '#A2E037' },
                ].map(m => (
                  <div key={m.name} className="flex items-center gap-3">
                    <span className="w-24 text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{m.name}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-high)' }}>
                      <div className="h-full rounded-full" style={{ width: `${m.acc}%`, background: m.col }} />
                    </div>
                    <span className="w-12 text-right numerical text-[11px] font-black" style={{ color: m.col }}>{m.acc}%</span>
                  </div>
                ))}
              </div>
            </TiltCard>

            {/* AWS card */}
            <TiltCard className="md:col-span-5 glass-card grad-border rounded-2xl p-8 cursor-default flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-lime/10 flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-2xl" style={{ color: '#5a9e1f' }}>hub</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>AWS NATIVE</span>
                <h3 className="font-extrabold text-xl mt-1 mb-3" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  Distributed Spark Pipeline
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  AWS EMR-powered Apache Spark processes 5.2M+ historical records with CoinGecko live market streaming. FastAPI on EC2 serves live inference at sub-45ms latency.
                </p>
              </div>
              <div className="mt-6 rounded-2xl p-4 text-center"
                   style={{ background: 'rgba(162,224,55,0.07)', border: '1px solid rgba(162,224,55,0.15)' }}>
                <p className="font-black text-3xl numerical" style={{ color: '#5a9e1f' }}>&lt;42ms</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>End-to-end latency</p>
              </div>
            </TiltCard>

            {/* 3 smaller cards */}
            {[
              { icon: 'radar',      tag: 'REAL-TIME', title: 'Live WebSocket Feeds',    desc: 'Sub-second price & order-book streaming from 5 exchanges into the feature store.' },
              { icon: 'monitoring', tag: 'ANALYTICS', title: 'Institutional Charts',    desc: 'RSI, MACD, Bollinger Bands, and volume profiles in an interactive dashboard.' },
              { icon: 'psychology', tag: 'NLP',       title: 'Sentiment Analysis',      desc: 'On-chain and social media signals encoded alongside 200+ technical indicators.' },
            ].map(f => (
              <TiltCard key={f.title} className="md:col-span-4 glass-card grad-border rounded-2xl p-6 cursor-default">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(44,110,89,0.08)' }}>
                  <span className="material-symbols-outlined text-primary">{f.icon}</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>{f.tag}</span>
                <h3 className="font-bold text-base mt-1 mb-2" style={{ color: 'var(--text)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── PIPELINE ────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: '#0a0c0b' }}>
        <div className="max-w-6xl mx-auto">

          <div ref={pipeRef} className="reveal text-center mb-20">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Data Flow</span>
            <h2 className="font-extrabold text-white mt-4"
                style={{ fontSize: 'clamp(26px, 4vw, 48px)', letterSpacing: '-0.03em' }}>
              From raw feeds to{' '}
              <span className="text-gradient-lime">actionable alpha.</span>
            </h2>
          </div>

          <div className="relative">
            {/* Desktop Animated Connector Line with Flowing Beams */}
            <div className="hidden md:block data-flow-connector">
              <div className="data-flow-pulse" />
              <div className="data-flow-pulse data-flow-pulse-delayed" />
            </div>

            {/* Steps — each with animated status indicator, ripple ping, and hover glow */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {PIPELINE.map((s, i) => (
                <div key={s.n} className="flex flex-col items-center text-center group relative cursor-default transition-all duration-300">
                  
                  {/* Step Icon Box with animated radar ping */}
                  <div className="relative mb-4">
                    <div className="data-flow-node-ping" style={{ animationDelay: `${i * 0.6}s` }} />
                    <div
                      className={`relative z-10 w-[76px] h-[76px] rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-glow ${
                        s.highlight
                          ? 'border-lime/60 shadow-glow-lime'
                          : 'border-white/15 hover:border-primary/50'
                      }`}
                      style={{
                        background: s.highlight ? 'rgba(162,224,55,0.18)' : '#0e1210',
                        boxShadow: s.highlight
                          ? '0 0 24px rgba(162,224,55,0.25), inset 0 1px 1px rgba(255,255,255,0.2)'
                          : '0 4px 20px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.08)',
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-3xl transition-transform duration-300 group-hover:scale-110"
                        style={{ color: s.highlight ? '#A2E037' : '#00C288' }}
                      >
                        {s.icon}
                      </span>
                    </div>

                    {/* Step sequence badge */}
                    <span
                      className="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border shadow-md"
                      style={{
                        background: s.highlight ? '#A2E037' : '#171a19',
                        color: s.highlight ? '#0a0c0b' : '#A2E037',
                        borderColor: s.highlight ? '#A2E037' : 'rgba(162,224,55,0.4)',
                      }}
                    >
                      {s.n}
                    </span>
                  </div>

                  {/* Operational tag */}
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-2 transition-all duration-200 group-hover:scale-105"
                    style={{
                      background: s.highlight ? 'rgba(162,224,55,0.18)' : 'rgba(44,110,89,0.22)',
                      color: s.highlight ? '#A2E037' : '#00C288',
                      border: s.highlight ? '1px solid rgba(162,224,55,0.4)' : '1px solid rgba(44,110,89,0.4)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.highlight ? '#A2E037' : '#00C288' }} />
                    {s.badge}
                  </span>

                  <h4 className="font-extrabold text-sm mb-1 transition-colors duration-200" style={{ color: s.highlight ? '#A2E037' : '#ffffff' }}>
                    {s.label}
                  </h4>
                  <p className="text-[12px] font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {s.sub}
                  </p>
                  <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {s.detail}
                  </p>

                  {/* Mobile downward connector */}
                  {i < PIPELINE.length - 1 && (
                    <div className="md:hidden flex flex-col items-center my-3 text-primary animate-pulse">
                      <span className="material-symbols-outlined text-base">keyboard_double_arrow_down</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        <div ref={ctaRef} className="reveal relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border"
               style={{ background: 'rgba(44,110,89,0.06)', borderColor: 'rgba(44,110,89,0.2)' }}>
            <span className="live-dot" />
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Free · Open Access · Academic</span>
          </div>

          <h2 className="font-extrabold mb-6"
              style={{ fontSize: 'clamp(30px, 5.5vw, 60px)', letterSpacing: '-0.035em', color: 'var(--text)', lineHeight: 1.05 }}>
            Ready to see the{' '}
            <span className="text-gradient">next market move?</span>
          </h2>

          <p className="mb-10 text-base lg:text-lg leading-relaxed mx-auto"
             style={{ color: 'var(--text-muted)', maxWidth: 440 }}>
            Jump into the live dashboard, run interactive ML predictions, or explore the full distributed architecture.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Link to="/dashboard"
                  className="btn-primary px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 shadow-glow w-full sm:w-auto min-h-[48px]">
              <span className="material-symbols-outlined">dashboard</span>
              Open Dashboard
            </Link>
            <Link to="/predictions"
                  className="btn-ghost px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 w-full sm:w-auto min-h-[48px]">
              <span className="material-symbols-outlined">online_prediction</span>
              Try Predictions
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className="border-t py-8 px-6 sm:px-8" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white text-[9px] font-black">CS</span>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>CryptoSpark AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
               style={{ background: 'rgba(44,110,89,0.08)', color: '#2C6E59', border: '1px solid rgba(44,110,89,0.2)' }}>
            <span className="live-dot" />LIVE
          </div>
        </div>
      </footer>

    </div>
  );
}
