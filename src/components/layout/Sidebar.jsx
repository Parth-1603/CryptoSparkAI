import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { path: '/',               label: 'Home',           icon: 'home',              end: true },
  { path: '/dashboard',      label: 'Dashboard',      icon: 'dashboard' },
  { path: '/predictions',    label: 'Predictions',    icon: 'online_prediction' },
  { path: '/model-metrics',  label: 'Model Metrics',  icon: 'query_stats' },
  { path: '/infrastructure', label: 'AWS Pipeline',   icon: 'hub' },
  { path: '/about',          label: 'About',          icon: 'info' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { isDark, toggle } = useTheme();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-full z-50 w-64 flex flex-col
          border-r transition-transform duration-300 ease-spring
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: isDark ? '4px 0 24px rgba(0,0,0,0.3)' : '4px 0 24px rgba(0,0,0,0.04)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-sm group-hover:shadow-glow transition-shadow duration-300 shrink-0">
              <span className="text-white text-xs font-black">CS</span>
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-primary tracking-tight leading-none">
                CryptoSpark AI
              </h1>
              <p className="text-[9px] font-mono mt-0.5 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                v2.4 · Analytics
              </p>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 mb-3 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
            Navigation
          </p>
          <div className="space-y-0.5">
            {navItems.map((item, i) => (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => `
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 animate-slide-in-left group
                  ${isActive
                    ? 'text-primary font-semibold'
                    : 'hover:bg-surface-container'
                  }
                `}
                style={({ isActive }) => ({
                  animationDelay: `${i * 40}ms`,
                  background: isActive ? 'rgba(44,110,89,0.08)' : 'transparent',
                  color: isActive ? '#2C6E59' : 'var(--text-muted)',
                })}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                    )}
                    <span
                      className="material-symbols-outlined text-[20px] transition-all duration-200"
                      style={{ color: isActive ? '#2C6E59' : 'var(--text-muted)' }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom strip */}
        <div className="px-3 pb-4 space-y-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          {/* Dark/Light toggle row */}
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--surface-low)' }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--text-muted)' }}>
                {isDark ? 'dark_mode' : 'light_mode'}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <button
              onClick={toggle}
              className={`theme-toggle ${isDark ? 'active' : ''}`}
              aria-label="Toggle theme"
            >
              <div className="theme-toggle-knob" />
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary" style={{ background:'rgba(44,110,89,0.07)', border:'1px solid rgba(44,110,89,0.15)' }}>
            <span className="live-dot" />
            All Systems Operational
          </div>
        </div>
      </aside>
    </>
  );
}
