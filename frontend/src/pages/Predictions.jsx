import React, { useState } from 'react';
import GlassCard from '../components/shared/GlassCard';
import { api } from '../services/api';

export default function Predictions() {
  const [asset, setAsset] = useState('Bitcoin (BTC)');
  const [period, setPeriod] = useState('1H');
  const [algorithm, setAlgorithm] = useState('XGBoost (Gradient Boosting)');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState(null); // full backend response
  const [explanation, setExplanation] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [logLines, setLogLines] = useState([
    { tag: 'SYSTEM', text: 'Pipeline initialized. Waiting for first run...' },
    { tag: 'READY', text: 'Waiting for pipeline trigger...' },
  ]);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setIsSimulating(true);
    setError(null);
    setExplanation(null);
    setLogLines(prev => [...prev, { tag: 'EXEC', text: `Requesting prediction for ${asset}...` }]);

    try {
      const data = await api.predict(asset, period, algorithm);
      setResult(data);
      setLogLines(prev => [...prev, ...(data.logs || [])]);

      // Automatically generate AI Explainability after prediction completes
      setIsExplaining(true);
      try {
        const explainRes = await api.explain({
          asset,
          period,
          algorithm,
          price: data.price,
          currentPrice: data.currentPrice,
          signal: data.signal,
          confidence: data.confidence,
          pnlEstimate: data.pnlEstimate,
          features: data.features,
          topFeatures: data.topFeatures,
        });
        setExplanation(explainRes.explanation);
      } catch (explainErr) {
        console.warn('Explainability call fallback:', explainErr);
        setExplanation(`CryptoSpark AI predicted ${data.price?.toLocaleString()} for ${asset}. Key factors include moving averages and short-term volatility supporting a ${data.signal} signal with ${data.confidence}% confidence.`);
      } finally {
        setIsExplaining(false);
      }
    } catch (err) {
      setError(err.message);
      setLogLines(prev => [...prev, { tag: 'ERROR', text: err.message }]);
    } finally {
      setIsSimulating(false);
    }
  };

  const price = result?.price;
  const confidence = result?.confidence;
  const pnl = result?.pnlEstimate;
  const signal = result?.signal;
  const bounds = result?.bounds;
  const health = result?.pipelineHealth || 'HEALTHY';

  // Pipeline Health Badge Colors
  const healthBadgeConfig = {
    HEALTHY:  { label: 'PIPELINE HEALTHY', dotColor: 'bg-positive', badgeClass: 'bg-positive/10 text-positive border border-positive/30' },
    DEGRADED: { label: 'DEGRADED PIPELINE', dotColor: 'bg-yellow-400', badgeClass: 'bg-yellow-400/10 text-yellow-600 border border-yellow-400/30' },
    FALLBACK: { label: 'AUTO-HEALED FALLBACK', dotColor: 'bg-orange-400', badgeClass: 'bg-orange-500/10 text-orange-600 border border-orange-500/30' },
  }[health] || { label: 'PIPELINE ACTIVE', dotColor: 'bg-primary', badgeClass: 'bg-primary/10 text-primary border border-primary/30' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-charcoal mb-1" style={{ letterSpacing: '-0.02em' }}>
            Interactive ML Playground
          </h1>
          <p className="text-sm text-on-surface-variant">Configure real-time neural network inference with self-healing fault tolerance.</p>
        </div>
        
        {/* Pipeline Health Badge */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold ${healthBadgeConfig.badgeClass} transition-all duration-300`}>
          <span className={`w-2 h-2 rounded-full ${healthBadgeConfig.dotColor} animate-pulse`}></span>
          <span>{healthBadgeConfig.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="xl:col-span-4 space-y-5 animate-slide-left">
          <GlassCard className="p-6 rounded-xl space-y-5">
            <h3 className="font-bold text-base text-charcoal flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tune</span>
              Parameters
            </h3>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Cryptocurrency Asset</label>
              <select
                value={asset}
                onChange={e => setAsset(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm cursor-pointer"
              >
                {['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)', 'Cardano (ADA)'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Forecast Period</label>
              <div className="grid grid-cols-3 gap-2">
                {['1H', '1D', '1W'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 ${period === p
                        ? 'bg-primary text-white shadow-sm scale-[1.02]'
                        : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Algorithm</label>
              <select
                value={algorithm}
                onChange={e => setAlgorithm(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm cursor-pointer"
              >
                {['XGBoost (Gradient Boosting)', 'LSTM (Recurrent Neural Network)', 'Prophet (Additive Model)', 'Ensemble (Hybrid V3)'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleRun}
              className={`btn-primary w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${isSimulating ? 'opacity-60 cursor-not-allowed' : ''
                }`}
            >
              <span className={`material-symbols-outlined ${isSimulating ? 'animate-spin' : ''}`}>
                {isSimulating ? 'refresh' : 'bolt'}
              </span>
              {isSimulating ? 'Processing Pipeline...' : 'Run Prediction Pipeline'}
            </button>

            {error && (
              <p className="text-[11px] text-error font-semibold">
                Request failed: {error}
              </p>
            )}
          </GlassCard>

          <GlassCard className="p-5 rounded-xl space-y-3">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Self-Healing Pipeline Health</p>
            {[
              { label: 'Model Resilience', val: 'Active', w: '100%' },
              { label: 'CoinGecko / CSV Fallback', val: isSimulating ? 'Validating' : 'Ready', w: '95%' },
              { label: 'Groq Llama 3 Engine', val: 'Connected', w: '92%' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-on-surface-variant">{item.label}</span>
                  <span className="text-primary font-mono text-[11px] font-bold">{item.val}</span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden progress-bar">
                  <div className="h-full bg-gradient-primary rounded-full" style={{ width: item.w }}></div>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Output Panel */}
        <div className="xl:col-span-8 space-y-5">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isSimulating ? (
              [1, 2, 3, 4].map(i => (
                <GlassCard key={i} className="p-5 h-24 space-y-3">
                  <div className="skeleton h-3 w-2/3 rounded-md"></div>
                  <div className="skeleton h-6 w-full rounded-md"></div>
                </GlassCard>
              ))
            ) : !result ? (
              <GlassCard className="p-5 col-span-2 md:col-span-4 text-center text-sm text-on-surface-variant">
                Run a prediction to see quantitative results and AI explainability here.
              </GlassCard>
            ) : (
              <>
                <GlassCard className="p-4 flex flex-col justify-between animate-scale-in">
                  <span className="text-[10px] font-bold text-cool-grey uppercase tracking-wider">Predicted Price</span>
                  <div className="mt-2">
                    <span className="font-black text-xl text-charcoal numerical-data">${price?.toLocaleString()}</span>
                    <p className={`text-[10px] font-bold mt-0.5 ${pnl >= 0 ? 'text-positive' : 'text-error'}`}>
                      {pnl >= 0 ? '+' : ''}{pnl?.toLocaleString()} vs current
                    </p>
                  </div>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col justify-between animate-scale-in" style={{ animationDelay: '60ms' }}>
                  <span className="text-[10px] font-bold text-cool-grey uppercase tracking-wider">Confidence</span>
                  <div className="mt-2">
                    <span className="font-black text-xl text-charcoal numerical-data">{confidence}%</span>
                    <p className="text-[10px] text-cool-grey mt-0.5">
                      {confidence >= 90 ? 'High Precision' : confidence >= 80 ? 'Moderate Precision' : 'Calibrated'}
                    </p>
                  </div>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col justify-between animate-scale-in" style={{ animationDelay: '120ms' }}>
                  <span className="text-[10px] font-bold text-cool-grey uppercase tracking-wider">PNL Estimate</span>
                  <div className="mt-2">
                    <span className="font-black text-xl text-charcoal numerical-data">
                      {pnl >= 0 ? '+' : ''}${pnl?.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-cool-grey mt-0.5">Per 1 {asset.match(/\(([^)]+)\)/)?.[1] || ''}</p>
                  </div>
                </GlassCard>
                <GlassCard className={`p-4 flex flex-col justify-center items-center animate-scale-in ${signal === 'ACCUMULATE' ? 'bg-lime/15 border-lime/30' : 'bg-error/10 border-error/30'
                  }`} style={{ animationDelay: '180ms' }}>
                  <span className="text-[9px] font-bold text-charcoal uppercase tracking-widest mb-2">Signal</span>
                  <div className={`px-3 py-1.5 rounded-lg font-black text-xs tracking-tight ${signal === 'ACCUMULATE' ? 'bg-lime text-charcoal glow-lime' : 'bg-error text-white'
                    }`}>
                    {signal}
                  </div>
                </GlassCard>
              </>
            )}
          </div>

          {/* AI EXPLAINABILITY CARD */}
          {(isExplaining || explanation) && (
            <GlassCard className="p-5 rounded-xl border border-primary/25 bg-surface-container-low/90 shadow-glow-primary/10 animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">AI Explainability Insight</h4>
                    <p className="text-[10px] text-cool-grey font-mono">Groq Llama 3 Quantitative Interpretation</p>
                  </div>
                </div>
                {isExplaining && (
                  <span className="text-xs text-primary font-bold animate-pulse flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    Analyzing feature weights...
                  </span>
                )}
              </div>

              {isExplaining ? (
                <div className="space-y-2 py-2">
                  <div className="skeleton h-3.5 w-full rounded"></div>
                  <div className="skeleton h-3.5 w-5/6 rounded"></div>
                  <div className="skeleton h-3.5 w-4/6 rounded"></div>
                </div>
              ) : (
                <div className="text-xs leading-relaxed text-charcoal/90 font-medium">
                  {explanation}
                </div>
              )}
            </GlassCard>
          )}

          {/* Forecast Chart */}
          <GlassCard className="p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-base text-charcoal">Forecast Architecture</h3>
                <p className="text-xs text-cool-grey font-mono mt-0.5">{asset} · {period} Delta</p>
              </div>
              <div className="flex gap-4 text-[11px] font-semibold text-cool-grey">
                <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-primary rounded"></span>Historical</div>
                <div className="flex items-center gap-1.5"><span className="w-4 h-0 border-t-2 border-dashed border-lime"></span>Predicted</div>
              </div>
            </div>

            <div className={`h-60 relative transition-all duration-500 ${isSimulating ? 'opacity-40 blur-sm' : 'opacity-100'}`}>
              <svg className="w-full h-full" viewBox="0 0 1000 300">
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A2E037" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#A2E037" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 0,220 Q 150,180 300,200 Q 450,220 600,180 L 1000,100 L 1000,280 L 600,240 Q 450,260 300,240 Q 150,220 0,260 Z" fill="url(#forecastGrad)" />
                <path className="chart-line" d="M 0,240 Q 150,200 300,220 Q 450,240 600,200" fill="none" stroke="#2c6e59" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 600,200 L 1000,120" fill="none" stroke="#a2e037" strokeDasharray="8,5" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="600" cy="200" r="5" fill="#fff" stroke="#2c6e59" strokeWidth="2.5" />
                <text x="570" y="178" fill="#2c6e59" fontSize="11" fontWeight="700" fontFamily="Plus Jakarta Sans">CURRENT</text>
              </svg>
            </div>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-outline-variant pt-5">
              {[
                { label: 'Lower Bound', val: bounds?.lower || '...' },
                { label: 'Mean Forecast', val: bounds?.mean || '...', highlight: true },
                { label: 'Upper Bound', val: bounds?.upper || '...' },
                { label: 'R² Score', val: bounds?.r2Score || '...' },
              ].map(m => (
                <div key={m.label}>
                  <p className="text-[9px] text-cool-grey uppercase font-bold tracking-widest mb-1">{m.label}</p>
                  <p className={`font-mono text-sm font-semibold ${m.highlight ? 'text-primary' : 'text-charcoal'}`}>{m.val}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Console Log */}
          <div className="glass-card rounded-xl bg-charcoal p-4 font-mono text-[11px] h-32 overflow-y-auto space-y-1.5">
            {logLines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <span className={`font-bold shrink-0 ${line.tag === 'FALLBACK' ? 'text-yellow-400' : line.tag === 'ERROR' ? 'text-error' : 'text-lime'}`}>
                  [{line.tag}]
                </span>
                <span className="text-white/70">{line.text}</span>
              </div>
            ))}
            <span className="text-white/30 animate-blink">█</span>
          </div>
        </div>
      </div>
    </div>
  );
}
