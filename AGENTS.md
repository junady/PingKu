# AGENTS.md — PingKu Project Context, Technical Architecture & Development Rules

> **PingKu** — Lightweight NOC & Server Telemetry Dashboard  
> **Copyright (C) 2026 Arjuna Setya Ramadhani**  
> **License:** GNU Affero General Public License v3.0 (AGPL-3.0)  
> **Status:** Production-Ready & Open Source

---

## 1. Project Context & Philosophy

### 1.1 What is PingKu?
**PingKu** adalah aplikasi monitoring jaringan (*Network Operation Center* / NOC) dan telemetri server secara *real-time* yang dirancang dengan arsitektur sangat ringan (*lightweight*, konsumsi RAM <60 MB di Linux). Aplikasi ini memadukan backend Node.js (Express + WebSocket) dengan frontend modern berbasis React, Tailwind CSS, dan diagram topologi interaktif `@xyflow/react`.

### 1.2 Core Architectural Principles for AI Agents
1. **Zero-Config Auto-Discovery**:
   Saat aplikasi dijalankan di server baru (misal Debian, Ubuntu, Windows, atau macOS), sistem secara dinamis mendeteksi sistem operasi, hostname asli, IP interface lokal utama, gateway router, serta port-port service lokal yang sedang aktif tanpa memerlukan konfigurasi database manual.
2. **Single-Process Standalone Deployment**:
   Backend Express di `Server/index.js` mengompilasi dan melayani aset frontend produksi dari `Client/dist` secara statis di port `8080` (dapat diubah via `PORT`), sehingga pengguna cukup menjalankan `npm start` untuk mengaktifkan seluruh sistem dalam 1 perintah.
3. **No Heavy External Agents**:
   Tidak memerlukan *agent* berat eksternal seperti Prometheus, Grafana, atau Telegraf. Semua metrik diambil melalui pustaka bawaan `systeminformation`, `os`, dan socket TCP/ICMP non-blocking.
4. **Privacy-First & Secure by Design**:
   - Database SQLite disimpan lokal di `Server/PingKu.db` dan **WAJIB di-ignore** oleh git.
   - Fitur diagnostik jaringan (DNS Lookup, Port Scanner, Continuous Ping) **TIDAK BOLEH** menggunakan `child_process.exec()` yang rawan *command injection*. Wajib menggunakan modul bawaan Node.js (`dns.promises` dan `net.Socket`).

---

## 2. Directory Structure & Key Files

```
PingKu/
├── .env.example                       # Contoh variabel lingkungan root (PORT, RESOLVER)
├── .gitignore                         # Sanitasi data: mengabaikan *.db, .env, node_modules/
├── LICENSE                            # GNU AGPL-3.0 (Free Software Foundation)
├── package.json                       # Root scripts: setup, start, server, client, build
├── README.md                          # Dokumentasi publik & panduan instalasi
├── AGENTS.md                          # File panduan dan kontrak teknis untuk AI Agents
│
├── Server/                            # Backend Engine (Node.js Express + WebSocket)
│   ├── .env.example                   # Contoh konfigurasi backend (PORT=8080, DB_PATH)
│   ├── index.js                       # Express HTTP + WebSocket server (:8080) & REST API
│   ├── monitor.js                     # Telemetri systeminformation, host metadata, TCP/ICMP probe
│   ├── discovery.js                   # Auto-discovery router gateway & local listening services
│   ├── alerter.js                     # Status transition detector (UP/DOWN) & alert logger
│   ├── db.js                          # SQLite schema initialization (better-sqlite3) & dynamic seeding
│   ├── package.json                   # Backend dependencies
│   └── PingKu.db                      # Local SQLite file (GIT IGNORED - JANGAN DI-COMMIT)
│
└── Client/                            # Frontend SPA (Vite + React + Tailwind CSS)
    ├── package.json                   # Frontend dependencies (@xyflow/react, lucide-react)
    ├── vite.config.js                 # Konfigurasi Vite build & server proxy
    ├── dist/                          # Production bundle (disajikan statis oleh backend)
    └── src/
        ├── main.jsx                   # React entry point
        ├── App.jsx                    # Layout utama, sidebar, navigation, global shortcut
        ├── index.css                  # Obsidian NOC color palette & custom styles
        ├── assets/
        │   └── pingku-logo.png        # Logo resmi PingKu (PERTANDATANGAN BRAND - JANGAN DIHAPUS)
        ├── hooks/
        │   └── useTelemetry.js        # Hook telemetri live WebSocket, dynamic reconnect, & REST sync
        ├── utils/
        │   └── settings.js            # Penyimpanan pengaturan persisten di localStorage & event bus
        └── components/
            ├── TopMetricCards.jsx         # Kartu ringkasan CPU, RAM, Disk, dan Network Rx/Tx
            ├── SystemPerformanceChart.jsx # Grafik canvas performa CPU & RAM dengan filter waktu
            ├── TopologyMap.jsx            # Peta diagram topologi interaktif (@xyflow/react)
            ├── ServiceHostStatus.jsx      # Bar ketersediaan status host (uptime ticks)
            ├── RecentAlertsCard.jsx       # Kartu peringatan insiden terbaru (Warning/Critical)
            ├── NetworkToolsHub.jsx        # Suite diagnostik (DNS, VLSM, Ping, Port Scan, GeoIP)
            ├── ConnectionLogsView.jsx     # Tabel riwayat log koneksi dan audit insiden
            ├── SettingsView.jsx           # Form koneksi backend, tes latensi, & auto-discovery
            └── GlobalSearchPalette.jsx    # Spotlight / Command Palette (Ctrl+K / ⌘K)
```

