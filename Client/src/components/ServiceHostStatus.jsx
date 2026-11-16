import React from 'react';
import { Server, Router as RouterIcon, Monitor, HardDrive } from 'lucide-react';

function HostIcon({ type }) {
  switch (type?.toLowerCase()) {
    case 'router':
      return <RouterIcon className="w-4 h-4 text-[#91a4ae]" />;
    case 'client':
      return <Monitor className="w-4 h-4 text-[#91a4ae]" />;
    case 'switch':
      return <HardDrive className="w-4 h-4 text-[#91a4ae]" />;
    case 'server':
    default:
      return <Server className="w-4 h-4 text-[#91a4ae]" />;
  }
}

function HostStatusRow({ node }) {
  const isDown = node.status === 'DOWN';
  const tickCount = 32;

  // Tick bars matching Figma design (4px wide, 17px tall, rounded-[2px])
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    let isRed = false;
    if (isDown) {
      isRed = [0, 1, 8, 11, 15, 22, 29].includes(i);
    }
    return (
      <span
        key={i}
        className={`w-1 h-[17px] rounded-[2px] inline-block shrink-0 ${
          isRed ? 'bg-[#f29583]' : 'bg-[#243139]'
        }`}
      />
    );
  });

  return (
    <div className="grid grid-cols-12 items-center py-3.5 border-b border-[#1b262e] last:border-none gap-4">
      {/* Kolom 1: Host / Device (Span 4) */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-[6px] bg-[#172127] border border-[#243139] flex items-center justify-center shrink-0">
          <HostIcon type={node.type} />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-[#edf4f5] truncate">
            {node.label}
          </div>
          <div className="text-[11px] text-[#91a4ae] capitalize">
            {node.type || 'Server'}
          </div>
        </div>
      </div>

      {/* Kolom 2: IP Address (Span 2) */}
      <div className="col-span-2 text-[12px] font-mono text-[#91a4ae]">
        {node.ip_address}
      </div>

      {/* Kolom 3: Uptime History · 24H (Span 4) */}
      <div className="col-span-4 flex items-center gap-[3px] overflow-hidden">
        {ticks}
      </div>

      {/* Kolom 4: Status (Span 2, Right Aligned) */}
      <div className="col-span-2 flex justify-end">
        {isDown ? (
          <span className="bg-[#34231f] border border-[#4d2d25] text-[#f29583] text-[11px] font-medium px-2.5 py-1 rounded-[5px] flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f29583]" />
            Down
          </span>
        ) : (
          <span className="bg-[#163229] border border-[#214f3f] text-[#5ce4bd] text-[11px] font-medium px-2.5 py-1 rounded-[5px] flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd]" />
            {node.latency_ms !== null && node.latency_ms !== undefined ? `${node.latency_ms}ms UP` : '1ms UP'}
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
  const incidentCount = nodes.filter((n) => n.status === 'DOWN').length;

  return (
    <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-6 shadow-sm">
      {/* Header Panel */}
      <div className="flex items-center justify-between pb-5 border-b border-[#1b262e] mb-2">
        <div>
          <h3 className="text-[16px] font-semibold text-[#edf4f5]">
            Service & host status
          </h3>
          <p className="text-[12px] text-[#91a4ae] mt-0.5">
            Ketersediaan layanan dan respons perangkat jaringan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#91a4ae] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd]" />
            <span>99.8% uptime</span>
          </div>

          {incidentCount > 0 ? (
            <span className="bg-[#34231f] border border-[#4d2d25] text-[#f29583] text-xs font-semibold px-2.5 py-1 rounded-[6px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f29583]" />
              {incidentCount} active incident{incidentCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="bg-[#163229] border border-[#214f3f] text-[#5ce4bd] text-xs font-semibold px-2.5 py-1 rounded-[6px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd]" />
              All operational
            </span>
          )}
        </div>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-12 py-3 text-[10px] font-bold text-[#657d89] tracking-wider uppercase border-b border-[#1b262e]">
        <div className="col-span-4">HOST / DEVICE</div>
        <div className="col-span-2">IP ADDRESS</div>
        <div className="col-span-4">UPTIME HISTORY · 24H</div>
        <div className="col-span-2 text-right">STATUS</div>
      </div>

      {/* Rows */}
      <div>
        {listToRender.map((node) => (
          <HostStatusRow key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
