/**
 * PingKu — Lightweight NOC & Server Telemetry Dashboard
 * Copyright (C) 2026 Arjuna Setya Ramadhani.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
 */

import React, { useState, useRef } from 'react';
import {
  LayoutDashboard,
  Share2,
  Wrench,
  FileText,
  Settings as SettingsIcon,
  Search,
  Bell,
  Layers,
  ChevronDown,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import pingkuLogo from './assets/pingku-logo.png';
import { useTelemetry } from './hooks/useTelemetry';
import TopMetricCards from './components/TopMetricCards';
import SystemPerformanceChart from './components/SystemPerformanceChart';
import RecentAlertsCard from './components/RecentAlertsCard';
import ServiceHostStatus from './components/ServiceHostStatus';
import TopologyMap from './components/TopologyMap';
import NetworkToolsHub from './components/NetworkToolsHub';
import ConnectionLogsView from './components/ConnectionLogsView';
import SettingsView from './components/SettingsView';
import GlobalSearchPalette from './components/GlobalSearchPalette';

export default function App() {
  const {
    system,
    history,
    nodes,
    logs,
    isConnected,
    refreshNodes,
    addNode,
    updateNode,
    updateNodePosition,
    deleteNode,
    pingNode,
  } = useTelemetry();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toolsInitialSubTab, setToolsInitialSubTab] = useState('suite');
  const [toolsInitialTarget, setToolsInitialTarget] = useState('');
  const searchInputRef = useRef(null);

  const menuItems = [
    {
      id: 'overview',
      label: '1. Overview',
      code: '01',
      title: 'Overview',
      subtitle: 'Diagnostik real-time sistem, server, dan jaringan.',
      icon: LayoutDashboard,
    },
    {
      id: 'topology',
      label: '2. Topology Map',
      code: '02',
      title: 'Topology Map',
      subtitle: 'Geser posisi node, pantau status link, dan inspeksi perangkat.',
      icon: Share2,
    },
    {
      id: 'tools',
      label: '3. Network Tools',
      code: '03',
      title: 'Network Tools',
      subtitle: 'Semua alat diagnostik jaringan, dalam satu tempat.',
      icon: Wrench,
    },
    {
      id: 'logs',
      label: '4. Connection Logs',
      code: '04',
      title: 'Connection Logs',
      subtitle: 'Setiap perubahan dan peringatan, tercatat jelas.',
      icon: FileText,
      badge: logs && logs.length > 0 ? logs.length : 50,
    },
    {
      id: 'settings',
      label: '5. Settings',
      code: '05',
      title: 'Settings',
      subtitle: 'Atur koneksi backend dan preferensi telemetri.',
      icon: SettingsIcon,
    },
  ];

  const currentMenu = menuItems.find((item) => item.id === activeTab) || menuItems[0];

  return (
    <div className="flex min-h-screen bg-[#0b1015] text-[#edf4f5] font-sans antialiased selection:bg-[#5ce4bd]/30 selection:text-[#edf4f5]">
      {/* =========================================================================
          SIDEBAR KIRI (Figma Design Token Match: #10171d, 228px)
          ========================================================================= */}
      <aside className="w-[228px] bg-[#10171d] border-r border-[#1f2c35] flex flex-col justify-between shrink-0 select-none z-20">
        <div className="p-4">
          {/* Brand Logo Header — Mempertahankan logo asli transparan pingku-logo.png */}
          <div className="pt-2 pb-5 mb-3 flex items-center justify-start border-b border-[#1b262e]">
            <img
              src={pingkuLogo}
              alt="PingKu — Server & framework monitoring"
              className="w-full max-w-[185px] h-auto object-contain select-none block"
            />
          </div>

          {/* Workspace Selector Card */}
          <div className="bg-[#152028] border border-[#243139] hover:border-[#2e3e48] rounded-[8px] p-2.5 mb-4 flex items-center justify-between cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-[5px] bg-[#1a2530] border border-[#2e3e48] flex items-center justify-center text-[#5ce4bd] shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-[#edf4f5] leading-tight truncate" title={system?.os_hostname || 'Local Host'}>
                  {system?.os_hostname || 'Local workspace'}
                </div>
                <div className="text-[10px] text-[#91a4ae] truncate">
                  {system?.os_distro ? `${system.os_distro} · Host` : 'Server Telemetry · Live'}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#657d89] shrink-0 ml-1" />
          </div>

          {/* Navigasi Utama (5 Tabs) */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#17382f] text-[#5ce4bd] font-semibold'
                      : 'text-[#91a4ae] hover:text-[#edf4f5] hover:bg-[#152028]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#5ce4bd]' : 'text-[#91a4ae]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] font-semibold ${
                        isActive
                          ? 'bg-[#214f3f] text-[#5ce4bd]'
                          : 'bg-[#172127] text-[#91a4ae] border border-[#243139]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Status Koneksi Host */}
        <div className="p-4 border-t border-[#1b262e] space-y-3">
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-[8px] border text-[11px] font-medium transition-colors ${
              isConnected
                ? 'bg-[#163229] border-[#214f3f] text-[#5ce4bd]'
                : 'bg-[#34231f] border-[#4d2d25] text-[#f29583]'
            }`}
          >
            <span className="truncate">
              {isConnected ? `${system?.os_distro || 'Server'}: Connected` : 'Server: Offline (8080)'}
            </span>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isConnected ? 'bg-[#5ce4bd] animate-pulse' : 'bg-[#f29583]'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#657d89] px-1">
            <span>PingKu NOC v1.2</span>
            <span className="hover:text-[#91a4ae] cursor-pointer">Docs & API</span>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          AREA KANAN: TOPBAR + MAIN VIEW CONTAINER
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b1015]">
        {/* Topbar Header Sesuai Desain Figma (Height 72px) */}
        <header className="h-[72px] bg-[#0b1015] border-b border-[#1f2c35] px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
          {/* Breadcrumb Kiri */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#91a4ae]">Workspace</span>
            <span className="text-[#657d89]">/</span>
            <span className="text-[#edf4f5] font-medium">{currentMenu.title}</span>
          </div>

          {/* Action Header Kanan */}
          <div className="flex items-center gap-3">
            {/* Search Input Box dengan Keyboard Shortcut Badge & Palette */}
            <div className="relative hidden md:flex items-center bg-[#152028] border border-[#243139] hover:border-[#2e3e48] rounded-[8px] px-3 py-1.5 w-64 text-xs text-[#edf4f5] transition-colors focus-within:border-[#5ce4bd]">
              <Search className="w-3.5 h-3.5 text-[#91a4ae] mr-2 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari host, IP, atau event..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onClick={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="bg-transparent border-none outline-none text-[#edf4f5] placeholder-[#657d89] w-full text-xs"
              />
              <kbd
                onClick={() => {
                  setIsSearchOpen((prev) => !prev);
                  if (!isSearchOpen) searchInputRef.current?.focus();
                }}
                className="text-[10px] font-mono bg-[#1a2530] text-[#91a4ae] hover:text-[#edf4f5] px-1.5 py-0.5 rounded border border-[#2e3e48] shrink-0 ml-1 cursor-pointer transition"
                title="Tekan Ctrl+K atau Cmd+K untuk mencari"
              >
                ⌘ K
              </kbd>

              {/* Floating Global Search Palette */}
              <GlobalSearchPalette
                isOpen={isSearchOpen}
                setIsOpen={setIsSearchOpen}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                nodes={nodes}
                logs={logs}
                onNavigateTab={(tabId) => {
                  setActiveTab(tabId);
                  setIsSearchOpen(false);
                }}
                onSelectNode={(node) => {
                  setActiveTab('topology');
                  setIsSearchOpen(false);
                }}
                onQuickDiagnostic={(toolType, target) => {
                  setToolsInitialSubTab(toolType === 'dns' ? 'suite' : toolType);
                  setToolsInitialTarget(target);
                  setActiveTab('tools');
                  setIsSearchOpen(false);
                }}
              />
            </div>

            {/* Live Telemetry Indicator Badge */}
            <div className="flex items-center gap-1.5 bg-[#163229] border border-[#214f3f] text-[#5ce4bd] text-xs font-semibold px-3 py-1.5 rounded-[8px] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#5ce4bd] animate-pulse" />
              <span>Live telemetry</span>
            </div>

            {/* Notification Bell Button */}
            <button
              type="button"
              className="relative w-8 h-8 rounded-[8px] bg-[#152028] border border-[#243139] hover:bg-[#1a2530] flex items-center justify-center text-[#91a4ae] hover:text-[#edf4f5] transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#5ce4bd]" />
            </button>

            {/* User Profile / Admin Dropdown */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#1f2c35]">
              <div className="w-8 h-8 rounded-full bg-[#17382f] border border-[#214f3f] text-[#5ce4bd] text-xs font-bold flex items-center justify-center shadow-sm">
                AD
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-medium text-[#edf4f5] leading-none">Admin</div>
                <div className="text-[10px] text-[#91a4ae] mt-0.5 leading-none">admin@pingku.local</div>
              </div>
            </div>
          </div>
        </header>

        {/* Konten Halaman Aktif */}
        <main className={`flex-1 ${activeTab === 'topology' ? 'p-6 flex flex-col' : 'p-8'}`}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto w-full">
              {/* Header Overview Sesuai Desain Figma */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#5ce4bd] uppercase tracking-wider block">
                    MONITORING / 01
                  </span>
                  <h1 className="text-[28px] font-bold text-[#edf4f5] tracking-tight mt-0.5">
                    Overview
                  </h1>
                  <p className="text-[13px] text-[#91a4ae] mt-0.5">
                    Diagnostik real-time sistem, server, dan jaringan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="bg-[#152028] border border-[#243139] hover:bg-[#1a2530] text-[#edf4f5] text-xs px-3.5 py-2 rounded-[8px] flex items-center gap-1.5 shadow-sm transition"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#91a4ae]" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Row 1: 3 KPI Cards (CPU, RAM, Network I/O) */}
              <TopMetricCards system={system} history={history} />

              {/* Row 2: Performance Chart (2/3) + Recent Alerts (1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2">
                  <SystemPerformanceChart history={history} />
                </div>
                <div className="lg:col-span-1">
                  <RecentAlertsCard logs={logs} />
                </div>
              </div>

              {/* Row 3: Service & Host Status (Uptime bars 32-tick) */}
              <ServiceHostStatus nodes={nodes} />

              {/* Bottom Footer Info */}
              <div className="flex flex-col sm:flex-row items-center justify-between py-4 border-t border-[#1b262e] text-[11px] text-[#657d89] mt-8 gap-2">
                <div>
                  <span className="font-semibold text-[#91a4ae]">
                    {system?.os_hostname ? `${system.os_hostname.toUpperCase()} / WORKSPACE` : 'PINGKU / LOCAL WORKSPACE'}
                  </span> · {system?.os_distro || 'Host Server'} ({system?.os_arch || 'x64'}) · Node.js {system?.node_version || 'v20.x'}
                </div>
                <div>
                  Terakhir diperbarui: {new Date().toLocaleTimeString()} · WebSocket 2s interval
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOPOLOGY MAP */}
          {activeTab === 'topology' && (
            <div className="flex-1 w-full min-h-[660px] flex">
              <TopologyMap
                nodes={nodes}
                onAddNode={addNode}
                onUpdateNode={updateNode}
                onUpdateNodePosition={updateNodePosition}
                onDeleteNode={deleteNode}
                onPingNode={pingNode}
                onRefreshNodes={refreshNodes}
                onNavigateToLogs={() => setActiveTab('logs')}
              />
            </div>
          )}

          {/* TAB 3: NETWORK TOOLS SUITE */}
          {activeTab === 'tools' && (
            <NetworkToolsHub
              initialSubTab={toolsInitialSubTab}
              initialTarget={toolsInitialTarget}
            />
          )}

          {/* TAB 4: CONNECTION LOGS */}
          {activeTab === 'logs' && <ConnectionLogsView logs={logs} />}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView
              isConnected={isConnected}
              system={system}
              nodes={nodes}
            />
          )}
        </main>
      </div>
    </div>
  );
}