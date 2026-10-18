import React, { useState, useEffect } from 'react';
import GlassCard from '../components/shared/GlassCard';
import { SkeletonCard } from '../components/shared/LoadingState';
import { api } from '../services/api';

export default function Infrastructure() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      api.getInfrastructureStatus(),
      api.getInfrastructureLogs(),
    ]).then(([statusRes, logsRes]) => {
      if (!mounted) return;
      if (statusRes.status === 'fulfilled') setStatus(statusRes.value);
      if (logsRes.status === 'fulfilled') setLogs(logsRes.value);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const health = status?.health || {};

  return (
    <div className="space-y-8">
      {/* Infrastructure Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !status ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} height="h-32" />
          ))
        ) : (
          <>
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
        </>
      )}
    </div>

      {/* Architecture Flow Map — Animated AWS Pipeline Stream */}
      <GlassCard className="rounded-xl p-6 md:p-8 overflow-hidden relative min-h-[400px] flex flex-col justify-center bg-gradient-to-b from-surface/40 via-surface/10 to-surface/40 border border-outline-variant/60 shadow-lg">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-28 bg-primary/5 blur-3xl pointer-events-none rounded-full" />

        {/* Section Header with Live Stream Beacon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-outline-variant/60 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">
                hub
              </span>
              <h3 className="font-title-lg text-lg md:text-xl font-bold text-on-surface tracking-tight">
                AWS Distributed Pipeline Architecture
              </h3>
            </div>
            <p className="text-on-surface-variant text-xs mt-1">
              Continuous high-throughput streaming from Amazon S3 to PySpark distributed engine & sub-second REST API serving
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 border border-primary/30 text-primary shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
              PIPELINE STREAMING • HEALTHY
            </span>
          </div>
        </div>

        {/* Flow Map Nodes & Stream Packets */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 relative z-10 my-2">
          {/* Node 1: Amazon S3 */}
          <div className="relative group flex flex-col items-center">
            <div className="data-flow-node-ping" style={{ animationDelay: '0s' }} />
            <div className="w-20 h-20 md:w-22 md:h-22 bg-surface-container-low rounded-2xl flex flex-col items-center justify-center border border-outline-variant group-hover:border-primary group-hover:shadow-[0_0_24px_rgba(162,224,55,0.3)] transition-all duration-300 relative z-10">
              <span className="material-symbols-outlined text-primary text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">
                inventory_2
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime mt-1 animate-pulse" />
            </div>
            <div className="text-center mt-3">
              <p className="font-title-md text-sm md:text-base text-on-surface font-bold tracking-tight">Amazon S3</p>
              <p className="font-label-sm text-[11px] text-primary font-medium">Data Lake</p>
              <div className="mt-1 px-2 py-0.5 rounded bg-surface-container-high/60 border border-outline-variant/60 inline-block">
                <p className="text-[10px] text-on-surface-variant font-mono">5.2M+ Raw Ticks</p>
              </div>
            </div>
          </div>

          {/* Connector 1 */}
          <div className="hidden md:flex flex-1 items-center px-1">
            <div className="aws-pipe-segment w-full">
              <div className="aws-pipe-packet" style={{ animationDelay: '0s' }} />
              <div className="aws-pipe-packet aws-pipe-packet-delayed" style={{ animationDelay: '1.1s' }} />
            </div>
          </div>
          <div className="md:hidden flex flex-col items-center py-1">
            <div className="aws-pipe-vertical">
              <div className="aws-pipe-vertical-packet" />
            </div>
          </div>

          {/* Node 2: Amazon EMR */}
          <div className="relative group flex flex-col items-center">
            <div className="data-flow-node-ping" style={{ animationDelay: '0.6s' }} />
            <div className="w-20 h-20 md:w-22 md:h-22 bg-surface-container-low rounded-2xl flex flex-col items-center justify-center border border-outline-variant group-hover:border-primary group-hover:shadow-[0_0_24px_rgba(162,224,55,0.3)] transition-all duration-300 relative z-10">
              <span className="material-symbols-outlined text-primary text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">
                dns
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime mt-1 animate-pulse" />
            </div>
            <div className="text-center mt-3">
              <p className="font-title-md text-sm md:text-base text-on-surface font-bold tracking-tight">Amazon EMR</p>
              <p className="font-label-sm text-[11px] text-primary font-medium">Spark Engine</p>
              <div className="mt-1 px-2 py-0.5 rounded bg-surface-container-high/60 border border-outline-variant/60 inline-block">
                <p className="text-[10px] text-on-surface-variant font-mono">emr-7.14.0</p>
              </div>
            </div>
          </div>

          {/* Connector 2 */}
          <div className="hidden md:flex flex-1 items-center px-1">
            <div className="aws-pipe-segment w-full">
              <div className="aws-pipe-packet" style={{ animationDelay: '0.4s' }} />
              <div className="aws-pipe-packet aws-pipe-packet-delayed" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>
          <div className="md:hidden flex flex-col items-center py-1">
            <div className="aws-pipe-vertical">
              <div className="aws-pipe-vertical-packet" />
            </div>
          </div>

          {/* Node 3: PySpark */}
          <div className="relative group flex flex-col items-center">
            <div className="data-flow-node-ping" style={{ animationDelay: '1.2s' }} />
            <div className="w-20 h-20 md:w-22 md:h-22 bg-surface-container-low rounded-2xl flex flex-col items-center justify-center border border-outline-variant group-hover:border-primary group-hover:shadow-[0_0_24px_rgba(162,224,55,0.3)] transition-all duration-300 relative z-10">
              <span className="material-symbols-outlined text-primary text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">
                terminal
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime mt-1 animate-pulse" />
            </div>
            <div className="text-center mt-3">
              <p className="font-title-md text-sm md:text-base text-on-surface font-bold tracking-tight">PySpark</p>
              <p className="font-label-sm text-[11px] text-primary font-medium">ETL Layer</p>
              <div className="mt-1 px-2 py-0.5 rounded bg-surface-container-high/60 border border-outline-variant/60 inline-block">
                <p className="text-[10px] text-on-surface-variant font-mono">13 Rolling Features</p>
              </div>
            </div>
          </div>

          {/* Connector 3 */}
          <div className="hidden md:flex flex-1 items-center px-1">
            <div className="aws-pipe-segment w-full">
              <div className="aws-pipe-packet" style={{ animationDelay: '0.8s' }} />
              <div className="aws-pipe-packet aws-pipe-packet-delayed" style={{ animationDelay: '1.9s' }} />
            </div>
          </div>
          <div className="md:hidden flex flex-col items-center py-1">
            <div className="aws-pipe-vertical">
              <div className="aws-pipe-vertical-packet" />
            </div>
          </div>

          {/* Node 4: Feature Store */}
          <div className="relative group flex flex-col items-center">
            <div className="data-flow-node-ping" style={{ animationDelay: '1.8s' }} />
            <div className="w-20 h-20 md:w-22 md:h-22 bg-surface-container-low rounded-2xl flex flex-col items-center justify-center border border-outline-variant group-hover:border-primary group-hover:shadow-[0_0_24px_rgba(162,224,55,0.3)] transition-all duration-300 relative z-10">
              <span className="material-symbols-outlined text-primary text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">
                database
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime mt-1 animate-pulse" />
            </div>
            <div className="text-center mt-3">
              <p className="font-title-md text-sm md:text-base text-on-surface font-bold tracking-tight">Feature Store</p>
              <p className="font-label-sm text-[11px] text-primary font-medium">Offline Store</p>
              <div className="mt-1 px-2 py-0.5 rounded bg-surface-container-high/60 border border-outline-variant/60 inline-block">
                <p className="text-[10px] text-on-surface-variant font-mono">Parquet Partitioned</p>
              </div>
            </div>
          </div>

          {/* Connector 4 */}
          <div className="hidden md:flex flex-1 items-center px-1">
            <div className="aws-pipe-segment w-full">
              <div className="aws-pipe-packet" style={{ animationDelay: '1.2s' }} />
              <div className="aws-pipe-packet aws-pipe-packet-delayed" style={{ animationDelay: '2.3s' }} />
            </div>
          </div>
          <div className="md:hidden flex flex-col items-center py-1">
            <div className="aws-pipe-vertical">
              <div className="aws-pipe-vertical-packet" />
            </div>
          </div>

          {/* Node 5: Prediction API */}
          <div className="relative group flex flex-col items-center">
            <div className="data-flow-node-ping" style={{ animationDelay: '2.4s' }} />
            <div className="w-20 h-20 md:w-22 md:h-22 bg-surface rounded-2xl flex flex-col items-center justify-center border-2 border-primary group-hover:shadow-[0_0_28px_rgba(44,110,89,0.5)] transition-all duration-300 relative z-10">
              <span className="material-symbols-outlined text-primary text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">
                api
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime mt-1 animate-pulse" />
            </div>
            <div className="text-center mt-3">
              <p className="font-title-md text-sm md:text-base text-on-surface font-bold tracking-tight">Prediction API</p>
              <p className="font-label-sm text-[11px] text-primary font-medium">Live Inference</p>
              <div className="mt-1 px-2 py-0.5 rounded bg-surface-container-high/60 border border-outline-variant/60 inline-block">
                <p className="text-[10px] text-on-surface-variant font-mono">FastAPI &lt;42ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Legend */}
        <div className="mt-10 pt-4 border-t border-outline-variant/60 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-on-surface-variant font-label-md text-xs relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
            <span>S3 Ingestion Stream (5.2M+ Rows)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-lime rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
            <span>EMR PySpark Distributed Compute</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-mint-green rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />
            <span>Sub-50ms REST Model Serving</span>
          </div>
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
            <button className="bg-surface border border-outline-variant px-4 py-2 rounded-lg text-xs font-bold text-on-surface hover:border-primary transition-all flex items-center gap-1.5 min-h-[44px]">
              <span className="material-symbols-outlined text-sm">download</span> Export Logs
            </button>
          </div>

          <GlassCard className="rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-xs">
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
