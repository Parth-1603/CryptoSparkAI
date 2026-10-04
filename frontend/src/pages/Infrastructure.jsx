import React, { useState, useEffect } from 'react';
import GlassCard from '../components/shared/GlassCard';
import { api } from '../services/api';

export default function Infrastructure() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // NOTE: these must match the exact names exported from api.js —
    // getInfrastructureStatus / getInfrastructureLogs, not
    // getInfraStatus / getInfraLogs.
    api.getInfrastructureStatus().then(setStatus).catch(console.error);
    api.getInfrastructureLogs().then(setLogs).catch(console.error);
  }, []);

  const health = status?.health || {};

  return (
    <div className="space-y-8">
      {/* Infrastructure Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-3xl">storage</span>
            <span className="text-tertiary font-label-sm text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> 4.2%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-on-surface-variant font-label-md text-xs">Total Records Processed</p>
            <h3 className="text-headline-md font-headline-md font-bold text-charcoal mt-1 font-mono">
              {status?.totalRecordsProcessed || '...'}
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-5 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-3xl">speed</span>
            <span className="text-on-surface-variant text-xs font-bold uppercase">OPTIMAL</span>
          </div>
          <div className="mt-4">
            <p className="text-on-surface-variant font-label-md text-xs">Avg Processing Latency</p>
            <h3 className="text-headline-md font-headline-md font-bold text-on-surface mt-1 font-mono">
              {status?.avgLatency || '...'}
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-5 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-3xl">memory</span>
            <span className="text-primary text-xs font-bold">EMR m5.large</span>
          </div>
          <div className="mt-4">
            <p className="text-on-surface-variant font-label-md text-xs">Active Compute Nodes</p>
            <h3 className="text-headline-md font-headline-md font-bold text-on-surface mt-1 font-mono">
              {status?.activeNodes || '...'}
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-5 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-3xl">cloud_done</span>
            <span className="text-charcoal text-xs font-bold">99.9% UPTIME</span>
          </div>
          <div className="mt-4">
            <p className="text-on-surface-variant font-label-md text-xs">S3 Throughput</p>
            <h3 className="text-headline-md font-headline-md font-bold text-on-surface mt-1 font-mono">
              {status?.s3Throughput || '...'}
            </h3>
          </div>
        </GlassCard>
      </div>

      {/* Architecture Flow Map — static diagram, not data-driven */}
      <GlassCard className="rounded-xl p-8 overflow-hidden relative min-h-[380px] flex flex-col justify-center">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-surface-container-low rounded-2xl flex items-center justify-center border border-outline-variant hover:border-primary transition-all">
              <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
            </div>
            <div className="text-center">
              <p className="font-title-md text-title-md text-on-surface font-bold">Amazon S3</p>
              <p className="font-label-sm text-xs text-on-surface-variant">Data Lake</p>
            </div>
          </div>

          <div className="hidden md:block flex-1 h-0.5 bg-primary/30 rounded-full"></div>
          <span className="md:hidden material-symbols-outlined text-primary">arrow_downward</span>

          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-surface-container-low rounded-2xl flex items-center justify-center border border-outline-variant hover:border-primary transition-all">
              <span className="material-symbols-outlined text-primary text-4xl">dns</span>
            </div>
            <div className="text-center">
              <p className="font-title-md text-title-md text-on-surface font-bold">Amazon EMR</p>
              <p className="font-label-sm text-xs text-on-surface-variant">Spark Engine</p>
            </div>
          </div>

          <div className="hidden md:block flex-1 h-0.5 bg-lime rounded-full"></div>
          <span className="md:hidden material-symbols-outlined text-primary">arrow_downward</span>

          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-surface-container-low rounded-2xl flex items-center justify-center border border-outline-variant hover:border-primary transition-all">
              <span className="material-symbols-outlined text-primary text-4xl">terminal</span>
            </div>
            <div className="text-center">
              <p className="font-title-md text-title-md text-on-surface font-bold">PySpark</p>
              <p className="font-label-sm text-xs text-on-surface-variant">ETL Layer</p>
            </div>
          </div>

          <div className="hidden md:block flex-1 h-0.5 bg-primary/30 rounded-full"></div>
          <span className="md:hidden material-symbols-outlined text-primary">arrow_downward</span>

          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-surface-container-low rounded-2xl flex items-center justify-center border border-outline-variant hover:border-primary transition-all">
              <span className="material-symbols-outlined text-primary text-4xl">database</span>
            </div>
            <div className="text-center">
              <p className="font-title-md text-title-md text-on-surface font-bold">Feature Store</p>
              <p className="font-label-sm text-xs text-on-surface-variant">Offline Store</p>
            </div>
          </div>

          <div className="hidden md:block flex-1 h-0.5 bg-lime rounded-full"></div>
          <span className="md:hidden material-symbols-outlined text-primary">arrow_downward</span>

          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center border-2 border-primary shadow-md">
              <span className="material-symbols-outlined text-primary text-5xl">api</span>
            </div>
            <div className="text-center">
              <p className="font-title-md text-title-md text-on-surface font-bold">Prediction API</p>
              <p className="font-label-sm text-xs text-on-surface-variant">Live Inference</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-8 text-on-surface-variant font-label-md text-xs">
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-primary rounded-full"></span>Data Stream</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-lime rounded-full"></span>Compute Path</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-tertiary-fixed-dim rounded-full"></span>Inference Output</div>
        </div>
      </GlassCard>

      {/* Infrastructure Health & Prediction Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h4 className="font-title-lg text-title-lg text-on-surface">Infrastructure Health</h4>
          <GlassCard className="p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">cloud_queue</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Amazon S3</span>
                <span className="text-primary text-xs">{health.s3?.status || '...'}</span>
              </div>
              <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${health.s3?.load ?? 0}%` }}></div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">groups_2</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center text-sm font-bold">
                <span>EMR Cluster</span>
                <span className="text-primary text-xs">{health.emr?.status || '...'}</span>
              </div>
              <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${health.emr?.load ?? 0}%` }}></div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">settings_ethernet</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center text-sm font-bold">
                <span>EC2 Instances</span>
                <span className="text-primary text-xs">{health.ec2?.status || '...'}</span>
              </div>
              <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${health.ec2?.load ?? 0}%` }}></div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Prediction Verification Stream Table — now driven by the live logs array */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h4 className="font-title-lg text-title-lg text-on-surface">Prediction Logs</h4>
              <p className="text-on-surface-variant text-xs">Real-time inference verification stream</p>
            </div>
            <button className="bg-surface border border-outline-variant px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface hover:border-primary transition-all flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">download</span> Export Logs
            </button>
          </div>

          <GlassCard className="rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low border-b border-outline-variant uppercase text-cool-grey font-bold">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Asset</th>
                    <th className="px-5 py-3">Predicted vs Actual</th>
                    <th className="px-5 py-3">Error %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-mono">
                  {logs.map(row => (
                    <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-5 py-3 font-bold text-on-surface">{row.id}</td>
                      <td className="px-5 py-3 text-cool-grey">{row.timestamp}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>{row.asset}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-primary font-bold">{row.predicted}</span> / <span className="text-cool-grey">{row.actual}</span>
                      </td>
                      <td className="px-5 py-3 text-primary font-bold">{row.errorPct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-surface-container-low px-5 py-3 border-t border-outline-variant flex justify-between items-center text-xs text-cool-grey">
              <span>Showing {logs.length} of {status?.totalRecordsProcessed || '...'} Records</span>
              <div className="flex gap-2">
                <button className="w-7 h-7 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant"><span className="material-symbols-outlined text-xs">chevron_left</span></button>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant"><span className="material-symbols-outlined text-xs">chevron_right</span></button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
