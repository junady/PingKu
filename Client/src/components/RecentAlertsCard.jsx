import React from 'react';

export default function RecentAlertsCard({ logs = [] }) {
  const formatTime = (ts) => {
    if (!ts) return '08:22:18';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '08:22:18';
    }
  };

  // Default fallback alert items matching Figma design if logs is empty
  const defaultAlerts = [
    { id: 1, title: 'Penggunaan CPU tinggi', subtitle: '87.7% · 192.168.10.1', time: '08:22:18', severity: 'WARNING' },
    { id: 2, title: 'Penggunaan CPU tinggi', subtitle: '93.4% · 192.168.10.1', time: '08:20:54', severity: 'WARNING' },
    { id: 3, title: 'Penggunaan CPU tinggi', subtitle: '92.5% · 192.168.10.1', time: '08:19:10', severity: 'WARNING' },
  ];

  const items = logs.length > 0
    ? logs.slice(0, 3).map((l, idx) => ({
        id: l.id || idx,
        title: l.event || l.message || 'Penggunaan CPU tinggi',
        subtitle: `${l.host || '192.168.10.1'}`,
        time: formatTime(l.timestamp),
        severity: l.severity || 'WARNING',
      }))
    : defaultAlerts;

  const totalCount = logs.length > 0 ? logs.length : 50;

  return (
    <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 flex flex-col justify-between shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#edf4f5]">
            Recent alerts
          </h3>
          <p className="text-[12px] text-[#91a4ae] mt-0.5">
            Ambang batas memerlukan perhatian
          </p>
        </div>

        <span className="bg-[#382b1d] border border-[#523d24] text-[#f0b849] text-[11px] font-semibold px-2.5 py-0.5 rounded-[5px]">
          {totalCount} total logs
        </span>
      </div>

      {/* List */}
      <div className="space-y-3.5 my-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-2 border-b border-[#1b262e] last:border-none"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#f0b849] mt-1 shrink-0" />
              <div>
                <div className="text-[13px] font-medium text-[#edf4f5] leading-tight">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#91a4ae] mt-0.5">
                  {item.subtitle}
                </div>
              </div>
            </div>

            <span className="text-[11px] font-mono text-[#91a4ae] shrink-0 pl-3">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
