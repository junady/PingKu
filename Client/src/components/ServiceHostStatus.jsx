import React from 'react';
import { Server, ShieldCheck } from 'lucide-react';

function HostStatusRow({ node }) {
  const isDown = node.status === 'DOWN';
  const tickCount = 28;

  // Generate pattern tick bars (Master Stylesheet .np-uptime-bar)
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    if (isDown) {
      const isRed = [0, 2, 3, 5, 8, 12, 16, 20, 24, 25].includes(i);
      return (
        <span
          key={i}
          title={isRed ? 'Incident / Offline' : 'Operational'}
          className={`np-uptime-bar ${isRed ? 'np-uptime-bar--down' : 'np-uptime-bar--idle'}`}
        />
      );
    }
    return (
      <span
        key={i}
        title="100% Operational (UP)"
        className="np-uptime-bar np-uptime-bar--up cursor-pointer"
      />
    );
  });

  return (
    <div className="np-host-row">
      {/* Kolom 1: Nama & Badge Perangkat */}
      <div className="np-host-name min-w-[210px]">
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
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
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
      <div className="np-host-ip min-w-[130px]">
        <span className="bg-slate-900/60 px-2 py-1 rounded-md border border-slate-800">
          {node.ip_address}
        </span>
      </div>

      {/* Kolom 3: Uptime Tick Bars (Master Stylesheet) */}
      <div className="np-uptime-bars flex-1 justify-center px-4 overflow-hidden">
        {ticks}
      </div>

      {/* Kolom 4: Badge Latensi / Status */}
      <div className="w-24 text-right shrink-0">
        {isDown ? (
          <span className="np-pill np-pill--down text-xs">
            <span className="np-dot np-dot--down animate-ping" />
            DOWN
          </span>
        ) : (
          <span className="np-pill np-pill--up text-xs">
            <span className="np-dot np-dot--up" />
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
    <div className="np-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="np-card-title uppercase tracking-tight text-sm">
              Service & Host Status
            </h3>
          </div>
          <p className="np-card-subtitle mt-0.5">
            Pantau status aktif dan riwayat respons perangkat jaringan secara real-time
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="np-dot np-dot--up" /> 99.8% Uptime
          </span>
          <span className="flex items-center gap-1.5">
            <span className="np-dot np-dot--down" /> 1 Incident
          </span>
        </div>
      </div>

      <div className="np-host-list">
        {listToRender.map((node) => (
          <HostStatusRow key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
