# PingKu — Lightweight NOC & Server Telemetry Dashboard

<div align="center">

![PingKu Banner](https://img.shields.io/badge/PingKu-NOC%20Telemetry-10b981?style=for-the-badge&logo=server&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-AGPL%20v3-3b82f6?style=for-the-badge)

**Lightweight real-time NOC dashboard and network diagnostic suite designed for Linux servers (Debian 12), homelabs, and network engineers.**

</div>

---

## 📌 Ringkasan Proyek (Overview)

**PingKu** adalah aplikasi web monitoring jaringan dan telemetri server secara *real-time* yang sangat ringan (<60 MB RAM di Linux). Dibuat khusus untuk Network Operation Center (NOC) berskala lab/homelab, siswa/mahasiswa Teknik Komputer Jaringan (TKJ), serta portofolio teknis sistem administrasi & full-stack engineering.

UI/UX dirancang dengan estetika modern bergaya **Beszel**, menggunakan palet *Dark NOC Theme*, kurva bezier animasi pada peta topologi, visualisasi bar ketersediaan (*uptime tick bars*), serta sparkline interaktif bergradasi.

---

## 🏛️ Arsitektur Sistem

```
+------------------------------------------------------------------------+
|                      CLIENT BROWSER (Vite + React)                     |
|                                                                        |
|  [Top Metric Cards]       [Interactive Topology Map]   [Alert Logs]    |
|   - CPU / RAM / Net        - @xyflow/react Bezier       - Severity     |
|   - Sparkline Area         - Device Drawer & CRUD       - Real-Time    |
|                                                                        |
|  [Network Diagnostic Tools Suite]                                      |
|   - Live DNS & Port Checker (Google DoH & BIND9 /api/dns)              |
|   - Interactive VLSM Subnet Calculator (Dynamic Subnets & Math)        |
|   - Live ICMP Ping Monitor (Continuous Prober & RTT Area Chart)        |
|   - TCP Port Scanner (Multi-port Prober: 22, 53, 80, 443, 8291, dll.)  |
|   - IP & ASN Geolocation Intelligence (ISP, Country, Location)         |
+------------------------------------------------------------------------+
         ▲                                                ▲
         │ WebSocket Stream (2s Interval)                 │ REST API
         ▼                                                ▼
+------------------------------------------------------------------------+
|                     BACKEND SERVER (Node.js Express)                   |
|                                                                        |
|  - WebSocket Broadcast Engine (/ws)                                    |
|  - Telemetry Monitor (systeminformation: CPU, RAM, Disk, Net I/O)      |
|  - Probing Engine (net.Socket TCP + ICMP Ping Latency Prober)          |
|  - Status Change Detector & Alerter (UP/DOWN State Transition)         |
|  - REST Endpoints (/api/nodes, /api/dns, /api/ping, /api/port-scan)   |
|  - SQLite Storage (PingKu.db via better-sqlite3)                       |
+------------------------------------------------------------------------+
         ▲
         │ Host-Only / Bridged Network
         ▼
+------------------------------------------------------------------------+
|               DEBIAN 12 SERVER (VM VirtualBox / Physical)              |
|                                                                        |
|  - BIND9 DNS Service (Port 53)                                         |
|  - Web Server & SSH (Port 80, 22)                                      |
|  - MikroTik Router OS (192.168.10.254 - Port 8291)                     |
|  - Client Workstations (LAN 192.168.10.x)                              |
+------------------------------------------------------------------------+
```

---

## ✨ Fitur Utama

### 1. Live Server Telemetry (FR-01)
- Pemantauan otomatis CPU Usage (%), RAM Usage (MB/GB & %), Disk Usage (%), System Uptime, dan Network Traffic (Rx/Tx Kbps) setiap 2 detik.
- Grafik garis (*sparkline area*) dengan kedalaman visual gradien.

### 2. Interactive Topology Map (FR-03)
- Peta diagram jaringan interaktif berbasis `@xyflow/react`.
- Mendukung koneksi relasi *parent-child* dengan kurva bezier dan indikator sinyal bergerak.
- Indikator status perangkat: **Active (Hijau)** saat UP, dan **DOWN (Merah Berkedip + Garis Putus-putus)** saat koneksi terputus.
- *Slide-over drawer* di sisi kanan untuk melihat spesifikasi detail IP, port TCP, riwayat latensi, serta aksi *Test Ping Ulang*, *Edit Node*, dan *Hapus Node*.
- Modal interaktif untuk **+ Add Node** baru ke topologi secara permanen.

### 3. Network Diagnostic Utilities Suite (FR-04)
Semua utilitas beroperasi secara **100% Real-Time**:
1. **Live DNS & Port Checker**:
   - Query record DNS lengkap: `A`, `AAAA`, `NS`, `MX`, dan `TXT` secara langsung via *DNS over HTTPS* (Google & Cloudflare DoH) dan *Local BIND9 Resolver* (`192.168.10.1`).
   - Menghitung waktu respons query (*ms*) dan status record (`NOERROR` / `NXDOMAIN`).
   - Dilengkapi *integrated service port checker* (port 80, 443, 53, 22).
2. **Interactive VLSM Subnet Calculator**:
   - Input Base CIDR (contoh: `192.168.10.0/24`) dengan perhitungan desimal/biner murni di JavaScript.
   - Penambahan dan pengeditan kebutuhan host secara dinamis (`+ Add Subnet`, ubah nama LAN & jumlah host secara instan).
   - Visualisasi alokasi blok IP proporsional (*proportional allocation bar*) bergradien warna.
   - Tabel subnetting lengkap: CIDR, Subnet Mask, Network ID, Usable Range, Broadcast IP, dan Rasio Alokasi Host.
3. **Live ICMP Ping Monitor**:
   - Pengecekan paket ICMP terus-menerus (*continuous ping stream*).
   - Menghitung statistik latensi secara instan: *Min RTT*, *Avg RTT*, *Max RTT*, *Jitter*, dan *Packet Loss %*.
   - Grafik RTT *real-time* dengan riwayat 30 paket terakhir.
4. **TCP Port Scanner**:
   - Pemindaian multi-port cepat (*concurrent prober*) untuk port-port esensial: Port 21 (FTP), 22 (SSH), 53 (DNS BIND9), 80 (HTTP), 443 (HTTPS), 3306 (MySQL), 8080 (Web App), 8291 (MikroTik Winbox).
   - Menampilkan status `OPEN` / `CLOSED` dan waktu latensi koneksi.
5. **IP & ASN Geolocation Intelligence**:
   - Lookup identitas IP publik global, ISP/Organisasi, nomor ASN, negara, kota, timezone, dan rute jaringan.

### 4. Service & Host Status (Beszel-Style)
- Daftar perangkat jaringan dengan visualisasi bilah ketersediaan (*uptime tick bars*).
- Menampilkan status latensi perangkat secara langsung (`1ms UP`, `DOWN`).

### 5. Automated Event & Alert Logging (FR-05)
- Deteksi otomatis perubahan status node (*UP -> DOWN* atau *DOWN -> UP*).
- Deteksi ambang batas penggunaan CPU (*CPU Spike Alert* > 85%).
- Penyimpanan riwayat log ke database SQLite lokal (maksimal 100 log teratas dengan pembersihan otomatis).

---

## 📁 Struktur Direktori

```
PingKu/
├── Server/
│   ├── db.js          # SQLite (better-sqlite3) schema & seed data
│   ├── monitor.js     # systeminformation metrics & TCP/ICMP probing
│   ├── alerter.js     # Status change detector & alert logging
│   ├── index.js       # Express HTTP + WebSocket server (:8080)
│   └── PingKu.db      # File database SQLite lokal
├── Client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopMetricCards.jsx    # Kartu CPU, RAM, Network I/O
│   │   │   ├── TopologyMap.jsx       # Peta Topologi React Flow + Drawer
│   │   │   ├── NetworkToolsHub.jsx   # Hub Navigasi Alat Jaringan
│   │   │   ├── DnsQueryTool.jsx      # DNS & Port Checker Live
│   │   │   ├── VlsmCalculator.jsx    # VLSM Subnet Calculator Dinamis
│   │   │   ├── LivePingTool.jsx      # Live ICMP Ping Prober & Graph
│   │   │   ├── PortScannerTool.jsx   # TCP Port Scanner Multi-Port
│   │   │   ├── IpGeoTool.jsx         # IP & ASN Geolocation Intelligence
│   │   │   ├── ServiceHostStatus.jsx # Bilah Ketersediaan Uptime Ticks
│   │   │   └── AlertLogPanel.jsx     # Tabel Alert Logs Riwayat Kejadian
│   │   ├── hooks/
│   │   │   └── useTelemetry.js       # WebSocket hook koneksi live :8080/ws
│   │   ├── App.jsx                   # Layout utama & Sidebar navigasi
│   │   ├── main.jsx                  # React DOM entrypoint
│   │   └── index.css                 # Tailwind v4 & gaya NOC dark theme
│   ├── package.json
│   └── vite.config.js
├── AGENTS.md                         # Aturan & kontrak pengembangan AI
└── README.md
```

---

## 🚀 Panduan Instalasi & Menjalankan

### Persyaratan Sistem
- Node.js versi 18 atau lebih baru.
- Linux (Ubuntu/Debian/Alpine/Arch), Windows 10/11, atau macOS.

---

### Opsi 1: Mode Standalone Production (Satu Perintah — Direkomendasikan)
Express backend secara otomatis menyajikan frontend production build dari port `8080`:

```bash
# 1. Clone repositori
git clone https://github.com/username/PingKu.git
cd PingKu

# 2. Setup semua dependensi & build frontend
npm run setup

# 3. Jalankan aplikasi
npm start
```
*Buka browser di **`http://localhost:8080`**.*  
Sistem akan otomatis menjalankan **Zero-Config Auto-Discovery** dan langsung memetakan IP host, gateway, serta service lokal kamu!

> **Tip Port Conflict:** Jika port `8080` sudah digunakan oleh aplikasi lain, cukup jalankan dengan:
> * Linux/macOS: `PORT=8081 npm start`
> * Windows PowerShell: `$env:PORT="8081"; npm start`

---

### Opsi 2: Mode Development (Hot-Reload)
Jika kamu ingin mengembangkan atau memodifikasi kode:

```bash
# Terminal 1 — Jalankan Backend Server (:8080)
npm run server

# Terminal 2 — Jalankan Vite Frontend Dev Server (:5173)
npm run client
```
*Buka browser di **`http://localhost:5173`**.*

---

## 🔍 Fitur Zero-Config Auto-Discovery & Command Palette

1. **Zero-Configuration Auto-Discovery**:
   - Backend memindai interface jaringan lokal (`eth0`, `Wi-Fi`, `ens33`) dan default gateway router (`si.networkGatewayDefault()`).
   - Memindai service lokal yang sedang aktif (`80/443` Web, `22` SSH, `3306` MySQL, `5432` Postgres, `6379` Redis, `8291` Winbox) dan langsung memetakannya ke diagram topologi.
   - Tombol **"Auto-Discover"** di Topology Map memungkinkan pemindaian ulang kapan saja saat kamu menyalakan service baru.

2. **Global Search & Command Palette (`Ctrl + K` / `⌘ K`)**:
   - Akses cepat untuk mencari nama node, alamat IP, dan log insiden.
   - Jika kamu mengetik alamat IP atau domain apa saja, langsung tersedia tombol aksi cepat: **Jalankan Live Ping**, **Pindai Port Terbuka**, dan **Cek DNS Query**.

---

## 🧪 Skenario Pengujian Nyata di VM Debian 12 (Tahap 4)

Untuk menguji kemampuan pemantauan di lingkungan homelab/jaringan nyata:

1. **Konfigurasi Jaringan VM**:
   - Pasang adapter jaringan VM Debian 12 ke mode **Host-Only Adapter** (misal: `192.168.10.2`) atau **Bridged Adapter**.
2. **Jalankan Backend di Debian**:
   - Transfer folder `Server` ke VM Debian.
   - Jalankan `node index.js`.
3. **Simulasi Downtime Layanan**:
   - Di terminal VM Debian, matikan layanan DNS BIND9:
     ```bash
     sudo systemctl stop bind9
     ```
   - **Hasil di Dashboard PingKu**:
     - Node `DNS Server BIND9` di Peta Topologi secara otomatis berubah menjadi **Merah Berkedip** dengan garis putus-putus (**DOWN**).
     - Di tabel **Recent Alert Logs**, langsung muncul log baru:
       `[CRITICAL] DNS Server BIND9 (192.168.10.1:53) is DOWN: Connection failed/timeout`.
   - Nyalakan kembali layanan:
     ```bash
     sudo systemctl start bind9
     ```
   - Node otomatis kembali **Hijau (Active)** dan log mencatat status **RESOLVED**.

---

## 📡 Spesifikasi API & Kontrak Data

### Paket WebSocket (`ws://localhost:8080/ws`, broadcast setiap 2 detik)
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

### REST API Endpoints
| Metode | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/nodes` | Mendapatkan seluruh daftar perangkat dan posisi topologi |
| `POST` | `/api/nodes` | Menambahkan node baru ke database |
| `PUT` | `/api/nodes/:id` | Memperbarui informasi atau posisi koordinat node |
| `DELETE` | `/api/nodes/:id` | Menghapus node dari topologi |
| `POST` | `/api/nodes/:id/ping` | Melakukan tes koneksi manual ke satu node tertentu |
| `GET` | `/api/ping?host=...` | Menguji paket ICMP ping ke target host secara langsung |
| `POST` | `/api/port-scan` | Melakukan TCP port scan cepat terhadap target host |
| `GET` | `/api/dns?domain=...&resolver=...` | Melakukan lookup DNS (A, AAAA, NS, MX, TXT) |
| `GET` | `/api/logs` | Mengambil 50 riwayat alert log terbaru |

---

## 📄 Lisensi (License)

Copyright (C) 2026 Arjuna Setya Ramadhani.

Proyek ini dilisensikan di bawah ketentuan **GNU Affero General Public License v3.0 (AGPL-3.0)**.  
Lihat berkas [`LICENSE`](file:///d:/Juna%20Task/PingKu/LICENSE) untuk rincian lengkap mengenai hak penggunaan, distribusi, dan modifikasi kode sumber terbuka.
