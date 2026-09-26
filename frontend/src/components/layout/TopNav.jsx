import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`theme-toggle ${isDark ? 'active' : ''}`}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <div className="theme-toggle-knob" />
    </button>
  );
}

export default function TopNav({ onMenuToggle }) {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':     return 'Institutional Dashboard';
      case '/predictions':   return 'ML Playground';
      case '/infrastructure':return 'AWS Pipeline';
      case '/model-metrics': return 'Model Performance';
      case '/about':         return 'About Project';
      default:               return 'CryptoSpark AI';
    }
  };

  const quickLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/predictions', label: 'Predictions' },
    { to: '/infrastructure', label: 'Pipeline' },
  ];

  return (
    <header
      className="sticky top-0 z-40 w-full flex items-center justify-between px-5 py-3 backdrop-blur-md border-b"
      style={{
        background: 'rgba(var(--surface-rgb, 255,255,255), 0.88)',
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: '0 1px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:bg-surface-container active:scale-95"
          style={{ color: 'var(--primary)' }}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div>
          <h2 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
            {getPageTitle()}
          </h2>
        </div>

        <div className="hidden md:flex items-center gap-0.5 border-l pl-5 ml-1" style={{ borderColor: 'var(--border)' }}>
          {quickLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                location.pathname === link.to
                  ? 'text-primary bg-primary/8'
                  : 'hover:bg-surface-container'
              }`}
              style={{ color: location.pathname === link.to ? '#2C6E59' : 'var(--text-muted)' }}
            >
              {link.label}
              {location.pathname === link.to && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        <div className="relative hidden sm:block w-48">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color:'var(--text-muted)' }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full pl-9 pr-4 py-1.5 text-xs border"
            style={{
              background:'var(--surface-low)',
              borderColor:'var(--border)',
              color:'var(--text)',
            }}
          />
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        <div className="flex items-center gap-1">
          {['notifications','settings'].map(icon => (
            <button
              key={icon}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-surface-container"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full font-mono text-[9px] font-black tracking-widest shadow-sm">
          <span className="live-dot" style={{ width:6, height:6, background:'#A2E037' }} />
          LIVE
        </div>
      </div>
    </header>
  );
}
