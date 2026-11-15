import React from 'react';
import { Clock } from 'lucide-react';

export default function AlertLogPanel({ logs = [] }) {
  const formatTime = (ts, fallbackStr) => {
    if (fallbackStr) return fallbackStr;
    if (!ts) return '--:--:--';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts || '--:--:--';
    }
  };

  const renderBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            WARNING
          </span>
        );
      case 'RESOLVED':
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {severity?.toUpperCase() === 'INFO' ? 'INFO' : 'RESOLVED'}
          </span>
        );
    }
  };

  return (
    <div className="relative group bg-gradient-to-b from-[#131927] to-[#0e1320] border border-slate-800/90 rounded-2xl p-6 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white tracking-tight uppercase">
            Recent Alert Logs
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
          Total Logs: {logs.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800/80 pb-3">
              <th className="pb-3 font-semibold uppercase tracking-wider text-[11px] w-36">Time</th>
              <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Event</th>
              <th className="pb-3 font-semibold uppercase tracking-wider text-[11px] w-48">Host</th>
              <th className="pb-3 font-semibold uppercase tracking-wider text-[11px] text-right w-28">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500 italic">
                  Belum ada log alert tercatat. Sistem dalam keadaan normal.
                </td>
              </tr>
            ) : (
              logs.slice(0, 8).map((log, idx) => {
                const eventText = log.event || log.message || 'System Notification';
                const hostText = log.host || '192.168.10.1';
                const timeText = formatTime(log.timestamp, log.timeStr);

                return (
                  <tr key={log.id || idx} className="hover:bg-slate-800/25 transition">
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{timeText}</td>
                    <td className="py-3 font-medium text-slate-200">
                      <span className="text-slate-500 mr-2">•</span>
                      {eventText}
                    </td>
                    <td className="py-3">
                      <span className="font-mono text-[11px] text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                        {hostText}
                      </span>
                    </td>
                    <td className="py-3 text-right">{renderBadge(log.severity)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
