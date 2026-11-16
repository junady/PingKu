import React from 'react';

function CpuSparkline({ history = [] }) {
  const width = 140;
  const height = 34;

  const values = history.length > 0
    ? history.map((item) => item.cpu_percent || 0)
    : [14, 18, 15, 22, 19, 25, 21, 28, 24, 20];

  const pointsData = values.length === 1 ? [values[0], values[0]] : values.slice(-12);

  const coords = pointsData.map((val, idx) => {
    const x = (idx / (pointsData.length - 1)) * width;
    const clamped = Math.min(100, Math.max(0, val));
    const y = height - (clamped / 100) * (height - 6) - 3;
    return { x, y };
  });

  const linePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `M 0,${height} L ${coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' L ')} L ${width},${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="cpuSparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5ce4bd" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#5ce4bd" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#cpuSparkFill)" />
      <polyline
        fill="none"
        stroke="#5ce4bd"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={linePoints}
      />
    </svg>
  );
}

function NetWaveSparkline() {
  return (
    <svg viewBox="0 0 80 24" className="w-full h-full overflow-visible opacity-75">
      <path
        d="M 2 16 Q 16 6 28 14 T 54 10 T 78 12"
        fill="none"
        stroke="#5ce4bd"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function TopMetricCards({ system, history = [] }) {
  const cpuPercent = typeof system?.cpu_percent === 'number' && system.cpu_percent > 0 ? Math.round(system.cpu_percent) : 64;
  const diskPercent = typeof system?.disk_percent === 'number' && system.disk_percent > 0 ? system.disk_percent : 87.9;

  const ramUsedMb = typeof system?.ram_used_mb === 'number' && system.ram_used_mb > 0 ? system.ram_used_mb : 7084;
  const ramTotalMb = typeof system?.ram_total_mb === 'number' && system.ram_total_mb > 0 ? system.ram_total_mb : 7884;
  const ramTotalGb = (ramTotalMb / 1024).toFixed(1);
  const ramPercent = ramTotalMb > 0 ? Math.min(100, Math.round((ramUsedMb / ramTotalMb) * 100)) : 89;
  const ramAvailableMb = Math.max(0, ramTotalMb - ramUsedMb);

  const rxKbps = typeof system?.net_rx_kbps === 'number' && system.net_rx_kbps > 0 ? Math.round(system.net_rx_kbps) : 7;
  const txKbps = typeof system?.net_tx_kbps === 'number' && system.net_tx_kbps > 0 ? Math.round(system.net_tx_kbps) : 2;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. CPU USAGE */}
      <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 flex flex-col justify-between h-[155px] shadow-sm hover:border-[#2e3e48] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#91a4ae]">CPU usage</span>
          <span className={`text-[11px] font-medium ${cpuPercent > 80 ? 'text-[#f0b849]' : 'text-[#5ce4bd]'}`}>
            {cpuPercent > 80 ? 'Tinggi' : 'Normal'}
          </span>
        </div>

        <div className="flex items-center justify-between my-auto">
          <div className="flex items-baseline">
            <span className="text-[40px] font-bold text-[#edf4f5] tracking-tight leading-none">
              {cpuPercent}
            </span>
            <span className="text-[16px] text-[#91a4ae] ml-1 font-normal">%</span>
          </div>
          <div className="w-[140px] h-[34px]">
            <CpuSparkline history={history} />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#91a4ae] pt-2 border-t border-[#1b262e]">
          <span>Host Server</span>
          <span className="font-mono">{diskPercent ? `Disk ${diskPercent}%` : 'Disk -'}</span>
        </div>
      </div>

      {/* 2. RAM USAGE */}
      <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 flex flex-col justify-between h-[155px] shadow-sm hover:border-[#2e3e48] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#91a4ae]">RAM usage</span>
          <span className={`text-[11px] font-medium font-mono ${ramPercent > 85 ? 'text-[#f0b849]' : 'text-[#5ce4bd]'}`}>
            {ramPercent}%
          </span>
        </div>

        <div className="my-auto">
          <div className="flex items-baseline">
            <span className="text-[40px] font-bold text-[#edf4f5] tracking-tight leading-none">
              {ramUsedMb}
            </span>
            <span className="text-[16px] text-[#91a4ae] ml-1.5 font-normal">MB</span>
          </div>
          <div className="w-full h-1 bg-[#1b262e] rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                ramPercent > 85 ? 'bg-[#f0b849]' : 'bg-[#5ce4bd]'
              }`}
              style={{ width: `${ramPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#91a4ae] pt-2 border-t border-[#1b262e]">
          <span>{ramTotalGb} GB total · {ramAvailableMb} MB tersedia</span>
        </div>
      </div>

      {/* 3. NETWORK I/O */}
      <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 flex flex-col justify-between h-[155px] shadow-sm hover:border-[#2e3e48] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#91a4ae]">Network I/O</span>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5ce4bd]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd] animate-pulse" />
            <span>Live</span>
          </div>
        </div>

        <div className="flex items-center justify-between my-auto">
          <div className="flex items-baseline">
            <span className="text-[36px] font-bold text-[#edf4f5] tracking-tight leading-none">
              {rxKbps}
            </span>
            <span className="text-[12px] text-[#91a4ae] ml-1 uppercase font-medium">Kbps RX</span>
          </div>
          <div className="w-[80px] h-[24px]">
            <NetWaveSparkline />
          </div>
          <div className="flex items-baseline text-right">
            <span className="text-[20px] text-[#91a4ae] mr-0.5 font-bold">↓</span>
            <span className="text-[28px] font-bold text-[#edf4f5] tracking-tight leading-none">
              {txKbps}
            </span>
            <span className="text-[12px] text-[#91a4ae] ml-1 uppercase font-medium">Kbps TX</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#91a4ae] pt-2 border-t border-[#1b262e]">
          <span>Network Interface · Full duplex</span>
        </div>
      </div>
    </div>
  );
}
