/**
 * PingKu — Lightweight NOC & Server Telemetry Dashboard
 * Copyright (C) 2026 Arjuna Setya Ramadhani.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
 *
 * useTelemetry.js — Hybrid Telemetry Engine:
 * 1. Mode Server Asli: Menghubungkan ke WebSocket real-time Express backend (:8080/ws).
 * 2. Mode Vercel / Cloud Demo: Menjalankan Interactive Telemetry Simulator otomatis
 *    dengan fluktuasi CPU/RAM/Network yang natural, grafik sparkline hidup,
 *    dan persistensi node ke localStorage tanpa perlu instalasi terminal apa pun.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getAppSettings } from '../utils/settings';
import { SCHOOL_TOPOLOGY_NODES } from '../data/schoolTopologyData';

const STORAGE_NODES_KEY = 'pingku_topology_nodes';

export function useTelemetry() {
  const [settings, setSettings] = useState(getAppSettings);
  const [isConnected, setIsConnected] = useState(true);

  // URL dinamis dari pengaturan
  const apiBase = settings.backendUrl ? `${settings.backendUrl.replace(/\/$/, '')}/api` : '/api';
  const wsUrl = settings.wsUrl || '';

  // State utama telemetri sistem (FR-01) dengan baseline realistis
  const [system, setSystem] = useState({
    os_distro: 'Debian GNU/Linux 12 (bookworm)',
    os_hostname: 'noc-server-01',
    os_arch: 'x64',
    cpu_brand: 'Intel(R) Xeon(R) CPU E5-2680 v4',
    cpu_cores: 16,
    node_version: 'v20.18.0',
    cpu_percent: 13.8,
    ram_used_mb: 1420,
    ram_total_mb: 16384,
    disk_percent: 38.5,
    uptime_sec: 142500,
    net_rx_kbps: 245.8,
    net_tx_kbps: 112.3,
  });

  // State riwayat sparkline grafik dengan 15 titik awal halus
  const [history, setHistory] = useState(() => {
    const initial = [];
    const now = Date.now();
    for (let i = 14; i >= 0; i--) {
      const time = now - i * 2000;
      const wave = 13 + Math.sin((now - i * 2000) / 10000) * 4.5 + ((i % 3) * 0.8);
      initial.push({ time, cpu_percent: Number(wave.toFixed(1)) });
    }
    return initial;
  });

  // State daftar node topologi (dengan persistensi localStorage untuk interaksi Vercel)
  const [nodes, setNodes] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_NODES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return SCHOOL_TOPOLOGY_NODES;
  });

  // State riwayat alert log
  const [logs, setLogs] = useState(() => [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      severity: 'INFO',
      message: 'Telemetri sistem NOC aktif — 18 host terpantau normal.'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 180000).toISOString(),
      severity: 'RESOLVED',
      message: 'Core Switch L3 (Cisco Catalyst 3850) backbone 10G stabil.'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      severity: 'INFO',
      message: 'Router Gateway (MikroTik CCR2004) BGP & NAT sinkron.'
    }
  ]);

  const wsRef = useRef(null);
  const isWsLiveRef = useRef(false);

  // Helper menambah titik riwayat sparkline
  const appendHistory = useCallback((sysData, timestamp) => {
    setHistory((prev) => {
      const next = [...prev, { time: timestamp || Date.now(), cpu_percent: sysData.cpu_percent }];
      return next.length > 30 ? next.slice(next.length - 30) : next;
    });
  }, []);

  // Simpan perubahan nodes ke localStorage
  const saveNodesToStorage = useCallback((newNodes) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_NODES_KEY, JSON.stringify(newNodes));
      } catch {}
    }
  }, []);

  // Dengarkan perubahan konfigurasi dari SettingsView
  useEffect(() => {
    const handleSettingsChanged = (e) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };
    window.addEventListener('pingku_settings_changed', handleSettingsChanged);
    return () => window.removeEventListener('pingku_settings_changed', handleSettingsChanged);
  }, []);

  // 1. Ambil data awal dari REST API backend jika ada
  const fetchInitialData = useCallback(async () => {
    if (!apiBase) return;
    try {
      const [nodesRes, logsRes] = await Promise.all([
        fetch(`${apiBase}/nodes`).catch(() => null),
        fetch(`${apiBase}/logs`).catch(() => null),
      ]);

      if (nodesRes && nodesRes.ok) {
        const nodesData = await nodesRes.json();
        if (Array.isArray(nodesData) && nodesData.length > 0) {
          setNodes((prevNodes) => {
            const merged = nodesData.map((node) => {
              const existing = prevNodes.find((n) => n.id === node.id);
              return {
                ...node,
                status: existing?.status || node.status || 'UP',
                latency_ms: existing?.latency_ms ?? node.latency_ms ?? 1,
              };
            });
            saveNodesToStorage(merged);
            return merged;
          });
        }
      }

      if (logsRes && logsRes.ok) {
        const logsData = await logsRes.json();
        if (Array.isArray(logsData) && logsData.length > 0) {
          setLogs(logsData);
        }
      }
    } catch {}
  }, [apiBase, saveNodesToStorage]);

  // 2. Koneksi Live WebSocket (Jika server lokal aktif)
  useEffect(() => {
    fetchInitialData();
    let reconnectTimer;
    let isMounted = true;

    function connectWs() {
      if (!isMounted || !wsUrl) return;
      try {
        if (wsRef.current) {
          try { wsRef.current.close(); } catch {}
        }

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          isWsLiveRef.current = true;
          setIsConnected(true);
          console.log(`[PingKu] WebSocket connected ke ${wsUrl}`);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);

            if (data.system) {
              setSystem(data.system);
              appendHistory(data.system, data.timestamp);
            }

            if (Array.isArray(data.nodes)) {
              setNodes((prevNodes) => {
                const updated = prevNodes.map((node) => {
                  const live = data.nodes.find((n) => n.id === node.id);
                  return live
                    ? { ...node, status: live.status, latency_ms: live.latency_ms }
                    : node;
                });
                saveNodesToStorage(updated);
                return updated;
              });
            }

            if (data.latest_alert) {
              setLogs((prev) => [data.latest_alert, ...prev].slice(0, 50));
            }
          } catch (err) {
            console.error('[PingKu] Format pesan WebSocket tidak valid:', err);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          isWsLiveRef.current = false;
          reconnectTimer = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          if (!isMounted) return;
          isWsLiveRef.current = false;
          try { ws.close(); } catch {}
        };
      } catch {
        if (!isMounted) return;
        isWsLiveRef.current = false;
        reconnectTimer = setTimeout(connectWs, 3000);
      }
    }

    if (wsUrl && !wsUrl.startsWith('ws://localhost') || !window.location.hostname.includes('vercel.app')) {
      connectWs();
    }

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }
    };
  }, [wsUrl, fetchInitialData, appendHistory, saveNodesToStorage]);

  // 3. Interactive Telemetry Simulator Loop (Aktif otomatis saat WebSocket offline / di Vercel)
  useEffect(() => {
    let tickCount = 0;

    const timer = setInterval(() => {
      // Jika WebSocket server lokal aktif dan menyiarkan data asli, serahkan ke WebSocket
      if (isWsLiveRef.current) return;

      tickCount++;
      const now = Date.now();
      const wave = 13.5 + Math.sin(now / 11000) * 5.2 + (Math.sin(now / 3200) * 1.5);
      const simulatedCpu = Number(Math.max(8.0, Math.min(28.5, wave)).toFixed(1));
      const simulatedRam = 1420 + Math.floor(Math.sin(now / 18000) * 35) + (tickCount % 5) * 3;
      const simulatedRx = Number((245 + Math.sin(now / 7000) * 45 + (Math.random() * 8)).toFixed(1));
      const simulatedTx = Number((112 + Math.cos(now / 7000) * 22 + (Math.random() * 6)).toFixed(1));

      setSystem((prev) => ({
        os_distro: prev.os_distro || 'Debian GNU/Linux 12 (bookworm)',
        os_hostname: prev.os_hostname || 'noc-server-01',
        os_arch: prev.os_arch || 'x64',
        cpu_brand: prev.cpu_brand || 'Intel(R) Xeon(R) CPU E5-2680 v4',
        cpu_cores: prev.cpu_cores || 16,
        node_version: prev.node_version || 'v20.18.0',
        cpu_percent: simulatedCpu,
        ram_used_mb: simulatedRam,
        ram_total_mb: 16384,
        disk_percent: 38.5,
        uptime_sec: (prev.uptime_sec || 124500) + 2,
        net_rx_kbps: simulatedRx,
        net_tx_kbps: simulatedTx,
      }));

      appendHistory({ cpu_percent: simulatedCpu }, now);
      setIsConnected(true);
    }, 2000);

    return () => clearInterval(timer);
  }, [appendHistory]);

  // 4. Aksi CRUD Node untuk TopologyMap (Hybrid: Update State + localStorage + Sync API)
  const addNode = async (newNodeData) => {
    const id = 'node-' + Date.now();
    const created = {
      id,
      ...newNodeData,
      status: 'UP',
      latency_ms: 1,
    };

    setNodes((prev) => {
      const updated = [...prev, created];
      saveNodesToStorage(updated);
      return updated;
    });

    if (apiBase) {
      try {
        await fetch(`${apiBase}/nodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNodeData),
        });
      } catch {}
    }
    return created;
  };

  const updateNode = async (id, updatedFields) => {
    setNodes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...updatedFields } : n));
      saveNodesToStorage(updated);
      return updated;
    });

    if (apiBase) {
      try {
        await fetch(`${apiBase}/nodes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields),
        });
      } catch {}
    }
  };

  const updateNodePosition = async (id, xOrPos, maybeY) => {
    let pos_x, pos_y;
    if (typeof xOrPos === 'object' && xOrPos !== null) {
      pos_x = xOrPos.pos_x ?? xOrPos.x;
      pos_y = xOrPos.pos_y ?? xOrPos.y;
    } else {
      pos_x = xOrPos;
      pos_y = maybeY;
    }

    if (pos_x === undefined || pos_y === undefined) return;

    setNodes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, pos_x, pos_y } : n));
      saveNodesToStorage(updated);
      return updated;
    });

    if (apiBase) {
      try {
        await fetch(`${apiBase}/nodes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pos_x, pos_y }),
        });
      } catch {}
    }
  };

  const deleteNode = async (id) => {
    setNodes((prev) => {
      const updated = prev
        .filter((n) => n.id !== id)
        .map((n) => (n.parent_id === id ? { ...n, parent_id: null } : n));
      saveNodesToStorage(updated);
      return updated;
    });

    if (apiBase) {
      try {
        await fetch(`${apiBase}/nodes/${id}`, { method: 'DELETE' });
      } catch {}
    }
  };

  const pingNode = async (id) => {
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/nodes/${id}/ping`, { method: 'POST' });
        if (res.ok) {
          const result = await res.json();
          setNodes((prev) => {
            const updated = prev.map((n) => (n.id === id ? { ...n, ...result } : n));
            saveNodesToStorage(updated);
            return updated;
          });
          return result;
        }
      } catch {}
    }

    // Fallback simulasi respons instan untuk Vercel demo
    const latency_ms = Math.floor(Math.random() * 2) + 1;
    const result = { id, status: 'UP', latency_ms };
    setNodes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...result } : n));
      saveNodesToStorage(updated);
      return updated;
    });
    return result;
  };

  return {
    system,
    history,
    nodes,
    logs,
    isConnected,
    refreshNodes: fetchInitialData,
    addNode,
    updateNode,
    updateNodePosition,
    deleteNode,
    pingNode,
  };
}
