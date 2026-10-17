import React, { useState, useEffect } from 'react';
import KPICard from '../components/shared/KPICard';
import GlassCard from '../components/shared/GlassCard';
import { SkeletonCard } from '../components/shared/LoadingState';
import { api } from '../services/api';

const PERIOD_MAP = {
  '1D': { period: '1W',  subtext: 'Intraday neural overlay · Real-time cadence',        apiPeriod: '1W'  },
  '1W': { period: '1W',  subtext: '7-day momentum trajectory · Daily aggregations',      apiPeriod: '1W'  },
  '1M': { period: '1M',  subtext: '30-day macro cycle projection · Daily aggregates',     apiPeriod: '1M'  },
  '1Y': { period: '1Y',  subtext: '52-week regression corridor · Weekly bars',            apiPeriod: '1Y'  },
};

/** Scale an array of prices into SVG Y coords (0 = top, 400 = bottom). */
function priceToY(price, minP, maxP, svgH = 380, padPct = 0.05) {
  const range = maxP - minP || 1;
  const padded = range * (1 + 2 * padPct);
  const paddedMin = minP - range * padPct;
  return svgH - ((price - paddedMin) / padded) * svgH;
}

/** Build an SVG polyline `points` string from OHLCV rows. */
function buildPoints(rows) {
  if (!rows || rows.length === 0) return '';
  const prices = rows.map((r) => r.close);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const w = 1000;
  return rows
    .map((r, i) => {
      const x = (i / Math.max(rows.length - 1, 1)) * w;
      const y = priceToY(r.close, minP, maxP);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/** Build a closed fill polygon (polyline + bottom edge). */
function buildFillPoints(rows) {
  if (!rows || rows.length === 0) return '';
  const prices = rows.map((r) => r.close);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const w = 1000;
  const linePoints = rows.map((r, i) => {
    const x = (i / Math.max(rows.length - 1, 1)) * w;
    const y = priceToY(r.close, minP, maxP);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return [
    ...linePoints,
    `1000,380`,
    `0,380`,
  ].join(' ');
}

/** Pick ~5 evenly-spaced labels from the rows based on period. */
function buildXLabels(rows, period) {
  if (!rows || rows.length === 0) return [];
  const fmt = (ts) => {
    const d = new Date(ts);
    if (period === '1D' || period === '1W') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (period === '1M') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };
  const n = 5;
  const step = Math.floor((rows.length - 1) / (n - 1));
  return Array.from({ length: n }, (_, i) => {
    const idx = Math.min(i * step, rows.length - 1);
    return fmt(rows[idx].timestamp);
  });
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1M');

  // Chart state
  const [chartRows, setChartRows] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(false);
  const [chartSymbol] = useState('btc');

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      api.getMarketSummary(),
      api.getWatchlist(),
      api.getSignals(),
    ]).then(([sumRes, watchRes, sigRes]) => {
      if (!mounted) return;
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (watchRes.status === 'fulfilled') setWatchlist(watchRes.value);
      if (sigRes.status === 'fulfilled') setSignals(sigRes.value);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  // Fetch chart data whenever timeframe changes
  useEffect(() => {
    let mounted = true;
    setChartLoading(true);
    setChartError(false);
    const apiPeriod = PERIOD_MAP[timeframe]?.apiPeriod || '1M';
    api.getHistorical(chartSymbol, apiPeriod)
      .then((res) => {
        if (!mounted) return;
        setChartRows(res.data || []);
        setChartLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setChartRows([]);
        setChartLoading(false);
        setChartError(true);
      });
    return () => { mounted = false; };
  }, [timeframe, chartSymbol]);

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

  // Computed chart values from real historical data
  const chartPrices = chartRows.map((r) => r.close);
  const chartMin = chartPrices.length ? Math.min(...chartPrices) : 0;
  const chartMax = chartPrices.length ? Math.max(...chartPrices) : 1;
  const chartRange = chartMax - chartMin || 1;
  const chartLatestPrice = chartRows.length ? chartRows[chartRows.length - 1].close : null;
  const chartFirstPrice = chartRows.length ? chartRows[0].close : null;
  const chartPctChange = (chartFirstPrice && chartLatestPrice)
    ? (((chartLatestPrice - chartFirstPrice) / chartFirstPrice) * 100)
    : null;
  const chartIsPositive = chartPctChange === null || chartPctChange >= 0;
  const xLabels = buildXLabels(chartRows, timeframe);
  const currentSubtext = PERIOD_MAP[timeframe]?.subtext || '';


  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {loading && !summary ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} height="h-24" />
          ))
        ) : (
          <>
            {kpiCards.map((card, i) => (
              <div key={card.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <KPICard {...card} />
              </div>
            ))}

            {/* Active Model Card */}
            <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
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
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Chart + Tables */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <GlassCard className="p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="font-bold text-lg text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">trending_up</span>
                  BTC/USD Price Trend
                  {chartRows.length > 0 && (
                    <span className="text-[10px] font-mono bg-surface-container-low border border-outline-variant px-2 py-0.5 rounded-full text-on-surface-variant ml-1">
                      {chartRows.length} data points
                    </span>
                  )}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                  {currentSubtext}
                </p>
              </div>
              <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
                {['1D', '1W', '1M', '1Y'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all duration-200 cursor-pointer ${
                      timeframe === t
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 w-full relative overflow-hidden rounded-lg">
              {chartLoading ? (
                /* Skeleton shimmer while fetching */
                <div className="w-full h-full bg-surface-container rounded-lg overflow-hidden">
                  <div className="h-full w-full animate-pulse flex flex-col gap-3 p-4">
                    {[60, 80, 55, 70, 90, 50].map((h, i) => (
                      <div key={i} className="bg-primary/10 rounded" style={{ height: `${h}%`, width: `${85 + i * 2}%` }} />
                    ))}
                  </div>
                </div>
              ) : chartError || chartRows.length === 0 ? (
                /* Error / empty state */
                <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant gap-2">
                  <span className="material-symbols-outlined text-4xl opacity-30">show_chart</span>
                  <p className="text-xs font-mono opacity-50">Historical data unavailable</p>
                </div>
              ) : (
                /* Real SVG chart */
                <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2C6E59" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#2C6E59" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Horizontal grid lines */}
                  {[95, 190, 285].map((y) => (
                    <line key={y} stroke="#e1e3e0" strokeDasharray="4,4" x1="0" x2="1000" y1={y} y2={y} />
                  ))}
                  {/* Y-axis price labels */}
                  {[0, 1, 2, 3].map((i) => {
                    const price = chartMin + (chartRange * (3 - i)) / 3;
                    const y = priceToY(price, chartMin, chartMax);
                    return (
                      <text
                        key={i}
                        x="8"
                        y={y - 4}
                        fill="#8a9199"
                        fontSize="18"
                        fontFamily="monospace"
                      >
                        ${price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price.toFixed(0)}
                      </text>
                    );
                  })}
                  {/* Gradient fill area */}
                  <polygon
                    points={buildFillPoints(chartRows)}
                    fill="url(#chartGrad)"
                  />
                  {/* Price line */}
                  <polyline
                    key={timeframe}
                    points={buildPoints(chartRows)}
                    fill="none"
                    stroke="#2C6E59"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: 'points 0.5s ease-in-out' }}
                  />
                  {/* Latest price dot */}
                  {chartRows.length > 0 && (() => {
                    const last = chartRows[chartRows.length - 1];
                    const lx = 1000;
                    const ly = priceToY(last.close, chartMin, chartMax);
                    return (
                      <>
                        <circle cx={lx} cy={ly} r="6" fill="#2C6E59" opacity="0.3" />
                        <circle cx={lx} cy={ly} r="3.5" fill="#2C6E59" />
                      </>
                    );
                  })()}
                </svg>
              )}

              {/* Price change badge — only show when data is loaded */}
              {!chartLoading && !chartError && chartLatestPrice && (
                <div className="absolute top-3 right-3 flex flex-col items-end pointer-events-none">
                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md font-mono flex items-center gap-1.5 ${
                    chartIsPositive ? 'bg-primary text-white' : 'bg-error text-white'
                  }`}>
                    <span>LATEST: ${chartLatestPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    {chartPctChange !== null && (
                      <span className={`text-[9px] bg-black/25 px-1 py-0.5 rounded font-bold ${
                        chartIsPositive ? 'text-lime' : 'text-red-200'
                      }`}>
                        {chartPctChange >= 0 ? '+' : ''}{chartPctChange.toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <div className="w-px h-10 bg-primary/30 mt-1 mx-auto" />
                </div>
              )}
            </div>

            {/* X-Axis date labels from real timestamps */}
            <div className="flex justify-between items-center text-[10px] font-mono text-on-surface-variant px-2 pt-3 border-t border-outline-variant/40 mt-1">
              {chartLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-3 w-12 bg-primary/10 rounded animate-pulse" />
                  ))
                : xLabels.map((lbl, idx) => (
                    <span
                      key={idx}
                      className={idx === xLabels.length - 1 ? 'font-bold text-primary' : ''}
                    >
                      {lbl}
                    </span>
                  ))
              }
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
              <table className="w-full min-w-[540px] text-left">
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
                  {loading && watchlist.length === 0 ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10" />
                            <div className="h-4 w-20 bg-primary/10 rounded" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right"><div className="h-4 w-16 ml-auto bg-primary/10 rounded" /></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 w-12 ml-auto bg-primary/10 rounded" /></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 w-14 ml-auto bg-primary/10 rounded" /></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 w-14 ml-auto bg-primary/10 rounded" /></td>
                      </tr>
                    ))
                  ) : (
                    watchlist.map(row => (
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
                    ))
                  )}
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
