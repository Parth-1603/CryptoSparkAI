import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home', icon: 'home', end: true },
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/predictions', label: 'Predictions', icon: 'online_prediction' },
  { path: '/model-metrics', label: 'Model Performance', icon: 'query_stats' },
  { path: '/infrastructure', label: 'AWS Pipeline', icon: 'hub' },
  { path: '/about', label: 'About Project', icon: 'info' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-full flex flex-col z-50 w-64
        border-r border-outline-variant/60
        bg-surface-container-lowest/95 backdrop-blur-xl
        transition-transform duration-300 ease-spring
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="px-6 py-7 border-b border-outline-variant/50">
          <NavLink to="/" onClick={onClose} className="block group">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm group-hover:shadow-glow-primary transition-shadow duration-300">
                <span className="text-white text-xs font-black">CS</span>
              </div>
              <div>
                <h1 className="font-extrabold text-base text-primary tracking-tight leading-none">
                  CryptoSpark AI
                </h1>
                <p className="text-[10px] text-on-surface-variant/60 font-mono mt-0.5">v2.4 · Analytics Platform</p>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-[0.15em] px-3 mb-2">Navigation</p>
          {navItems.map((item, i) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.end}
              onClick={onClose}
              style={{ animationDelay: `${i * 40}ms` }}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200 ease-spring relative group
                animate-slide-left
                ${isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Active left bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <span className={`material-symbols-outlined text-[20px] transition-all duration-200 ${
                    isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status Strip */}
        <div className="px-3 py-3 border-t border-outline-variant/50">
          <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/15 text-xs flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-positive animate-pulse"></span>
            <span className="text-primary font-semibold">All Systems Operational</span>
          </div>

          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-surface-container border border-outline-variant/50">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-[11px] shrink-0 shadow-sm">
              UA
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-on-surface truncate">Analyst Alpha</p>
              <p className="text-[9px] text-on-surface-variant font-mono uppercase tracking-widest">Active Account</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
