import React, { useState, useMemo } from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';

function intToIp(intVal) {
  return [
    (intVal >>> 24) & 255,
    (intVal >>> 16) & 255,
    (intVal >>> 8) & 255,
    intVal & 255,
  ].join('.');
}

function ipToInt(ipStr) {
  return ipStr
    .split('.')
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function cidrToMask(prefix) {
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return intToIp(mask);
}

const PRESET_COLORS = [
  'bg-gradient-to-r from-blue-600 to-blue-500',
  'bg-gradient-to-r from-emerald-600 to-emerald-500',
  'bg-gradient-to-r from-amber-600 to-amber-500',
  'bg-gradient-to-r from-purple-600 to-purple-500',
  'bg-gradient-to-r from-pink-600 to-pink-500',
  'bg-gradient-to-r from-cyan-600 to-cyan-500',
];

function calculateVlsm(cidrInput, reqs) {
  try {
    const parts = cidrInput.trim().split('/');
    if (parts.length !== 2) return null;
    const ipPart = parts[0];
    const prefix = parseInt(parts[1], 10);
    if (isNaN(prefix) || prefix < 8 || prefix > 30) return null;

    let currentIpInt = ipToInt(ipPart);
    const totalBlockSize = Math.pow(2, 32 - prefix);

    // Sort subnets descending by hosts needed (VLSM rule)
    const sortedReqs = [...reqs].sort((a, b) => b.hosts - a.hosts);

    let allocatedTotal = 0;
    const subnets = sortedReqs.map((req, idx) => {
      let blockSize = 4;
      let hostBits = 2;
      while (blockSize - 2 < req.hosts) {
        blockSize *= 2;
        hostBits++;
      }

      const subCidr = 32 - hostBits;
      const netIdInt = currentIpInt;
      const broadcastInt = netIdInt + blockSize - 1;
      const firstUsableInt = netIdInt + 1;
      const lastUsableInt = broadcastInt - 1;

      const subnetData = {
        name: req.name || `LAN ${idx + 1}`,
        cidr: `/${subCidr}`,
        subnetMask: cidrToMask(subCidr),
        netId: intToIp(netIdInt),
        usableRange: `${intToIp(firstUsableInt)} - ${intToIp(lastUsableInt)}`,
        broadcast: intToIp(broadcastInt),
        usableHosts: blockSize - 2,
        neededHosts: req.hosts,
        blockSize,
        color: req.color || PRESET_COLORS[idx % PRESET_COLORS.length],
      };

      currentIpInt += blockSize;
      allocatedTotal += blockSize;

      return subnetData;
    });

    const unusedSize = Math.max(0, totalBlockSize - allocatedTotal);

    return {
      subnets,
      totalBlockSize,
      allocatedTotal,
      unusedSize,
      isOverflow: allocatedTotal > totalBlockSize,
    };
  } catch {
    return null;
  }
}

export default function VlsmCalculator() {
  const [baseCidr, setBaseCidr] = useState('192.168.10.0/24');
  const [requirements, setRequirements] = useState([
    { id: 1, name: 'LAN 1: Admin', hosts: 60, color: PRESET_COLORS[0] },
    { id: 2, name: 'LAN 2: Staff', hosts: 30, color: PRESET_COLORS[1] },
    { id: 3, name: 'LAN 3: Guest', hosts: 10, color: PRESET_COLORS[2] },
  ]);

  const calculationResult = useMemo(
    () => calculateVlsm(baseCidr, requirements),
    [baseCidr, requirements]
  );

  const handleAddRequirement = () => {
    const nextId = Date.now();
    const nextIdx = requirements.length;
    setRequirements((prev) => [
      ...prev,
      {
        id: nextId,
        name: `LAN ${nextIdx + 1}: Subnet`,
        hosts: 14,
        color: PRESET_COLORS[nextIdx % PRESET_COLORS.length],
      },
    ]);
  };

  const handleUpdateRequirement = (id, field, value) => {
    setRequirements((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, [field]: field === 'hosts' ? Math.max(1, parseInt(value, 10) || 1) : value }
          : req
      )
    );
  };

  const handleRemoveRequirement = (id) => {
    if (requirements.length <= 1) return;
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="relative group bg-gradient-to-b from-[#131927] to-[#0e1320] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              Interactive VLSM Subnet Calculator
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Real-Time Math
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Pecah blok IP menjadi subnet optimal otomatis berdasarkan kebutuhan host perangkat.
        </p>

        {/* Input Base IP/CIDR */}
        <div className="mb-5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Base Network ID & Prefix (CIDR)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={baseCidr}
              onChange={(e) => setBaseCidr(e.target.value)}
              placeholder="192.168.10.0/24"
              className="flex-1 px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono shadow-inner"
            />
            <button
              type="button"
              onClick={handleAddRequirement}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Subnet</span>
            </button>
          </div>
        </div>

        {/* Dynamic Requirements List */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Host Requirements (Dapat Diedit & Ditambah Langsung)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Total Subnets: {requirements.length}
            </span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800"
              >
                <input
                  type="text"
                  value={req.name}
                  onChange={(e) => handleUpdateRequirement(req.id, 'name', e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700/70 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={req.hosts}
                    onChange={(e) => handleUpdateRequirement(req.id, 'hosts', e.target.value)}
                    className="w-20 px-2.5 py-1.5 bg-slate-900 border border-slate-700/70 rounded-lg text-xs text-white font-mono text-center focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">hosts</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveRequirement(req.id)}
                  disabled={requirements.length <= 1}
                  className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition rounded-lg hover:bg-slate-800"
                  title="Hapus Kebutuhan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Warning jika alokasi melebihi kapasitas subnet */}
        {calculationResult?.isOverflow && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium">
            Peringatan: Kebutuhan total host ({calculationResult.allocatedTotal} IP) melebihi kapasitas blok CIDR ({calculationResult.totalBlockSize} IP). Coba perbesar prefix (misal: /23 atau /22).
          </div>
        )}

        {/* Proportional IP block allocation bar */}
        {calculationResult && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Proportional IP Block Allocation
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {calculationResult.allocatedTotal} / {calculationResult.totalBlockSize} IPs ({Math.min(100, Math.round((calculationResult.allocatedTotal / calculationResult.totalBlockSize) * 100))}%)
              </span>
            </div>

            <div className="w-full h-9 rounded-xl overflow-hidden flex bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-white select-none p-1 gap-1">
              {calculationResult.subnets.map((sub, idx) => {
                const pct = (sub.blockSize / calculationResult.totalBlockSize) * 100;
                return (
                  <div
                    key={idx}
                    className={`${sub.color} flex items-center justify-center truncate px-2 rounded-lg shadow-sm`}
                    style={{ width: `${Math.max(10, pct)}%` }}
                    title={`${sub.name} (${sub.blockSize} IPs - ${sub.cidr})`}
                  >
                    <span className="truncate">
                      {sub.name} ({sub.blockSize})
                    </span>
                  </div>
                );
              })}
              {calculationResult.unusedSize > 0 && (
                <div
                  className="bg-slate-800/80 rounded-lg flex items-center justify-center truncate px-2 text-slate-400 border border-slate-700/40"
                  style={{
                    width: `${(calculationResult.unusedSize / calculationResult.totalBlockSize) * 100}%`,
                  }}
                  title={`Unused (${calculationResult.unusedSize} IPs)`}
                >
                  <span className="truncate">Unused ({calculationResult.unusedSize})</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subnet Table */}
        {calculationResult && (
          <div className="overflow-x-auto max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#0e1320] border-b border-slate-800">
                <tr className="text-slate-400 pb-2">
                  <th className="pb-2 font-semibold uppercase text-[10px]">Subnet Name</th>
                  <th className="pb-2 font-semibold uppercase text-[10px] w-14">CIDR</th>
                  <th className="pb-2 font-semibold uppercase text-[10px]">Network ID</th>
                  <th className="pb-2 font-semibold uppercase text-[10px]">Usable Range</th>
                  <th className="pb-2 font-semibold uppercase text-[10px]">Broadcast</th>
                  <th className="pb-2 font-semibold uppercase text-[10px] text-right w-16">Hosts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {calculationResult.subnets.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-800/25 transition">
                    <td className="py-2.5 font-medium text-slate-200">{sub.name}</td>
                    <td className="py-2.5 font-mono">
                      <span className="bg-slate-900 px-1.5 py-0.5 rounded text-sky-400 border border-slate-800 font-bold">
                        {sub.cidr}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-300">{sub.netId}</td>
                    <td className="py-2.5 font-mono text-slate-300">{sub.usableRange}</td>
                    <td className="py-2.5 font-mono text-slate-300">{sub.broadcast}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400 font-bold">
                      {sub.usableHosts} / {sub.neededHosts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
