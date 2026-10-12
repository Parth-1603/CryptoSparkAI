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
  const { isDark } = useTheme();

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

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/predictions', label: 'Predictions' },
    { to: '/model-metrics', label: 'Metrics' },
    { to: '/infrastructure', label: 'Pipeline' },
    { to: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 py-2.5 transition-colors duration-200">
      <div
        className="w-full max-w-[1600px] mx-auto rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between transition-all duration-300 backdrop-blur-xl"
        style={{
          background: isDark ? 'rgba(12, 16, 14, 0.72)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: isDark ? '#ffffff' : '#000000',
          border: isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.6)',
          boxShadow: isDark
            ? '0 12px 36px -8px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.18)'
            : '0 12px 36px -8px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,0.95)',
        }}
      >
        {/* Left: Mobile Toggle & Circular Badge & Section Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              color: isDark ? '#ffffff' : '#000000',
            }}
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>

          <Link
            to="/"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-transform hover:scale-105"
            style={{
              background: isDark ? '#ffffff' : '#000000',
              color: isDark ? '#000000' : '#ffffff',
            }}
            title="Home"
          >
            CS
          </Link>

          <h2 className="font-extrabold text-xs sm:text-sm tracking-tight truncate max-w-[130px] sm:max-w-none">
            {getPageTitle()}
          </h2>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-6 lg:gap-8 px-4">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-xs font-semibold transition-opacity duration-200 ${
                  isActive ? 'opacity-100 font-bold' : 'opacity-65 hover:opacity-100'
                }`}
                style={{
                  color: isDark ? '#ffffff' : '#000000',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme Toggle & High-contrast Capsule Live Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div
            className="rounded-full px-3 py-1.5 text-[10px] font-black tracking-widest flex items-center gap-1.5 shrink-0 shadow-sm"
            style={{
              background: isDark ? '#ffffff' : '#000000',
              color: isDark ? '#000000' : '#ffffff',
            }}
          >
            <span className="live-dot" style={{ width: 6, height: 6, background: '#A2E037' }} />
            LIVE
          </div>
        </div>
      </div>
    </header>
  );
}
