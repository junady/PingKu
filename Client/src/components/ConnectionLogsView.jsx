import React, { useState, useMemo } from 'react';
import { Search, Download, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ConnectionLogsView({ logs = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const formatTime = (ts) => {
    if (!ts) return '08:22:18';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '08:22:18';
    }
  };

  // Sample or live logs
  const displayLogs = useMemo(() => {
    if (logs && logs.length > 0) {
      return logs;
    }
    // Default fallback logs matching Figma design
    return [
      { id: 1, timestamp: Date.now() - 1000 * 30, event: 'Penggunaan CPU server tinggi mencapai 87.7%.', host: '192.168.10.1', severity: 'WARNING' },
      { id: 2, timestamp: Date.now() - 1000 * 90, event: 'Penggunaan CPU server tinggi mencapai 87.7%.', host: '192.168.10.1', severity: 'WARNING' },
      { id: 3, timestamp: Date.now() - 1000 * 180, event: 'Penggunaan CPU server tinggi mencapai 93.4%.', host: '192.168.10.1', severity: 'WARNING' },
      { id: 4, timestamp: Date.now() - 1000 * 250, event: 'Penggunaan CPU server tinggi mencapai 93.4%.', host: '192.168.10.1', severity: 'WARNING' },
      { id: 5, timestamp: Date.now() - 1000 * 320, event: 'Penggunaan CPU server tinggi mencapai 92.5%.', host: '192.168.10.1', severity: 'WARNING' },
      { id: 6, timestamp: Date.now() - 1000 * 400, event: 'Penggunaan CPU server tinggi mencapai 92.5%.', host: '192.168.10.1', severity: 'WARNING' },
      { id: 7, timestamp: Date.now() - 1000 * 60000, event: 'Penggunaan CPU server tinggi mencapai 90.2%.', host: '192.168.10.1', severity: 'WARNING' },
      { id: 8, timestamp: Date.now() - 1000 * 120000, event: 'Penggunaan CPU server tinggi mencapai 90.6%.', host: '192.168.10.1', severity: 'WARNING' },
    ];
  }, [logs]);

  // Filter logs
  const filtered = useMemo(() => {
    return displayLogs.filter((l) => {
      const matchSearch =
        !searchTerm ||
        (l.event || l.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.host || '').includes(searchTerm);
      const matchSev = severityFilter === 'ALL' || l.severity === severityFilter;
      return matchSearch && matchSev;
    });
  }, [displayLogs, searchTerm, severityFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCsv = () => {
    const headers = 'ID,Time,Event,Host,Severity\n';
    const rows = filtered
      .map((l) => `"${l.id}","${formatTime(l.timestamp)}","${(l.event || l.message || '').replace(/"/g, '""')}","${l.host || ''}","${l.severity || ''}"`)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#5ce4bd] uppercase tracking-wider block">
            MONITORING / 04
          </span>
          <h1 className="text-[28px] font-bold text-[#edf4f5] tracking-tight mt-0.5">
            Connection Logs
          </h1>
          <p className="text-[13px] text-[#91a4ae] mt-0.5">
            Setiap perubahan dan peringatan, tercatat jelas.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="bg-[#152028] border border-[#243139] hover:bg-[#1a2530] text-[#edf4f5] text-xs px-3.5 py-2 rounded-[8px] flex items-center gap-1.5 shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5 text-[#91a4ae]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 shadow-sm">
          <span className="text-[11px] text-[#91a4ae] font-medium block">
            Total logs
          </span>
          <div className="text-[36px] font-bold text-[#edf4f5] font-mono leading-tight mt-1">
            {displayLogs.length}
          </div>
          <span className="text-[11px] text-[#657d89] mt-2 block">
            Seluruh kejadian yang tercatat
          </span>
        </div>

        <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 shadow-sm">
          <span className="text-[11px] text-[#91a4ae] font-medium block">
            CPU warning terbaru
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[36px] font-bold text-[#f0b849] font-mono leading-tight">
              87.7%
            </span>
            <div className="flex items-end gap-1 h-6">
              {[4, 6, 5, 8, 7, 10, 9].map((h, i) => (
                <div key={i} className="w-1 bg-[#f0b849]/60 rounded-full" style={{ height: `${h * 2.2}px` }} />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-[#657d89] mt-2 block font-mono">
            Penggunaan CPU pada 08:22:18
          </span>
        </div>

        <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 shadow-sm">
          <span className="text-[11px] text-[#91a4ae] font-medium block">
            Host pada log terbaru
          </span>
          <div className="text-[26px] font-bold text-[#edf4f5] font-mono leading-tight mt-1">
            192.168.10.1
          </div>
          <span className="text-[11px] text-[#657d89] mt-2 block">
            DNS Server BIND9
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
            <span>Pembaruan otomatis</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5 text-xs">
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-[#657d89] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari event atau IP address..."
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
              <option value="ALL">Semua status</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
              <option value="RESOLVED">Resolved / Info</option>
            </select>
          </div>

          <div>
            <select className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3 py-2 text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]">
              <option value="ALL">Semua host</option>
              <option value="192.168.10.1">192.168.10.1 (DNS)</option>
              <option value="192.168.10.2">192.168.10.2 (Debian)</option>
              <option value="192.168.10.254">192.168.10.254 (MikroTik)</option>
            </select>
          </div>

          <div>
            <select className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3 py-2 text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]">
              <option value="24h">Semua waktu (24 Jam)</option>
              <option value="1h">1 jam terakhir</option>
              <option value="6h">6 jam terakhir</option>
            </select>
          </div>
        </div>

        {/* Table Headers */}
        <div className="grid grid-cols-12 py-2.5 text-[10px] font-bold text-[#657d89] tracking-wider uppercase border-b border-[#1b262e]">
          <div className="col-span-2">WAKTU</div>
          <div className="col-span-6">EVENT</div>
          <div className="col-span-2">HOST</div>
          <div className="col-span-2 text-right pr-6">SEVERITY</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#1b262e]">
          {pageItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#657d89] italic">
              Tidak ada log yang cocok dengan filter.
            </div>
          ) : (
            pageItems.map((log, idx) => (
              <div
                key={log.id || idx}
                className="grid grid-cols-12 items-center py-3.5 text-xs hover:bg-[#152028]/40 transition group"
              >
                <div className="col-span-2 font-mono text-[#91a4ae] text-[11px]">
                  {formatTime(log.timestamp)}
                </div>

                <div className="col-span-6 flex items-center gap-2.5 pr-4">
                  <span className="w-5 h-5 rounded-[4px] bg-[#382b1d] border border-[#523d24] text-[#f0b849] flex items-center justify-center shrink-0 font-bold text-[10px]">
                    !
                  </span>
                  <span className="text-[#edf4f5] font-medium truncate">
                    {log.event || log.message}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="bg-[#172127] border border-[#243139] text-[#91a4ae] font-mono text-[11px] px-2.5 py-1 rounded-[5px]">
                    {log.host || '192.168.10.1'}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-3">
                  <span className="bg-[#382b1d] border border-[#523d24] text-[#f0b849] text-[11px] font-medium px-2.5 py-0.5 rounded-[5px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f0b849]" />
                    Warning
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#657d89] group-hover:text-[#edf4f5] transition" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-[#1b262e] mt-4 text-xs text-[#91a4ae]">
          <div>
            Menampilkan 1-{Math.min(itemsPerPage, filtered.length)} dari {filtered.length} logs
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-[6px] bg-[#152028] border border-[#243139] text-[#edf4f5] disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-[6px] bg-[#152028] border border-[#243139] text-[#edf4f5] disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
