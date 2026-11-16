import React, { useEffect, useRef } from 'react';
import {
  Search,
  Server,
  Router,
  Cpu,
  Monitor,
  Radio,
  Shield,
  Globe,
  FileText,
  Settings,
  Activity,
  ArrowRight,
  X,
  Layers,
  Terminal,
} from 'lucide-react';

export default function GlobalSearchPalette({
  isOpen,
  setIsOpen,
  searchQuery,
  setSearchQuery,
  nodes = [],
  logs = [],
  onNavigateTab,
  onSelectNode,
  onQuickDiagnostic,
}) {
  const containerRef = useRef(null);

  // Keyboard shortcut Ctrl+K / Cmd+K & Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Klik di luar menutup dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const q = (searchQuery || '').trim().toLowerCase();

  // 1. Filter Nodes
  const matchedNodes = nodes.filter((n) => {
    if (!q) return false;
    const labelMatch = (n.label || '').toLowerCase().includes(q);
    const ipMatch = (n.ip_address || '').toLowerCase().includes(q);
    const portMatch = String(n.port || '').includes(q);
    const typeMatch = (n.type || '').toLowerCase().includes(q);
    return labelMatch || ipMatch || portMatch || typeMatch;
  });

  // 2. Filter Logs
  const matchedLogs = logs.filter((l) => {
    if (!q) return false;
    const msgMatch = (l.message || '').toLowerCase().includes(q);
    const sevMatch = (l.severity || '').toLowerCase().includes(q);
    return msgMatch || sevMatch;
  }).slice(0, 5);

  // 3. Deteksi apakah query mirip IP atau Hostname untuk aksi cepat diagnostik
  const isLikelyHost = /^[a-zA-Z0-9.-]+$/.test(q) && q.length >= 2;

  // Navigasi cepat
  const navItems = [
    { id: 'overview', title: 'Overview', desc: 'Metrik sistem CPU, RAM, I/O & host', icon: Activity },
    { id: 'topology', title: 'Topology Map', desc: `Peta topologi ${nodes.length} perangkat jaringan`, icon: Layers },
    { id: 'tools', title: 'Network Tools', desc: 'Diagnostik DNS, Live Ping & Port Scanner', icon: Terminal },
    { id: 'logs', title: 'Connection Logs', desc: `Riwayat status alert & log event (${logs.length})`, icon: FileText },
    { id: 'settings', title: 'Settings', desc: 'Konfigurasi backend URL & parameter telemetri', icon: Settings },
  ];

  const matchedNav = q
    ? navItems.filter((item) =>
        item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
      )
    : navItems;

  const getNodeIcon = (type) => {
    switch (type) {
      case 'router':
        return <Router className="w-4 h-4 text-[#5ce4bd]" />;
      case 'server':
        return <Server className="w-4 h-4 text-[#60a5fa]" />;
      case 'client':
        return <Monitor className="w-4 h-4 text-[#f0b849]" />;
      default:
        return <Cpu className="w-4 h-4 text-[#91a4ae]" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-full right-0 mt-2 w-[480px] max-w-[90vw] bg-[#111921] border border-[#1f2c35] rounded-[12px] shadow-2xl z-50 overflow-hidden text-xs text-[#edf4f5] animate-in fade-in duration-150 backdrop-blur-md"
    >
      {/* Header Info Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e141a] border-b border-[#1b262e] text-[11px] text-[#91a4ae]">
        <div className="flex items-center gap-1.5 font-medium">
          <Search className="w-3.5 h-3.5 text-[#5ce4bd]" />
          <span>{q ? `Hasil pencarian untuk "${q}"` : 'Pencarian Cepat & Perintah (Command)'}</span>
        </div>
        <div className="flex items-center gap-2">
          {q && (
            <button
              onClick={() => setSearchQuery('')}
              className="hover:text-[#edf4f5] flex items-center gap-0.5 text-[10px] text-[#657d89]"
            >
              <X className="w-3 h-3" /> Bersihkan
            </button>
          )}
          <span className="text-[10px] bg-[#172127] border border-[#243139] px-1.5 py-0.5 rounded text-[#91a4ae]">
            ESC untuk tutup
          </span>
        </div>
      </div>

      <div className="max-h-[460px] overflow-y-auto divide-y divide-[#18232c] p-2 space-y-2">
        {/* BAGIAN 1: AKSI CEPAT DIAGNOSTIK JIKA MENGETIK IP / HOST */}
        {q && isLikelyHost && (
          <div className="pt-1">
            <div className="px-2 pb-1.5 text-[10px] font-bold text-[#5ce4bd] uppercase tracking-wider">
              Aksi Diagnostik Cepat untuk "{q}"
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onQuickDiagnostic?.('ping', q);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-[8px] bg-[#152028] hover:bg-[#1a2933] border border-transparent hover:border-[#214f3f] transition text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[6px] bg-[#163229] border border-[#214f3f] flex items-center justify-center text-[#5ce4bd]">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#edf4f5] group-hover:text-[#5ce4bd] flex items-center gap-1.5">
                      <span>Jalankan Live Ping ke</span>
                      <code className="text-[#5ce4bd] font-mono text-[11px] bg-[#0e161c] px-1 rounded">{q}</code>
                    </div>
                    <div className="text-[10px] text-[#91a4ae]">Uji latensi ICMP realtime terus-menerus</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#657d89] group-hover:text-[#5ce4bd] transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onQuickDiagnostic?.('ports', q);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-[8px] bg-[#152028] hover:bg-[#1a2933] border border-transparent hover:border-[#243139] transition text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[6px] bg-[#192433] border border-[#23354b] flex items-center justify-center text-[#60a5fa]">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#edf4f5] group-hover:text-[#60a5fa] flex items-center gap-1.5">
                      <span>Pindai Port Terbuka pada</span>
                      <code className="text-[#60a5fa] font-mono text-[11px] bg-[#0e161c] px-1 rounded">{q}</code>
                    </div>
                    <div className="text-[10px] text-[#91a4ae]">Scan port HTTP, SSH, MySQL, Winbox, dll.</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#657d89] group-hover:text-[#60a5fa] transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onQuickDiagnostic?.('dns', q);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-[8px] bg-[#152028] hover:bg-[#1a2933] border border-transparent hover:border-[#243139] transition text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[6px] bg-[#2a2416] border border-[#42371f] flex items-center justify-center text-[#f0b849]">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#edf4f5] group-hover:text-[#f0b849] flex items-center gap-1.5">
                      <span>Cek DNS Query untuk</span>
                      <code className="text-[#f0b849] font-mono text-[11px] bg-[#0e161c] px-1 rounded">{q}</code>
                    </div>
                    <div className="text-[10px] text-[#91a4ae]">Periksa record A, AAAA, MX, NS & TXT</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#657d89] group-hover:text-[#f0b849] transition-transform group-hover:translate-x-0.5" />
              </button>

              {!nodes.some((n) => n.ip_address === q) && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab?.('topology');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-[8px] bg-[#152028] hover:bg-[#1a2933] border border-transparent hover:border-[#214f3f] transition text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[6px] bg-[#163229] border border-[#214f3f] flex items-center justify-center text-[#5ce4bd]">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#edf4f5] group-hover:text-[#5ce4bd] flex items-center gap-1.5">
                        <span>Pantau Host Ini di Topologi</span>
                        <code className="text-[#5ce4bd] font-mono text-[11px] bg-[#0e161c] px-1 rounded">{q}</code>
                      </div>
                      <div className="text-[10px] text-[#91a4ae]">Buka Topologi Map untuk menambahkan perangkat ini</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#657d89] group-hover:text-[#5ce4bd] transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* BAGIAN 2: PERANGKAT / NODES YANG DITEMUKAN */}
        {q && matchedNodes.length > 0 && (
          <div className="pt-2">
            <div className="px-2 pb-1.5 text-[10px] font-bold text-[#91a4ae] uppercase tracking-wider flex items-center justify-between">
              <span>Perangkat Terdaftar ({matchedNodes.length})</span>
              <span className="text-[#657d89]">Klik untuk buka di Topology</span>
            </div>
            <div className="space-y-1">
              {matchedNodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    onSelectNode?.(node);
                    onNavigateTab?.('topology');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-[8px] bg-[#152028] hover:bg-[#1c2933] border border-[#243139] hover:border-[#2e3e48] transition text-left group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-[6px] bg-[#1a2530] border border-[#2e3e48] flex items-center justify-center shrink-0">
                      {getNodeIcon(node.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[#edf4f5] group-hover:text-[#5ce4bd] truncate flex items-center gap-1.5">
                        <span>{node.label}</span>
                        <span className="text-[9px] uppercase px-1 rounded bg-[#1e2a33] text-[#91a4ae] font-mono">
                          {node.type}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#91a4ae] font-mono flex items-center gap-2 mt-0.5">
                        <span>{node.ip_address}{node.port ? `:${node.port}` : ''}</span>
                        {node.latency_ms !== null && node.latency_ms !== undefined && (
                          <span className="text-[#5ce4bd]">· {node.latency_ms} ms</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                        node.status === 'UP'
                          ? 'bg-[#163229] text-[#5ce4bd] border border-[#214f3f]'
                          : node.status === 'DOWN'
                          ? 'bg-[#34231f] text-[#f29583] border border-[#4d2d25]'
                          : 'bg-[#222a30] text-[#91a4ae] border border-[#2e3e48]'
                      }`}
                    >
                      {node.status || 'UNKNOWN'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#657d89] group-hover:text-[#edf4f5]" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DEFAULT VIEW JIKA QUERY KOSONG: DAFTAR PERANGKAT AKTIF */}
        {!q && nodes.length > 0 && (
          <div className="pt-1">
            <div className="px-2 pb-1.5 text-[10px] font-bold text-[#91a4ae] uppercase tracking-wider flex items-center justify-between">
              <span>Perangkat Terhubung ({nodes.length})</span>
              <span className="text-[#657d89]">Topologi Aktif</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {nodes.slice(0, 4).map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    onSelectNode?.(node);
                    onNavigateTab?.('topology');
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between p-2 rounded-[8px] bg-[#152028] hover:bg-[#1a2530] border border-[#243139] text-left transition group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        node.status === 'UP' ? 'bg-[#5ce4bd]' : 'bg-[#f29583]'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-[#edf4f5] group-hover:text-[#5ce4bd] truncate text-[11px]">
                        {node.label}
                      </div>
                      <div className="text-[10px] text-[#91a4ae] font-mono truncate">
                        {node.ip_address}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BAGIAN 3: RIWAYAT LOG & ALERT COCOK */}
        {q && matchedLogs.length > 0 && (
          <div className="pt-2">
            <div className="px-2 pb-1.5 text-[10px] font-bold text-[#91a4ae] uppercase tracking-wider flex items-center justify-between">
              <span>Log Event Terkait ({matchedLogs.length})</span>
              <span className="text-[#657d89]">Klik untuk buka Logs</span>
            </div>
            <div className="space-y-1">
              {matchedLogs.map((log, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onNavigateTab?.('logs');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-[8px] bg-[#152028] hover:bg-[#1a2530] border border-[#243139] text-left transition group"
                >
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase mt-0.5 shrink-0 ${
                      log.severity === 'CRITICAL'
                        ? 'bg-[#34231f] text-[#f29583]'
                        : log.severity === 'WARNING'
                        ? 'bg-[#332a18] text-[#f0b849]'
                        : log.severity === 'RESOLVED'
                        ? 'bg-[#163229] text-[#5ce4bd]'
                        : 'bg-[#172127] text-[#91a4ae]'
                    }`}
                  >
                    {log.severity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-[#edf4f5] group-hover:text-[#5ce4bd] leading-tight truncate">
                      {log.message}
                    </div>
                    <div className="text-[9px] text-[#657d89] mt-0.5 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BAGIAN 4: NAVIGASI CEPAT HALAMAN */}
        <div className="pt-2">
          <div className="px-2 pb-1.5 text-[10px] font-bold text-[#91a4ae] uppercase tracking-wider">
            Navigasi Halaman
          </div>
          <div className="grid grid-cols-1 gap-1">
            {matchedNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigateTab?.(item.id);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between p-2 rounded-[8px] hover:bg-[#152028] border border-transparent hover:border-[#243139] text-left transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-[5px] bg-[#172127] flex items-center justify-center text-[#91a4ae] group-hover:text-[#5ce4bd]">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#edf4f5] group-hover:text-[#5ce4bd]">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#91a4ae]">{item.desc}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#657d89] group-hover:text-[#edf4f5] transition-transform group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* JIKA TIDAK ADA HASIL SAMA SEKALI */}
        {q && matchedNodes.length === 0 && matchedLogs.length === 0 && matchedNav.length === 0 && !isLikelyHost && (
          <div className="py-6 text-center text-[#91a4ae]">
            <Search className="w-8 h-8 text-[#2e3e48] mx-auto mb-2" />
            <div className="font-medium text-[#edf4f5]">Tidak ada hasil untuk "{q}"</div>
            <div className="text-[11px] text-[#657d89] mt-1 max-w-[280px] mx-auto">
              Coba cari berdasarkan IP seperti <code className="text-[#5ce4bd]">127.0.0.1</code> atau nama perangkat seperti <code className="text-[#5ce4bd]">Server</code>.
            </div>
          </div>
        )}
      </div>

      {/* Footer Shortcut Info */}
      <div className="px-4 py-2 bg-[#0e141a] border-t border-[#1b262e] flex items-center justify-between text-[10px] text-[#657d89]">
        <span>Tip: Ketik IP apa saja untuk langsung menjalankan tes Ping atau Port Scan</span>
        <span className="font-mono text-[#91a4ae]">PingKu NOC</span>
      </div>
    </div>
  );
}
