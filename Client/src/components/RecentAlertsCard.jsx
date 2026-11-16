import React from 'react';
import { CheckCircle2 } from 'lucide-react';

function extractHostFromMessage(msg) {
  if (!msg) return '-';
  const match = msg.match(/\((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\)/);
  if (match) return match[1];
  if (msg.toLowerCase().includes('cpu') || msg.toLowerCase().includes('server')) {
    return 'Local Server';
  }
  return '-';
}

export default function RecentAlertsCard({ logs = [] }) {
  const formatTime = (ts) => {
    if (!ts) return '-';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return String(ts);
    }
  };

  const hasLogs = Array.isArray(logs) && logs.length > 0;
  const items = hasLogs
    ? logs.slice(0, 3).map((l, idx) => {
        const fullMsg = l.event || l.message || '';
        const hostVal = l.host || extractHostFromMessage(fullMsg);
        return {
          id: l.id || idx,
          title: fullMsg,
          subtitle: hostVal !== '-' ? hostVal : 'Local Server',
          time: formatTime(l.timestamp),
          severity: l.severity || 'WARNING',
        };
      })
    : [];

  const totalCount = hasLogs ? logs.length : 0;

  return (
    <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 flex flex-col justify-between shadow-sm min-h-[260px]">
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

        <span className="bg-[#152028] border border-[#243139] text-[#91a4ae] text-[11px] font-semibold px-2.5 py-0.5 rounded-[5px]">
          {totalCount} total logs
        </span>
      </div>

      {/* List atau Empty State */}
      {!hasLogs ? (
        <div className="py-8 text-center my-auto">
          <div className="w-8 h-8 rounded-full bg-[#163229] border border-[#214f3f] flex items-center justify-center mx-auto mb-2 text-[#5ce4bd]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-[13px] font-semibold text-[#edf4f5]">Kondisi Normal</div>
          <div className="text-[11px] text-[#657d89] mt-0.5">Belum ada peringatan aktif terdeteksi</div>
        </div>
      ) : (
        <div className="space-y-3.5 my-auto">
          {items.map((item) => {
            const isCritical = item.severity === 'CRITICAL';
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-[#1b262e] last:border-none"
              >
                <div className="flex items-start gap-2.5 min-w-0 pr-2">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      isCritical ? 'bg-[#f29583] animate-pulse' : 'bg-[#f0b849]'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#edf4f5] leading-tight truncate" title={item.title}>
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#91a4ae] mt-0.5 font-mono">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-[#91a4ae] shrink-0 pl-2">
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}