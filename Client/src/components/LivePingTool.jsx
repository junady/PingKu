import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, RefreshCw, Radio } from 'lucide-react';

export default function LivePingTool() {
  const [host, setHost] = useState('127.0.0.1');
  const [isPinging, setIsPinging] = useState(false);
  const [pingIntervalMs, setPingIntervalMs] = useState(1000);
  const [pingHistory, setPingHistory] = useState([]);
  const [stats, setStats] = useState({
    sent: 0,
    received: 0,
    lost: 0,
    min: null,
    max: null,
    avg: null,
    jitter: 0,
  });

  const timerRef = useRef(null);
  const seqRef = useRef(1);

  const updateStats = useCallback((record) => {
    setStats((prev) => {
      const sent = prev.sent + 1;
      const isOk = record.status === 'REPLY' && record.latency_ms !== null;
      const received = prev.received + (isOk ? 1 : 0);
      const lost = sent - received;

      if (!isOk) {
        return { ...prev, sent, received, lost };
      }

      const lat = record.latency_ms;
      const min = prev.min === null ? lat : Math.min(prev.min, lat);
      const max = prev.max === null ? lat : Math.max(prev.max, lat);
      const avg = prev.avg === null ? lat : Math.round((prev.avg * (received - 1) + lat) / received);
      const jitter = prev.avg !== null ? Math.abs(lat - prev.avg) : 0;

      return { sent, received, lost, min, max, avg, jitter };
    });
  }, []);

  // Fungsi single ping packet langsung ke backend
  const sendPing = useCallback(async () => {
    const currentSeq = seqRef.current++;
    const startTime = performance.now();

    try {
      const res = await fetch(`http://localhost:8080/api/ping?host=${encodeURIComponent(host)}`);
      if (res.ok) {
        const data = await res.json();
        const record = {
          seq: currentSeq,
          host,
          status: data.status === 'UP' ? 'REPLY' : 'TIMEOUT',
          latency_ms: data.latency_ms ?? Math.round(performance.now() - startTime),
          ttl: data.ttl || 64,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setPingHistory((prev) => [record, ...prev].slice(0, 30));
        updateStats(record);
      } else {
        const record = {
          seq: currentSeq,
          host,
          status: 'TIMEOUT',
          latency_ms: null,
          ttl: 0,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setPingHistory((prev) => [record, ...prev].slice(0, 30));
        updateStats(record);
      }
    } catch {
      const record = {
        seq: currentSeq,
        host,
        status: 'TIMEOUT',
        latency_ms: null,
        ttl: 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setPingHistory((prev) => [record, ...prev].slice(0, 30));
      updateStats(record);
    }
  }, [host, updateStats]);

  // Loop Continuous Ping
  useEffect(() => {
    if (isPinging) {
      sendPing();
      timerRef.current = setInterval(sendPing, pingIntervalMs);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPinging, pingIntervalMs, sendPing]);

  const handleStartStop = () => {
    setIsPinging((prev) => !prev);
  };

  const handleReset = () => {
    setIsPinging(false);
    setPingHistory([]);
    seqRef.current = 1;
    setStats({
      sent: 0,
      received: 0,
      lost: 0,
      min: null,
      max: null,
      avg: null,
      jitter: 0,
    });
  };

  // Sparkline Chart untuk Live Ping
  const chartWidth = 320;
  const chartHeight = 50;
  const validLatencies = pingHistory
    .slice()
    .reverse()
    .map((p) => (p.status === 'REPLY' && p.latency_ms !== null ? p.latency_ms : 0));

  const pointsData = validLatencies.length > 1 ? validLatencies : [0, 0];
  const maxVal = Math.max(10, ...pointsData);

  const coords = pointsData.map((val, idx) => {
    const x = (idx / (pointsData.length - 1)) * chartWidth;
    const y = chartHeight - (val / maxVal) * (chartHeight - 10) - 5;
    return { x, y };
  });

  const linePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `M 0,${chartHeight} L ${coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' L ')} L ${chartWidth},${chartHeight} Z`;

  return (
    <div className="relative group bg-gradient-to-b from-[#131927] to-[#0e1320] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header Tool */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              Live ICMP Ping & Jitter Monitor
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isPinging ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span className="text-[11px] font-mono font-semibold text-slate-300">
              {isPinging ? 'STREAMING' : 'IDLE'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Kirim paket probe ICMP terus-menerus ke target IP/Host secara real-time dan analisis statistik latensi.
        </p>

        {/* Input Bar & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-6">
          <div className="md:col-span-5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Target IP / Hostname
            </label>
            <input
              type="text"
              value={host}
              disabled={isPinging}
              onChange={(e) => setHost(e.target.value)}
              placeholder="192.168.10.1 atau 8.8.8.8"
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 font-mono shadow-inner disabled:opacity-60"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Interval
            </label>
            <select
              value={pingIntervalMs}
              disabled={isPinging}
              onChange={(e) => setPingIntervalMs(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 shadow-inner disabled:opacity-60"
            >
              <option value="500">Fast (500ms)</option>
              <option value="1000">Normal (1s)</option>
              <option value="2000">Slow (2s)</option>
            </select>
          </div>

          <div className="md:col-span-4 flex gap-2">
            <button
              onClick={handleStartStop}
              className={`flex-1 py-2.5 font-semibold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 ${
                isPinging
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25'
              }`}
            >
              {isPinging ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPinging ? 'Stop Ping' : 'Start Ping'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/80 transition"
              title="Reset Statistik"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-Time Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Sent / Recv</span>
            <span className="text-sm font-mono font-bold text-white">
              {stats.sent} / {stats.received}
            </span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Loss %</span>
            <span
              className={`text-sm font-mono font-bold ${
                stats.lost > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {stats.sent > 0 ? ((stats.lost / stats.sent) * 100).toFixed(0) : 0}%
            </span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Min Latency</span>
            <span className="text-sm font-mono font-bold text-sky-400">
              {stats.min !== null ? `${stats.min}ms` : '--'}
            </span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Avg Latency</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {stats.avg !== null ? `${stats.avg}ms` : '--'}
            </span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Max Latency</span>
            <span className="text-sm font-mono font-bold text-amber-400">
              {stats.max !== null ? `${stats.max}ms` : '--'}
            </span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Jitter</span>
            <span className="text-sm font-mono font-bold text-indigo-400">
              ±{stats.jitter}ms
            </span>
          </div>
        </div>

        {/* Real-Time Sparkline Chart */}
        {pingHistory.length > 0 && (
          <div className="mb-5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Real-Time RTT Response Graph
              </span>
              <span className="text-[10px] font-mono text-slate-500">Scale: 0 - {maxVal}ms</span>
            </div>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-12 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pingAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#pingAreaGrad)" />
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={linePoints}
              />
            </svg>
          </div>
        )}

        {/* Live Packet Log Table */}
        <div className="overflow-x-auto max-h-56 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#0e1320] border-b border-slate-800">
              <tr className="text-slate-400 pb-2">
                <th className="pb-2 font-semibold uppercase text-[10px] w-14">Seq</th>
                <th className="pb-2 font-semibold uppercase text-[10px]">Time</th>
                <th className="pb-2 font-semibold uppercase text-[10px]">Host</th>
                <th className="pb-2 font-semibold uppercase text-[10px]">Status</th>
                <th className="pb-2 font-semibold uppercase text-[10px]">TTL</th>
                <th className="pb-2 font-semibold uppercase text-[10px] text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {pingHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 italic">
                    Klik "Start Ping" untuk mulai memantau respons jaringan secara langsung.
                  </td>
                </tr>
              ) : (
                pingHistory.map((item) => (
                  <tr key={item.seq} className="hover:bg-slate-800/25 transition">
                    <td className="py-2 font-mono text-slate-400 text-[11px]">#{item.seq}</td>
                    <td className="py-2 font-mono text-slate-400 text-[11px]">{item.time}</td>
                    <td className="py-2 font-mono text-slate-200">{item.host}</td>
                    <td className="py-2">
                      {item.status === 'REPLY' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Reply 64 bytes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          Request timed out
                        </span>
                      )}
                    </td>
                    <td className="py-2 font-mono text-slate-400">{item.ttl}</td>
                    <td className="py-2 text-right font-mono font-bold">
                      {item.latency_ms !== null ? (
                        <span
                          className={
                            item.latency_ms > 50
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }
                        >
                          {item.latency_ms} ms
                        </span>
                      ) : (
                        <span className="text-rose-400">--</span>
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
