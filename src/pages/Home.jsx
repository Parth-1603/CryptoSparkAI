import React from 'react';
import { Link } from 'react-router-dom';

const tickerItems = [
  { symbol: 'BTC', price: '$67,241.02', change: '+2.45%', isPositive: true, color: '#F7931A', letter: '₿' },
  { symbol: 'ETH', price: '$3,542.88', change: '-1.12%', isPositive: false, color: '#627EEA', letter: 'Ξ' },
  { symbol: 'SOL', price: '$142.15', change: '+8.90%', isPositive: true, color: '#14f195', letter: 'S' },
  { symbol: 'BNB', price: '$582.40', change: '+0.50%', isPositive: true, color: '#F3BA2F', letter: 'B' },
  { symbol: 'ADA', price: '$0.485', change: '+3.10%', isPositive: true, color: '#0033AD', letter: 'A' },
  { symbol: 'DOT', price: '$8.22', change: '+1.40%', isPositive: true, color: '#e6007a', letter: 'D' },
];

const features = [
  {
    icon: 'radar',
    title: 'Real-Time Prices',
    desc: 'Low-latency data streams direct from global exchanges via WebSocket.',
    col: 'md:col-span-4',
  },
  {
    icon: 'neurology',
    title: 'Advanced ML Predictions',
    desc: 'XGBoost-LSTM ensemble evaluates over 200 technical indicators with 78% historical accuracy.',
    col: 'md:col-span-8',
    tags: ['Sentiment Analysis', 'Volatility Index', 'Liquidity Flow'],
  },
  {
    icon: 'database',
    title: 'Big Data Aggregation',
    desc: 'Ingesting 50 GB+ of raw data daily into a distributed lakehouse.',
    col: 'md:col-span-6',
  },
  {
    icon: 'monitoring',
    title: 'Deep Analytics',
    desc: 'Interactive charting with key performance indicators.',
    col: 'md:col-span-3',
  },
  {
    icon: 'cloud',
    title: 'AWS Native',
    desc: 'Serverless scaling via EMR and SageMaker.',
    col: 'md:col-span-3',
  },
];

const pipelineSteps = [
  { step: '01', title: 'Raw Dataset', desc: 'API & RPC Ingestion' },
  { step: '02', title: 'Amazon S3', desc: 'Durable Data Lake' },
  { step: '03', title: 'AWS EMR', desc: 'Spark Processing' },
  { step: '04', title: 'ML Engine', desc: 'XGBoost & LSTM' },
  { step: '05', title: 'Insights', desc: 'Live Dashboard', highlight: true },
];

