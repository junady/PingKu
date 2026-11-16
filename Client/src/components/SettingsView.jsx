import React, { useState, useEffect } from 'react';
import { RotateCw, CheckCircle, ExternalLink, ShieldCheck, Activity, Wifi, Terminal, AlertTriangle, Play, RefreshCw, Check, Sparkles } from 'lucide-react';
import { getAppSettings, saveAppSettings, resetAppSettings } from '../utils/settings';

export default function SettingsView({ isConnected, system, nodes = [] }) {
  const currentSettings = getAppSettings();

  const [backendUrl, setBackendUrl] = useState(currentSettings.backendUrl || 'http://localhost:8080');
  const [wsUrl, setWsUrl] = useState(currentSettings.wsUrl || 'ws://localhost:8080/ws');
  const [dnsResolver, setDnsResolver] = useState(currentSettings.dnsResolver || '1.1.1.1');
  const [port, setPort] = useState(currentSettings.port || 53);
  const [intervalSec, setIntervalSec] = useState(currentSettings.intervalSec || 2);
  const [probeMethod, setProbeMethod] = useState(currentSettings.probeMethod || 'ICMP / TCP');

  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // State Uji Koneksi Langsung (Test Ping ke Backend)
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // State Auto-Discovery
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryData, setDiscoveryData] = useState(null);

  const handleRunDiscovery = async () => {
    setIsDiscovering(true);
    setDiscoveryData(null);
    try {
      const res = await fetch(`${backendUrl.trim().replace(/\/$/, '')}/api/discovery/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false }),
      });
      if (res.ok) {
        const data = await res.json();
        setDiscoveryData(data);
      } else {
        setDiscoveryData({ error: 'Gagal menjalankan discovery di backend.' });
      }
    } catch (err) {
      setDiscoveryData({ error: err.message });
    } finally {
      setIsDiscovering(false);
    }
  };

  // Otomatis sinkronkan wsUrl jika backendUrl berubah
  const handleBackendUrlChange = (val) => {
    setBackendUrl(val);
    try {
      const url = new URL(val);
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      setWsUrl(`${wsProtocol}//${url.host}/ws`);
    } catch {}
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const targetApi = `${backendUrl.trim().replace(/\/$/, '')}/api/nodes`;
      const res = await fetch(targetApi, { signal: AbortSignal.timeout(3500) });
      const latency = Math.round(performance.now() - start);

      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          latency,
          nodesCount: Array.isArray(data) ? data.length : 0,
          message: `Berhasil terhubung! (${latency} ms · ${Array.isArray(data) ? data.length : 0} node terdaftar)`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Server merespons dengan HTTP ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Koneksi gagal: ${err.message || 'Server offline atau URL salah'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newSettings = {
      backendUrl: backendUrl.trim(),
      wsUrl: wsUrl.trim(),
      dnsResolver: dnsResolver.trim(),
      port: Number(port) || 53,
      intervalSec: Number(intervalSec) || 2,
      probeMethod,
    };

    const ok = saveAppSettings(newSettings);
    if (ok) {
      setIsSaved(true);
      setSaveMessage('Pengaturan berhasil disimpan dan koneksi backend diperbarui!');
      setTimeout(() => {
        setIsSaved(false);
      }, 3500);
    }
  };

  const handleReset = () => {
    const def = resetAppSettings();
    setBackendUrl(def.backendUrl);
    setWsUrl(def.wsUrl);
    setDnsResolver(def.dnsResolver);
    setPort(def.port);
    setIntervalSec(def.intervalSec);
    setProbeMethod(def.probeMethod);
    setTestResult(null);

    setIsSaved(true);
    setSaveMessage('Pengaturan telah dikembalikan ke default bawaan sistem.');
    setTimeout(() => {
      setIsSaved(false);
    }, 3500);
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
              Konfigurasi integrasi backend dan parameter probe ICMP / TCP. Pengaturan disimpan langsung di browser dan diterapkan secara instan.
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
                {/* Backend URL Input + Test Connection Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#91a4ae] font-medium">
                      Backend server URL
                    </label>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="text-[11px] text-[#5ce4bd] hover:text-[#4cd4ad] font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Menguji koneksi...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          <span>Uji koneksi backend</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={backendUrl}
                      onChange={(e) => handleBackendUrlChange(e.target.value)}
                      placeholder="http://localhost:8080"
                      className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3.5 py-2 text-[#edf4f5] font-mono focus:outline-none focus:border-[#5ce4bd]"
                    />
                  </div>

                  {/* Feedback Hasil Test Koneksi Langsung */}
                  {testResult && (
                    <div
                      className={`mt-2 p-2.5 rounded-[8px] border text-[11px] flex items-center justify-between animate-in fade-in duration-150 ${
                        testResult.success
                          ? 'bg-[#163229] border-[#214f3f] text-[#5ce4bd]'
                          : 'bg-[#34231f] border-[#4d2d25] text-[#f29583]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {testResult.success ? (
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{testResult.message}</span>
                      </div>
                      {testResult.success && (
                        <span className="font-mono text-[10px] bg-[#111921] px-1.5 py-0.5 rounded">
                          HTTP OK
                        </span>
                      )}
                    </div>
                  )}

                  <span className="text-[11px] text-[#657d89] mt-1 block">
                    Endpoint API utama untuk data monitoring server. Bisa mengarah ke localhost atau IP server remote (misal: <code>http://192.168.1.100:8080</code>).
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
                    placeholder="ws://localhost:8080/ws"
                    className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3.5 py-2 text-[#edf4f5] font-mono focus:outline-none focus:border-[#5ce4bd]"
                  />
                  <span className="text-[11px] text-[#657d89] mt-1 block">
                    Koneksi streaming untuk pembaruan metrik real-time interval 2 detik.
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
                      placeholder="1.1.1.1 atau 8.8.8.8"
                      className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3.5 py-2 text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd] font-mono"
                    />
                    <span className="text-[11px] text-[#657d89] mt-1 block">
                      DNS upstream publik (1.1.1.1, 8.8.8.8) atau resolver lokal BIND9 (port 53).
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
                        min="1"
                        max="60"
                        value={intervalSec}
                        onChange={(e) => setIntervalSec(Number(e.target.value))}
                        className="w-full bg-[#152028] border border-[#243139] rounded-[8px] px-3.5 py-2 text-[#edf4f5] font-mono focus:outline-none focus:border-[#5ce4bd]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#657d89]">
                        detik
                      </span>
                    </div>
                    <span className="text-[11px] text-[#657d89] mt-1 block">
                      Interval broadcast telemetri WebSocket (standar: 2 detik).
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
                      <option value="ICMP / TCP">ICMP / TCP (Hybrid)</option>
                      <option value="ICMP Only">ICMP Only (Ping)</option>
                      <option value="TCP Only">TCP Only (Socket)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 03: Zero-Config Auto-Discovery */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-[#5ce4bd] font-mono">03</span>
                <span className="text-[13px] font-semibold text-[#edf4f5]">
                  Zero-Config Auto-Discovery
                </span>
              </div>

              <div className="space-y-3 pl-4 border-l border-[#1f2c35]">
                <p className="text-[#91a4ae] text-[11px] leading-relaxed">
                  Pindai otomatis router gateway dan port service lokal yang sedang aktif di mesin ini (Nginx, Apache, MySQL, Postgres, Redis, SSH, Winbox) lalu petakan langsung ke diagram topologi.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRunDiscovery}
                    disabled={isDiscovering}
                    className="bg-[#17382f] border border-[#214f3f] text-[#5ce4bd] hover:bg-[#1f4a3e] px-4 py-2 rounded-[8px] font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isDiscovering ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Memindai server & service...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Jalankan Auto-Discovery Sekarang</span>
                      </>
                    )}
                  </button>
                </div>

                {discoveryData && (
                  <div
                    className={`p-3 rounded-[8px] border text-[11px] animate-in fade-in duration-150 ${
                      discoveryData.error
                        ? 'bg-[#34231f] border-[#4d2d25] text-[#f29583]'
                        : 'bg-[#163229] border-[#214f3f] text-[#5ce4bd]'
                    }`}
                  >
                    {discoveryData.error ? (
                      <div>Gagal: {discoveryData.error}</div>
                    ) : (
                      <div className="space-y-1">
                        <div className="font-semibold text-[#edf4f5]">
                          ✅ Discovery Berhasil Selesai!
                        </div>
                        <div className="text-[10px] text-[#91a4ae]">
                          Host: <span className="text-[#edf4f5] font-mono">{discoveryData.discovery?.primary_ip} ({discoveryData.discovery?.host?.hostname})</span> · Gateway: <span className="text-[#5ce4bd] font-mono">{discoveryData.discovery?.gateway_ip || 'N/A'}</span>
                        </div>
                        <div className="text-[10px] text-[#91a4ae]">
                          {discoveryData.newly_added?.length > 0 ? (
                            <span>{discoveryData.newly_added.length} perangkat/service baru dipetakan ke topologi.</span>
                          ) : (
                            <span>Semua service lokal dan gateway sudah terpetakan di topologi.</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-[#1b262e] gap-3">
              <span className="text-[11px] text-[#657d89]">
                {isSaved ? (
                  <span className="text-[#5ce4bd] font-medium flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    {saveMessage || 'Perubahan berhasil disimpan!'}
                  </span>
                ) : (
                  'Perubahan disimpan ke browser dan langsung diterapkan ke koneksi aktif.'
                )}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-[#172127] hover:bg-[#1f2c35] text-[#edf4f5] font-medium rounded-[8px] transition"
                >
                  Reset default
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
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#5ce4bd] animate-pulse' : 'bg-[#f29583]'}`} />
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#1b262e]">
                <span className="text-[#91a4ae]">WebSocket stream</span>
                <span className="text-[#5ce4bd] font-medium flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#5ce4bd]' : 'bg-[#f29583]'}`} />
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#1b262e]">
                <span className="text-[#91a4ae]">Sistem operasi</span>
                <span className="text-[#edf4f5] font-mono text-[11px]">
                  {system?.os_distro || 'Host Server'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#1b262e]">
                <span className="text-[#91a4ae]">Hostname</span>
                <span className="text-[#edf4f5] font-mono text-[11px] truncate max-w-[150px]" title={system?.os_hostname}>
                  {system?.os_hostname || 'localhost'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#1b262e]">
                <span className="text-[#91a4ae]">Arsitektur / Core</span>
                <span className="text-[#edf4f5] font-mono text-[11px]">
                  {system?.os_arch ? `${system.os_arch} · ${system.cpu_cores || 1} Cores` : 'x64'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#91a4ae]">Node terdaftar</span>
                <span className="text-[#5ce4bd] font-mono text-[11px] font-semibold">
                  {nodes.length} perangkat aktif
                </span>
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
                  <div className="text-[10px] text-[#91a4ae]">Probe ICMP & TCP ({probeMethod})</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-[5px] bg-[#17382f] text-[#5ce4bd] text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                  02
                </span>
                <div>
                  <div className="text-[12px] font-semibold text-[#edf4f5]">Node.js backend</div>
                  <div className="text-[10px] text-[#91a4ae] font-mono truncate max-w-[200px]" title={backendUrl}>
                    {backendUrl.replace(/^https?:\/\//, '')}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-[5px] bg-[#17382f] text-[#5ce4bd] text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                  03
                </span>
                <div>
                  <div className="text-[12px] font-semibold text-[#edf4f5]">PingKu dashboard</div>
                  <div className="text-[10px] text-[#91a4ae]">WebSocket · setiap {intervalSec} detik</div>
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
              Gunakan tombol "Uji koneksi backend" untuk memverifikasi apakah endpoint API dapat diakses sebelum menyimpan perubahan.
            </p>
            <button
              type="button"
              onClick={handleTestConnection}
              className="text-[11px] font-medium text-[#5ce4bd] hover:underline flex items-center gap-1"
            >
              <span>Tes latensi server sekarang</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
