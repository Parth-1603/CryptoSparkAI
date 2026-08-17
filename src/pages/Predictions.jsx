import React, { useState } from 'react';
import GlassCard from '../components/shared/GlassCard';

export default function Predictions() {
  const [asset, setAsset] = useState('Bitcoin (BTC)');
  const [period, setPeriod] = useState('1H');
  const [algorithm, setAlgorithm] = useState('XGBoost (Gradient Boosting)');
  const [isSimulating, setIsSimulating] = useState(false);
  const [price, setPrice] = useState(68421.12);
  const [confidence, setConfidence] = useState(91.8);
  const [logLines, setLogLines] = useState([
    { tag: 'SYSTEM', text: 'Pipeline initialized: CUDA v11.8 context created...' },
    { tag: 'DATA', text: 'Streaming batch fetched: 12,401 nodes from Binance API.' },
    { tag: 'MODEL', text: 'XGBoost iteration 420: Loss 0.00142... Accuracy optimized.' },
    { tag: 'READY', text: 'Waiting for pipeline trigger...' },
  ]);

  const handleRun = () => {
    setIsSimulating(true);
    setLogLines(prev => [...prev, { tag: 'EXEC', text: 'Running hyperparameter tuning for XGBoost...' }]);

    setTimeout(() => {
      setLogLines(prev => [...prev, { tag: 'EXEC', text: 'Weights calibrated. Shuffling cross-validation sets...' }]);
    }, 800);

    setTimeout(() => {
      const newPrice = +(68000 + Math.random() * 1200).toFixed(2);
      const newConf = +(90 + Math.random() * 5).toFixed(1);
      setIsSimulating(false);
      setPrice(newPrice);
      setConfidence(newConf);
      setLogLines(prev => [...prev, { tag: 'DONE', text: `Prediction cycle complete. Price: $${newPrice.toLocaleString()} | Confidence: ${newConf}%` }]);
    }, 2200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-charcoal mb-1" style={{ letterSpacing: '-0.02em' }}>
            Interactive ML Playground
          </h1>
          <p className="text-sm text-on-surface-variant">Configure real-time neural network inference for spot market volatility.</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full badge-live text-xs font-bold text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse"></span>
          LIVE PIPELINE ACTIVE
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
                {['Bitcoin (BTC)','Ethereum (ETH)','Solana (SOL)','Cardano (ADA)'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Forecast Period</label>
              <div className="grid grid-cols-3 gap-2">
                {['1H','1D','1W'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                      period === p
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
                {['XGBoost (Gradient Boosting)','LSTM (Recurrent Neural Network)','Prophet (Additive Model)','Ensemble (Hybrid V3)'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleRun}
              className={`btn-primary w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${
                isSimulating ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <span className={`material-symbols-outlined ${isSimulating ? 'animate-spin' : ''}`}>
                {isSimulating ? 'refresh' : 'bolt'}
              </span>
              {isSimulating ? 'Processing...' : 'Run Prediction Pipeline'}
            </button>
          </GlassCard>

          <GlassCard className="p-5 rounded-xl space-y-3">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">System Health</p>
            {[
              { label: 'SageMaker Latency', val: '14ms', w: '94%' },
              { label: 'Pipeline Throughput', val: '1.2 GB/s', w: '82%' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-on-surface-variant">{item.label}</span>
                  <span className="text-primary font-mono">{item.val}</span>
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
              [1,2,3,4].map(i => (
                <GlassCard key={i} className="p-5 h-24 space-y-3">
                  <div className="skeleton h-3 w-2/3 rounded-md"></div>
                  <div className="skeleton h-6 w-full rounded-md"></div>
                </GlassCard>
              ))
            ) : (
              <>
                <GlassCard className="p-4 flex flex-col justify-between animate-scale-in">
                  <span className="text-[10px] font-bold text-cool-grey uppercase tracking-wider">Predicted Price</span>
                  <div className="mt-2">
                    <span className="font-black text-xl text-charcoal numerical-data">${price.toLocaleString()}</span>
                    <p className="text-[10px] text-positive font-bold mt-0.5">+2.4% vs current</p>
                  </div>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col justify-between animate-scale-in" style={{ animationDelay: '60ms' }}>
                  <span className="text-[10px] font-bold text-cool-grey uppercase tracking-wider">Confidence</span>
                  <div className="mt-2">
                    <span className="font-black text-xl text-charcoal numerical-data">{confidence}%</span>
                    <p className="text-[10px] text-cool-grey mt-0.5">High Precision</p>
                  </div>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col justify-between animate-scale-in" style={{ animationDelay: '120ms' }}>
                  <span className="text-[10px] font-bold text-cool-grey uppercase tracking-wider">PNL Estimate</span>
                  <div className="mt-2">
                    <span className="font-black text-xl text-charcoal numerical-data">+$1,540</span>
                    <p className="text-[10px] text-cool-grey mt-0.5">Per 1 BTC</p>
                  </div>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col justify-center items-center bg-lime/15 border-lime/30 animate-scale-in" style={{ animationDelay: '180ms' }}>
                  <span className="text-[9px] font-bold text-charcoal uppercase tracking-widest mb-2">Signal</span>
                  <div className="bg-lime text-charcoal px-3 py-1.5 rounded-lg font-black text-xs tracking-tight glow-lime">
                    ACCUMULATE
                  </div>
                </GlassCard>
              </>
            )}
          </div>

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
                    <stop offset="0%" stopColor="#A2E037" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="#A2E037" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M 0,220 Q 150,180 300,200 Q 450,220 600,180 L 1000,100 L 1000,280 L 600,240 Q 450,260 300,240 Q 150,220 0,260 Z" fill="url(#forecastGrad)"/>
                <path className="chart-line" d="M 0,240 Q 150,200 300,220 Q 450,240 600,200" fill="none" stroke="#2c6e59" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M 600,200 L 1000,120" fill="none" stroke="#a2e037" strokeDasharray="8,5" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="600" cy="200" r="5" fill="#fff" stroke="#2c6e59" strokeWidth="2.5"/>
                <text x="570" y="178" fill="#2c6e59" fontSize="11" fontWeight="700" fontFamily="Plus Jakarta Sans">CURRENT</text>
              </svg>
            </div>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-outline-variant pt-5">
              {[
                { label: 'Lower Bound', val: '$66,120' },
                { label: 'Mean Forecast', val: `$${price.toLocaleString()}`, highlight: true },
                { label: 'Upper Bound', val: '$70,250' },
                { label: 'R² Score', val: '0.9842' },
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
                <span className="text-lime font-bold shrink-0">[{line.tag}]</span>
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
