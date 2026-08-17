import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function TopNav({ onMenuToggle }) {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Institutional Dashboard';
      case '/predictions': return 'Interactive ML Playground';
      case '/infrastructure': return 'AWS Pipeline';
      case '/model-metrics': return 'Model Performance';
      case '/about': return 'About Project';
      default: return 'CryptoSpark AI';
    }
  };

  const quickLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/predictions', label: 'Predictions' },
    { to: '/infrastructure', label: 'Pipeline' },
  ];

  return (
    <header className="sticky top-0 w-full z-40 flex justify-between items-center px-6 py-3 border-b border-outline-variant bg-surface-container-lowest/90 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-primary hover:bg-surface-container rounded-lg transition-all duration-200 active:scale-95"
          aria-label="Toggle Menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <h2 className="font-bold text-base text-on-surface tracking-tight">
          {getPageTitle()}
        </h2>

        <div className="hidden md:flex gap-1 ml-6 border-l border-outline-variant pl-6">
          {quickLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 rounded-md ${
                location.pathname === link.to
                  ? 'text-primary bg-primary/8'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
              }`}
            >
              {link.label}
              {location.pathname === link.to && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block w-52">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search markets..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-full pl-9 pr-4 py-1.5 text-xs transition-all"
          />
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-200">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-200">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full font-mono text-[10px] font-bold shadow-sm">
          <span className="w-1.5 h-1.5 bg-lime rounded-full animate-pulse"></span>
          LIVE
        </div>
      </div>
    </header>
  );
}
