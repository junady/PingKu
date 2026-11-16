import React, { useState } from 'react';
import { RotateCw, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export default function SettingsView({ isConnected }) {
  const [backendUrl, setBackendUrl] = useState('http://localhost:8080');
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080/ws');
  const [dnsResolver, setDnsResolver] = useState('Public DNS over HTTPS & BIND9');
  const [port, setPort] = useState(53);
  const [intervalSec, setIntervalSec] = useState(2);
  const [probeMethod, setProbeMethod] = useState('ICMP / TCP');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setBackendUrl('http://localhost:8080');
    setWsUrl('ws://localhost:8080/ws');
    setDnsResolver('Public DNS over HTTPS & BIND9');
    setPort(53);
    setIntervalSec(2);
    setProbeMethod('ICMP / TCP');
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#5ce4bd] uppercase tracking-wider block">
            MONITORING / 05
          </span>
          <h1 className="text-[28px] font-bold text-[#edf4f5] tracking-tight mt-0.5">
            Settings
          </h1>
          <p className="text-[13px] text-[#91a4ae] mt-0.5">
            Atur koneksi backend dan preferensi telemetri.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="bg-[#152028] border border-[#243139] hover:bg-[#1a2530] text-[#edf4f5] text-xs px-3.5 py-2 rounded-[8px] flex items-center gap-1.5 shadow-sm transition"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#91a4ae]" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Panel: Form Settings (Span 2) */}
        <div className="lg:col-span-2 bg-[#111921] border border-[#1f2c35] rounded-[12px] p-6 shadow-sm">
          <div className="pb-4 border-b border-[#1b262e] mb-6">
            <h2 className="text-[16px] font-semibold text-[#edf4f5]">
              System & telemetry
            </h2>
            <p className="text-[12px] text-[#91a4ae] mt-0.5">
              Konfigurasi integrasi backend dan parameter probe ICMP / TCP.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6 text-xs">
            {/* Section 01: Koneksi Backend */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-[#5ce4bd] font-mono">01</span>
                <span className="text-[13px] font-semibold text-[#edf4f5]">
                  Koneksi backend
                </span>
              </div>

              <div className="space-y-4 pl-4 border-l border-[#1f2c35]">
                <div>
                  <label className="block text-[#91a4ae] font-medium mb-1">
                    Backend server URL
                  </label>
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3.5 py-2 text-[#edf4f5] font-mono focus:outline-none focus:border-[#5ce4bd]"
                  />
                  <span className="text-[11px] text-[#657d89] mt-1 block">
                    Endpoint API utama untuk data monitoring server.
                  </span>
                </div>

                <div>
                  <label className="block text-[#91a4ae] font-medium mb-1">
                    WebSocket stream
                  </label>
                  <input
                    type="text"
                    value={wsUrl}
                    onChange={(e) => setWsUrl(e.target.value)}
                    className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3.5 py-2 text-[#edf4f5] font-mono focus:outline-none focus:border-[#5ce4bd]"
                  />
                  <span className="text-[11px] text-[#657d89] mt-1 block">
                    Koneksi streaming untuk pembaruan metrik secara langsung.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 02: DNS & Probe */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-[#5ce4bd] font-mono">02</span>
                <span className="text-[13px] font-semibold text-[#edf4f5]">
                  DNS & probe
                </span>
              </div>

              <div className="space-y-4 pl-4 border-l border-[#1f2c35]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[#91a4ae] font-medium mb-1">
                      Default DNS resolver
                    </label>
                    <input
                      type="text"
                      value={dnsResolver}
                      onChange={(e) => setDnsResolver(e.target.value)}
                      className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3.5 py-2 text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
                    />
                    <span className="text-[11px] text-[#657d89] mt-1 block">
                      BIND9 tersedia di 192.168.10.1.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[#91a4ae] font-medium mb-1">
                      Port
                    </label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(Number(e.target.value))}
                      className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3.5 py-2 text-[#edf4f5] font-mono focus:outline-none focus:border-[#5ce4bd]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#91a4ae] font-medium mb-1">
                      Interval pembaruan
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={intervalSec}
                        onChange={(e) => setIntervalSec(Number(e.target.value))}
                        className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3.5 py-2 text-[#edf4f5] font-mono focus:outline-none focus:border-[#5ce4bd]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#657d89]">
                        detik
                      </span>
                    </div>
                    <span className="text-[11px] text-[#657d89] mt-1 block">
                      Interval yang lebih singkat meningkatkan frekuensi pengambilan data.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[#91a4ae] font-medium mb-1">
                      Metode probe
                    </label>
                    <select
                      value={probeMethod}
                      onChange={(e) => setProbeMethod(e.target.value)}
                      className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3.5 py-2 text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
                    >
                      <option value="ICMP / TCP">ICMP / TCP</option>
                      <option value="ICMP Only">ICMP Only</option>
                      <option value="TCP Only">TCP Only</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-5 border-t border-[#1b262e]">
              <span className="text-[11px] text-[#657d89]">
                {isSaved ? 'Perubahan berhasil disimpan!' : 'Perubahan diterapkan setelah disimpan.'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-[#172127] hover:bg-[#1f2c35] text-[#edf4f5] font-medium rounded-[8px] transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5ce4bd] hover:bg-[#4cd4ad] text-[#0b1015] font-semibold rounded-[8px] shadow-sm transition active:scale-[0.98]"
                >
                  Simpan perubahan
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Panel: Cards (Span 1) */}
        <div className="space-y-5">
          {/* Card 1: Connection Health */}
          <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold text-[#edf4f5]">
              Connection health
            </h3>
            <p className="text-[11px] text-[#91a4ae] mt-0.5 mb-4">
              Status integrasi saat ini
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-[#1b262e]">
                <span className="text-[#91a4ae]">Backend server</span>
                <span className="text-[#5ce4bd] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd]" />
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#1b262e]">
                <span className="text-[#91a4ae]">WebSocket stream</span>
                <span className="text-[#5ce4bd] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd]" />
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#91a4ae]">Sistem operasi</span>
                <span className="text-[#edf4f5] font-mono text-[11px]">Debian 12</span>
              </div>
            </div>
          </div>

          {/* Card 2: Telemetry Pipeline */}
          <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold text-[#edf4f5]">
              Telemetry pipeline
            </h3>
            <p className="text-[11px] text-[#91a4ae] mt-0.5 mb-4">
              Dari perangkat ke dashboard.
            </p>

            <div className="space-y-3 relative pl-2">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-[5px] bg-[#17382f] text-[#5ce4bd] text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                  01
                </span>
                <div>
                  <div className="text-[12px] font-semibold text-[#edf4f5]">Network devices</div>
                  <div className="text-[10px] text-[#91a4ae]">Probe ICMP & TCP</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-[5px] bg-[#17382f] text-[#5ce4bd] text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                  02
                </span>
                <div>
                  <div className="text-[12px] font-semibold text-[#edf4f5]">Node.js backend</div>
                  <div className="text-[10px] text-[#91a4ae]">localhost:8080</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-[5px] bg-[#17382f] text-[#5ce4bd] text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                  03
                </span>
                <div>
                  <div className="text-[12px] font-semibold text-[#edf4f5]">PingKu dashboard</div>
                  <div className="text-[10px] text-[#91a4ae]">WebSocket · setiap 2 detik</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Callout Advice */}
          <div className="bg-[#122822] border border-[#1b4339] rounded-[12px] p-5">
            <h4 className="text-[13px] font-semibold text-[#5ce4bd] mb-1.5">
              Monitoring yang tetap terhubung.
            </h4>
            <p className="text-[11px] text-[#91a4ae] leading-relaxed mb-3">
              Pastikan backend Node.js aktif dan URL WebSocket dapat dijangkau sebelum mengubah konfigurasi koneksi.
            </p>
            <a
              href="#docs"
              className="text-[11px] font-medium text-[#5ce4bd] hover:underline flex items-center gap-1"
            >
              <span>Lihat panduan konfigurasi</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
