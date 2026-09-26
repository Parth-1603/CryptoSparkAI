import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';

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
const TERM_LINES = [
  { tag: 'SYS',    text: 'CryptoSpark Engine v2.4 — INITIALIZED',  col: '#A2E037' },
  { tag: 'STREAM', text: 'BTC/USD → $67,241.02  Δ +2.45%',        col: '#00C288' },
  { tag: 'STREAM', text: 'ETH/USD → $3,542.88   Δ -1.12%',        col: '#00C288' },
  { tag: 'STREAM', text: 'SOL/USD → $142.15     Δ +8.90%',        col: '#00C288' },
  { tag: 'ML',     text: 'XGBoost inference — COMPLETE',            col: '#A2E037' },
  { tag: 'ML',     text: 'Predicted: $69,200  [conf: 91.8%]',      col: '#A2E037' },
  { tag: 'SIGNAL', text: '▲ ACCUMULATE  |  Risk: MODERATE',        col: '#F7C94E' },
  { tag: 'SPARK',  text: '14.2M records processed  |  42ms',       col: '#00C288' },
  { tag: 'AWS',    text: 'SageMaker endpoint — HEALTHY',            col: '#A2E037' },
  { tag: 'PIPE',   text: 'Throughput: 1.2 GB/s  |  Err: 0.00%',   col: '#00C288' },
];

function Terminal() {
  const [lines, setLines] = useState([TERM_LINES[0]]);
  const idxRef = useRef(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setLines(prev => {
        const next = [...prev, TERM_LINES[idxRef.current % TERM_LINES.length]];
        idxRef.current++;
        return next.length > 7 ? next.slice(-7) : next;
      });
    }, 1100);
    return () => clearInterval(t);
  }, []);

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
          { label: 'Accuracy', val: '94.2%', col: '#A2E037' },
          { label: 'Latency',  val: '42ms',  col: '#00C288' },
          { label: 'Records',  val: '14M+',  col: '#2C6E59' },
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
const TICKERS = [
  { sym: 'BTC',   price: '$67,241', chg: '+2.45%', pos: true,  bg: '#F7931A', letter: '₿' },
  { sym: 'ETH',   price: '$3,542',  chg: '-1.12%', pos: false, bg: '#627EEA', letter: 'Ξ' },
  { sym: 'SOL',   price: '$142.15', chg: '+8.90%', pos: true,  bg: '#14f195', letter: 'S', dark: true },
  { sym: 'BNB',   price: '$582.40', chg: '+0.50%', pos: true,  bg: '#F3BA2F', letter: 'B' },
  { sym: 'ADA',   price: '$0.485',  chg: '+3.10%', pos: true,  bg: '#0D47A1', letter: 'A' },
  { sym: 'MATIC', price: '$0.892',  chg: '+5.22%', pos: true,  bg: '#8247E5', letter: 'M' },
  { sym: 'DOT',   price: '$8.22',   chg: '+1.40%', pos: true,  bg: '#e6007a', letter: 'D' },
];

const PIPELINE = [
  { n: '01', label: 'Raw Data',  sub: 'API & RPC',    icon: 'cloud_download' },
  { n: '02', label: 'Amazon S3', sub: 'Data lake',    icon: 'storage' },
  { n: '03', label: 'AWS EMR',   sub: 'Spark',        icon: 'hub' },
  { n: '04', label: 'ML Engine', sub: 'XGBoost+LSTM', icon: 'neurology' },
  { n: '05', label: 'Dashboard', sub: 'Live insights', icon: 'monitoring', highlight: true },
];

