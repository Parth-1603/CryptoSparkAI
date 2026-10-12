import React from 'react';

/**
 * Clean, lightweight loading components using existing brand palette:
 * Primary: #2C6E59, Lime: #A2E037, Surface: var(--surface)
 */

export function PageProgressBar({ isLoading }) {
  if (!isLoading) return null;
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-50 overflow-hidden pointer-events-none"
      style={{ background: 'rgba(44,110,89,0.1)' }}
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-lime to-mint-green animate-pulse"
        style={{
          width: '100%',
          animation: 'indeterminate 1.2s infinite ease-in-out',
        }}
      />
    </div>
  );
}

export function LogoPulseLoader({ label = 'Loading neural models...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in" role="status">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse">
          <span className="text-white text-sm font-black font-mono">CS</span>
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
      </div>
      <p className="mt-4 text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

export function SkeletonCard({ className = '', height = 'h-32' }) {
  return (
    <div
      className={`rounded-xl border animate-pulse ${height} ${className}`}
      style={{
        background: 'var(--surface-low)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 rounded bg-primary/10" />
        <div className="h-6 w-1/2 rounded bg-primary/15" />
        <div className="h-2 w-2/3 rounded bg-primary/5" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div
      className="rounded-xl border p-4 space-y-3 animate-pulse"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="h-4 w-1/4 rounded bg-primary/15 mb-4" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 items-center py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-3.5 rounded bg-primary/10"
              style={{ width: `${100 / cols}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
