/**
 * PingKu — Lightweight NOC & Server Telemetry Dashboard
 * Copyright (C) 2026 Arjuna Setya Ramadhani.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
 *
 * schoolTopologyData.js — Dataset Topologi Jaringan Server Skala Besar (Sekolah / Kampus / Enterprise)
 * Tata letak berjarak lega (spacious), bebas tumpang tindih (zero overlap), dan mudah dipahami.
 */

export const SCHOOL_TOPOLOGY_NODES = [
  // ==========================================
  // TIER 1: INTERNET EDGE & ROUTER GATEWAY (KOLOM 1)
  // ==========================================
  {
    id: 'gw-core',
    label: 'Router Gateway (MikroTik CCR2004)',
    type: 'router',
    ip_address: '10.0.0.1',
    port: 8291,
    parent_id: null,
    pos_x: 60,
    pos_y: 580,
    status: 'UP',
    latency_ms: 1,
    role: 'Edge Router & Bandwidth Management',
    location: 'Ruang Server NOC'
  },

  // ==========================================
  // TIER 2: CORE SWITCH LAYER 3 (KOLOM 2)
  // ==========================================
  {
    id: 'sw-core',
    label: 'Core Switch L3 (Cisco Catalyst 3850)',
    type: 'switch',
    ip_address: '10.0.0.2',
    port: 22,
    parent_id: 'gw-core',
    pos_x: 370,
    pos_y: 720,
    status: 'UP',
    latency_ms: 1,
    role: 'VLAN Trunking & 10G SFP+ Backbone',
    location: 'Rack NOC Utama'
  },

  // ==========================================
  // TIER 3: DISTRIBUTION SWITCHES & CORE SERVERS (KOLOM 3)
  // ==========================================
  {
    id: 'srv-cbt-main',
    label: 'Server Utama CBT / ANBK',
    type: 'server',
    ip_address: '10.0.10.10',
    port: 80,
    parent_id: 'sw-server',
    pos_x: 680,
    pos_y: 80,
    status: 'UP',
    latency_ms: 1,
    role: 'Ujian Berbasis Komputer & Simulasi Nasional',
    location: 'Rack Server 01'
  },
  {
    id: 'sw-server',
    label: 'Switch Distribusi Server Farm',
    type: 'switch',
    ip_address: '10.0.0.3',
    port: 22,
    parent_id: 'sw-core',
    pos_x: 680,
    pos_y: 220,
    status: 'UP',
    latency_ms: 1,
    role: 'Dedicated Gigabit Switch Data Center',
    location: 'Rack Server 01'
  },
  {
    id: 'srv-moodle',
    label: 'Server E-Learning Moodle (LMS)',
    type: 'server',
    ip_address: '10.0.10.15',
    port: 443,
    parent_id: 'sw-server',
    pos_x: 680,
    pos_y: 360,
    status: 'UP',
    latency_ms: 1,
    role: 'Portal Belajar & Materi Siswa Online',
    location: 'Rack Server 02'
  },
  {
    id: 'sw-lab-cbt',
    label: 'Switch Distribusi Lab CBT',
    type: 'switch',
    ip_address: '10.0.0.4',
    port: 22,
    parent_id: 'sw-core',
    pos_x: 680,
    pos_y: 680,
    status: 'UP',
    latency_ms: 1,
    role: 'Fiber Optic Uplink ke Lab Komputer',
    location: 'Gedung Lab TIK'
  },
  {
    id: 'sw-kantor',
    label: 'Switch Distribusi Kantor & TU',
    type: 'switch',
    ip_address: '10.0.0.5',
    port: 22,
    parent_id: 'sw-core',
    pos_x: 680,
    pos_y: 870,
    status: 'UP',
    latency_ms: 2,
    role: 'Distribusi Jaringan Administrasi & Guru',
    location: 'Gedung Administrasi'
  },

  // ==========================================
  // TIER 4: SERVERS & PERIPHERALS (KOLOM 4)
  // ==========================================
  {
    id: 'srv-cbt-backup',
    label: 'Server CBT Cadangan (Replica)',
    type: 'server',
    ip_address: '10.0.10.11',
    port: 80,
    parent_id: 'sw-server',
    pos_x: 990,
    pos_y: 80,
    status: 'UP',
    latency_ms: 2,
    role: 'Failover Sinkronisasi Ujian',
    location: 'Rack Server 01'
  },
  {
    id: 'srv-siakad',
    label: 'Server Database SIAKAD (MySQL)',
    type: 'server',
    ip_address: '10.0.10.20',
    port: 3306,
    parent_id: 'sw-server',
    pos_x: 990,
    pos_y: 180,
    status: 'UP',
    latency_ms: 2,
    role: 'Database Akademik, Raport & Presensi',
    location: 'Rack Server 02'
  },
  {
    id: 'srv-slims',
    label: 'Server Perpustakaan (SLiMS)',
    type: 'server',
    ip_address: '10.0.10.25',
    port: 8080,
    parent_id: 'sw-server',
    pos_x: 990,
    pos_y: 280,
    status: 'UP',
    latency_ms: 3,
    role: 'Katalog Buku & Peminjaman Online',
    location: 'Ruang Perpustakaan'
  },
  {
    id: 'srv-web-school',
    label: 'Server Web Profil Sekolah',
    type: 'server',
    ip_address: '10.0.10.35',
    port: 443,
    parent_id: 'sw-server',
    pos_x: 990,
    pos_y: 380,
    status: 'UP',
    latency_ms: 2,
    role: 'Portal Informasi Publik & PPDB Online',
    location: 'Rack Server 02'
  },
  {
    id: 'nas-backup-storage',
    label: 'Storage NAS & Backup (TrueNAS)',
    type: 'server',
    ip_address: '10.0.10.30',
    port: 5000,
    parent_id: 'sw-server',
    pos_x: 990,
    pos_y: 480,
    status: 'UP',
    latency_ms: 2,
    role: 'Arsip Data Sekolah & Backup Harian',
    location: 'Ruang Server NOC'
  },
  {
    id: 'srv-cctv-nvr',
    label: 'Server CCTV NVR (32 Channel)',
    type: 'server',
    ip_address: '10.0.10.40',
    port: 8000,
    parent_id: 'sw-server',
    pos_x: 990,
    pos_y: 580,
    status: 'UP',
    latency_ms: 2,
    role: 'Rekaman Keamanan Gedung & Parkir',
    location: 'Pos Keamanan'
  },
  {
    id: 'srv-proktor-lab1',
    label: 'PC Proktor Lab Komputer 1',
    type: 'client',
    ip_address: '10.0.20.10',
    port: 3389,
    parent_id: 'sw-lab-cbt',
    pos_x: 990,
    pos_y: 680,
    status: 'UP',
    latency_ms: 2,
    role: 'Komputer Pengendali Ujian CBT 40 Klien',
    location: 'Lab Komputer 1'
  },
  {
    id: 'ap-lab-komputer',
    label: 'Access Point Wi-Fi Lab TIK',
    type: 'router',
    ip_address: '10.0.20.2',
    port: 80,
    parent_id: 'sw-lab-cbt',
    pos_x: 990,
    pos_y: 775,
    status: 'UP',
    latency_ms: 1,
    role: 'Wireless Access Area Praktikum',
    location: 'Lab Komputer 2'
  },
  {
    id: 'srv-dapodik-tu',
    label: 'PC Operator Dapodik & TU',
    type: 'client',
    ip_address: '10.0.40.10',
    port: 80,
    parent_id: 'sw-kantor',
    pos_x: 990,
    pos_y: 870,
    status: 'UP',
    latency_ms: 2,
    role: 'Sinkronisasi Data Kemdikbud & Arsip Siswa',
    location: 'Ruang Tata Usaha'
  },
  {
    id: 'ap-ruang-guru',
    label: 'Access Point Wi-Fi Ruang Guru',
    type: 'router',
    ip_address: '10.0.40.1',
    port: 80,
    parent_id: 'sw-kantor',
    pos_x: 990,
    pos_y: 965,
    status: 'UP',
    latency_ms: 2,
    role: 'Wireless Dedicated Guru & Staff',
    location: 'Lantai 2 Ruang Guru'
  },

  // ==========================================
  // TIER 5: EXTERNAL HOTSPOT AP (KOLOM 5)
  // ==========================================
  {
    id: 'srv-radius-hotspot',
    label: 'Server Radius & Hotspot',
    type: 'server',
    ip_address: '10.0.10.5',
    port: 1812,
    parent_id: 'sw-server',
    pos_x: 1300,
    pos_y: 330,
    status: 'UP',
    latency_ms: 1,
    role: 'Autentikasi Login Wi-Fi Sekolah',
    location: 'Ruang Server NOC'
  }
];

export const SCHOOL_SERVICE_STATUS_SUMMARY = [
  { label: 'Router Gateway (CCR2004)', status: 'UP', latency: '1 ms UP', ticks: 30, isDown: false },
  { label: 'Core Switch L3 (Catalyst 3850)', status: 'UP', latency: '1 ms UP', ticks: 30, isDown: false },
  { label: 'Server Utama CBT / ANBK', status: 'UP', latency: '1 ms UP', ticks: 30, isDown: false },
  { label: 'Server Database SIAKAD', status: 'UP', latency: '2 ms UP', ticks: 30, isDown: false },
  { label: 'Server E-Learning Moodle', status: 'UP', latency: '1 ms UP', ticks: 30, isDown: false },
  { label: 'Storage NAS & Backup (TrueNAS)', status: 'UP', latency: '2 ms UP', ticks: 30, isDown: false },
  { label: 'PC Proktor Lab CBT', status: 'UP', latency: '2 ms UP', ticks: 30, isDown: false },
];
