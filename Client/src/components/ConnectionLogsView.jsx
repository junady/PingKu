import React, { useState, useMemo } from 'react';
import { Search, Download, AlertTriangle, ChevronRight, ChevronLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

function extractHostFromMessage(msg) {
  if (!msg) return '-';
  // Cari IP dalam tanda kurung, contoh: (192.168.1.1)
  const match = msg.match(/\((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\)/);
  if (match) return match[1];
  // Jika peringatan CPU / sistem server
  if (msg.toLowerCase().includes('cpu') || msg.toLowerCase().includes('server')) {
    return 'Local Server';
  }
  return '-';
}

function renderSeverityBadge(sev) {
  switch (sev?.toUpperCase()) {
    case 'CRITICAL':
      return (
        <span className="bg-[#34231f] border border-[#4d2d25] text-[#f29583] text-[11px] font-medium px-2.5 py-0.5 rounded-[5px] flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f29583] animate-pulse" />
          Critical
        </span>
      );
    case 'INFO':
    case 'RESOLVED':
      return (
        <span className="bg-[#163229] border border-[#214f3f] text-[#5ce4bd] text-[11px] font-medium px-2.5 py-0.5 rounded-[5px] flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd]" />
          {sev === 'RESOLVED' ? 'Resolved' : 'Info'}
        </span>
      );
    case 'WARNING':
    default:
      return (
        <span className="bg-[#382b1d] border border-[#523d24] text-[#f0b849] text-[11px] font-medium px-2.5 py-0.5 rounded-[5px] flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f0b849]" />
          Warning
        </span>
      );
  }
}

export default function ConnectionLogsView({ logs = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [hostFilter, setHostFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const formatTime = (ts) => {
    if (!ts) return '-';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return String(ts);
    }
  };

  // Hanya gunakan log nyata yang benar-benar tersimpan di database atau masuk lewat WebSocket
  const rawLogs = useMemo(() => {
    return Array.isArray(logs) ? logs : [];
  }, [logs]);

  // Ekstrak daftar host unik nyata dari log
  const availableHosts = useMemo(() => {
    const set = new Set();
    rawLogs.forEach((l) => {
      const h = l.host || extractHostFromMessage(l.event || l.message);
      if (h && h !== '-') set.add(h);
    });
    return Array.from(set);
  }, [rawLogs]);

  // Filter logs berdasarkan pencarian teks, severity, dan host
  const filtered = useMemo(() => {
    return rawLogs.filter((l) => {
      const eventText = l.event || l.message || '';
      const hostText = l.host || extractHostFromMessage(eventText);

      const matchSearch =
        !searchTerm ||
        eventText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hostText.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSev = severityFilter === 'ALL' || l.severity === severityFilter;
      const matchHost = hostFilter === 'ALL' || hostText === hostFilter;

      return matchSearch && matchSev && matchHost;
    });
  }, [rawLogs, searchTerm, severityFilter, hostFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Perhitungan metrik nyata untuk 3 KPI Card
  const totalLogsCount = rawLogs.length;
  const warningCount = rawLogs.filter((l) => l.severity === 'WARNING').length;
  const criticalCount = rawLogs.filter((l) => l.severity === 'CRITICAL').length;
  const latestLog = rawLogs[0];
  const latestHost = latestLog ? (latestLog.host || extractHostFromMessage(latestLog.event || latestLog.message)) : '-';

  const handleExportCsv = () => {
    if (filtered.length === 0) return;
    const headers = 'ID,Time,Event,Host,Severity\n';
    const rows = filtered
      .map((l) => {
        const h = l.host || extractHostFromMessage(l.event || l.message);
        return `"${l.id}","${formatTime(l.timestamp)}","${(l.event || l.message || '').replace(/"/g, '""')}","${h}","${l.severity || ''}"`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pingku-logs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header Sesuai Desain Figma */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#5ce4bd] uppercase tracking-wider block">
            MONITORING / 04
          </span>
          <h1 className="text-[28px] font-bold text-[#edf4f5] tracking-tight mt-0.5">
            Connection Logs
          </h1>
          <p className="text-[13px] text-[#91a4ae] mt-0.5">
            Setiap perubahan dan peringatan, tercatat jelas secara real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
          className="bg-[#152028] border border-[#243139] hover:bg-[#1a2530] text-[#edf4f5] text-xs px-3.5 py-2 rounded-[8px] flex items-center gap-1.5 shadow-sm transition disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5 text-[#91a4ae]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Top 3 KPI Cards Real-Time Berdasarkan Data Nyata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 shadow-sm">
          <span className="text-[11px] text-[#91a4ae] font-medium block">
            Total logs
          </span>
          <div className="text-[36px] font-bold text-[#edf4f5] font-mono leading-tight mt-1">
            {totalLogsCount}
          </div>
          <span className="text-[11px] text-[#657d89] mt-2 block">
            {totalLogsCount > 0 ? 'Seluruh kejadian tersimpan di database' : 'Belum ada kejadian tercatat'}
          </span>
        </div>

        <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 shadow-sm">
          <span className="text-[11px] text-[#91a4ae] font-medium block">
            Peringatan CPU & Ambang Batas
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[36px] font-bold text-[#f0b849] font-mono leading-tight">
              {warningCount}
            </span>
            <div className="flex items-end gap-1 h-6">
              {[4, 6, 5, 8, 7, 10, 9].map((h, i) => (
                <div key={i} className="w-1 bg-[#f0b849]/60 rounded-full" style={{ height: `${h * 2.2}px` }} />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-[#657d89] mt-2 block">
            {warningCount > 0 ? 'Total peringatan beban CPU terdeteksi' : 'Semua ambang batas normal'}
          </span>
        </div>

        <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 shadow-sm">
          <span className="text-[11px] text-[#91a4ae] font-medium block">
            Insiden Kritis (Offline)
          </span>
          <div className="text-[26px] font-bold text-[#edf4f5] font-mono leading-tight mt-1 truncate">
            {criticalCount > 0 ? `${criticalCount} Insiden` : '0 Insiden'}
          </div>
          <span className="text-[11px] text-[#657d89] mt-2 block truncate">
            {latestLog ? `Log terbaru: ${formatTime(latestLog.timestamp)}` : 'Sistem beroperasi normal'}
          </span>
        </div>
      </div>

      {/* Event Stream Panel */}
      <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#1b262e] mb-4">
          <h2 className="text-[16px] font-semibold text-[#edf4f5]">
            Event stream
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-[#5ce4bd] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd] animate-pulse" />
            <span>Pembaruan live WebSocket</span>
          </div>
        </div>

        {/* Filter Bar Dinamis */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5 text-xs">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#657d89] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pesan event atau IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#152028] border border-[#243139] rounded-[8px] pl-9 pr-3 py-2 text-[#edf4f5] placeholder-[#657d89] focus:outline-none focus:border-[#5ce4bd]"
            />
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3 py-2 text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
            >
              <option value="ALL">Semua severity</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
              <option value="RESOLVED">Resolved</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          <div>
            <select
              value={hostFilter}
              onChange={(e) => setHostFilter(e.target.value)}
              className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3 py-2 text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
            >
              <option value="ALL">Semua host</option>
              {availableHosts.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Headers */}
        <div className="grid grid-cols-12 py-2.5 text-[10px] font-bold text-[#657d89] tracking-wider uppercase border-b border-[#1b262e]">
          <div className="col-span-2">WAKTU</div>
          <div className="col-span-6">EVENT</div>
          <div className="col-span-2">HOST / IP</div>
          <div className="col-span-2 text-right pr-4">SEVERITY</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#1b262e]">
          {rawLogs.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-10 h-10 rounded-full bg-[#152028] border border-[#243139] flex items-center justify-center mx-auto mb-2 text-[#5ce4bd]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-[13px] font-semibold text-[#edf4f5]">
                Belum ada log kejadian
              </div>
              <div className="text-[11px] text-[#657d89] mt-0.5 max-w-sm mx-auto">
                Peringatan sistem dan perubahan status koneksi akan otomatis tercatat di sini secara real-time.
              </div>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#657d89] italic">
              Tidak ada log yang cocok dengan filter pencarian.
            </div>
          ) : (
            pageItems.map((log, idx) => {
              const eventMsg = log.event || log.message || '';
              const hostVal = log.host || extractHostFromMessage(eventMsg);
              const isWarning = log.severity === 'WARNING';
              const isCritical = log.severity === 'CRITICAL';

              return (
                <div
                  key={log.id || idx}
                  className="grid grid-cols-12 items-center py-3.5 text-xs hover:bg-[#152028]/40 transition group"
                >
                  <div className="col-span-2 font-mono text-[#91a4ae] text-[11px]">
                    {formatTime(log.timestamp)}
                  </div>

                  <div className="col-span-6 flex items-center gap-2.5 pr-4 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-[4px] border flex items-center justify-center shrink-0 font-bold text-[10px] ${
                        isCritical
                          ? 'bg-[#34231f] border-[#4d2d25] text-[#f29583]'
                          : isWarning
                          ? 'bg-[#382b1d] border-[#523d24] text-[#f0b849]'
                          : 'bg-[#163229] border-[#214f3f] text-[#5ce4bd]'
                      }`}
                    >
                      !
                    </span>
                    <span className="text-[#edf4f5] font-medium truncate" title={eventMsg}>
                      {eventMsg}
                    </span>
                  </div>

                  <div className="col-span-2">
                    {hostVal && hostVal !== '-' ? (
                      <span className="bg-[#172127] border border-[#243139] text-[#91a4ae] font-mono text-[11px] px-2.5 py-1 rounded-[5px]">
                        {hostVal}
                      </span>
                    ) : (
                      <span className="text-[#657d89] font-mono text-[11px] pl-1">-</span>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                    {renderSeverityBadge(log.severity)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {rawLogs.length > 0 && (
          <div className="flex items-center justify-between pt-5 border-t border-[#1b262e] mt-4 text-xs text-[#91a4ae]">
            <div>
              Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}-
              {Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} logs
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-[6px] bg-[#152028] border border-[#243139] text-[#edf4f5] disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`w-7 h-7 rounded-[6px] text-xs font-semibold ${
                    currentPage === pg
                      ? 'bg-[#17382f] text-[#5ce4bd] border border-[#214f3f]'
                      : 'bg-[#152028] border border-[#243139] text-[#91a4ae] hover:text-[#edf4f5]'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-[6px] bg-[#152028] border border-[#243139] text-[#edf4f5] disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}