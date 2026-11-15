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
    <div className="h-screen w-screen flex bg-[#090d16] text-slate-100 font-sans overflow-hidden">
      {/* ==========================================
          SIDEBAR KIRI (PingKu NOC)
      ========================================== */}
      <aside className="w-64 bg-[#0e1320] border-r border-slate-800/90 flex flex-col justify-between shrink-0 select-none shadow-xl z-20">
        <div>
          {/* Logo Brand Header */}
          <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-800/80 bg-[#0e1320]/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                PingKu
              </span>
              <span className="text-[10px] font-medium text-slate-400 block -mt-0.5">
                NOC & Telemetry
              </span>
            </div>
          </div>

          {/* Navigasi Utama */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-800/90 to-slate-800/60 text-white border border-slate-700/80 shadow-md shadow-black/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Status Koneksi Host di Bagian Bawah Sidebar */}
        <div className="p-4 border-t border-slate-800/80">
          <div
            className={`px-4 py-3 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-inner ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="truncate">
                {isConnected ? 'Debian 12: Connected' : 'Server: Offline (8080)'}
              </span>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${
                isConnected
                  ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  : 'bg-rose-500'
              }`}
            />
          </div>
        </div>
      </aside>

      {/* ==========================================
          AREA KANAN: HEADER + KONTEN UTAMA
      ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Atas */}
        <header className="h-20 px-8 bg-[#0e1320]/80 backdrop-blur-md border-b border-slate-800/90 flex items-center justify-between shrink-0 z-10">
          <div>
            {activeTab === 'tools' ? (
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
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
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  {currentMenu.title}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">{currentMenu.subtitle}</p>
              </div>
            )}
          </div>

          {/* Action Header Kanan */}
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search metrics, hosts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-9 pr-3.5 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            {/* Live Telemetry Indicator Badge (Demo Toggle Dihapus) */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>Live Telemetry</span>
            </div>

            {/* User & Notifications */}
            <div className="flex items-center gap-2 text-slate-400 pl-2 border-l border-slate-800">
              <button className="p-2 rounded-xl hover:bg-slate-800/80 hover:text-slate-200 transition">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl hover:bg-slate-800/80 hover:text-slate-200 transition relative">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
              </button>
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-500/20 ml-1 select-none">
                JR
              </div>
            </div>
          </div>
        </header>

        {/* Konten Tab Aktif */}
        <main
          className={`flex-1 overflow-y-auto ${
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
