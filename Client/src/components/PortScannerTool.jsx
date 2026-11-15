import React, { useState } from 'react';
import { Shield, Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const PRESETS = [
  {
    name: 'NOC & Core',
    ports: [21, 22, 23, 53, 80, 443, 8080, 8291],
  },
  {
    name: 'Web & Database',
    ports: [80, 443, 3306, 5432, 6379, 8080, 9000],
  },
  {
    name: 'Remote Access',
    ports: [22, 23, 3389, 5900, 8291],
  },
];

const COMMON_SERVICES = {
  21: 'FTP (File Transfer)',
  22: 'SSH (Remote Shell)',
  23: 'Telnet',
  25: 'SMTP (Mail)',
  53: 'DNS (BIND9 / Resolver)',
  80: 'HTTP (Web Server)',
  110: 'POP3',
  143: 'IMAP',
  443: 'HTTPS (SSL/TLS)',
  3306: 'MySQL Database',
  3389: 'RDP (Windows Remote)',
  5432: 'PostgreSQL Database',
  5900: 'VNC Desktop',
  6379: 'Redis Cache',
  8080: 'HTTP Web App',
  8291: 'MikroTik Winbox',
  9000: 'Portainer / Container',
};

export default function PortScannerTool() {
  const [host, setHost] = useState('127.0.0.1');
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customPortsInput, setCustomPortsInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);

  const getPortsToScan = () => {
    if (customPortsInput.trim()) {
      return customPortsInput
        .split(',')
        .map((p) => parseInt(p.trim(), 10))
        .filter((p) => !isNaN(p) && p > 0 && p <= 65535);
    }
    return PRESETS[selectedPreset].ports;
  };

  const handleStartScan = async (e) => {
    e.preventDefault();
    const ports = getPortsToScan();
    if (!host.trim() || ports.length === 0) return;

    setIsScanning(true);
    setScanProgress(10);
    setResults([]);
    setHasScanned(true);

    try {
      setScanProgress(30);
      const res = await fetch('http://localhost:8080/api/port-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: host.trim(), ports }),
      });

      setScanProgress(80);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        setResults(
          ports.map((p) => ({
            port: p,
            service: COMMON_SERVICES[p] || `Port ${p}`,
            status: 'CLOSED',
            latency_ms: null,
          }))
        );
      }
    } catch {
      setResults(
        ports.map((p) => ({
          port: p,
          service: COMMON_SERVICES[p] || `Port ${p}`,
          status: 'CLOSED',
          latency_ms: null,
        }))
      );
    } finally {
      setScanProgress(100);
      setIsScanning(false);
    }
  };

  const openCount = results.filter((r) => r.status === 'OPEN').length;
  const closedCount = results.length - openCount;

  return (
    <div className="relative group bg-gradient-to-b from-[#131927] to-[#0e1320] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              TCP Port Scanner & Service Prober
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            TCP Socket
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Pindai port terbuka pada host target (misal: SSH port 22, DNS port 53, HTTP port 80, Winbox port 8291).
        </p>

        {/* Form Controls */}
        <form onSubmit={handleStartScan} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Host / IP
              </label>
              <input
                type="text"
                value={host}
                disabled={isScanning}
                onChange={(e) => setHost(e.target.value)}
                placeholder="192.168.10.1 atau 127.0.0.1"
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono shadow-inner"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Custom Ports (Opsional)
              </label>
              <input
                type="text"
                value={customPortsInput}
                disabled={isScanning}
                onChange={(e) => setCustomPortsInput(e.target.value)}
                placeholder="Misal: 22, 53, 80, 8080"
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono shadow-inner"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={isScanning}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isScanning ? 'Scanning...' : 'Scan Ports'}</span>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Presets:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isScanning}
                onClick={() => {
                  setSelectedPreset(idx);
                  setCustomPortsInput('');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                  selectedPreset === idx && !customPortsInput
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </form>

        {/* Progress Bar Saat Scanning */}
        {isScanning && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Scanning ports on {host}...</span>
              <span className="font-mono">{scanProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Summary Badges */}
        {hasScanned && (
          <div className="flex items-center gap-4 mb-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              {openCount} Open Ports
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              {closedCount} Closed / Filtered
            </span>
          </div>
        )}

        {/* Results Table */}
        <div className="overflow-x-auto max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#0e1320] border-b border-slate-800">
              <tr className="text-slate-400 pb-2">
                <th className="pb-2 font-semibold uppercase text-[10px] w-20">Port</th>
                <th className="pb-2 font-semibold uppercase text-[10px]">Service</th>
                <th className="pb-2 font-semibold uppercase text-[10px] text-center w-28">Status</th>
                <th className="pb-2 font-semibold uppercase text-[10px] text-right w-24">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500 italic">
                    Belum ada port yang dipindai. Pilih host dan klik "Scan Ports".
                  </td>
                </tr>
              ) : (
                results.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/25 transition">
                    <td className="py-2.5 font-mono font-bold text-slate-200">
                      #{r.port}
                    </td>
                    <td className="py-2.5 font-medium text-slate-300">{r.service}</td>
                    <td className="py-2.5 text-center">
                      {r.status === 'OPEN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          OPEN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800/80 text-slate-400 border border-slate-700/60">
                          <XCircle className="w-3 h-3 text-slate-500" />
                          CLOSED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono font-medium">
                      {r.latency_ms !== null ? (
                        <span className="text-sky-400">{r.latency_ms} ms</span>
                      ) : (
                        <span className="text-slate-600">--</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
