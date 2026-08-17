import React from 'react';

export default function StatusBadge({ status = 'active', text }) {
  const getColors = () => {
    switch (status) {
      case 'active':
      case 'live':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'lime':
        return 'bg-lime/20 text-charcoal border-lime/40';
      case 'error':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-surface-container-high text-cool-grey border-outline-variant';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold border uppercase tracking-wider ${getColors()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {text || status}
    </span>
  );
}
