import React from 'react';
import GlassCard from '../components/shared/GlassCard';

const models = [
  { name: 'XGBoost', category: 'Ensemble', accuracy: 94.2, f1: '0.92', rmse: '0.041', runtime: '42m · AWS EMR', dotColor: 'bg-primary', isLeader: true },
  { name: 'LSTM', category: 'Deep Learning', accuracy: 91.8, f1: '0.89', rmse: '0.058', runtime: '124m · p3.2xlarge', dotColor: 'bg-lime', isLeader: false },
  { name: 'Random Forest', category: 'Bagging', accuracy: 88.5, f1: '0.86', rmse: '0.072', runtime: '18m · m5.xlarge', dotColor: 'bg-outline', isLeader: false },
  { name: 'Linear Regression', category: 'Baseline', accuracy: 76.4, f1: '0.71', rmse: '0.145', runtime: '2m · Local', dotColor: 'bg-surface-container-high', isLeader: false },
];

const features = [
  { name: 'Prev Close', weight: 42.8 },
  { name: 'Volume (24h)', weight: 28.4 },
  { name: 'RSI (14)', weight: 15.2 },
  { name: 'MACD Divergence', weight: 9.1 },
  { name: 'Order Book Imbalance', weight: 4.5 },
];

export default function ModelMetrics() {
  return (
    <div className="space-y-8">
      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map((m, i) => (
          <GlassCard
            key={m.name}
            className="p-5 rounded-xl flex flex-col justify-between animate-fade-in-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[9px] font-bold text-cool-grey uppercase tracking-widest">{m.category}</span>
                <h3 className="font-extrabold text-base text-charcoal">{m.name}</h3>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${m.dotColor} ${m.isLeader ? 'shadow-glow-primary' : ''}`}></div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs text-cool-grey">Accuracy</span>
                <span className={`font-black text-2xl numerical-data ${m.isLeader ? 'text-gradient-primary' : 'text-charcoal'}`}>
                  {m.accuracy}%
                </span>
              </div>

              {/* Mini accuracy bar */}
              <div className="h-1.5 bg-surface-container rounded-full overflow-hidden progress-bar">
                <div
                  className="h-full rounded-full bg-gradient-primary"
                  style={{ width: `${m.accuracy}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-surface-container-low p-2 rounded-lg">
                  <p className="text-cool-grey">F1 Score</p>
                  <p className="font-bold text-charcoal numerical-data">{m.f1}</p>
                </div>
                <div className="bg-surface-container-low p-2 rounded-lg">
                  <p className="text-cool-grey">RMSE</p>
                  <p className="font-bold text-charcoal numerical-data">{m.rmse}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/50 flex items-center gap-1.5 text-[10px] text-cool-grey">
                <span className="material-symbols-outlined text-sm">timer</span>
                <span>{m.runtime}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart */}
        <GlassCard className="lg:col-span-7 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-extrabold text-base text-charcoal">Performance Comparison</h2>
              <p className="text-xs text-cool-grey mt-0.5">Accuracy vs F1 Score Benchmarking</p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-primary"></div><span className="text-cool-grey">Accuracy</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-lime"></div><span className="text-cool-grey">F1 Score</span></div>
            </div>
          </div>

          <div className="h-64 flex items-end justify-around gap-6 px-4 pt-2">
            {models.map((m, i) => (
              <div key={m.name} className="flex flex-col items-center flex-1 max-w-[90px] h-full justify-end group cursor-default">
                <div className="flex gap-2 w-full items-end" style={{ height: '100%' }}>
                  <div
                    className="w-1/2 rounded-t bar-chart-bar bg-primary group-hover:brightness-110 transition-filter duration-200"
                    style={{ height: `${m.accuracy}%`, animationDelay: `${i * 80}ms` }}
                  />
                  <div
                    className="w-1/2 rounded-t bar-chart-bar bg-lime group-hover:brightness-110 transition-filter duration-200"
                    style={{ height: `${parseFloat(m.f1) * 100}%`, animationDelay: `${i * 80 + 40}ms` }}
                  />
                </div>
                <span className="mt-3 text-[11px] font-semibold text-charcoal">{m.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Feature Importance */}
        <GlassCard className="lg:col-span-5 rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="font-extrabold text-base text-charcoal">Feature Importance</h2>
            <p className="text-xs text-cool-grey mt-0.5">Predictive power weighting</p>
          </div>
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={f.name} className="space-y-1.5" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-charcoal">{f.name}</span>
                  <span className="text-primary font-bold numerical-data">{f.weight}%</span>
                </div>
                <div className="h-2 bg-surface-container-low rounded-full overflow-hidden progress-bar">
                  <div
                    className="h-full bg-gradient-primary rounded-full feature-bar"
                    style={{ '--bar-width': `${f.weight}%`, width: `${f.weight}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* CV Table */}
      <GlassCard className="rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <div>
            <h2 className="font-extrabold text-base text-charcoal">Cross-Validation Analytics</h2>
            <p className="text-xs text-cool-grey mt-0.5">Hyperparameter tuning results</p>
          </div>
          <button className="btn-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-[10px] font-bold text-cool-grey uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Model Instance</th>
                <th className="px-6 py-4">Precision</th>
                <th className="px-6 py-4">Recall</th>
                <th className="px-6 py-4">Log Loss</th>
                <th className="px-6 py-4">AUC-ROC</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {[
                { name: 'XGB_Production_v2.4', deployed: '4h ago', dot: 'bg-primary', precision: '0.952', recall: '0.938', loss: '0.104', auc: '0.984', badge: 'Production', badgeClass: 'bg-primary/10 text-primary border-primary/20' },
                { name: 'LSTM_Recurrent_Seq2Seq', deployed: '12h ago', dot: 'bg-lime', precision: '0.914', recall: '0.902', loss: '0.185', auc: '0.955', badge: 'Challenger', badgeClass: 'bg-lime/15 text-charcoal border-lime/30' },
              ].map(row => (
                <tr key={row.name} className="hover:bg-surface-container-low/40 transition-colors duration-150 cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${row.dot}`}></div>
                      <div>
                        <p className="font-bold text-charcoal">{row.name}</p>
                        <p className="text-[10px] text-cool-grey font-mono">Deployed: {row.deployed}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-charcoal font-semibold">{row.precision}</td>
                  <td className="px-6 py-4 font-mono text-charcoal font-semibold">{row.recall}</td>
                  <td className="px-6 py-4 font-mono text-charcoal font-semibold">{row.loss}</td>
                  <td className="px-6 py-4 font-mono text-charcoal font-semibold">{row.auc}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${row.badgeClass}`}>{row.badge}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
