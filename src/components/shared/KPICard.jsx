import React from 'react';
import GlassCard from './GlassCard';

export default function KPICard({ label, value, change, isPositive, subtext, highlight }) {
  return (
    <GlassCard className={`p-4 rounded-lg flex flex-col justify-between ${highlight ? 'border-primary/30 bg-primary/5' : ''}`}>
      <div className="flex justify-between items-start">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</span>
        {change && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            isPositive ? 'text-mint-green bg-mint-green/10' : 'text-error bg-error/10'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div className="mt-2">
        <span className="font-headline-md text-headline-md font-bold tracking-tight numerical-data text-charcoal">
          {value}
        </span>
        {subtext && (
          <p className="text-[10px] text-on-surface-variant mt-0.5">{subtext}</p>
        )}
      </div>
    </GlassCard>
  );
}
