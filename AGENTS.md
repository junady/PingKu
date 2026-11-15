# AGENTS.md — PingKu Development Rules & Contracts

## Project Overview
**PingKu** adalah Lightweight NOC & Server Telemetry Dashboard real-time berbasis Node.js (backend) dan React + Tailwind CSS + @xyflow/react (frontend).

---

## 1. Project Directory Structure
```
PingKu/
├── Server/
│   ├── db.js          # SQLite (better-sqlite3) schema & seed data
│   ├── monitor.js     # systeminformation metrics & TCP/ICMP probing
│   ├── alerter.js     # Status change detector & alert logging
│   ├── index.js       # Express HTTP + WebSocket server (:8080)
│   └── PingKu.db      # SQLite database file
├── Client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopMetricCards.jsx    # CPU, RAM, Network I/O
│   │   │   ├── TopologyMap.jsx       # Interactive React Flow map
│   │   │   ├── DnsQueryTool.jsx      # DNS & Port Checker
│   │   │   ├── VlsmCalculator.jsx    # VLSM Subnet Calculator
│   │   │   ├── ServiceHostStatus.jsx # Real-time host uptime bars
│   │   │   └── AlertLogPanel.jsx     # Recent Alert Logs table
│   │   ├── hooks/
│   │   │   └── useTelemetry.js       # WebSocket & Demo Mode telemetry hook
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── AGENTS.md
```

---

## 2. Database Schema (SQLite — `PingKu.db`)

### Table: `nodes`
- `id` (TEXT PRIMARY KEY) — e.g. `'node-1'`
- `label` (TEXT NOT NULL) — e.g. `'Router MikroTik'`
- `type` (TEXT NOT NULL) — `'router'`, `'switch'`, `'server'`, `'client'`
- `ip_address` (TEXT NOT NULL) — e.g. `'192.168.10.1'`
- `port` (INTEGER DEFAULT 0) — e.g. `53`, `80`, `22`, or `0` for ICMP ping
- `parent_id` (TEXT, NULLABLE) — Parent node id for tree connection
- `pos_x` (REAL DEFAULT 0), `pos_y` (REAL DEFAULT 0) — React Flow coordinates

### Table: `alert_logs`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `timestamp` (DATETIME DEFAULT CURRENT_TIMESTAMP)
- `severity` (TEXT NOT NULL) — `'INFO'`, `'WARNING'`, `'CRITICAL'`, `'RESOLVED'`
- `message` (TEXT NOT NULL)

---

## 3. Data Contracts

### 3.1 WebSocket Telemetry Packet (`ws://localhost:8080/ws`, broadcast every 2s)
```json
{
  "timestamp": "2026-11-15T11:50:02Z",
  "system": {
    "cpu_percent": 14.2,
    "ram_used_mb": 512,
    "ram_total_mb": 2048,
    "disk_percent": 35.0,
    "uptime_sec": 86400,
    "net_rx_kbps": 124.5,
    "net_tx_kbps": 48.1
  },
  "nodes": [
    { "id": "node-1", "status": "UP", "latency_ms": 1 },
    { "id": "node-2", "status": "DOWN", "latency_ms": null }
  ],
  "latest_alert": null
}
```

### 3.2 REST API Endpoints
- `GET /api/nodes` — Return array of all nodes in DB
- `POST /api/nodes` — Create node `{ label, type, ip_address, port, parent_id, pos_x, pos_y }`
- `PUT /api/nodes/:id` — Update node details or position `{ pos_x, pos_y, ... }`
- `DELETE /api/nodes/:id` — Delete node and unparent its children
- `GET /api/dns?domain=...&resolver=...` — Perform DNS query (`A`, `AAAA`, `NS`, `MX`, `TXT`)
- `GET /api/logs` — Get latest 50 alert logs

---

## 4. UI/UX & Design Guidelines
- Dark NOC Theme: Background `#0b0f19` / `#0f172a`, card backgrounds `#111827`, border `#1e293b`.
- Topology Canvas: Light theme canvas (`#ffffff` / `#f8fafc`) with subtle dot grid, custom node cards, curved bezier edges with arrows and animated flowing markers.
- Node detail drawer: Slide-over right drawer with host details, latency history sparkline, and ping/edit/delete actions.
- Multi-Tab Navigation: Overview (Metrics, Host Uptime Bars, Alert Logs), Topology Map, Network Tools (DNS & Port Checker, VLSM Calculator).
