import React, { useState, useEffect, useCallback } from 'react';
import { Compass, Search, Globe2, MapPin, Building, ShieldCheck, Loader2, Server } from 'lucide-react';

export default function IpGeoTool() {
  const [target, setTarget] = useState('1.1.1.1');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [latencyMs, setLatencyMs] = useState(null);

  const handleLookup = useCallback(async (overrideTarget) => {
    const query = (overrideTarget || target).trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMsg('');
    const startTime = performance.now();

    try {
      // Query IP Whois / Geo info
      const res = await fetch(`https://ipwhois.app/json/${encodeURIComponent(query)}`);
      const latency = Math.round(performance.now() - startTime);
      setLatencyMs(latency);

      if (res.ok) {
        const json = await res.json();
        if (json.success === false) {
          setErrorMsg(json.message || 'Alamat IP atau host tidak ditemukan.');
          setData(null);
        } else {
          setData(json);
        }
      } else {
        setErrorMsg('Gagal mengambil data dari API Geolocation.');
      }
    } catch (err) {
      setErrorMsg('Gagal menghubungi lookup service: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [target]);

  useEffect(() => {
    handleLookup('1.1.1.1');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLookup();
  };

  return (
    <div className="relative group bg-gradient-to-b from-[#131927] to-[#0e1320] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              IP & ASN Geolocation Lookup
            </h3>
          </div>
          <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            NOC Intelligence
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Identifikasi lokasi fisik, penyedia internet (ISP), Autonomous System Number (ASN), dan rute IP global.
        </p>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Masukkan IP (misal: 1.1.1.1, 8.8.8.8) atau domain"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-purple-500/25 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Lookup</span>
            </button>
          </div>
        </form>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Result Cards */}
        {data && (
          <div className="space-y-4">
            {/* IP & Status Bar */}
            <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">{data.country_flag || '🌐'}</span>
                <div>
                  <span className="font-mono font-bold text-white text-sm block">
                    {data.ip}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {data.type || 'IPv4'} • {data.country || 'Global'}
                  </span>
                </div>
              </div>
              {latencyMs !== null && (
                <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg font-mono text-[11px] font-bold">
                  {latencyMs}ms RTT
                </span>
              )}
            </div>

            {/* Grid Detail Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                <Building className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    ISP / ORGANISASI
                  </span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {data.isp || data.org || '-'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {data.asn || 'AS Unknown'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    LOKASI / KOTA
                  </span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {data.city ? `${data.city}, ${data.region}` : data.country || '-'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : '-'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                <Globe2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    TIMEZONE & BENUA
                  </span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {data.timezone_name || data.timezone || '-'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {data.continent || 'World'} ({data.timezone_gmt || 'UTC'})
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    CURRENCY & CODE
                  </span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {data.currency_code ? `${data.currency_code} (${data.currency_symbol})` : '-'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Country Code: {data.country_code || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
