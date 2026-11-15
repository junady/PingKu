import React, { useState } from 'react';
import { Radio, Shield, Globe, Calculator, LayoutGrid, Compass } from 'lucide-react';
import LivePingTool from './LivePingTool';
import PortScannerTool from './PortScannerTool';
import DnsQueryTool from './DnsQueryTool';
import VlsmCalculator from './VlsmCalculator';
import IpGeoTool from './IpGeoTool';

export default function NetworkToolsHub() {
  // Default to 'suite' so it matches Image 1 mockup immediately upon opening
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
      {/* Sub Navigation Bar untuk Network Tools */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#131927] to-[#0e1320] p-1.5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {tools.map((t) => {
            const Icon = t.icon;
            const isActive = activeSubTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400 px-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>100% Real-Time Live</span>
        </div>
      </div>

      {/* TAB 1: SUITE (1:1 DENGAN MOCKUP GAMBAR 1) */}
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
