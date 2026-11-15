import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Radio as RouterIcon,
  Network,
  Server,
  Monitor,
  Plus,
  X,
  Edit2,
  Trash2,
  RefreshCw,
  Layers,
} from 'lucide-react';

// ==========================================
// 1. CUSTOM NODE (Sesuai Desain Mockup + Kedalaman Visual)
// ==========================================
const DeviceNode = ({ data, selected }) => {
  const isDown = data.status === 'DOWN';

  const renderIcon = () => {
    const iconClass = 'w-5 h-5 text-slate-700';
    switch (data.type) {
      case 'router':
        return <RouterIcon className={iconClass} />;
      case 'switch':
        return <Network className={iconClass} />;
      case 'server':
        return <Server className={iconClass} />;
      case 'client':
      default:
        return <Monitor className={iconClass} />;
    }
  };

  return (
    <div
      className={`np-topo-node ${selected ? 'is-selected' : ''} ${isDown ? 'is-down animate-pulse' : ''}`}
    >
      {/* Handle Target (Kiri) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white !opacity-80"
      />

      {/* Kotak Ikon Master Stylesheet */}
      <div className="np-topo-node-icon">
        {renderIcon()}
      </div>

      {/* Label & Status */}
      <div className="flex flex-col text-left">
        <span className="np-topo-node-title">
          {data.label}
        </span>

        {isDown ? (
          <div className="np-topo-node-status np-topo-node-status--down">
            <span className="np-dot np-dot--down animate-ping" />
            <span>DOWN</span>
          </div>
        ) : (
          <div className="np-topo-node-status np-topo-node-status--up">
            <span className="np-dot np-dot--up" />
            <span>
              {data.latency_ms !== null && data.latency_ms !== undefined
                ? `${data.latency_ms}ms`
                : 'Active (0ms)'}
            </span>
          </div>
        )}
      </div>

      {/* Handle Source (Kanan) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white !opacity-80"
      />
    </div>
  );
};

// ==========================================
// 2. KOMPONEN UTAMA TOPOLOGY MAP
// ==========================================
export default function TopologyMap({
  nodes: rawNodes = [],
  onAddNode,
  onUpdateNode,
  onUpdateNodePosition,
  onDeleteNode,
  onPingNode,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  // Form State untuk Tambah Node
  const [formData, setFormData] = useState({
    label: '',
    type: 'server',
    ip_address: '192.168.10.',
    port: 80,
    parent_id: '',
  });

  // Form State untuk Edit Node
  const [editFormData, setEditFormData] = useState({
    label: '',
    type: 'server',
    ip_address: '',
    port: 0,
    parent_id: '',
  });

  const nodeTypes = useMemo(() => ({ device: DeviceNode }), []);

  // Sinkronisasi data node & relasi edge ke React Flow
  useEffect(() => {
    // 1. Generate Nodes
    const flowNodes = rawNodes.map((item) => ({
      id: item.id,
      type: 'device',
      position: { x: item.pos_x ?? 200, y: item.pos_y ?? 200 },
      selected: item.id === selectedNodeId,
      data: {
        ...item,
      },
    }));

    // 2. Generate Edges dari parent_id
    const flowEdges = rawNodes
      .filter((item) => item.parent_id)
      .map((item) => {
        const isDown = item.status === 'DOWN';
        return {
          id: `edge-${item.parent_id}-${item.id}`,
          source: item.parent_id,
          target: item.id,
          type: 'default',
          animated: true,
          style: {
            stroke: isDown ? '#ef4444' : '#64748b',
            strokeWidth: 2,
            strokeDasharray: isDown ? '5 5' : 'none',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isDown ? '#ef4444' : '#64748b',
            width: 16,
            height: 16,
          },
        };
      });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [rawNodes, selectedNodeId, setNodes, setEdges]);

  const selectedNodeData = useMemo(() => {
    return rawNodes.find((n) => n.id === selectedNodeId) || null;
  }, [rawNodes, selectedNodeId]);

  const handleNodeDragStop = useCallback(
    (_, node) => {
      if (onUpdateNodePosition) {
        onUpdateNodePosition(node.id, {
          pos_x: Math.round(node.position.x),
          pos_y: Math.round(node.position.y),
        });
      }
    },
    [onUpdateNodePosition]
  );

  const handleOpenEditModal = () => {
    if (!selectedNodeData) return;
    setEditFormData({
      label: selectedNodeData.label || '',
      type: selectedNodeData.type || 'server',
      ip_address: selectedNodeData.ip_address || '',
      port: selectedNodeData.port ?? 0,
      parent_id: selectedNodeData.parent_id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedNodeId || !onUpdateNode) return;
    onUpdateNode(selectedNodeId, {
      ...editFormData,
      port: Number(editFormData.port) || 0,
      parent_id: editFormData.parent_id || null,
    });
    setIsEditModalOpen(false);
  };

  const handleCreateNode = (e) => {
    e.preventDefault();
    const newNode = {
      ...formData,
      port: Number(formData.port) || 0,
      parent_id: formData.parent_id || null,
      pos_x: 600,
      pos_y: 200 + rawNodes.length * 30,
    };
    if (onAddNode) onAddNode(newNode);
    setIsAddModalOpen(false);
    setFormData({
      label: '',
      type: 'server',
      ip_address: '192.168.10.',
      port: 80,
      parent_id: '',
    });
  };

  const handleTestPing = async () => {
    if (!selectedNodeId || !onPingNode || isPinging) return;
    setIsPinging(true);
    await onPingNode(selectedNodeId);
    setTimeout(() => setIsPinging(false), 500);
  };

  return (
    <div className="np-topology-shell bg-[#0e1320] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* ==========================================
          AREA UTAMA: KANVAS PUTIH TOPOLOGI
      ========================================== */}
      <div className="np-topology-main bg-slate-50 overflow-hidden">
        {/* Header Atas Kanvas */}
        <div className="z-10 flex items-center justify-between px-8 py-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Interactive Topology Map
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Geser posisi perangkat dan klik pada node untuk melihat detail IP, port, dan pengujian koneksi
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="np-btn np-btn--primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>
        </div>

        {/* Kanvas React Flow */}
        <div className="flex-1 w-full h-full np-topology-canvas !border-none !rounded-none">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            onNodeDragStop={handleNodeDragStop}
            fitView
            fitViewOptions={{ padding: 0.18 }}
          >
            <Background color="#cbd5e1" gap={20} size={1.5} />
            <Controls
              position="bottom-left"
              className="!bg-white !border !border-slate-200 !rounded-xl !shadow-md overflow-hidden"
            />
          </ReactFlow>
        </div>
      </div>

      {/* ==========================================
          DRAWER KANAN: DETAIL PERANGKAT (MASTER STYLESHEET)
      ========================================== */}
      {selectedNodeData && (
        <aside className="np-drawer">
          <div>
            {/* Header Drawer */}
            <div className="np-drawer-header">
              <div className="np-drawer-title">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-sky-400 shadow-inner">
                  {selectedNodeData.type === 'router' ? (
                    <RouterIcon className="w-5 h-5" />
                  ) : selectedNodeData.type === 'switch' ? (
                    <Network className="w-5 h-5" />
                  ) : selectedNodeData.type === 'server' ? (
                    <Server className="w-5 h-5" />
                  ) : (
                    <Monitor className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white tracking-tight">
                    {selectedNodeData.label}
                  </h2>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    {selectedNodeData.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="np-icon-btn"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabel Spesifikasi Node (Key-Value) */}
            <div className="np-kv-list">
              <div className="np-kv-row">
                <span className="np-kv-key">Hostname</span>
                <span className="np-kv-val font-semibold text-white">{selectedNodeData.label}</span>
              </div>

              <div className="np-kv-row">
                <span className="np-kv-key">IP Address</span>
                <span className="np-kv-val font-mono bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                  {selectedNodeData.ip_address}
                </span>
              </div>

              <div className="np-kv-row">
                <span className="np-kv-key">TCP Port</span>
                <span className="np-kv-val font-mono">
                  {selectedNodeData.port && selectedNodeData.port > 0
                    ? `${selectedNodeData.port} (${
                        selectedNodeData.port === 53
                          ? 'DNS'
                          : selectedNodeData.port === 22
                          ? 'SSH'
                          : selectedNodeData.port === 80
                          ? 'HTTP'
                          : selectedNodeData.port === 8291
                          ? 'Winbox'
                          : 'TCP'
                      })`
                    : 'ICMP (Ping)'}
                </span>
              </div>

              <div className="np-kv-row">
                <span className="np-kv-key">Parent Node</span>
                <span className="np-kv-val">
                  {rawNodes.find((n) => n.id === selectedNodeData.parent_id)?.label || 'None (Root)'}
                </span>
              </div>

              <div className="np-kv-row">
                <span className="np-kv-key">Status</span>
                <span className="np-kv-val">
                  {selectedNodeData.status === 'DOWN' ? (
                    <span className="np-pill np-pill--down">
                      <span className="np-dot np-dot--down animate-ping" />
                      Offline (DOWN)
                    </span>
                  ) : (
                    <span className="np-pill np-pill--up">
                      <span className="np-dot np-dot--up" />
                      Active ({selectedNodeData.latency_ms ?? 0}ms)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Sparkline Latency History dengan Area Gradient Fill */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Latency History
                </span>
                <span className="text-[11px] font-mono text-slate-400">Past 30m</span>
              </div>

              <div className="h-20 w-full bg-slate-900/90 rounded-xl border border-slate-800 flex items-end p-2 overflow-hidden shadow-inner">
                <svg viewBox="0 0 200 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="latencyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={selectedNodeData.status === 'DOWN' ? '#ef4444' : '#10b981'}
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        stopColor={selectedNodeData.status === 'DOWN' ? '#ef4444' : '#10b981'}
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path
                    d={
                      selectedNodeData.status === 'DOWN'
                        ? 'M 0 50 L 0 45 L 40 45 L 60 48 L 100 48 L 140 45 L 200 48 L 200 50 Z'
                        : 'M 0 50 L 0 40 L 30 40 L 40 10 L 50 40 L 100 40 L 115 32 L 150 35 L 200 34 L 200 50 Z'
                    }
                    fill="url(#latencyAreaGrad)"
                  />
                  {/* Stroke curve */}
                  <path
                    d={
                      selectedNodeData.status === 'DOWN'
                        ? 'M 0 45 L 40 45 L 60 48 L 100 48 L 140 45 L 200 48'
                        : 'M 0 40 L 30 40 L 40 10 L 50 40 L 100 40 L 115 32 L 150 35 L 200 34'
                    }
                    fill="none"
                    stroke={selectedNodeData.status === 'DOWN' ? '#ef4444' : '#10b981'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Bawah */}
          <div className="np-drawer-actions">
            <button
              onClick={handleTestPing}
              disabled={isPinging}
              className="np-btn np-btn--primary w-full"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Testing Ping...' : 'Test Ping Ulang'}</span>
            </button>

            <div className="np-drawer-actions-row">
              <button
                onClick={handleOpenEditModal}
                className="np-btn np-btn--secondary"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Node</span>
              </button>

              <button
                onClick={() => {
                  if (onDeleteNode) onDeleteNode(selectedNodeData.id);
                  setSelectedNodeId(null);
                }}
                className="np-btn np-btn--danger-outline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Node</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ==========================================
          MODAL: + ADD NODE
      ========================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111624] border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white tracking-tight">
                Tambah Perangkat Jaringan (Node)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Nama Perangkat (Label)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DNS Server BIND9"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-teal-500 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                    Tipe
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="router">Router (MikroTik)</option>
                    <option value="switch">Switch</option>
                    <option value="server">Server</option>
                    <option value="client">Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                    Parent Node
                  </label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">-- Root (Tanpa Parent) --</option>
                    {rawNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                    IP Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="192.168.10.1"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl font-mono text-white focus:outline-none focus:border-teal-500 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                    Port (0=Ping)
                  </label>
                  <input
                    type="number"
                    placeholder="53"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl font-mono text-white focus:outline-none focus:border-teal-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition shadow-md shadow-teal-500/25"
                >
                  Simpan Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: EDIT NODE
      ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111624] border border-slate-800 rounded-2xl p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white tracking-tight">
                Edit Perangkat (Node)
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Nama Perangkat (Label)
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.label}
                  onChange={(e) => setEditFormData({ ...editFormData, label: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-teal-500 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                    Tipe
                  </label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="router">Router (MikroTik)</option>
                    <option value="switch">Switch</option>
                    <option value="server">Server</option>
                    <option value="client">Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                    Parent Node
                  </label>
                  <select
                    value={editFormData.parent_id}
                    onChange={(e) => setEditFormData({ ...editFormData, parent_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">-- Root (Tanpa Parent) --</option>
                    {rawNodes
                      .filter((n) => n.id !== selectedNodeId)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                    IP Address
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.ip_address}
                    onChange={(e) => setEditFormData({ ...editFormData, ip_address: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl font-mono text-white focus:outline-none focus:border-teal-500 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                    Port
                  </label>
                  <input
                    type="number"
                    value={editFormData.port}
                    onChange={(e) => setEditFormData({ ...editFormData, port: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl font-mono text-white focus:outline-none focus:border-teal-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition shadow-md shadow-teal-500/25"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
