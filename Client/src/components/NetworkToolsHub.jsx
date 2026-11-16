import React, { useState } from 'react';
import { Radio, Shield, Globe, RotateCw, LayoutGrid, Compass } from 'lucide-react';
import LivePingTool from './LivePingTool';
import PortScannerTool from './PortScannerTool';
import DnsQueryTool from './DnsQueryTool';
import VlsmCalculator from './VlsmCalculator';
import IpGeoTool from './IpGeoTool';

export default function NetworkToolsHub() {
  const [activeSubTab, setActiveSubTab] = useState('suite');

  const tools = [
    { id: 'suite', label: 'DNS & VLSM Suite', icon: Globe },
    { id: 'ping', label: 'Live Ping Monitor', icon: Radio },
    { id: 'ports', label: 'TCP Port Scanner', icon: Shield },
    { id: 'geo', label: 'IP & ASN Geo Lookup', icon: Compass },
    { id: 'all', label: 'All Diagnostic Tools', icon: LayoutGrid },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Sesuai Desain Figma */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#5ce4bd] uppercase tracking-wider block">
            MONITORING / 03
          </span>
          <h1 className="text-[28px] font-bold text-[#edf4f5] tracking-tight mt-0.5">
            Network Tools
          </h1>
          <p className="text-[13px] text-[#91a4ae] mt-0.5">
            Semua alat diagnostik jaringan, dalam satu tempat.
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

      {/* Sub Navigation Bar Sesuai Desain Figma */}
      <div className="flex items-center justify-between bg-[#111921] border border-[#1f2c35] p-1.5 rounded-[10px] shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tools.map((t) => {
            const Icon = t.icon;
            const isActive = activeSubTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#17382f] text-[#5ce4bd]'
                    : 'text-[#91a4ae] hover:text-[#edf4f5] hover:bg-[#152028]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#5ce4bd] font-medium px-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd] animate-pulse" />
          <span>Real-time tools</span>
        </div>
      </div>

      {/* TAB 1: SUITE (DNS & VLSM) */}
      {activeSubTab === 'suite' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <DnsQueryTool />
          <VlsmCalculator />
        </div>
      )}

      {/* TAB 2: LIVE PING MONITOR */}
      {activeSubTab === 'ping' && (
        <div className="max-w-4xl mx-auto">
          <LivePingTool />
        </div>
      )}

      {/* TAB 3: TCP PORT SCANNER */}
      {activeSubTab === 'ports' && (
        <div className="max-w-4xl mx-auto">
          <PortScannerTool />
        </div>
      )}

      {/* TAB 4: IP & ASN GEOLOCATION LOOKUP */}
      {activeSubTab === 'geo' && (
        <div className="max-w-4xl mx-auto">
          <IpGeoTool />
        </div>
      )}

      {/* TAB 5: ALL DIAGNOSTICS (GRID VIEW) */}
      {activeSubTab === 'all' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <DnsQueryTool />
            <VlsmCalculator />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <LivePingTool />
            <PortScannerTool />
          </div>
          <div className="max-w-4xl mx-auto">
            <IpGeoTool />
          </div>
        </div>
      )}
    </div>
  );
}