---

## 3. Database Schema (SQLite — `PingKu.db`)

Dikelola melalui `better-sqlite3` di `Server/db.js`:

### 3.1 Table: `nodes`
Menyimpan perangkat dan service jaringan yang dipantau dalam topologi.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | ID unik node (e.g. `'gateway-router'`, `'web-server'`) |
| `label` | TEXT | NOT NULL | Nama label tampilan (e.g. `'Router Gateway (192.168.1.1)'`) |
| `type` | TEXT | NOT NULL | Kategori: `'router'`, `'switch'`, `'server'`, `'client'` |
| `ip_address`| TEXT | NOT NULL | IP host atau domain yang dipantau |
| `port` | INTEGER | DEFAULT 0 | Port TCP (misal `80`, `443`, `22`, `3306`) atau `0` untuk ICMP ping |
| `parent_id` | TEXT | NULLABLE | ID parent untuk membangun garis relasi pohon di topologi |
| `pos_x` | REAL | DEFAULT 200 | Posisi koordinat X di kanvas React Flow |
| `pos_y` | REAL | DEFAULT 200 | Posisi koordinat Y di kanvas React Flow |

### 3.2 Table: `alert_logs`
Menyimpan riwayat perubahan status perangkat dan peringatan beban sistem.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | ID sekuensial log |
| `timestamp`| DATETIME| DEFAULT CURRENT_TIMESTAMP | Waktu pencatatan insiden |
| `severity` | TEXT | NOT NULL | `'INFO'`, `'WARNING'`, `'CRITICAL'`, `'RESOLVED'` |
| `message` | TEXT | NOT NULL | Deskripsi detail log kejadian |

---

## 4. Communication & Data Contracts

### 4.1 WebSocket Broadcast Packet (`ws://<host>:<port>/ws` — Interval: 2 detik)
Backend menyiarkan snapshot kesehatan server dan status node setiap 2 detik ke seluruh client yang terhubung:
```json
{
  "timestamp": "2026-11-16T04:05:00.000Z",
  "system": {
    "os_distro": "Debian GNU/Linux 12 (bookworm)",
    "os_hostname": "noc-server-01",
    "os_arch": "x64",
    "cpu_brand": "Intel(R) Xeon(R) CPU E5-2680 v4",
    "cpu_cores": 16,
    "node_version": "v20.11.0",
    "cpu_percent": 12.4,
    "ram_used_mb": 1420,
    "ram_total_mb": 16000,
    "disk_percent": 38.5,
    "uptime_sec": 124500,
    "net_rx_kbps": 245.8,
    "net_tx_kbps": 112.3
  },
  "nodes": [
    { "id": "gateway-router", "status": "UP", "latency_ms": 1 },
    { "id": "web-server", "status": "UP", "latency_ms": 4 },
    { "id": "db-server", "status": "DOWN", "latency_ms": null }
  ],
  "latest_alert": null
}
```

