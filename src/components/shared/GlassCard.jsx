import React from 'react';

export default function GlassCard({ children, className = '', lift = false, noHover = false, ...props }) {
  return (
    <div
      className={`
        glass-card rounded-xl
        ${lift ? 'glass-card-lift' : ''}
        ${noHover ? 'hover:transform-none' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
