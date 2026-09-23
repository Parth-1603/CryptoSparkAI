import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      className="border-t py-8 px-8"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center">
            <span className="text-white text-[8px] font-black">CS</span>
          </div>
          <div>
            <p className="font-bold text-xs" style={{ color: 'var(--text)' }}>CryptoSpark AI</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>© 2024 · Academic Research</p>
          </div>
        </div>

        <nav className="flex gap-5 flex-wrap justify-center">
          {[
            { to: '/dashboard',      label: 'Dashboard' },
            { to: '/predictions',    label: 'Predictions' },
            { to: '/infrastructure', label: 'Infrastructure' },
            { to: '/model-metrics',  label: 'Model Metrics' },
            { to: '/about',          label: 'About' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs font-medium transition-colors duration-200 hover:text-primary"
              style={{ color: 'var(--text-muted)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
          style={{ background: 'rgba(44,110,89,0.08)', color: '#2C6E59', border: '1px solid rgba(44,110,89,0.2)' }}
        >
          <span className="live-dot" />
          LIVE
        </div>
      </div>
    </footer>
  );
}
