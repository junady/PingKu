import React from 'react';
import { ArrowLeftRight, Cpu, HardDrive } from 'lucide-react';

function CpuAreaSparkline({ history }) {
  const width = 260;
  const height = 40;

  const values = history.length > 0
    ? history.map((item) => item.cpu_percent || 0)
    : [14, 16, 13, 19, 15, 14];

  const pointsData = values.length === 1 ? [values[0], values[0]] : values;

  // Koordinat polyline garis
  const coords = pointsData.map((val, idx) => {
    const x = (idx / (pointsData.length - 1)) * width;
    const clamped = Math.min(100, Math.max(0, val));
    const y = height - (clamped / 100) * (height - 8) - 4;
    return { x, y };
  });

  const linePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  // Path area penutup di bawah garis (Beszel style chart area)
  const areaPath = `M 0,${height} L ${coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' L ')} L ${width},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-10 overflow-visible mt-2"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="cpuStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="cpuArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Area gradient under the line */}
      <path d={areaPath} fill="url(#cpuArea)" />
      {/* Stroke line */}
      <polyline
        fill="none"
        stroke="url(#cpuStroke)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={linePoints}
      />
    </svg>
  );
}

export default function TopMetricCards({ system, history = [] }) {
  const ramUsedMb = system?.ram_used_mb ?? 512;
  const ramTotalMb = system?.ram_total_mb ?? 2048;
  const ramTotalGb = (ramTotalMb / 1024).toFixed(1);
  const ramPercent = Math.min(100, Math.round((ramUsedMb / ramTotalMb) * 100));

  const rxKbps = Math.round(system?.net_rx_kbps ?? 124);
  const txKbps = Math.round(system?.net_tx_kbps ?? 48);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* ==========================================
          1. CPU USAGE (Beszel-Style Depth & Gradient)
      ========================================== */}
      <div className="relative group bg-gradient-to-b from-[#131927] to-[#0e1320] border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/20 transition-all duration-300">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                CPU Usage
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
              Disk: {system?.disk_percent ?? 32}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {Math.round(system?.cpu_percent ?? 14)}%
            </span>
            <span className="text-xs text-slate-400">load</span>
          </div>

          {/* Sparkline Area Chart */}
          <CpuAreaSparkline history={history} />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
          <span>Intel Xeon • 4 Cores</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Normal
          </span>
        </div>
      </div>

      {/* ==========================================
          2. RAM USAGE (Beszel-Style Depth & Bar)
      ========================================== */}
      <div className="relative group bg-gradient-to-b from-[#131927] to-[#0e1320] border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/20 transition-all duration-300">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <HardDrive className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                RAM Usage
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
              {ramPercent}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {ramUsedMb} MB
            </span>
            <span className="text-sm font-medium text-slate-400">
              / {ramTotalGb} GB
            </span>
          </div>

          {/* Progress Bar with Gradient and Glow */}
          <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden mt-6 p-0.5 border border-slate-700/40">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                ramPercent > 85
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                  : 'bg-gradient-to-r from-sky-400 to-indigo-500 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
              }`}
              style={{ width: `${ramPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
          <span>Shared memory and buffers</span>
          <span className="text-slate-500 font-mono text-[11px]">Free: {ramTotalMb - ramUsedMb} MB</span>
        </div>
      </div>

      {/* ==========================================
          3. NETWORK I/O (Beszel-Style Traffic Card)
      ========================================== */}
      <div className="relative group bg-gradient-to-b from-[#131927] to-[#0e1320] border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/20 transition-all duration-300">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Network I/O
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono text-emerald-400 font-medium">Live</span>
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {rxKbps}
            </span>
            <span className="text-xs font-semibold text-sky-400 uppercase">Kbps Rx</span>
            <span className="text-slate-600 font-bold mx-1">/</span>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {txKbps}
            </span>
            <span className="text-xs font-semibold text-emerald-400 uppercase">Kbps Tx</span>
          </div>

          {/* Visual Dual Rate Indicator Bar */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Inbound</span>
              <span className="text-xs font-mono font-bold text-sky-400">{rxKbps} Kbps</span>
            </div>
            <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Outbound</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{txKbps} Kbps</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
          <span>Real-time traffic on eth0</span>
          <span className="text-slate-500 font-mono text-[11px]">Duplex: Full</span>
        </div>
      </div>
    </div>
  );
}
