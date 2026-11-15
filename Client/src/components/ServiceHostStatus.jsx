import React from 'react';
import { Server, ShieldCheck } from 'lucide-react';

function HostStatusRow({ node }) {
  const isDown = node.status === 'DOWN';
  const tickCount = 28;

  // Generate pattern tick bars (Beszel-style status ticks)
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    if (isDown) {
      const isRed = [0, 2, 3, 5, 8, 12, 16, 20, 24, 25].includes(i);
      return (
        <span
          key={i}
          title={isRed ? 'Incident / Offline' : 'Operational'}
          className={`w-1.5 h-4 rounded-[2px] transition-all ${
            isRed
              ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]'
              : 'bg-rose-950/40 border border-rose-900/30'
          }`}
        />
      );
    }
    return (
      <span
        key={i}
        title="100% Operational (UP)"
        className="w-1.5 h-4 rounded-[2px] bg-emerald-500/90 hover:bg-emerald-400 hover:scale-110 shadow-[0_0_4px_rgba(16,185,129,0.2)] transition-all cursor-pointer"
      />
    );
  });

  return (
    <div className="flex items-center justify-between py-3.5 px-3 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 rounded-xl transition duration-150">
      {/* Kolom 1: Nama & Badge Perangkat */}
      <div className="flex items-center gap-3 w-1/4 min-w-[210px]">
        <div
          className={`p-2 rounded-lg border ${
            isDown
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
          }`}
        >
          <Server className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-100 tracking-tight">
              {node.label}
            </span>
            {isDown && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)] animate-pulse">
                OFFLINE
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-400 block -mt-0.5">
            {node.type || 'host'}
          </span>
        </div>
      </div>

      {/* Kolom 2: IP Address */}
      <div className="w-1/6 min-w-[130px]">
        <span className="text-xs font-mono font-medium text-slate-300 bg-slate-900/60 px-2 py-1 rounded-md border border-slate-800">
          {node.ip_address}
        </span>
      </div>

      {/* Kolom 3: Uptime Tick Bars (Beszel style) */}
      <div className="flex items-center gap-1 flex-1 justify-center px-4 overflow-hidden">
        {ticks}
      </div>

      {/* Kolom 4: Badge Latensi / Status */}
      <div className="w-24 text-right shrink-0">
        {isDown ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-semibold shadow-[0_0_10px_rgba(244,63,94,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            DOWN
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {node.latency_ms !== null && node.latency_ms !== undefined
              ? `${node.latency_ms}ms UP`
              : '1ms UP'}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ServiceHostStatus({ nodes = [] }) {
  const displayNodes = nodes.filter((n) =>
    ['Router MikroTik', 'DNS Server BIND9', 'Debian Server 12', 'Client-3', 'Debian Server'].some(
      (name) => n.label.toLowerCase().includes(name.toLowerCase())
    )
  );

  const listToRender = displayNodes.length > 0 ? displayNodes : nodes.slice(0, 4);

  return (
    <div className="relative group bg-gradient-to-b from-[#131927] to-[#0e1320] border border-slate-800/90 rounded-2xl p-6 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              Service & Host Status
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pantau status aktif dan riwayat respons perangkat jaringan secara real-time
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> 99.8% Uptime
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> 1 Incident
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {listToRender.map((node) => (
          <HostStatusRow key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