export default function Home() {
  return (
    <div className="bg-background overflow-x-hidden min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 w-full z-40 flex justify-between items-center px-6 py-4 border-b border-outline-variant/50 bg-surface-container-lowest/90 backdrop-blur-md shadow-sm">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm">
            <span className="text-white text-[10px] font-black">CS</span>
          </div>
          <span className="font-extrabold text-lg text-primary tracking-tight leading-none">
            CryptoSpark AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[
            { to: '/', label: 'Home', active: true },
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/predictions', label: 'Predictions' },
            { to: '/infrastructure', label: 'Pipeline' },
            { to: '/about', label: 'About' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                link.active
                  ? 'text-primary bg-primary/8'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          to="/dashboard"
          className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold shadow-sm"
        >
          Launch Dashboard
        </Link>
      </nav>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="hero-glow relative min-h-[680px] flex flex-col items-center justify-center px-6 text-center pt-16 pb-20 overflow-hidden">
          {/* Background orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-lime/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto space-y-7">
            {/* Live badge */}
            <div className="animate-fade-in inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/8 border border-primary/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse"></span>
              <span className="text-primary font-semibold text-[11px] uppercase tracking-widest">
                Live: Apache Spark Clusters Active
              </span>
            </div>

            <h1
              className="animate-fade-in-up font-extrabold text-charcoal leading-tight"
              style={{ fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '-0.03em' }}
            >
              AI-Powered Cryptocurrency<br />
              <span className="text-gradient-primary">Forecasting via Big Data</span>
            </h1>

            <p className="animate-fade-in-up text-cool-grey text-lg max-w-2xl mx-auto leading-relaxed"
               style={{ animationDelay: '100ms' }}>
              Harness distributed <span className="text-charcoal font-semibold">AWS S3 + Apache Spark</span> pipelines
              to generate sub-second alpha through ensemble{' '}
              <span className="text-charcoal font-semibold">XGBoost & LSTM</span> models.
            </p>

            <div className="animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4"
                 style={{ animationDelay: '180ms' }}>
              <Link
                to="/dashboard"
                className="btn-primary px-8 py-3.5 rounded-xl text-base font-semibold flex items-center gap-2 glow-primary"
              >
                Launch Dashboard
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </Link>
              <Link
                to="/infrastructure"
                className="px-8 py-3.5 rounded-xl text-base font-semibold bg-white border border-outline-variant text-charcoal hover:bg-surface-container hover:border-primary transition-all duration-300 flex items-center gap-2"
              >
                View Architecture
                <span className="material-symbols-outlined text-xl">account_tree</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Ticker ── */}
        <section className="py-5 border-y border-outline-variant/60 bg-white/80 backdrop-blur-sm overflow-hidden ticker-fade">
          <div className="flex gap-4 whitespace-nowrap animate-marquee">
            {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-outline-variant/60 min-w-[200px] shadow-card hover:shadow-card-hover hover:border-outline transition-all duration-300 cursor-default"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  {item.letter}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal text-sm">{item.symbol}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      item.isPositive ? 'text-positive bg-positive/10' : 'text-error bg-error/10'
                    }`}>
                      {item.change}
                    </span>
                  </div>
                  <span className="font-semibold text-xs text-charcoal numerical-data">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature Bento Grid ── */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="mb-16 text-center space-y-3">
            <h2 className="font-extrabold text-charcoal" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
              Enterprise Capabilities
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-outline-variant"></div>
              <div className="h-1.5 w-10 bg-lime rounded-full"></div>
              <div className="h-px w-12 bg-outline-variant"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`${f.col} card-flat p-7 rounded-2xl gradient-border group`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors duration-300">
                  <span className="material-symbols-outlined text-primary">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-charcoal mb-2">{f.title}</h3>
                <p className="text-cool-grey text-sm leading-relaxed">{f.desc}</p>
                {f.tags && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {f.tags.map(tag => (
                      <span key={tag} className="bg-surface-container-low px-2.5 py-1 rounded-md text-[10px] font-bold text-cool-grey border border-outline-variant uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Pipeline Architecture ── */}
        <section className="py-24 bg-white/80 backdrop-blur-sm border-y border-outline-variant/60 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-2">
              <h2 className="font-extrabold text-charcoal" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
                Pipeline Architecture
              </h2>
              <p className="text-cool-grey text-sm">How raw data becomes actionable alpha</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
              {pipelineSteps.map((s, i) => (
                <div key={s.step} className="flex flex-col items-center gap-3">
                  <div className={`relative w-full p-5 rounded-2xl border text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${
                    s.highlight
                      ? 'bg-lime border-lime/50 shadow-glow-lime'
                      : 'bg-white border-outline-variant hover:border-primary/30'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-3 text-xs font-black ${
                      s.highlight ? 'bg-charcoal text-lime' : 'bg-primary/10 text-primary'
                    }`}>
                      {s.step}
                    </div>
                    <h4 className={`font-bold text-xs uppercase tracking-wider mb-1 ${s.highlight ? 'text-charcoal' : 'text-charcoal'}`}>{s.title}</h4>
                    <p className={`text-[11px] ${s.highlight ? 'text-charcoal/70' : 'text-cool-grey'}`}>{s.desc}</p>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <div className="hidden md:block h-0 w-full" /> /* connector handled by grid gap */
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col md:flex-row justify-between items-center px-8 py-10 border-t border-outline-variant/60 bg-white">
        <div className="flex items-center gap-2.5 mb-4 md:mb-0">
          <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center">
            <span className="text-white text-[8px] font-black">CS</span>
          </div>
          <div>
            <p className="text-sm font-bold text-charcoal">CryptoSpark AI</p>
            <p className="text-[10px] text-cool-grey">© 2024 · Institutional Grade Analytics</p>
          </div>
        </div>

        <div className="flex gap-5 text-xs font-medium text-cool-grey">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/predictions', label: 'Predictions' },
            { to: '/infrastructure', label: 'Infrastructure' },
            { to: '/model-metrics', label: 'Model Metrics' },
            { to: '/about', label: 'About' },
          ].map(link => (
            <Link key={link.to} to={link.to} className="hover:text-primary transition-colors duration-200">
              {link.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
