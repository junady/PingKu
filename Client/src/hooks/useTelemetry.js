import { useState, useEffect, useRef, useCallback } from 'react';
import { getAppSettings } from '../utils/settings';

export function useTelemetry() {
  const [settings, setSettings] = useState(getAppSettings);
  const [isConnected, setIsConnected] = useState(false);

  // URL dinamis dari pengaturan (disimpan di localStorage)
  const apiBase = `${(settings.backendUrl || 'http://localhost:8080').replace(/\/$/, '')}/api`;
  const wsUrl = settings.wsUrl || 'ws://localhost:8080/ws';

  // State utama telemetri sistem (FR-01)
  const [system, setSystem] = useState({
    cpu_percent: 0,
    ram_used_mb: 0,
    ram_total_mb: 0,
    disk_percent: 0,
    uptime_sec: 0,
    net_rx_kbps: 0,
    net_tx_kbps: 0,
  });

  const [history, setHistory] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [logs, setLogs] = useState([]);

  const wsRef = useRef(null);

  // Helper menambah titik riwayat sparkline
  const appendHistory = useCallback((sysData, timestamp) => {
    setHistory((prev) => {
      const next = [...prev, { time: timestamp || Date.now(), cpu_percent: sysData.cpu_percent }];
      return next.length > 30 ? next.slice(next.length - 30) : next;
    });
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

  // 1. Ambil data awal dari REST API backend
  const fetchInitialData = useCallback(async () => {
    try {
      const [nodesRes, logsRes] = await Promise.all([
        fetch(`${apiBase}/nodes`),
        fetch(`${apiBase}/logs`),
      ]);

      if (nodesRes.ok) {
        const nodesData = await nodesRes.json();
        setNodes((prevNodes) => {
          return nodesData.map((node) => {
            const existing = prevNodes.find((n) => n.id === node.id);
            return {
              ...node,
              status: existing?.status || node.status || 'UNKNOWN',
              latency_ms: existing?.latency_ms ?? node.latency_ms ?? null,
            };
          });
        });
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
    } catch (err) {
      console.warn(`[PingKu] Menunggu backend server di ${apiBase}...`, err.message);
    }
  }, [apiBase]);

  // 2. Koneksi Live WebSocket ke endpoint aktif
  useEffect(() => {
    fetchInitialData();
    let reconnectTimer;
    let isMounted = true;

    function connectWs() {
      if (!isMounted) return;
      try {
        if (wsRef.current) {
          try { wsRef.current.close(); } catch {}
        }

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
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
                if (prevNodes.length === 0) {
                  fetchInitialData();
                  return prevNodes;
                }
                return prevNodes.map((node) => {
                  const live = data.nodes.find((n) => n.id === node.id);
                  return live
                    ? { ...node, status: live.status, latency_ms: live.latency_ms }
                    : node;
                });
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
          setIsConnected(false);
          reconnectTimer = setTimeout(connectWs, 2000);
        };

        ws.onerror = () => {
          if (!isMounted) return;
          setIsConnected(false);
          try { ws.close(); } catch {}
        };
      } catch {
        if (!isMounted) return;
        setIsConnected(false);
        reconnectTimer = setTimeout(connectWs, 2000);
      }
    }

    connectWs();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }
    };
  }, [wsUrl, fetchInitialData, appendHistory]);

  // 3. Aksi CRUD Node untuk TopologyMap
  const addNode = async (newNodeData) => {
    try {
      const res = await fetch(`${apiBase}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNodeData),
      });
      if (res.ok) {
        const created = await res.json();
        setNodes((prev) => [...prev, { ...created, status: 'UP', latency_ms: 1 }]);
        return created;
      }
    } catch (err) {
      console.error('Gagal menambah node ke server:', err);
    }
  };

  const updateNode = async (id, updatedFields) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updatedFields } : n))
    );

    try {
      await fetch(`${apiBase}/nodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
    } catch (err) {
      console.error('Gagal update node di server:', err);
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

    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pos_x, pos_y } : n))
    );

    try {
      await fetch(`${apiBase}/nodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pos_x, pos_y }),
      });
    } catch (err) {
      console.error('Gagal simpan posisi node:', err);
    }
  };

  const deleteNode = async (id) => {
    setNodes((prev) =>
      prev
        .filter((n) => n.id !== id)
        .map((n) => (n.parent_id === id ? { ...n, parent_id: null } : n))
    );

    try {
      await fetch(`${apiBase}/nodes/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Gagal menghapus node:', err);
    }
  };

  const pingNode = async (id) => {
    try {
      const res = await fetch(`${apiBase}/nodes/${id}/ping`, { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        setNodes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, ...result } : n))
        );
        return result;
      }
    } catch (err) {
      console.error('Gagal ping node:', err);
    }
    return null;
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
