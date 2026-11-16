import React, { useState, useMemo } from 'react';

export default function SystemPerformanceChart({ history = [] }) {
  const [timeframe, setTimeframe] = useState('24h');

  // Sample or live 24h curve coordinates
  const defaultPoints = [
    { x: 0, y: 64, time: '00:00' },
    { x: 50, y: 72, time: '02:00' },
    { x: 100, y: 68, time: '04:00' },
    { x: 150, y: 60, time: '06:00' },
    { x: 200, y: 62, time: '08:00' },
    { x: 250, y: 55, time: '10:00' },
    { x: 300, y: 65, time: '12:00' },
    { x: 350, y: 58, time: '14:00' },
    { x: 400, y: 64, time: '16:00' },
    { x: 450, y: 70, time: '18:00' },
    { x: 500, y: 66, time: '20:00' },
    { x: 550, y: 72, time: '22:00' },
    { x: 600, y: 69, time: '23:59' },
  ];

  const points = useMemo(() => {
    if (history && history.length >= 4) {
      return history.map((item, idx) => ({
        x: (idx / (history.length - 1)) * 600,
        y: Math.min(100, Math.max(0, item.cpu_percent || 0)),
        time: item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${idx}`,
      }));
    }
    return defaultPoints;
  }, [history]);

  const svgWidth = 600;
  const svgHeight = 160;

  // Convert points to SVG coordinates
  // y ranges from 0 to 100%, svgHeight is 160
  const coords = points.map((p) => {
    const px = (p.x / 600) * svgWidth;
    const py = svgHeight - (p.y / 100) * (svgHeight - 16) - 8;
    return { x: px, y: py };
  });

  // Generate smooth cubic bezier curve
  let curveD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const cp1x = coords[i].x + (coords[i + 1].x - coords[i].x) / 2;
    const cp1y = coords[i].y;
    const cp2x = coords[i].x + (coords[i + 1].x - coords[i].x) / 2;
    const cp2y = coords[i + 1].y;
    curveD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${coords[i + 1].x} ${coords[i + 1].y}`;
  }

  const areaD = `${curveD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  return (
    <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 flex flex-col justify-between shadow-sm">
      {/* Header Panel */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#edf4f5]">
            System performance
          </h3>
          <p className="text-[12px] text-[#91a4ae] mt-0.5">
            Beban CPU selama 24 jam terakhir
          </p>
        </div>

        {/* Timeframe Toggles */}
        <div className="flex items-center gap-1 bg-[#172127] border border-[#243139] p-1 rounded-[8px] text-[11px] font-medium">
          {['1h', '6h', '12h', '24h'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-[5px] transition-colors ${
                timeframe === tf
                  ? 'bg-[#243139] text-[#edf4f5] font-semibold'
                  : 'text-[#91a4ae] hover:text-[#edf4f5]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-[180px] mt-2">
        {/* Y-Axis Grid Lines & Labels */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 text-[10px] text-[#657d89] font-mono">
          <div className="flex items-center">
            <span className="w-8 shrink-0">100%</span>
            <div className="flex-1 border-b border-[#1f2c35]/80" />
          </div>
          <div className="flex items-center">
            <span className="w-8 shrink-0">75%</span>
            <div className="flex-1 border-b border-[#1f2c35]/80" />
          </div>
          <div className="flex items-center">
            <span className="w-8 shrink-0">50%</span>
            <div className="flex-1 border-b border-[#1f2c35]/80" />
          </div>
          <div className="flex items-center">
            <span className="w-8 shrink-0">25%</span>
            <div className="flex-1 border-b border-[#1f2c35]/80" />
          </div>
        </div>

        {/* SVG Area & Stroke Curve */}
        <div className="absolute left-8 right-0 top-0 bottom-6 overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="perfAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5ce4bd" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#5ce4bd" stopOpacity="0.01" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#perfAreaFill)" />
            <path
              d={curveD}
              fill="none"
              stroke="#5ce4bd"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* X-Axis Timeline */}
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] text-[#657d89] font-mono pt-1">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>23:59</span>
        </div>
      </div>
    </div>
  );
}
