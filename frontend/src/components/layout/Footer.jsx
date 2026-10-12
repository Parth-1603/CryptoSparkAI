import React from 'react';

export default function Footer() {
  return (
    <footer
      className="border-t py-5 px-4 sm:px-8 transition-colors duration-200"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center">
            <span className="text-white text-[8px] font-black">CS</span>
          </div>
          <div>
            <p className="font-bold text-xs" style={{ color: 'var(--text)' }}>CryptoSpark AI</p>
          </div>
        </div>

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
