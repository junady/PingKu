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
  ExternalLink,
  Activity,
  AlertTriangle,
} from 'lucide-react';

// ==========================================
// 1. CUSTOM NODE (Sesuai Desain Figma Dark NOC)
// ==========================================
const DeviceNode = ({ id, data, selected }) => {
  const isDown = data.status === 'DOWN';

  const renderIcon = () => {
    const iconClass = 'w-4 h-4 text-[#91a4ae]';
    switch (data.type?.toLowerCase()) {
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
      onClick={(e) => {
        e.stopPropagation();
        if (data.onSelect) data.onSelect();
      }}
      className={`bg-[#152028] border rounded-[10px] p-3.5 min-w-[200px] shadow-lg cursor-pointer transition-all duration-200 select-none ${
        selected
          ? 'border-[#5ce4bd] ring-2 ring-[#5ce4bd]/20 shadow-[0_0_15px_rgba(92,228,189,0.15)]'
          : isDown
          ? 'border-[#f29583] shadow-[0_0_12px_rgba(242,149,131,0.15)]'
          : 'border-[#243139] hover:border-[#2e3e48]'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-[#657d89] !border-none"
      />

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[6px] bg-[#1a2530] border border-[#243139] flex items-center justify-center shrink-0">
          {renderIcon()}
        </div>

        <div className="min-w-0 flex-1 text-left">
          <div className="text-[13px] font-semibold text-[#edf4f5] truncate leading-tight">
            {data.label}
          </div>
          <div className="text-[10px] font-mono text-[#91a4ae] mt-0.5 truncate">
            {data.ip_address}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            {isDown ? (
              <span className="text-[9px] font-bold text-[#f29583] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f29583] animate-pulse" />
                DOWN
              </span>
            ) : (
              <span className="text-[9px] font-bold text-[#5ce4bd] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd]" />
                ONLINE
              </span>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-[#657d89] !border-none"
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
  onNavigateToLogs,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pingStatus, setPingStatus] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    label: '',
    type: 'server',
    ip_address: '',
    port: 0,
    parent_id: '',
  });

  const [editFormData, setEditFormData] = useState({
    label: '',
    type: 'server',
    ip_address: '',
    port: 0,
    parent_id: '',
  });

  const nodeTypes = useMemo(() => ({ deviceNode: DeviceNode }), []);

  // Build and Synchronize Topology Graph
  useEffect(() => {
    if (!rawNodes || rawNodes.length === 0) return;

    setNodes((prevNodes) => {
      // First initialization or length mismatch:
      if (prevNodes.length === 0 || prevNodes.length !== rawNodes.length) {
        return rawNodes.map((n) => ({
          id: n.id,
          type: 'deviceNode',
          selected: n.id === selectedNodeId,
          position: {
            x: typeof n.pos_x === 'number' && !isNaN(n.pos_x) ? n.pos_x : 100,
            y: typeof n.pos_y === 'number' && !isNaN(n.pos_y) ? n.pos_y : 100,
          },
          data: {
            label: n.label,
            type: n.type,
            ip_address: n.ip_address,
            port: n.port,
            status: n.status || 'UP',
            latency_ms: n.latency_ms,
            parent_id: n.parent_id,
            onSelect: () => setSelectedNodeId(n.id),
          },
        }));
      }

      // Existing nodes: only update data without resetting position or drag
      return prevNodes.map((flowNode) => {
        const raw = rawNodes.find((r) => r.id === flowNode.id);
        if (!raw) return flowNode;
        return {
          ...flowNode,
          selected: flowNode.id === selectedNodeId,
          data: {
            ...flowNode.data,
            label: raw.label,
            type: raw.type,
            ip_address: raw.ip_address,
            port: raw.port,
            status: raw.status || 'UP',
            latency_ms: raw.latency_ms,
            parent_id: raw.parent_id,
            onSelect: () => setSelectedNodeId(raw.id),
          },
        };
      });
    });

    // Convert Edges (Dashed red/salmon for down nodes)
    const flowEdges = rawNodes
      .filter((n) => n.parent_id)
      .map((n) => {
        const isParentDown = rawNodes.find((p) => p.id === n.parent_id)?.status === 'DOWN';
        const isNodeDown = n.status === 'DOWN';
        const isDown = isParentDown || isNodeDown;

        return {
          id: `e-${n.parent_id}-${n.id}`,
          source: n.parent_id,
          target: n.id,
          type: 'smoothstep',
          animated: !isDown,
          style: {
            stroke: isDown ? '#f29583' : '#5ce4bd',
            strokeWidth: 2,
            strokeDasharray: isDown ? '5,5' : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: isDown ? '#f29583' : '#5ce4bd',
          },
        };
      });

    setEdges(flowEdges);
  }, [rawNodes, selectedNodeId, setNodes, setEdges]);

  // Handle Drag Position
  const handleNodeDragStop = useCallback(
    (_, node) => {
      setSelectedNodeId(node.id);
      if (onUpdateNodePosition) {
        onUpdateNodePosition(node.id, {
          pos_x: Math.round(node.position.x),
          pos_y: Math.round(node.position.y),
        });
      }
    },
    [onUpdateNodePosition]
  );

  const selectedNodeData = useMemo(() => {
    if (!selectedNodeId) return null;
    const fromRaw = rawNodes.find((n) => n.id === selectedNodeId);
    if (fromRaw) return fromRaw;
    const fromFlow = nodes.find((n) => n.id === selectedNodeId);
    if (fromFlow) {
      return {
        id: fromFlow.id,
        pos_x: fromFlow.position.x,
        pos_y: fromFlow.position.y,
        ...fromFlow.data,
      };
    }
    return null;
  }, [rawNodes, nodes, selectedNodeId]);

  const parentNode = useMemo(() => {
    if (!selectedNodeData?.parent_id) return null;
    return rawNodes.find((n) => n.id === selectedNodeData.parent_id);
  }, [rawNodes, selectedNodeData]);

  // Handle Ping Single Node
  const handleRunPing = async () => {
    if (!selectedNodeData) return;
    setIsPinging(true);
    setPingStatus('Pinging...');
    try {
      if (onPingNode) {
        const res = await onPingNode(selectedNodeData.id);
        if (res && res.status === 'UP') {
          setPingStatus(`UP (${res.latency_ms ?? 1}ms)`);
        } else {
          setPingStatus('DOWN (Tidak merespons)');
        }
      } else {
        setTimeout(() => {
          setPingStatus(selectedNodeData.status === 'DOWN' ? 'DOWN (Request timeout)' : 'UP (1ms)');
          setIsPinging(false);
        }, 600);
        return;
      }
    } catch {
      setPingStatus('Gagal menguji');
    }
    setIsPinging(false);
  };

  const handleCreateNode = async (e) => {
    e.preventDefault();
    if (!formData.label || !formData.ip_address) return;
    if (onAddNode) {
      await onAddNode({
        ...formData,
        port: parseInt(formData.port, 10) || 0,
        pos_x: 250 + Math.random() * 80,
        pos_y: 200 + Math.random() * 80,
      });
    }
    setIsAddModalOpen(false);
    setFormData({ label: '', type: 'server', ip_address: '', port: 0, parent_id: '' });
  };

  const handleOpenEdit = () => {
    if (!selectedNodeData) return;
    setEditFormData({
      label: selectedNodeData.label,
      type: selectedNodeData.type,
      ip_address: selectedNodeData.ip_address,
      port: selectedNodeData.port || 0,
      parent_id: selectedNodeData.parent_id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedNodeData) return;
    if (onUpdateNode) {
      await onUpdateNode(selectedNodeData.id, {
        ...editFormData,
        port: parseInt(editFormData.port, 10) || 0,
      });
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedNodeData) return;
    if (confirm(`Yakin ingin menghapus node "${selectedNodeData.label}"?`)) {
      if (onDeleteNode) {
        await onDeleteNode(selectedNodeData.id);
      }
      setSelectedNodeId(null);
    }
  };

  // Stats
  const totalCount = rawNodes.length;
  const onlineCount = rawNodes.filter((n) => n.status === 'UP').length;
  const downCount = rawNodes.filter((n) => n.status === 'DOWN').length;

  return (
    <div className="space-y-5 w-full">
      {/* ==========================================
          HEADER TOPOLOGY MAP (Sesuai Desain Figma)
      ========================================== */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#5ce4bd] uppercase tracking-wider block">
            MONITORING / 02
          </span>
          <h1 className="text-[28px] font-bold text-[#edf4f5] tracking-tight mt-0.5">
            Topology Map
          </h1>
          <p className="text-[13px] text-[#91a4ae] mt-0.5">
            Lihat koneksi, temukan gangguan, kenali dampaknya.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#5ce4bd] hover:bg-[#4cd4ad] text-[#0b1015] font-semibold text-xs px-4 py-2.5 rounded-[8px] flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add node</span>
        </button>
      </div>

      {/* ==========================================
          INCIDENT BANNER (Jika Ada Node Down)
      ========================================== */}
      {downCount > 0 && (
        <div className="bg-[#2a1d1a] border border-[#442721] rounded-[10px] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#f29583] animate-pulse" />
            <span className="text-[13px] font-semibold text-[#f29583]">
              Gangguan koneksi terdeteksi
            </span>
            <span className="text-[12px] text-[#91a4ae] hidden sm:inline">
              Periksa router utama untuk memulihkan koneksi perangkat.
            </span>
          </div>

          <button
            onClick={() => (onNavigateToLogs ? onNavigateToLogs() : null)}
            className="text-[12px] font-medium text-[#f29583] hover:underline flex items-center gap-1"
          >
            <span>Lihat connection logs</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ==========================================
          CANVAS SHELL + REACT FLOW + RIGHT DRAWER
      ========================================== */}
      <div className="relative bg-[#0e151c] border border-[#1f2c35] rounded-[12px] overflow-hidden flex h-[620px] shadow-sm">
        {/* React Flow Canvas */}
        <div className="flex-1 w-full h-full relative">
          {/* Over-canvas: Network status label (Top Left) */}
          <div className="absolute top-4 left-5 z-10 pointer-events-none">
            <div className="text-[13px] font-semibold text-[#edf4f5]">
              Network Topology
            </div>
            <div className="text-[11px] font-mono text-[#91a4ae]">
              {totalCount > 0 ? `${totalCount} node terpantau` : 'Belum ada node'}
            </div>
          </div>

          {/* Over-canvas: Legend Pills (Top Right) */}
          <div className="absolute top-4 right-5 z-10 flex items-center gap-3 bg-[#152028]/90 backdrop-blur-sm border border-[#243139] px-3 py-1.5 rounded-[8px] text-[11px] font-medium text-[#91a4ae]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd]" />
              Online
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f29583]" />
              Down
            </span>
            <span className="text-[#657d89] font-mono">- - - Link</span>
          </div>

          {/* React Flow Component */}
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
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background color="#1f2d38" gap={22} size={1.2} />
            <Controls
              position="bottom-left"
              className="!bg-[#152028] !border !border-[#243139] !rounded-[8px] !shadow-lg overflow-hidden [&>button]:!bg-[#152028] [&>button]:!border-b [&>button]:!border-[#243139] [&>button]:!fill-[#edf4f5] [&>button:hover]:!bg-[#1a2530]"
            />
          </ReactFlow>

          {/* Over-canvas: Empty State Overlay */}
          {totalCount === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <div className="bg-[#152028]/95 border border-[#243139] p-6 rounded-[12px] text-center max-w-sm pointer-events-auto shadow-xl backdrop-blur-sm">
                <div className="text-[14px] font-semibold text-[#edf4f5]">Topologi Masih Kosong</div>
                <div className="text-xs text-[#91a4ae] mt-1 mb-4 leading-relaxed">
                  Belum ada perangkat yang didaftarkan. Tambahkan node untuk mulai memantau topologi secara real-time.
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#5ce4bd] hover:bg-[#4cd4ad] text-[#0b1015] font-semibold text-xs px-4 py-2 rounded-[6px] transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Perangkat Baru</span>
                </button>
              </div>
            </div>
          )}

          {/* Over-canvas: Nodes count indicator (Bottom Right) */}
          <div className="absolute bottom-3 right-4 z-10 text-[11px] font-mono text-[#657d89]">
            {totalCount} nodes · {edges.length} links
          </div>
        </div>

        {/* ==========================================
            RIGHT DRAWER: DEVICE DETAILS (Figma Match)
        ========================================== */}
        {selectedNodeData && (
          <aside className="w-[300px] shrink-0 bg-[#10171d] border-l border-[#1f2c35] p-5 flex flex-col justify-between overflow-y-auto z-20 shadow-xl animate-in slide-in-from-right duration-200">
            <div>
              {/* Header Drawer */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1b262e] mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#657d89] uppercase tracking-wider">
                    DEVICE DETAILS
                  </span>
                  {selectedNodeData.status === 'DOWN' ? (
                    <span className="bg-[#34231f] border border-[#4d2d25] text-[#f29583] text-[10px] font-semibold px-2 py-0.5 rounded-[4px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f29583]" />
                      Down
                    </span>
                  ) : (
                    <span className="bg-[#163229] border border-[#214f3f] text-[#5ce4bd] text-[10px] font-semibold px-2 py-0.5 rounded-[4px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5ce4bd]" />
                      Online
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 rounded-[6px] hover:bg-[#152028] text-[#91a4ae] hover:text-[#edf4f5] transition"
                  title="Tutup Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Device Title */}
              <h2 className="text-[18px] font-bold text-[#edf4f5] leading-snug">
                {selectedNodeData.label}
              </h2>
              <p className="text-[11px] text-[#91a4ae] capitalize mt-0.5">
                {selectedNodeData.type} · Local workspace
              </p>

              {/* Specs List */}
              <div className="space-y-3 mt-5 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-[#657d89] uppercase block mb-0.5">
                    IP address
                  </span>
                  <span className="font-mono text-[#edf4f5] text-[13px]">
                    {selectedNodeData.ip_address || '-'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[#657d89] uppercase block mb-0.5">
                    Tipe perangkat
                  </span>
                  <span className="text-[#edf4f5] capitalize">
                    {selectedNodeData.type || '-'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[#657d89] uppercase block mb-0.5">
                    Monitoring
                  </span>
                  <span className="text-[#edf4f5]">
                    {selectedNodeData.port > 0 ? `TCP / Port ${selectedNodeData.port}` : 'ICMP Ping (Port -)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[#657d89] uppercase block mb-0.5">
                    Status koneksi
                  </span>
                  <span
                    className={`font-medium ${
                      selectedNodeData.status === 'DOWN' ? 'text-[#f29583]' : 'text-[#5ce4bd]'
                    }`}
                  >
                    {selectedNodeData.status === 'DOWN'
                      ? 'Tidak merespons'
                      : `Normal (${selectedNodeData.latency_ms ?? 1}ms)`}
                  </span>
                </div>
              </div>

              {/* Parent Connection Card */}
              {parentNode && (
                <div className="mt-5 pt-4 border-t border-[#1b262e]">
                  <span className="text-[10px] font-bold text-[#657d89] uppercase tracking-wider block mb-2">
                    KONEKSI LANGSUNG
                  </span>
                  <div className="bg-[#152028] border border-[#243139] rounded-[8px] p-2.5">
                    <div className="text-[12px] font-semibold text-[#edf4f5]">
                      {parentNode.label}
                    </div>
                    <div className="text-[10px] text-[#f29583] mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f29583]" />
                      Link terputus
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Diagnostic & Action Buttons */}
            <div className="pt-4 border-t border-[#1b262e] space-y-2">
              <span className="text-[10px] font-bold text-[#657d89] uppercase tracking-wider block mb-1">
                DIAGNOSTIK
              </span>

              <button
                onClick={handleRunPing}
                disabled={isPinging}
                className="w-full bg-[#5ce4bd] hover:bg-[#4cd4ad] text-[#0b1015] font-semibold text-xs py-2 rounded-[8px] flex items-center justify-center gap-1.5 shadow-sm transition active:scale-[0.98] disabled:opacity-60"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{pingStatus || 'Jalankan ping ↗'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleOpenEdit}
                  className="bg-[#172127] border border-[#243139] hover:bg-[#1f2c35] text-[#edf4f5] text-xs py-1.5 rounded-[6px] flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3 h-3 text-[#91a4ae]" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="bg-[#241717] border border-[#442721] hover:bg-[#341f1f] text-[#f29583] text-xs py-1.5 rounded-[6px] flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ==========================================
          BOTTOM 3 SUMMARY CARDS (Sesuai Desain Figma)
      ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 flex items-center gap-4 shadow-sm">
          <span className="text-[36px] font-bold text-[#edf4f5] font-mono leading-none">
            {String(totalCount).padStart(2, '0')}
          </span>
          <div>
            <div className="text-[13px] font-semibold text-[#edf4f5]">
              Total perangkat
            </div>
            <div className="text-[11px] text-[#91a4ae] mt-0.5">
              Seluruh node dalam jaringan
            </div>
          </div>
        </div>

        <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 flex items-center gap-4 shadow-sm">
          <span className="text-[36px] font-bold text-[#5ce4bd] font-mono leading-none">
            {String(onlineCount).padStart(2, '0')}
          </span>
          <div>
            <div className="text-[13px] font-semibold text-[#edf4f5]">
              Perangkat online
            </div>
            <div className="text-[11px] text-[#91a4ae] mt-0.5">
              {onlineCount > 0 ? 'Responsif normal' : 'Belum ada respons aktif'}
            </div>
          </div>
        </div>

        <div className="bg-[#111921] border border-[#1f2c35] rounded-[12px] p-5 flex items-center gap-4 shadow-sm">
          <span className="text-[36px] font-bold text-[#f29583] font-mono leading-none">
            {String(downCount).padStart(2, '0')}
          </span>
          <div>
            <div className="text-[13px] font-semibold text-[#edf4f5]">
              Perangkat down
            </div>
            <div className="text-[11px] text-[#91a4ae] mt-0.5">
              {downCount > 0 ? 'Perlu pemeriksaan koneksi' : 'Semua perangkat normal'}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          MODAL: + ADD NODE
      ========================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111921] border border-[#1f2c35] rounded-[12px] p-6 text-[#edf4f5] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b262e]">
              <h3 className="text-sm font-bold text-[#edf4f5]">
                Tambah Perangkat Jaringan (Node)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#91a4ae] hover:text-[#edf4f5] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[#91a4ae] mb-1 font-semibold uppercase text-[10px]">
                  Nama Perangkat (Label)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DNS Server BIND9"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 bg-[#152028] border border-[#243139] rounded-[8px] text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#91a4ae] mb-1 font-semibold uppercase text-[10px]">
                    Tipe
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#152028] border border-[#243139] rounded-[8px] text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
                  >
                    <option value="router">Router</option>
                    <option value="switch">Switch</option>
                    <option value="server">Server</option>
                    <option value="client">Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#91a4ae] mb-1 font-semibold uppercase text-[10px]">
                    Parent Node
                  </label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-3 py-2 bg-[#152028] border border-[#243139] rounded-[8px] text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
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
                  <label className="block text-[#91a4ae] mb-1 font-semibold uppercase text-[10px]">
                    IP Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="192.168.1.1 atau 127.0.0.1"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    className="w-full px-3 py-2 bg-[#152028] border border-[#243139] rounded-[8px] font-mono text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
                  />
                </div>

                <div>
                  <label className="block text-[#91a4ae] mb-1 font-semibold uppercase text-[10px]">
                    Port (0=Ping)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    className="w-full px-3 py-2 bg-[#152028] border border-[#243139] rounded-[8px] font-mono text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#1b262e]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 bg-[#172127] hover:bg-[#1f2c35] text-[#91a4ae] rounded-[6px] font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#5ce4bd] hover:bg-[#4cd4ad] text-[#0b1015] font-semibold rounded-[6px] shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111921] border border-[#1f2c35] rounded-[12px] p-6 text-[#edf4f5] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b262e]">
              <h3 className="text-sm font-bold text-[#edf4f5]">
                Edit Perangkat Jaringan (Node)
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#91a4ae] hover:text-[#edf4f5] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[#91a4ae] mb-1 font-semibold uppercase text-[10px]">
                  Nama Perangkat (Label)
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.label}
                  onChange={(e) => setEditFormData({ ...editFormData, label: e.target.value })}
                  className="w-full px-3 py-2 bg-[#152028] border border-[#243139] rounded-[8px] text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#91a4ae] mb-1 font-semibold uppercase text-[10px]">
                    Tipe
                  </label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#152028] border border-[#243139] rounded-[8px] text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
                  >
                    <option value="router">Router</option>
                    <option value="switch">Switch</option>
                    <option value="server">Server</option>
                    <option value="client">Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#91a4ae] mb-1 font-semibold uppercase text-[10px]">
                    Parent Node
                  </label>
                  <select
                    value={editFormData.parent_id}
                    onChange={(e) => setEditFormData({ ...editFormData, parent_id: e.target.value })}
                    className="w-full px-3 py-2 bg-[#152028] border border-[#243139] rounded-[8px] text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
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
                  <label className="block text-[#91a4ae] mb-1 font-semibold uppercase text-[10px]">
                    IP Address
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.ip_address}
                    onChange={(e) => setEditFormData({ ...editFormData, ip_address: e.target.value })}
                    className="w-full px-3 py-2 bg-[#152028] border border-[#243139] rounded-[8px] font-mono text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
                  />
                </div>

                <div>
                  <label className="block text-[#91a4ae] mb-1 font-semibold uppercase text-[10px]">
                    Port
                  </label>
                  <input
                    type="number"
                    value={editFormData.port}
                    onChange={(e) => setEditFormData({ ...editFormData, port: e.target.value })}
                    className="w-full px-3 py-2 bg-[#152028] border border-[#243139] rounded-[8px] font-mono text-[#edf4f5] focus:outline-none focus:border-[#5ce4bd]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#1b262e]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 bg-[#172127] hover:bg-[#1f2c35] text-[#91a4ae] rounded-[6px] font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#5ce4bd] hover:bg-[#4cd4ad] text-[#0b1015] font-semibold rounded-[6px] shadow-sm"
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