### 4.2 REST API Specifications
- `GET /api/nodes` — Mendapatkan semua daftar node di database.
- `POST /api/nodes` — Membuat node baru `{ label, type, ip_address, port, parent_id, pos_x, pos_y }`.
- `PUT /api/nodes/:id` — Memperbarui informasi atau posisi drag & drop node di kanvas.
- `DELETE /api/nodes/:id` — Menghapus node dan melepaskan keterkaitan children (`parent_id = NULL`).
- `POST /api/nodes/:id/ping` — Menjalankan uji ping/port ulang secara manual pada node tertentu.
- `GET /api/dns?domain=<domain>&resolver=<ip>` — Query DNS multi-record (`A`, `AAAA`, `NS`, `MX`, `TXT`) menggunakan `dns.promises`.
- `GET /api/dns/port?host=<host>&port=<port>` — Uji koneksi port TCP tunggal menggunakan `net.Socket`.
- `GET /api/dns/quick-scan?host=<host>` — Pemindaian simultan ke 8 port esensial (`21, 22, 53, 80, 443, 3306, 8080, 8291`).
- `GET /api/discovery` — Membaca metadata LAN, IP gateway, dan daftar port service yang terdeteksi aktif.
- `POST /api/discovery/scan` — Memicu pemindaian auto-discovery dan menyinkronkannya langsung ke database tabel `nodes`.
- `GET /api/logs` — Mengambil 50 data log insiden terbaru.

---

## 5. UI/UX Design System (Figma & Obsidian NOC Token)

Semua AI Agent yang mengedit antarmuka pengguna **WAJIB** mematuhi token desain berikut:
* **Background Utama**: `#0b1015` (Obsidian Dark)
* **Card & Surface Background**: `#111921` (Slate Surface)
* **Borders & Dividers**: `#1f2c35` dan `#1b262e`
* **Accent Primary (Mint Green)**: `#5ce4bd` (Status UP, Button CTA, Highlight)
* **Accent Warning (Amber)**: `#f3a63b` (Latency Sedang, Peringatan)
* **Accent Danger (Coral Red)**: `#f29583` (Status DOWN, Critical Alert)
* **Text High Contrast**: `#edf4f5` (Judul, Metrik Utama)
* **Text Muted / Subtitle**: `#91a4ae` dan `#657d89`
* **Topology Canvas**: Kanvas berlatar terang-netral bersih (`#f8fafc`) dengan titik grid halus (`#cbd5e1`) agar diagram arsitektur kabel dan status link mudah dibaca saat presentasi NOC.

---

## 6. Critical Rules & Guardrails for AI Agents

1. **NO RAW SHELL COMMAND INJECTION**:
   Jangan pernah menggunakan `child_process.exec()` dengan input dari pengguna (seperti hostname atau IP dari request query). Selalu gunakan modul jaringan resmi Node.js:
   - DNS: `dns.promises.resolve*`
   - Port Scanning: `net.Socket` dengan `socket.setTimeout(timeoutMs)`
   - ICMP Ping: Lakukan validasi ketat regex IP/hostname dan sertakan hard timeout pada `exec`.

2. **KEEP `.gitignore` ENFORCED**:
   File database lokal (`PingKu.db`, `*.db-journal`, `*.sqlite*`) dan `.env` tidak boleh di-commit ke Git. Jika membuat tabel baru, lakukan melalui migrasi kode di `Server/db.js`.

3. **DYNAMIC OS & HOSTNAME ONLY**:
   Jangan pernah melakukan *hardcode* nama sistem operasi (misal `"Debian 12"`) atau hostname di UI. Selalu gunakan nilai dinamis dari `system.os_distro` dan `system.os_hostname` yang disediakan oleh `Server/monitor.js`.

4. **HOT-RECONNECT CONTRACT**:
   Jika mengubah konfigurasi backend di `SettingsView.jsx`, selalu simpan ke `localStorage` via `saveAppSettings()` di `Client/src/utils/settings.js`. Ini akan memicu event `pingku_settings_changed` yang didengar oleh `useTelemetry.js` untuk melakukan *reconnect* seketika tanpa me-refresh browser.

5. **PRODUCTION BUILD SYNC**:
   Aplikasi didistribusikan sebagai single binary/process di mana Express melayani `Client/dist`. Jika melakukan perubahan pada komponen React di folder `Client/`, selalu pastikan untuk menjalankan `npm --prefix Client run build` sebelum menyelesaikan tugas.

6. **BRANDING & COPYRIGHT**:
   - Nama produk: **PingKu** (bukan NetPulse).
   - Hak Cipta: **Copyright (C) 2026 Arjuna Setya Ramadhani**.
   - Lisensi: **AGPL-3.0**. File `LICENSE` asli dari Free Software Foundation (FSF) tidak boleh diubah header aslinya.
   - Logo `Client/src/assets/pingku-logo.png` harus dipertahankan.
