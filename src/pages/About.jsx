import React from 'react';
import GlassCard from '../components/shared/GlassCard';

const contributors = [
  { name: 'Parth Patil', role: 'ML Specialist', desc: 'Optimized Random Forest and LSTM ensembles for volatility classification.', initials: 'AT', bg: 'bg-gradient-primary text-white' },
  { name: 'Yadnika Patil', role: 'Data Engineer', desc: 'Architected the Apache Spark streaming layer and AWS S3 data lake integration.', initials: 'EV', bg: 'bg-lime text-charcoal' },
  { name: 'Jordan Mikael', role: 'Frontend Architect', desc: 'Engineered the real-time React dashboard with sub-100ms UI re-renders.', initials: 'JM', bg: 'bg-surface-container text-primary border border-outline-variant' },
];

const techStack = [
  { name: 'React / Tailwind', category: 'Frontend Engine', icon: 'javascript' },
  { name: 'Apache Spark', category: 'Data Processing', icon: 'hub' },
  { name: 'AWS SageMaker', category: 'Infrastructure', icon: 'cloud_queue' },
  { name: 'Scikit-Learn', category: 'Machine Learning', icon: 'model_training' },
];

export default function About() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="animate-fade-in-up relative bg-white rounded-2xl p-8 md:p-14 border border-outline-variant overflow-hidden">
        {/* Decorative orb */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-lime/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <span className="inline-block px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-[11px] font-bold tracking-widest uppercase">
            Academic Capstone 2024
          </span>
          <h2 className="font-extrabold text-charcoal leading-tight" style={{ fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-0.03em' }}>
            CryptoSpark AI:<br />
            <span className="text-gradient-primary">Quantifying Volatility</span> Through Distributed Intelligence
          </h2>
          <p className="text-cool-grey text-base leading-relaxed max-w-2xl">
            A high-frequency predictive engine engineered to ingest million-scale websocket packets through a distributed Spark pipeline for real-time institutional alpha generation.
          </p>
        </div>
      </div>

      {/* Problem Statement + Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <GlassCard className="md:col-span-7 p-8 rounded-xl">
          <h3 className="font-extrabold text-lg text-primary mb-5 flex items-center gap-3">
            <span className="material-symbols-outlined">psychology</span> Problem Statement
          </h3>
          <p className="text-sm text-on-surface leading-relaxed mb-3">
            Traditional retail-grade analysis lacks the throughput to handle micro-second volatility shifts in decentralized markets. Data fragmentation leads to <strong>"Predictive Drift"</strong> — models fail to account for cross-chain arbitrage signals.
          </p>
          <p className="text-sm text-on-surface leading-relaxed">
            CryptoSpark AI bridges the gap between institutional data pipelines and accessible predictive modeling.
          </p>

          <div className="mt-8 pt-6 border-t border-outline-variant grid grid-cols-3 gap-4">
            {[
              { val: '99.2%', label: 'Data Fidelity' },
              { val: '<45ms', label: 'Pipeline Latency' },
              { val: '1.2TB', label: 'Training Volume' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-black text-2xl text-charcoal numerical-data">{stat.val}</p>
                <p className="text-[10px] text-cool-grey uppercase font-bold tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="md:col-span-5 space-y-4">
          {[
            { icon: 'track_changes', title: 'Real-time Stream Ingestion', desc: 'Harnessing Apache Spark Streaming to normalize disparate liquidity provider data at scale.' },
            { icon: 'insights', title: 'Multi-Factor Forecasting', desc: 'Deploying Scikit-Learn ensemble methods to predict price action within 5-minute windows.' },
            { icon: 'cloud_done', title: 'Cloud Resiliency', desc: 'Full AWS integration for automated model retraining and scalable storage logic.' },
          ].map((item, i) => (
            <GlassCard key={item.title} className="p-5 rounded-xl gradient-border">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-charcoal">{item.title}</h4>
                  <p className="text-xs text-cool-grey mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <h3 className="font-extrabold text-xl text-charcoal" style={{ letterSpacing: '-0.01em' }}>Tech Stack Matrix</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {techStack.map((tech, i) => (
            <GlassCard key={tech.name} className="p-6 rounded-xl flex flex-col items-center text-center gap-4 gradient-border" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="w-12 h-12 flex items-center justify-center bg-primary/8 rounded-full group-hover:bg-primary/15 transition-colors duration-300">
                <span className="material-symbols-outlined text-primary text-2xl">{tech.icon}</span>
              </div>
              <div>
                <p className="font-bold text-sm text-charcoal">{tech.name}</p>
                <p className="text-[10px] text-cool-grey uppercase font-semibold tracking-wider mt-0.5">{tech.category}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Contributors */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h3 className="font-extrabold text-xl text-charcoal" style={{ letterSpacing: '-0.01em' }}>Project Contributors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contributors.map((c, i) => (
            <GlassCard key={c.name} lift className="p-8 rounded-xl text-center space-y-4" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center font-extrabold text-xl shadow-md ${c.bg}`}>
                {c.initials}
              </div>
              <div>
                <h5 className="font-extrabold text-lg text-primary">{c.name}</h5>
                <p className="text-[10px] text-cool-grey uppercase tracking-widest font-semibold mt-0.5">{c.role}</p>
              </div>
              <p className="text-xs text-on-surface leading-relaxed">{c.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