/* ═══════════════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════════════ */
export default function Home() {
  const heroRef  = useRef(null);
  const statsRef = useScrollReveal();
  const featRef  = useScrollReveal();
  const pipeRef  = useScrollReveal();
  const ctaRef   = useScrollReveal();

  /* individual pipe step refs for staggered reveal */
  const pipeStepRefs = [useScrollReveal(), useScrollReveal(), useScrollReveal(), useScrollReveal(), useScrollReveal()];

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

  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── NAV ────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-10 py-4"
           style={{ background: 'rgba(5,8,7,0.80)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-white text-[10px] font-black">CS</span>
          </div>
          <span className="font-extrabold text-white text-sm tracking-tight hidden sm:block">CryptoSpark AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {['/', '/dashboard', '/predictions', '/infrastructure', '/about'].map((to, i) => (
            <Link key={to} to={to}
                  className="px-3.5 py-2 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/6 rounded-lg transition-all duration-200">
              {['Home', 'Dashboard', 'Predictions', 'Pipeline', 'About'][i]}
            </Link>
          ))}
        </div>

        <Link to="/dashboard"
              className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5">
          Launch App
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </nav>

      {/* ── HERO ───────────────────────────────── */}
      <section
        ref={heroRef}
        className="hero-bg hero-cursor-glow relative flex items-center min-h-screen px-6 lg:px-16 overflow-hidden"
        style={{ paddingTop: 120, paddingBottom: 80 }}   /* generous offset for fixed nav */
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

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* ── Left: copy ── */}
          <div className="space-y-8">
            <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                 style={{ background: 'rgba(44,110,89,0.12)', borderColor: 'rgba(44,110,89,0.35)' }}>
              <span className="live-dot" style={{ background: '#A2E037' }} />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                Spark Clusters — Active
              </span>
            </div>

            {/* Headline */}
            <div style={{ lineHeight: 0.95, letterSpacing: '-0.042em', fontWeight: 900 }}>
              <div className="block text-white animate-fade-in-up" style={{ fontSize: 'clamp(48px, 7.5vw, 96px)', animationDelay: '60ms' }}>
                <ScrambleText text="PREDICT" delay={180} />
              </div>
              <div className="block text-white animate-fade-in-up" style={{ fontSize: 'clamp(48px, 7.5vw, 96px)', animationDelay: '150ms' }}>
                <ScrambleText text="THE FUTURE" delay={380} />
              </div>
              <div className="block animate-fade-in-up" style={{ fontSize: 'clamp(48px, 7.5vw, 96px)', animationDelay: '240ms' }}>
                <span style={{
                  WebkitTextStroke: '2px rgba(162,224,55,0.70)',
                  color: 'transparent',
                  display: 'inline-block',
                }}>
                  <ScrambleText text="OF CRYPTO" delay={580} />
                </span>
              </div>
            </div>

            <p className="text-white/40 text-base lg:text-lg max-w-md leading-relaxed animate-fade-in-up"
               style={{ animationDelay: '340ms' }}>
              Distributed computing meets ensemble machine learning.
              <br />AWS S3 · Apache Spark · XGBoost · LSTM · React
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-in-up" style={{ animationDelay: '420ms' }}>
              <Link to="/dashboard"
                    className="btn-primary px-8 py-3.5 rounded-2xl text-base font-bold flex items-center gap-2.5 shadow-glow">
                <span className="material-symbols-outlined">rocket_launch</span>
                Launch Dashboard
              </Link>
              <Link to="/predictions"
                    className="btn-ghost px-8 py-3.5 rounded-2xl text-base font-semibold flex items-center gap-2.5"
                    style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)' }}>
                <span className="material-symbols-outlined">online_prediction</span>
                Try Predictions
              </Link>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              {[
                { val: '14M+',  label: 'Records' },
                { val: '94.2%', label: 'Accuracy' },
                { val: '<45ms', label: 'Latency' },
                { val: '1.2TB', label: 'Training' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="font-black text-white numerical leading-none" style={{ fontSize: 'clamp(16px, 2vw, 22px)' }}>{s.val}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: terminal ── */}
          <div className="animate-scale-in" style={{ animationDelay: '280ms' }}>
            <Terminal />
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
          {[...TICKERS, ...TICKERS, ...TICKERS, ...TICKERS].map((t, i) => (
            <div key={i}
                 className="flex items-center gap-3 px-4 py-2.5 rounded-xl border min-w-[185px] cursor-default transition-all duration-200 hover:-translate-y-0.5"
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
      </div>

      {/* ── MARQUEE BRAND STRIP ─────────────────── */}
      <div className="overflow-hidden py-5 border-b" style={{ background: '#0a0c0b', borderColor: 'rgba(255,255,255,0.04)' }}>
        {/* Row 1 → left */}
        <div className="overflow-hidden mb-2">
          <div className="flex whitespace-nowrap ticker-track" style={{ gap: '2rem' }}>
            {Array(8).fill(null).map((_, i) => (
              <span key={i} className="shrink-0 font-black text-white uppercase"
                    style={{ fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1 }}>
                PREDICT <span style={{ color: '#2C6E59' }}>·</span> ANALYZE <span style={{ color: '#2C6E59' }}>·</span> DOMINATE <span style={{ color: '#2C6E59' }}>·</span> AUTOMATE <span style={{ color: '#2C6E59' }}>·</span>
              </span>
            ))}
          </div>
        </div>
        {/* Row 2 → right */}
        <div className="overflow-hidden">
          <div className="flex whitespace-nowrap ticker-reverse" style={{ gap: '2rem' }}>
            {Array(8).fill(null).map((_, i) => (
              <span key={i} className="shrink-0 font-black uppercase"
                    style={{ fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1, WebkitTextStroke: '1.5px rgba(162,224,55,0.30)', color: 'transparent' }}>
                FORECAST · COMPETE · INNOVATE · EVOLVE ·&nbsp;
              </span>
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
              { to: 14,   suf: 'M+',  label: 'Records / Batch',   sub: 'Daily ingestion',       icon: 'database' },
              { to: 94,   suf: '.2%', label: 'Model Accuracy',    sub: 'XGBoost production',    icon: 'neurology' },
              { to: 45,   suf: 'ms',  label: 'Pipeline Latency',  sub: 'End-to-end',            icon: 'speed' },
              { to: 1200, suf: 'GB',  label: 'Training Corpus',   sub: 'Historical data',       icon: 'hard_drive' },
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
                    XGBoost & LSTM Ensemble
                  </h3>
                </div>
              </div>
              <p className="leading-relaxed mb-7" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Production ensemble of gradient boosting and deep recurrent networks trained on 1.2 TB of market data. Achieves 94.2% forecast accuracy on out-of-sample validation.
              </p>
              <div className="space-y-3">
                {[
                  { name: 'XGBoost', acc: 94.2, col: '#2C6E59' },
                  { name: 'LSTM',    acc: 91.8, col: '#A2E037' },
                  { name: 'Random Forest', acc: 88.5, col: '#5a9e1f' },
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
                  EMR-powered Spark processes 14M+ records per batch via SageMaker endpoints.
                </p>
              </div>
              <div className="mt-6 rounded-2xl p-4 text-center"
                   style={{ background: 'rgba(162,224,55,0.07)', border: '1px solid rgba(162,224,55,0.15)' }}>
                <p className="font-black text-3xl numerical" style={{ color: '#5a9e1f' }}>&lt;45ms</p>
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
            {/* Connector line */}
            <div className="hidden md:block absolute top-[38px] left-[10%] right-[10%] h-px"
                 style={{ background: 'linear-gradient(90deg, transparent, rgba(44,110,89,0.5) 20%, rgba(162,224,55,0.5) 50%, rgba(44,110,89,0.5) 80%, transparent)' }} />

            {/* Steps — each with its own scroll reveal ref */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {PIPELINE.map((s, i) => (
                <div key={s.n} ref={pipeStepRefs[i]} className="reveal flex flex-col items-center text-center group"
                     style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className={`relative z-10 w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-4 border transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-glow ${
                    s.highlight ? 'border-lime/40' : 'border-white/10'
                  }`}
                       style={{ background: s.highlight ? 'rgba(162,224,55,0.10)' : 'rgba(255,255,255,0.04)' }}>
                    <span className="material-symbols-outlined text-xl" style={{ color: s.highlight ? '#A2E037' : '#2C6E59' }}>
                      {s.icon}
                    </span>
                  </div>
                  <span className="numerical text-[10px] font-black mb-1" style={{ color: 'rgba(255,255,255,0.18)' }}>{s.n}</span>
                  <h4 className="font-bold text-sm mb-0.5" style={{ color: s.highlight ? '#A2E037' : '#ffffff' }}>{s.label}</h4>
                  <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.32)' }}>{s.sub}</p>
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard"
                  className="btn-primary px-10 py-4 rounded-2xl text-base font-bold flex items-center gap-2.5 shadow-glow">
              <span className="material-symbols-outlined">dashboard</span>
              Open Dashboard
            </Link>
            <Link to="/predictions"
                  className="btn-ghost px-10 py-4 rounded-2xl text-base font-semibold flex items-center gap-2.5">
              <span className="material-symbols-outlined">online_prediction</span>
              Try Predictions
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className="border-t py-10 px-8" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white text-[9px] font-black">CS</span>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>CryptoSpark AI</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>© 2024 · Academic Capstone</p>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            {[['/dashboard','Dashboard'],['/predictions','Predictions'],['/infrastructure','Infrastructure'],['/model-metrics','Metrics'],['/about','About']].map(([h,l]) => (
              <Link key={h} to={h} className="text-xs font-medium hover:text-primary transition-colors" style={{ color: 'var(--text-muted)' }}>{l}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
               style={{ background: 'rgba(44,110,89,0.08)', color: '#2C6E59', border: '1px solid rgba(44,110,89,0.2)' }}>
            <span className="live-dot" />LIVE
          </div>
        </div>
      </footer>

    </div>
  );
}
