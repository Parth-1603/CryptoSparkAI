import React, { useState, useEffect } from 'react';
import KPICard from '../components/shared/KPICard';
import GlassCard from '../components/shared/GlassCard';
import { api } from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    api.getMarketSummary().then(setSummary).catch(console.error);
    api.getWatchlist().then(setWatchlist).catch(console.error);
    api.getSignals().then(setSignals).catch(console.error);
  }, []);

  const kpis = summary?.kpis;

  // Market dominance donut math — convert live percentages into the
  // stroke-dasharray/offset values the two overlaid SVG circles need.
  const dominance = summary?.marketDominance || { btc: 54.2, eth: 18.5, other: 27.3 };
  const CIRC = 2 * Math.PI * 54; // r=54, matches the circle radius below
  const btcLen = CIRC * (dominance.btc / 100);
  const ethLen = CIRC * (dominance.eth / 100);

  // Sentiment gauge math
  const sentiment = summary?.marketSentiment || { score: 72, label: 'Greed' };
  const SENT_CIRC = 2 * Math.PI * 60; // r=60
  const sentOffset = SENT_CIRC - (SENT_CIRC * sentiment.score) / 100;

  // Volatility bar widths — clamp into a reasonable 0-100% visual range
  const volatility = summary?.volatilityIndex || { deviation30d: 4.82, intradayRange: 1420 };
  const deviationBarWidth = Math.min(100, volatility.deviation30d * 10);
  const intradayBarWidth = Math.min(100, (volatility.intradayRange / 2000) * 100);

  const kpiCards = [
    {
      label: 'BTC/USD',
      value: kpis?.btcUsd?.value || '...',
      change: kpis?.btcUsd?.change || '',
      isPositive: kpis?.btcUsd?.isPositive ?? true,
    },
    {
      label: 'ETH/USD',
      value: kpis?.ethUsd?.value || '...',
      change: kpis?.ethUsd?.change || '',
      isPositive: kpis?.ethUsd?.isPositive ?? true,
    },
    { label: 'TOTAL CAP', value: kpis?.totalCap || '...' },
    { label: 'VOLUME (24H)', value: kpis?.volume24h || '...' },
    {
      label: 'MODEL ACCURACY',
      value: kpis?.modelAccuracy || '...',
      highlight: true,
      subtext: kpis?.activeModel?.engine || '',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => (
          <div key={card.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <KPICard {...card} />
          </div>
        ))}

        {/* Active Model Card */}
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <GlassCard className="p-4 rounded-lg flex flex-col justify-between h-full">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">ACTIVE MODEL</span>
            <div className="mt-2">
              <span className="font-title-md text-title-md font-bold tracking-wide text-charcoal">
                {kpis?.activeModel?.name || '...'}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-mint-green animate-pulse"></span>
                <span className="text-[9px] text-mint-green uppercase font-bold tracking-widest">
                  {kpis?.activeModel?.status || 'Running'}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Chart + Tables */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Price Trend Chart — kept as a visual placeholder; wiring this to
              real historical data would use api.getHistorical('btc') */}
          <GlassCard className="p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">trending_up</span>
                  BTC/USD Price Trend
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                  Neural network overlay applied · Updated 2s ago
                </p>
              </div>
              <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
                {['1D', '1W', '1M', '1Y'].map((t, i) => (
                  <button key={t} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all duration-200 ${i === 0 ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}>{t}</button>
                ))}
              </div>
            </div>

            <div className="h-72 w-full relative overflow-hidden rounded-lg">
              <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2C6E59" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#2C6E59" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[100, 200, 300].map(y => (
                  <line key={y} stroke="#e1e3e0" strokeDasharray="4,4" x1="0" x2="1000" y1={y} y2={y} />
                ))}
                <path d="M0 350 Q 150 320 250 280 T 500 240 T 750 120 T 1000 80 V 400 H 0 Z" fill="url(#chartGrad)" />
                <path
                  className="chart-line"
                  d="M0 350 Q 150 320 250 280 T 500 240 T 750 120 T 1000 80"
                  fill="none" stroke="#2C6E59" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              <div className="absolute top-8 right-16 flex flex-col items-end">
                <div className="bg-primary text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md font-mono">
                  PRED: {kpis?.btcUsd?.value || '$69,200'}
                </div>
                <div className="w-px h-12 bg-primary/30 mt-1 mx-auto"></div>
              </div>
            </div>
          </GlassCard>

          {/* Two Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6 rounded-xl">
              <h3 className="font-bold text-sm text-on-surface mb-4">Market Dominance</h3>
              <div className="flex items-center justify-around h-44">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="54" fill="none" stroke="#f2f4f1" strokeWidth="10" />
                    <circle
                      cx="64" cy="64" r="54" fill="none" stroke="#2C6E59" strokeWidth="10"
                      strokeDasharray={`${btcLen} ${CIRC - btcLen}`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="64" cy="64" r="54" fill="none" stroke="#A2E037" strokeWidth="10"
                      strokeDasharray={`${ethLen} ${CIRC - ethLen}`}
                      strokeDashoffset={-btcLen}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase">BTC</span>
                    <p className="text-xl font-black text-charcoal">{dominance.btc}%</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span><span className="font-semibold">BTC {dominance.btc}%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-lime"></span><span className="font-semibold">ETH {dominance.eth}%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span><span className="font-semibold">Other {dominance.other}%</span></div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 rounded-xl">
              <h3 className="font-bold text-sm text-on-surface mb-4">Volume Momentum</h3>
              <div className="h-44 flex items-end gap-1.5 pt-4">
                {[40, 60, 50, 80, 95, 70, 60, 45, 100].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
                    className={`w-full rounded-t bar-chart-bar ${i === 8 ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/50 transition-colors duration-200'
                      }`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[9px] text-on-surface-variant font-mono uppercase">
                <span>00:00</span><span>08:00</span><span>16:00</span><span>24:00</span>
              </div>
            </GlassCard>
          </div>

          {/* Watchlist Table — now driven entirely by the live watchlist array */}
          <GlassCard className="rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-bold text-sm text-on-surface">Live Market Watchlist</h3>
              <button className="text-[11px] font-bold text-primary hover:text-primary/70 uppercase tracking-wider transition-colors">
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[11px] font-bold text-on-surface-variant uppercase bg-surface-container-low/60">
                  <tr>
                    <th className="px-6 py-3">Asset</th>
                    <th className="px-6 py-3 text-right">Price</th>
                    <th className="px-6 py-3 text-right">24h</th>
                    <th className="px-6 py-3 text-right">Volume</th>
                    <th className="px-6 py-3 text-right">Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 text-sm">
                  {watchlist.map(row => (
                    <tr key={row.sym} className="hover:bg-surface-container-low/40 cursor-pointer transition-colors duration-150 group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm group-hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: row.color }}>
                            {row.letter}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{row.name}</p>
                            <p className="text-[10px] text-cool-grey font-mono">{row.sym}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono font-semibold text-charcoal">{row.price}</td>
                      <td className={`px-6 py-3.5 text-right font-bold font-mono ${row.pos ? 'text-mint-green' : 'text-error'}`}>{row.change}</td>
                      <td className="px-6 py-3.5 text-right font-mono text-cool-grey text-xs">{row.vol}</td>
                      <td className="px-6 py-3.5 text-right font-mono text-cool-grey text-xs">{row.cap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-5">
          {/* Sentiment Gauge */}
          <GlassCard className="p-6 rounded-xl text-center">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Market Sentiment</p>
            <div className="relative inline-flex items-center justify-center mb-3">
              <svg className="w-36 h-36 -rotate-90">
                <circle cx="72" cy="72" r="60" fill="none" stroke="#f2f4f1" strokeWidth="10" />
                <circle
                  cx="72" cy="72" r="60"
                  fill="none" stroke="url(#sentGrad)" strokeWidth="10"
                  strokeDasharray={SENT_CIRC}
                  strokeDashoffset={sentOffset}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="sentGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2C6E59" />
                    <stop offset="100%" stopColor="#A2E037" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-charcoal numerical-data">{sentiment.score}</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{sentiment.label}</span>
              </div>
            </div>
            <div className="flex justify-between text-[9px] text-cool-grey font-bold uppercase border-t border-outline-variant pt-3">
              <span>Fear</span><span>Greed</span>
            </div>
          </GlassCard>

          {/* Volatility */}
          <GlassCard className="p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-xl">bolt</span>
              <h3 className="font-bold text-sm text-on-surface">Volatility Index</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-cool-grey">30D Deviation</span>
                  <span className="font-mono">{volatility.deviation30d}%</span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden progress-bar">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${deviationBarWidth}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-cool-grey">Intraday Range</span>
                  <span className="font-mono">${Math.round(volatility.intradayRange).toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden progress-bar">
                  <div className="h-full bg-error rounded-full" style={{ width: `${intradayBarWidth}%` }}></div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Global Signals — now driven by the live signals array */}
          <GlassCard className="rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant">
              <h3 className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Global Signals</h3>
            </div>
            <div className="p-4 space-y-3">
              {signals.map((sig, i) => (
                <div key={i} className={`border-l-2 ${sig.color} pl-3 py-0.5`}>
                  <span className="text-[10px] text-cool-grey font-bold font-mono">{sig.time}</span>
                  <p className="text-xs font-medium text-on-surface mt-0.5 leading-relaxed">{sig.text}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
