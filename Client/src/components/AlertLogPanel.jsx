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
          <span className="np-pill np-pill--critical">
            <span className="np-dot np-dot--down animate-ping" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="np-pill np-pill--warning">
            <span className="np-dot" style={{ backgroundColor: 'var(--np-amber)' }} />
            WARNING
          </span>
        );
      case 'RESOLVED':
      case 'INFO':
      default:
        return (
          <span className="np-pill np-pill--resolved">
            <span className="np-dot np-dot--up" />
            {severity?.toUpperCase() === 'INFO' ? 'INFO' : 'RESOLVED'}
          </span>
        );
    }
  };

  return (
    <div className="np-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="np-card-title uppercase tracking-tight text-sm">
            Recent Alert Logs
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
          Total Logs: {logs.length}
        </span>
      </div>

      <div className="np-table-wrap">
        <table className="np-table">
          <thead>
            <tr>
              <th className="w-36">Time</th>
              <th>Event</th>
              <th className="w-48">Host</th>
              <th className="text-right w-28">Status</th>
            </tr>
          </thead>
          <tbody>
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
                  <tr key={log.id || idx}>
                    <td className="text-slate-400 font-mono text-xs">{timeText}</td>
                    <td className="font-medium text-slate-200">
                      <span className="text-slate-500 mr-2">•</span>
                      {eventText}
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                        {hostText}
                      </span>
                    </td>
                    <td className="text-right">{renderBadge(log.severity)}</td>
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
