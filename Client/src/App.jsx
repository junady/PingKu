import React, { useState } from 'react';
import {
  Activity,
  LayoutDashboard,
  Share2,
  Wrench,
  FileText,
  Settings as SettingsIcon,
  Search,
  MessageSquare,
  Bell,
} from 'lucide-react';
import pingkuLogo from './assets/pingku-logo.png';
import { useTelemetry } from './hooks/useTelemetry';
import TopMetricCards from './components/TopMetricCards';
import ServiceHostStatus from './components/ServiceHostStatus';
import AlertLogPanel from './components/AlertLogPanel';
import TopologyMap from './components/TopologyMap';
import NetworkToolsHub from './components/NetworkToolsHub';

export default function App() {
  const {
    system,
    history,
    nodes,
    logs,
    isConnected,
    addNode,
    updateNode,
    updateNodePosition,
    deleteNode,
    pingNode,
  } = useTelemetry();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    {
      id: 'overview',
      label: '1. Overview',
      title: 'Overview',
      subtitle: 'Real-time system, server, and network diagnostics.',
      icon: LayoutDashboard,
    },
    {
      id: 'topology',
      label: '2. Topology Map',
      title: 'Interactive Topology Map',
      subtitle: 'Geser posisi perangkat dan klik pada node untuk melihat detail IP, port, dan pengujian koneksi',
      icon: Share2,
    },
    {
      id: 'tools',
      label: '3. Network Tools',
      title: 'Network Tools',
      subtitle: 'Alat diagnostik live ICMP ping, TCP port scanner, DNS checker, dan kalkulator VLSM subnetting.',
      icon: Wrench,
    },
    {
      id: 'logs',
      label: '4. Connection Logs',
      title: 'Connection Logs',
      subtitle: 'Riwayat kejadian perubahan status node dan peringatan ambang batas server.',
      icon: FileText,
    },
    {
      id: 'settings',
      label: '5. Settings',
      title: 'Settings',
      subtitle: 'Konfigurasi parameter telemetri, backend port, dan opsi server Debian.',
      icon: SettingsIcon,
    },
  ];

  const currentMenu = menuItems.find((item) => item.id === activeTab) || menuItems[0];

  return (
    <div className="np-app">
      {/* ==========================================
          SIDEBAR KIRI (PingKu NOC)
      ========================================== */}
      <aside className="np-sidebar">
        <div>
          {/* Logo Brand Header */}
          <div className="px-2 pt-2 pb-4 mb-2 border-b border-slate-800/80 flex items-center justify-start min-h-[56px]">
            <img
              src={pingkuLogo}
              alt="PingKu — Server & framework monitoring"
              className="w-full max-w-[195px] h-auto max-h-12 object-contain select-none block drop-shadow-[0_2px_12px_rgba(20,184,166,0.25)]"
            />
          </div>

          {/* Navigasi Utama */}
          <nav className="np-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`np-nav-item ${isActive ? 'is-active' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Status Koneksi Host di Bagian Bawah Sidebar */}
        <div className="np-sidebar-footer">
          <div className={`np-connection-pill ${!isConnected ? 'np-connection-pill--offline' : ''}`}>
            <span className="truncate">
              {isConnected ? 'Debian 12: Connected' : 'Server: Offline (8080)'}
            </span>
            <span className={`np-dot ${isConnected ? 'np-dot--up' : 'np-dot--down'}`} />
          </div>
        </div>
      </aside>

      {/* ==========================================
          AREA KANAN: HEADER + KONTEN UTAMA
      ========================================== */}
      <div className="np-main">
        {/* Header Atas */}
        <header className="np-topbar">
          <div>
            {activeTab === 'tools' ? (
              <div>
                <h1 className="np-topbar-title text-white">
                  Network Tools
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <span className="text-blue-400 font-medium">Home</span>
                  <span>/</span>
                  <span>Network Tools</span>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="np-topbar-title text-white">
                  {currentMenu.title}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">{currentMenu.subtitle}</p>
              </div>
            )}
          </div>

          {/* Action Header Kanan */}
          <div className="np-topbar-actions">
            {/* Search Input */}
            <div className="np-search-box hidden md:block">
              <Search className="w-4 h-4 np-search-icon" />
              <input
                type="text"
                placeholder="Search metrics, hosts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="np-input text-xs"
              />
            </div>

            {/* Live Telemetry Indicator Badge */}
            <div className="np-pill np-pill--up text-xs font-semibold">
              <span className="np-dot np-dot--up" />
              <span>Live Telemetry</span>
            </div>

            {/* User & Notifications */}
            <div className="flex items-center gap-1.5 text-slate-400 pl-2 border-l border-slate-800">
              <button className="np-icon-btn" title="Pesan">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button className="np-icon-btn" title="Notifikasi">
                <Bell className="w-4 h-4" />
                <span className="np-badge-dot" />
              </button>
              {/* User Avatar */}
              <div className="np-avatar ml-1">
                JR
              </div>
            </div>
          </div>
        </header>

        {/* Konten Tab Aktif */}
        <main
          className={`np-content ${
            activeTab === 'topology' ? 'p-6 flex flex-col' : 'p-8'
          }`}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto w-full">
              <TopMetricCards system={system} history={history} />
              <ServiceHostStatus nodes={nodes} />
              <AlertLogPanel logs={logs} />
            </div>
          )}

          {/* TAB 2: TOPOLOGY MAP */}
          {activeTab === 'topology' && (
            <div className="flex-1 w-full min-h-[620px] flex">
              <TopologyMap
                nodes={nodes}
                onAddNode={addNode}
                onUpdateNode={updateNode}
                onUpdateNodePosition={updateNodePosition}
                onDeleteNode={deleteNode}
                onPingNode={pingNode}
              />
            </div>
          )}

          {/* TAB 3: NETWORK TOOLS SUITE (100% REAL-TIME) */}
          {activeTab === 'tools' && <NetworkToolsHub />}

          {/* TAB 4: CONNECTION LOGS */}
          {activeTab === 'logs' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <AlertLogPanel logs={logs} />
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto bg-gradient-to-b from-[#131927] to-[#0e1320] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold text-white mb-2">
                Pengaturan Sistem & Telemetri
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Konfigurasi integrasi backend Node.js dan parameter probe ICMP/TCP.
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-3 border-b border-slate-800/80">
                  <div>
                    <span className="font-semibold text-slate-200 block">Backend Server</span>
                    <span className="text-slate-400 font-mono text-[11px]">http://localhost:8080</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg border font-semibold shadow-sm ${
                      isConnected
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60'
                        : 'bg-rose-950/40 text-rose-400 border-rose-900/60'
                    }`}
                  >
                    {isConnected ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-slate-800/80">
                  <div>
                    <span className="font-semibold text-slate-200 block">WebSocket Stream</span>
                    <span className="text-slate-400 font-mono text-[11px]">ws://localhost:8080/ws</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 font-semibold shadow-sm">
                    INTERVAL 2s
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-slate-800/80">
                  <div>
                    <span className="font-semibold text-slate-200 block">DNS Resolver Default</span>
                    <span className="text-slate-400 text-[11px]">Public DNS over HTTPS & BIND9 (192.168.10.1)</span>
                  </div>
                  <span className="text-slate-300 font-mono">PORT 53</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
