/**
 * PingKu — Lightweight NOC & Server Telemetry Dashboard
 * Copyright (C) 2026 Arjuna Setya Ramadhani.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
 *
 * DemoLandingView.jsx — High-Fidelity Landing Page & Interactive Showcase
 * Pixel-accurate Figma design adaptation for PingKu.
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDown,
  RotateCw,
  Check,
  ExternalLink,
  ChevronDown,
  Plus,
  Share2,
  Wrench,
  FileText
} from 'lucide-react';
import pingkuLogo from '../assets/pingku-logo.png';

export default function DemoLandingView({
  system,
  onOpenLiveDashboard
}) {
  // Navigation active state based on scroll
  const [activeNav, setActiveNav] = useState('');

  // Interactive state for Topology Showcase drawer (default: Server Utama CBT Sekolah)
  const [selectedDemoNode, setSelectedDemoNode] = useState('srv-cbt-main');
  const [isPingTesting, setIsPingTesting] = useState(false);
  const [pingResultText, setPingResultText] = useState('1 ms');
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);

  // Interactive state for Diagnostics Showcase
  const [activeDiagTab, setActiveDiagTab] = useState('ping');

  // Interactive state for Extra FAQ Accordion
  const [openExtraFaq, setOpenExtraFaq] = useState(null);

  // Scroll spy to highlight active section in Navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fiturEl = document.getElementById('fitur');
      const caraKerjaEl = document.getElementById('cara-kerja');
      const faqEl = document.getElementById('faq');

      if (faqEl && scrollY >= faqEl.offsetTop - 140) {
        setActiveNav('faq');
      } else if (caraKerjaEl && scrollY >= caraKerjaEl.offsetTop - 140) {
        setActiveNav('cara-kerja');
      } else if (fiturEl && scrollY >= fiturEl.offsetTop - 140) {
        setActiveNav('fitur');
      } else {
        setActiveNav('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll helper with header offset
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -92;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveNav(id);
    }
  };

  // Showcase nodes data: Topologi Server Skala Besar (Sekolah / Kampus)
  const showcaseNodes = [
    {
      id: 'gw-core',
      label: 'Router Gateway (MikroTik CCR2004)',
      ip: '10.0.0.1',
      port: 8291,
      type: 'router',
      status: 'UP',
      latency: '1 ms',
      role: 'Edge Router & Bandwidth Management',
      location: 'Ruang Server NOC'
    },
    {
      id: 'sw-core',
      label: 'Core Switch L3 (Cisco Catalyst 3850)',
      ip: '10.0.0.2',
      port: 22,
      type: 'switch',
      status: 'UP',
      latency: '1 ms',
      role: 'VLAN Trunking & 10G SFP+ Backbone',
      location: 'Rack NOC Utama'
    },
    {
      id: 'srv-cbt-main',
      label: 'Server Utama CBT / ANBK',
      ip: '10.0.10.10',
      port: 80,
      type: 'server',
      status: 'UP',
      latency: '1 ms',
      role: 'Ujian Berbasis Komputer & Simulasi Nasional',
      location: 'Rack Server 01'
    },
    {
      id: 'srv-siakad',
      label: 'Server Database SIAKAD (MySQL)',
      ip: '10.0.10.20',
      port: 3306,
      type: 'server',
      status: 'UP',
      latency: '2 ms',
      role: 'Database Akademik, Raport & Nilai',
      location: 'Rack Server 02'
    },
    {
      id: 'srv-moodle',
      label: 'Server E-Learning Moodle (LMS)',
      ip: '10.0.10.15',
      port: 443,
      type: 'server',
      status: 'UP',
      latency: '1 ms',
      role: 'Portal Belajar & Materi Siswa Online',
      location: 'Rack Server 02'
    },
    {
      id: 'nas-backup',
      label: 'Storage NAS & Backup Sekolah (TrueNAS)',
      ip: '10.0.10.30',
      port: 5000,
      type: 'server',
      status: 'UP',
      latency: '2 ms',
      role: 'Arsip Data Sekolah & Backup Harian',
      location: 'Ruang Server NOC'
    },
    {
      id: 'srv-proktor-lab1',
      label: 'PC Server Proktor Lab CBT',
      ip: '10.0.20.10',
      port: 3389,
      type: 'client',
      status: 'UP',
      latency: '2 ms',
      role: 'Komputer Pengendali Ujian CBT 40 Klien',
      location: 'Lab Komputer 1'
    }
  ];

  const currentNode = showcaseNodes.find((n) => n.id === selectedDemoNode) || showcaseNodes[2];

  // Simulated ping action in Topology Drawer
  const handleTestPing = () => {
    setIsPingTesting(true);
    setTimeout(() => {
      setIsPingTesting(false);
      if (currentNode.status === 'UP') {
        const fakeLatency = Math.floor(Math.random() * 2) + 1;
        setPingResultText(`${fakeLatency} ms`);
      } else {
        setPingResultText('TIMEOUT');
      }
    }, 500);
  };

  // 30 uptime ticks generator matching Figma
  const renderUptimeTicks = (isDown = false, count = 28) => {
    return (
      <div className="flex items-center gap-[3px]">
        {Array.from({ length: count }).map((_, idx) => {
          const isRed = isDown && idx >= count - 6;
          return (
            <div
              key={idx}
              className={`w-[4px] h-[11px] rounded-[1px] transition-colors ${
                isRed ? 'bg-[#f58083]' : 'bg-[#57ba8d]'
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070b0f] text-[#f3f7f8] font-sans antialiased selection:bg-[#6ce5b1]/30 selection:text-[#f3f7f8]">
      {/* =========================================================================
          1. NAVIGATION HEADER (Height 88px, border-b #233039)
          Logo natural, perbesar sesuai instruksi, tombol GitHub repo di kanan.
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#070b0f]/95 backdrop-blur-md border-b border-[#233039]">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-8 h-[88px] flex items-center justify-between">
          {/* Brand Logo Header — Natural, perbesar proporsional */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center cursor-pointer select-none py-2 transition-transform hover:scale-[1.02]"
            title="PingKu — Home"
          >
            <img
              src={pingkuLogo}
              alt="PingKu — Server & framework monitoring"
              className="h-12 sm:h-14 md:h-[54px] w-auto max-w-[260px] sm:max-w-[280px] object-contain block"
            />
          </div>

          {/* Navigation Links (Fitur · Cara kerja · FAQ) */}
          <nav className="hidden md:flex items-center gap-12 text-[15px]">
            <button
              type="button"
              onClick={() => scrollToSection('fitur')}
              className={`transition-colors cursor-pointer font-medium ${
                activeNav === 'fitur'
                  ? 'text-[#6ce5b1] font-semibold'
                  : 'text-[#91a1ac] hover:text-[#f3f7f8]'
              }`}
            >
              <span>Fitur</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('cara-kerja')}
              className={`transition-colors cursor-pointer font-medium ${
                activeNav === 'cara-kerja'
                  ? 'text-[#6ce5b1] font-semibold'
                  : 'text-[#91a1ac] hover:text-[#f3f7f8]'
              }`}
            >
              <span>Cara kerja</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className={`transition-colors cursor-pointer font-medium ${
                activeNav === 'faq'
                  ? 'text-[#6ce5b1] font-semibold'
                  : 'text-[#91a1ac] hover:text-[#f3f7f8]'
              }`}
            >
              <span>FAQ</span>
            </button>
          </nav>

          {/* Right Action: GitHub Button + Buka Live Demo */}
          <div className="flex items-center gap-3">
            {/* Tombol GitHub Repo Resmi */}
            <a
              href="https://github.com/junady/PingKu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] bg-[#111921] hover:bg-[#18232d] border border-[#233039] hover:border-[#384855] text-[#edf4f5] text-[13px] font-semibold transition-all cursor-pointer shadow-sm group"
              title="Buka Repositori GitHub PingKu"
            >
              <svg className="w-4 h-4 fill-current text-[#91a1ac] group-hover:text-[#edf4f5] transition-colors" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>

            {/* Tombol Buka Live Demo */}
            <button
              type="button"
              onClick={() => onOpenLiveDashboard('overview')}
              className="bg-[#6ce5b1] hover:bg-[#5ce4bd] active:scale-[0.98] text-[#070b0f] font-semibold text-[14px] px-5 py-2.5 rounded-[8px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Buka live demo</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (Persis Desain Figma 3:4)
          ========================================================================= */}
      <section className="relative pt-16 pb-12 px-6 overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-[#17382f]/20 blur-[130px] pointer-events-none -z-10" />

        <div className="max-w-[1100px] mx-auto text-center">
          {/* Live demo badge */}
          <div className="inline-flex items-center gap-2 bg-[#09251e] border border-[#1b4a38] px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-[#6ce5b1] animate-pulse" />
            <span className="text-[10px] md:text-[11px] font-semibold tracking-wider text-[#6ce5b1] uppercase">
              NETWORK OBSERVABILITY, SIMPLIFIED
            </span>
          </div>

          {/* Headline 62px */}
          <h1 className="text-[44px] sm:text-[54px] md:text-[62px] font-bold text-[#f3f7f8] tracking-[-2.5px] leading-[1.12]">
            Kenali jaringanmu. <br />
            <span className="text-[#6ce5b1]">Sebelum masalah datang.</span>
          </h1>

          {/* Subtitle 17px */}
          <p className="text-[15px] sm:text-[17px] text-[#91a1ac] max-w-[860px] mx-auto leading-relaxed mt-6">
            Pantau server, petakan koneksi, dan temukan gangguan dalam satu tempat. <br className="hidden sm:inline" />
            Jelajahi langsung cara PingKu menjaga jaringan tetap terkendali.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => onOpenLiveDashboard('overview')}
              className="bg-[#6ce5b1] hover:bg-[#5ce4bd] active:scale-[0.98] text-[#070b0f] font-semibold text-[14px] px-7 py-3.5 rounded-[8px] flex items-center gap-2 shadow-lg shadow-[#6ce5b1]/15 transition-all cursor-pointer"
            >
              <span>Coba live demo</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('fitur')}
              className="bg-[#0e151b] hover:bg-[#141d24] border border-[#233039] hover:border-[#2e3e48] text-[#f3f7f8] font-semibold text-[14px] px-6 py-3.5 rounded-[8px] flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Jelajahi fitur</span>
              <ArrowDown className="w-4 h-4 text-[#91a1ac]" />
            </button>
          </div>

          {/* Microcopy 12px */}
          <p className="text-[12px] text-[#91a1ac] mt-5">
            Tanpa instalasi &nbsp;·&nbsp; Tanpa registrasi &nbsp;·&nbsp; Langsung eksplorasi
          </p>
        </div>

        {/* =========================================================================
            3. LIVE DASHBOARD PREVIEW FRAME (Persis Desain Figma 3:5 & 3:32)
            Ukuran w:1200px h:604px, border #34473e, bg #0e151b
            ========================================================================= */}
        <div className="max-w-[1200px] mx-auto mt-12">
          <div className="bg-[#0e151b] border border-[#34473e] rounded-[14px] overflow-hidden shadow-2xl relative">
            {/* Top Toolbar (Figma 3:33) */}
            <div className="h-[50px] bg-[#121b21] border-b border-[#233039] px-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-[#6ce5b1] text-base leading-none">◉</span>
                <span className="text-[#91a1ac] text-[12px]">
                  Workspace &nbsp;/&nbsp; <span className="text-[#f3f7f8] font-medium">{system?.os_hostname || 'Production'}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-[#14382b] border border-[#214f3f] px-2.5 py-1 rounded-[5px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1] animate-pulse" />
                  <span className="text-[#6ce5b1] text-[10px] font-medium">LIVE · 2 detik</span>
                </div>
                <span className="text-[#91a1ac] text-[11px] font-medium">Demo mode</span>
                <button
                  type="button"
                  onClick={() => onOpenLiveDashboard('overview')}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#6ce5b1] hover:underline ml-1"
                >
                  <span>Buka Layar Penuh</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Dashboard Mockup Grid (Sidebar + Main) */}
            <div className="flex flex-col md:flex-row min-h-[554px]">
              {/* Mini Sidebar (Figma 3:39) */}
              <div className="w-full md:w-[176px] bg-[#0b1217] border-r border-[#1a252e] p-3 shrink-0 flex flex-col justify-between">
                <div>
                  <div className="text-[9px] font-semibold text-[#657d89] tracking-wider uppercase px-2 mb-2">
                    MONITORING
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => onOpenLiveDashboard('overview')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] bg-[#163329] text-[#6ce5b1] text-[12px] font-medium text-left"
                    >
                      <LayoutOverviewIcon className="w-3.5 h-3.5" />
                      <span>Overview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenLiveDashboard('topology')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[#91a1ac] hover:text-[#f3f7f8] hover:bg-[#121a22] text-[12px] font-medium text-left transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Topology</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenLiveDashboard('tools')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[#91a1ac] hover:text-[#f3f7f8] hover:bg-[#121a22] text-[12px] font-medium text-left transition"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Diagnostics</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenLiveDashboard('logs')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[#91a1ac] hover:text-[#f3f7f8] hover:bg-[#121a22] text-[12px] font-medium text-left transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Event logs</span>
                    </button>
                  </div>

                  <div className="h-px bg-[#233039] my-4" />

                  <div className="text-[9px] font-semibold text-[#657d89] tracking-wider uppercase px-2 mb-2">
                    ENVIRONMENT
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] text-[#91a1ac]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                    <span>{system?.os_distro || 'Production'}</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#60737e] px-2 pt-4">
                  PingKu v1.2
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-5 space-y-4 bg-[#0e151b]">
                {/* Header overview banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                  <div>
                    <h2 className="text-[24px] font-bold text-[#f3f7f8] tracking-tight">
                      Network overview
                    </h2>
                    <p className="text-[11px] text-[#91a1ac]">
                      Semua yang terjadi di jaringanmu, dalam satu pandangan.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-[#6ce5b1] font-medium">● 7 sistem operasional</span>
                    <span className="text-[#91a1ac]">
                      Uptime: {system?.uptime_sec ? `${Math.floor(system.uptime_sec / 3600)}h ${Math.floor((system.uptime_sec % 3600) / 60)}m` : '14h 32m'}
                    </span>
                  </div>
                </div>

                {/* 4 Metric Cards (Figma 3:54, 3:61, 3:68, 3:75) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* CPU Card */}
                  <div className="bg-[#101a21] border border-[#233039] rounded-[8px] p-3.5 flex flex-col justify-between h-[140px] relative overflow-hidden">
                    <div>
                      <div className="text-[11px] text-[#91a1ac]">CPU usage</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-[28px] font-bold text-[#f3f7f8] leading-none">
                          {system?.cpu_percent ? Number(system.cpu_percent).toFixed(1) : '24.8'}
                        </span>
                        <span className="text-[11px] text-[#91a1ac]">%</span>
                      </div>
                      <div className="text-[10px] text-[#91a1ac] truncate mt-1">
                        {system?.cpu_brand ? `${system.cpu_cores || 8} vCPU · ${system.cpu_brand}` : '8 vCPU · AMD EPYC'}
                      </div>
                    </div>
                    {/* SVG Sparkline touching bottom */}
                    <div className="h-[36px] w-full -mx-3.5 -mb-3.5">
                      <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6ce5b1" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#6ce5b1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <polygon points="0,24 0,16 15,14 30,19 45,9 60,15 75,11 90,8 100,10 100,24" fill="url(#cpuGrad)" />
                        <polyline points="0,16 15,14 30,19 45,9 60,15 75,11 90,8 100,10" fill="none" stroke="#6ce5b1" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  {/* RAM Card */}
                  <div className="bg-[#101a21] border border-[#233039] rounded-[8px] p-3.5 flex flex-col justify-between h-[140px] relative overflow-hidden">
                    <div>
                      <div className="text-[11px] text-[#91a1ac]">RAM usage</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-[28px] font-bold text-[#f3f7f8] leading-none">
                          {system?.ram_used_mb ? (system.ram_used_mb / 1024).toFixed(1) : '3.2'}
                        </span>
                        <span className="text-[11px] text-[#91a1ac]">
                          / {system?.ram_total_mb ? `${Math.round(system.ram_total_mb / 1024)} GB` : '8 GB'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#91a1ac] truncate mt-1">
                        {system?.ram_used_mb && system?.ram_total_mb
                          ? `${Math.round((system.ram_used_mb / system.ram_total_mb) * 100)}% dari total memori`
                          : '40% dari total memori'}
                      </div>
                    </div>
                    {/* SVG Sparkline touching bottom */}
                    <div className="h-[28px] w-full -mx-3.5 -mb-3.5">
                      <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6ce5b1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6ce5b1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <polygon points="0,24 0,18 20,17 40,15 60,16 80,14 100,12 100,24" fill="url(#ramGrad)" />
                        <polyline points="0,18 20,17 40,15 60,16 80,14 100,12" fill="none" stroke="#6ce5b1" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Disk Card */}
                  <div className="bg-[#101a21] border border-[#233039] rounded-[8px] p-3.5 flex flex-col justify-between h-[140px] relative overflow-hidden">
                    <div>
                      <div className="text-[11px] text-[#91a1ac]">Disk usage</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-[28px] font-bold text-[#f3f7f8] leading-none">
                          {system?.disk_percent ? Number(system.disk_percent).toFixed(1) : '46.2'}
                        </span>
                        <span className="text-[11px] text-[#91a1ac]">%</span>
                      </div>
                      <div className="text-[10px] text-[#91a1ac] truncate mt-1">
                        92.4 GB / 200 GB
                      </div>
                    </div>
                    {/* SVG Sparkline touching bottom */}
                    <div className="h-[28px] w-full -mx-3.5 -mb-3.5">
                      <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6ce5b1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6ce5b1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <polygon points="0,24 0,15 25,15 50,14 75,14 100,14 100,24" fill="url(#diskGrad)" />
                        <polyline points="0,15 25,15 50,14 75,14 100,14" fill="none" stroke="#6ce5b1" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Network Traffic Card */}
                  <div className="bg-[#101a21] border border-[#233039] rounded-[8px] p-3.5 flex flex-col justify-between h-[140px] relative overflow-hidden">
                    <div>
                      <div className="text-[11px] text-[#91a1ac]">Network traffic</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-[28px] font-bold text-[#f3f7f8] leading-none">
                          {system?.net_rx_kbps ? Math.round(system.net_rx_kbps) : '842'}
                        </span>
                        <span className="text-[11px] text-[#91a1ac]">Kbps</span>
                      </div>
                      <div className="text-[10px] text-[#91a1ac] truncate mt-1 font-mono">
                        ↓ Rx {system?.net_rx_kbps ? Math.round(system.net_rx_kbps) : '842'} &nbsp;
                        ↑ Tx {system?.net_tx_kbps ? Math.round(system.net_tx_kbps) : '216'}
                      </div>
                    </div>
                    {/* SVG Sparkline touching bottom */}
                    <div className="h-[36px] w-full -mx-3.5 -mb-3.5">
                      <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6ce5b1" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#6ce5b1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <polygon points="0,24 0,16 15,10 30,18 45,7 60,14 75,9 90,13 100,8 100,24" fill="url(#netGrad)" />
                        <polyline points="0,16 15,10 30,18 45,7 60,14 75,9 90,13 100,8" fill="none" stroke="#6ce5b1" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Lower Row: Topology Diagram + Service Host Status (Figma 3:82, 3:409) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  {/* Left: Interactive Topology Canvas Mockup (7 cols) with Bezier Lines */}
                  <div className="lg:col-span-7 bg-[#0b1319] border border-[#233039] rounded-[8px] p-3.5 flex flex-col justify-between min-h-[273px] relative overflow-hidden">
                    <div className="flex items-center justify-between pb-2 border-b border-[#1b262e] z-10">
                      <div className="text-[13px] font-medium text-[#f3f7f8]">Network topology · Enterprise Sekolah</div>
                      <div className="text-[10px] text-[#91a1ac]">
                        <span className="text-[#6ce5b1] font-semibold">● 17 active</span>
                        &nbsp;&nbsp;&nbsp;
                        <span className="text-[#f58083] font-semibold">● 1 down</span>
                      </div>
                    </div>

                    {/* Dot Matrix Background */}
                    <div
                      className="absolute inset-0 top-10 pointer-events-none opacity-40"
                      style={{
                        backgroundImage: 'radial-gradient(#233039 1px, transparent 1px)',
                        backgroundSize: '16px 16px'
                      }}
                    />

                    {/* SVG Bezier Connection Lines */}
                    <svg className="absolute inset-0 top-12 w-full h-[210px] pointer-events-none z-0">
                      {/* Gateway to Core Switch */}
                      <path d="M 280,24 C 280,50 140,50 140,75" stroke="#2c5645" strokeWidth="1.5" fill="none" />
                      {/* Gateway to Access Switch */}
                      <path d="M 320,24 C 320,50 440,50 440,75" stroke="#2c5645" strokeWidth="1.5" fill="none" />
                      {/* Core Switch to Server CBT */}
                      <path d="M 120,95 C 120,120 70,120 70,145" stroke="#2c5645" strokeWidth="1.5" fill="none" />
                      {/* Core Switch to Database SIAKAD */}
                      <path d="M 160,95 C 160,120 200,120 200,145" stroke="#2c5645" strokeWidth="1.5" fill="none" />
                      {/* Access Switch to Moodle */}
                      <path d="M 420,95 C 420,120 370,120 370,145" stroke="#2c5645" strokeWidth="1.5" fill="none" />
                      {/* Access Switch to Storage NAS (Down - Red dash line) */}
                      <path d="M 460,95 C 460,120 500,120 500,145" stroke="#6d363e" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                    </svg>

                    {/* Topology Tree Nodes */}
                    <div className="relative h-[210px] my-auto flex flex-col justify-between py-2 z-10">
                      {/* Level 1: Gateway */}
                      <div className="flex justify-center">
                        <div className="bg-[#14251f] border border-[#2f5c49] rounded-[6px] px-3.5 py-1.5 flex items-center gap-2 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                          <div>
                            <div className="text-[10px] font-medium text-[#f3f7f8] leading-none">Router Gateway (CCR2004)</div>
                            <div className="text-[8px] font-mono text-[#91a1ac] mt-0.5">10.0.0.1</div>
                          </div>
                        </div>
                      </div>

                      {/* Level 2: Core Switch & Switch Lab CBT */}
                      <div className="flex justify-around px-6">
                        <div className="bg-[#14251f] border border-[#2f5c49] rounded-[6px] px-3.5 py-1.5 flex items-center gap-2 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                          <div>
                            <div className="text-[10px] font-medium text-[#f3f7f8] leading-none">Core switch L3</div>
                            <div className="text-[8px] font-mono text-[#91a1ac] mt-0.5">10.0.0.2</div>
                          </div>
                        </div>

                        <div className="bg-[#14251f] border border-[#2f5c49] rounded-[6px] px-3.5 py-1.5 flex items-center gap-2 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                          <div>
                            <div className="text-[10px] font-medium text-[#f3f7f8] leading-none">Switch Lab CBT / ANBK</div>
                            <div className="text-[8px] font-mono text-[#91a1ac] mt-0.5">10.0.0.4</div>
                          </div>
                        </div>
                      </div>

                      {/* Level 3: Leaf Nodes */}
                      <div className="flex justify-between px-2 gap-2 overflow-x-auto">
                        <div className="bg-[#14251f] border border-[#2f5c49] rounded-[6px] p-2 min-w-[95px] text-center shadow-sm">
                          <div className="text-[10px] font-medium text-[#f3f7f8]">Server CBT ANBK</div>
                          <div className="text-[8px] text-[#6ce5b1] font-mono">1 ms · UP</div>
                        </div>
                        <div className="bg-[#14251f] border border-[#2f5c49] rounded-[6px] p-2 min-w-[95px] text-center shadow-sm">
                          <div className="text-[10px] font-medium text-[#f3f7f8]">DB SIAKAD</div>
                          <div className="text-[8px] text-[#6ce5b1] font-mono">2 ms · UP</div>
                        </div>
                        <div className="bg-[#14251f] border border-[#2f5c49] rounded-[6px] p-2 min-w-[95px] text-center shadow-sm">
                          <div className="text-[10px] font-medium text-[#f3f7f8]">E-Learning LMS</div>
                          <div className="text-[8px] text-[#6ce5b1] font-mono">1 ms · UP</div>
                        </div>
                        <div className="bg-[#14251f] border border-[#2f5c49] rounded-[6px] p-2 min-w-[95px] text-center shadow-sm">
                          <div className="text-[10px] font-medium text-[#f3f7f8]">Storage NAS</div>
                          <div className="text-[8px] text-[#6ce5b1] font-mono">2 ms · UP</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Service and host status (5 cols, Figma 3:409) */}
                  <div className="lg:col-span-5 bg-[#101a21] border border-[#233039] rounded-[8px] p-3.5 flex flex-col justify-between min-h-[273px]">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#1b262e]">
                        <div className="text-[13px] font-medium text-[#f3f7f8]">Service &amp; host status</div>
                        <span className="text-[9px] text-[#657d89] font-mono">24H</span>
                      </div>
                      <div className="text-[9px] text-[#91a1ac] uppercase tracking-wider mt-2 mb-2">
                        KETERSEDIAAN · SERVER SEKOLAH
                      </div>

                      {/* Service Rows matching Figma */}
                      <div className="space-y-2.5">
                        {/* Gateway */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="text-[#f3f7f8] font-medium truncate">Router Gateway (CCR2004)</span>
                            <span className="text-[#6ce5b1] font-mono font-medium">1 ms UP</span>
                          </div>
                          {renderUptimeTicks(false, 30)}
                        </div>

                        {/* Core Switch L3 */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="text-[#f3f7f8] font-medium truncate">Core Switch L3 (Catalyst)</span>
                            <span className="text-[#6ce5b1] font-mono font-medium">1 ms UP</span>
                          </div>
                          {renderUptimeTicks(false, 30)}
                        </div>

                        {/* Server CBT ANBK */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="text-[#f3f7f8] font-medium truncate">Server Utama CBT / ANBK</span>
                            <span className="text-[#6ce5b1] font-mono font-medium">1 ms UP</span>
                          </div>
                          {renderUptimeTicks(false, 30)}
                        </div>

                        {/* Database SIAKAD */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="text-[#f3f7f8] font-medium truncate">Server DB SIAKAD (MySQL)</span>
                            <span className="text-[#6ce5b1] font-mono font-medium">2 ms UP</span>
                          </div>
                          {renderUptimeTicks(false, 30)}
                        </div>

                        {/* Storage NAS */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="text-[#f3f7f8] font-medium truncate">Storage NAS &amp; Backup (TrueNAS)</span>
                            <span className="text-[#6ce5b1] font-mono font-medium">2 ms UP</span>
                          </div>
                          {renderUptimeTicks(false, 30)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-[#657d89] pt-2 border-t border-[#1b262e] mt-1">
                      <span>24 jam lalu</span>
                      <span>Sekarang</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-[#91a1ac] text-[12px] mt-4">
            Tampilan demo dengan data ilustratif. Angka di atas bukan metrik server aktif.
          </p>
        </div>
      </section>

      {/* =========================================================================
          4. AT A GLANCE STAT METRIC ROW (Figma 3:6)
          2 detik · 5 metrik · 100% · 100 event
          ========================================================================= */}
      <section className="py-8 px-6">
        <div className="max-w-[1200px] mx-auto py-10 border-y border-[#233039] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-[27px] font-semibold text-[#f3f7f8] tracking-tight">
              2 detik
            </div>
            <div className="text-[12px] text-[#91a1ac]">
              Interval pembaruan telemetri
            </div>
          </div>

          <div className="space-y-1 md:border-l md:border-[#233039] md:pl-8">
            <div className="text-[27px] font-semibold text-[#f3f7f8] tracking-tight">
              5 metrik
            </div>
            <div className="text-[12px] text-[#91a1ac]">
              CPU, RAM, disk, uptime &amp; trafik
            </div>
          </div>

          <div className="space-y-1 md:border-l md:border-[#233039] md:pl-8">
            <div className="text-[27px] font-semibold text-[#f3f7f8] tracking-tight">
              100%
            </div>
            <div className="text-[12px] text-[#91a1ac]">
              Diagnostik secara real-time
            </div>
          </div>

          <div className="space-y-1 md:border-l md:border-[#233039] md:pl-8">
            <div className="text-[27px] font-semibold text-[#f3f7f8] tracking-tight">
              100 event
            </div>
            <div className="text-[12px] text-[#91a1ac]">
              Riwayat log terbaru tersimpan
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SECTION HEADER: DARI SINYAL MENJADI KENDALI (Figma 3:7)
          ========================================================================= */}
      <section id="fitur" className="pt-20 pb-8 px-6 scroll-mt-24">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-[#6ce5b1] uppercase tracking-wider">
              DARI SINYAL MENJADI KENDALI
            </div>
            <h2 className="text-[38px] font-bold text-[#f3f7f8] tracking-[-1.2px] mt-1">
              Satu tempat. Seluruh jaringan.
            </h2>
          </div>
          <div className="text-[14px] text-[#91a1ac] max-w-[420px] leading-[1.45]">
            <p className="mb-0">Bukan sekadar angka. Pahami hubungan,</p>
            <p>temukan akar masalah, lalu ambil tindakan.</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FEATURE 01: INTERACTIVE TOPOLOGY SHOWCASE (Figma 3:8)
          ========================================================================= */}
      <section className="py-8 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="text-[11px] font-semibold text-[#6ce5b1] uppercase tracking-wider">
              01 / INTERACTIVE TOPOLOGY
            </div>
            <h3 className="text-[34px] font-bold text-[#f3f7f8] tracking-[-0.8px] leading-[1.22]">
              Lihat koneksinya. <br />
              Temukan titik masalahnya.
            </h3>
            <p className="text-[14px] text-[#91a1ac] leading-relaxed">
              Petakan relasi parent&ndash;child dengan alur koneksi yang mudah ditelusuri.
              Status perangkat terlihat jelas, bahkan sebelum kamu membuka detailnya.
            </p>

            <ul className="space-y-3 text-[13px] text-[#f3f7f8] pt-2">
              <li className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#6ce5b1]" />
                <span>Active hijau. DOWN merah berkedip.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-[#6ce5b1] font-bold">↗</span>
                <span>Kurva bezier dengan indikator sinyal bergerak.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-[#6ce5b1] font-bold">+</span>
                <span>Tambah node lewat modal, tersimpan permanen.</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenLiveDashboard('topology')}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6ce5b1] hover:underline cursor-pointer"
              >
                <span>Eksplorasi topologi di demo</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Right Interactive Topology Simulator & Node Drawer (Figma 3:656, 7 cols) */}
          <div className="lg:col-span-7 bg-[#0e151b] border border-[#233039] rounded-[12px] overflow-hidden shadow-xl flex flex-col md:flex-row h-auto md:h-[420px]">
            {/* Topology Canvas Area */}
            <div className="flex-1 p-4 relative flex flex-col justify-between overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#233039] z-10">
                <span className="text-[14px] font-semibold text-[#f3f7f8]">Topology</span>
                <button
                  type="button"
                  onClick={() => setIsAddNodeModalOpen(true)}
                  className="bg-[#1b392e] hover:bg-[#214f3f] border border-[#2c5645] text-[#6ce5b1] text-[11px] font-medium px-3 py-1.5 rounded-[5px] transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Node</span>
                </button>
              </div>

              {/* Dot Matrix Canvas */}
              <div
                className="absolute inset-0 top-12 pointer-events-none opacity-40"
                style={{
                  backgroundImage: 'radial-gradient(#233039 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              />

              {/* Bezier Connection Curves */}
              <svg className="absolute inset-0 top-14 w-full h-[220px] pointer-events-none z-0">
                {/* Gateway to Web Server */}
                <path d="M 180,24 C 180,60 85,60 85,95" stroke="#2c5645" strokeWidth="1.5" fill="none" />
                {/* Gateway to Core Switch */}
                <path d="M 210,24 C 210,60 270,60 270,95" stroke="#2c5645" strokeWidth="1.5" fill="none" />
                {/* Core Switch to Database */}
                <path d="M 255,120 C 255,150 170,150 170,180" stroke="#2c5645" strokeWidth="1.5" fill="none" />
                {/* Core Switch to Backup NAS (Down - Red dash line) */}
                <path d="M 285,120 C 285,150 330,150 330,180" stroke="#6d363e" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
              </svg>

              {/* Node Graph Mockup matching Figma 3:1024..3:1041 */}
              <div className="relative my-auto py-4 z-10 space-y-6">
                {/* Level 1: Gateway */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDemoNode('gw-core');
                      setPingResultText('1 ms');
                    }}
                    className={`px-3.5 py-1.5 rounded-[6px] border text-left transition-all cursor-pointer ${
                      selectedDemoNode === 'gw-core'
                        ? 'bg-[#1b392e] border-[#6ce5b1] ring-2 ring-[#6ce5b1]/30'
                        : 'bg-[#14251f] border-[#2f5c49] hover:border-[#6ce5b1]/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                      <span className="text-[11px] font-semibold text-[#f3f7f8]">Router Gateway (MikroTik)</span>
                    </div>
                    <div className="text-[9px] font-mono text-[#91a1ac]">10.0.0.1</div>
                  </button>
                </div>

                {/* Level 2: Core Switch L3 & Server CBT */}
                <div className="flex justify-around px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDemoNode('sw-core');
                      setPingResultText('1 ms');
                    }}
                    className={`px-3.5 py-1.5 rounded-[6px] border text-left transition-all cursor-pointer ${
                      selectedDemoNode === 'sw-core'
                        ? 'bg-[#1b392e] border-[#6ce5b1] ring-2 ring-[#6ce5b1]/30'
                        : 'bg-[#14251f] border-[#2f5c49] hover:border-[#6ce5b1]/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                      <span className="text-[11px] font-semibold text-[#f3f7f8]">Core Switch L3</span>
                    </div>
                    <div className="text-[9px] font-mono text-[#91a1ac]">10.0.0.2</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDemoNode('srv-cbt-main');
                      setPingResultText('1 ms');
                    }}
                    className={`px-3.5 py-1.5 rounded-[6px] border text-left transition-all cursor-pointer ${
                      selectedDemoNode === 'srv-cbt-main'
                        ? 'bg-[#1b392e] border-[#6ce5b1] ring-2 ring-[#6ce5b1]/30'
                        : 'bg-[#14251f] border-[#2f5c49] hover:border-[#6ce5b1]/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                      <span className="text-[11px] font-semibold text-[#f3f7f8]">Server Utama CBT</span>
                    </div>
                    <div className="text-[9px] font-mono text-[#91a1ac]">10.0.10.10</div>
                  </button>
                </div>

                {/* Level 3: Database SIAKAD, PC Proktor & Storage NAS */}
                <div className="flex justify-around px-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDemoNode('srv-siakad');
                      setPingResultText('2 ms');
                    }}
                    className={`px-3 py-1.5 rounded-[6px] border text-left transition-all cursor-pointer ${
                      selectedDemoNode === 'srv-siakad'
                        ? 'bg-[#1b392e] border-[#6ce5b1] ring-2 ring-[#6ce5b1]/30'
                        : 'bg-[#14251f] border-[#2f5c49] hover:border-[#6ce5b1]/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                      <span className="text-[10px] font-semibold text-[#f3f7f8]">DB SIAKAD</span>
                    </div>
                    <div className="text-[8px] font-mono text-[#91a1ac]">10.0.10.20</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDemoNode('srv-proktor-lab1');
                      setPingResultText('2 ms');
                    }}
                    className={`px-3 py-1.5 rounded-[6px] border text-left transition-all cursor-pointer ${
                      selectedDemoNode === 'srv-proktor-lab1'
                        ? 'bg-[#1b392e] border-[#6ce5b1] ring-2 ring-[#6ce5b1]/30'
                        : 'bg-[#14251f] border-[#2f5c49] hover:border-[#6ce5b1]/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                      <span className="text-[10px] font-semibold text-[#f3f7f8]">Proktor Lab 1</span>
                    </div>
                    <div className="text-[8px] font-mono text-[#91a1ac]">10.0.20.10</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDemoNode('nas-backup');
                      setPingResultText('2 ms');
                    }}
                    className={`px-3 py-1.5 rounded-[6px] border text-left transition-all cursor-pointer ${
                      selectedDemoNode === 'nas-backup'
                        ? 'bg-[#18392d] border-[#6ce5b1] ring-2 ring-[#6ce5b1]/30'
                        : 'bg-[#14251f] border-[#2f5c49] hover:border-[#6ce5b1]/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                      <span className="text-[10px] font-semibold text-[#f3f7f8]">Storage NAS</span>
                    </div>
                    <div className="text-[8px] font-mono text-[#91a1ac]">10.0.10.30</div>
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-[#657d89] text-center pt-2 border-t border-[#1a252e]">
                Klik node di atas untuk inspeksi real-time di drawer kanan
              </div>
            </div>

            {/* Slide-over Node Detail Drawer (Figma 3:1044..3:1064) */}
            <div className="w-full md:w-[270px] bg-[#10171d] border-t md:border-t-0 md:border-l border-[#233039] p-4 flex flex-col justify-between shrink-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1b262e]">
                  <span className="text-[10px] font-bold text-[#657d89] tracking-wider uppercase">
                    DETAIL NODE · ENTERPRISE
                  </span>
                  <span className="text-[14px] text-[#91a1ac] cursor-pointer hover:text-[#edf4f5]">×</span>
                </div>

                <div>
                  <div className="text-[18px] font-bold text-[#f3f7f8] tracking-tight leading-tight">
                    {currentNode.label}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {currentNode.status === 'UP' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#14382b] text-[#6ce5b1] text-[11px] font-medium border border-[#214f3f]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#341b1f] text-[#f58083] text-[11px] font-medium border border-[#5c2f32]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f58083] animate-pulse" />
                        DOWN
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[#91a1ac] uppercase bg-[#152028] px-1.5 py-0.5 rounded border border-[#243139]">
                      {currentNode.type}
                    </span>
                  </div>
                </div>

                {/* Specs */}
                <div className="space-y-1.5 text-[11px] pt-1">
                  {currentNode.role && (
                    <div className="text-[11px] text-[#91a1ac] pb-1 border-b border-[#1b262e]">
                      <span className="text-[#657d89] block text-[9px] uppercase font-semibold">Peran Server:</span>
                      <span className="text-[#edf4f5]">{currentNode.role}</span>
                    </div>
                  )}
                  {currentNode.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#91a1ac]">Lokasi Fisik</span>
                      <span className="text-[#f3f7f8] font-medium">{currentNode.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[#91a1ac]">IP address</span>
                    <span className="font-mono text-[#f3f7f8] font-medium">{currentNode.ip}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#91a1ac]">TCP port</span>
                    <span className="font-mono text-[#f3f7f8] font-medium">{currentNode.port}</span>
                  </div>
                </div>

                {/* Latency History */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#657d89] uppercase tracking-wider mb-1.5">
                    <span>RIWAYAT LATENSI</span>
                    <span className={`font-mono text-[12px] font-bold ${currentNode.status === 'UP' ? 'text-[#6ce5b1]' : 'text-[#f58083]'}`}>
                      {pingResultText}
                    </span>
                  </div>
                  <div className="h-[36px] w-full bg-[#152028] border border-[#243139] rounded-[4px] p-1 flex items-end">
                    <div className="w-full flex items-end justify-between gap-[2px] h-full">
                      {[1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1].map((val, idx) => (
                        <div
                          key={idx}
                          style={{
                            height: currentNode.status === 'UP' ? `${(val / 2) * 85}%` : '15%'
                          }}
                          className={`w-full rounded-[1px] ${
                            currentNode.status === 'UP' ? 'bg-[#6ce5b1]' : 'bg-[#f58083]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#657d89] mt-1">
                    <span>60 detik lalu</span>
                    <span>Sekarang</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-3">
                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={isPingTesting}
                  className="w-full py-2 px-3 rounded-[6px] bg-[#6ce5b1] hover:bg-[#5ce4bd] text-[#070b0f] font-semibold text-[12px] flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isPingTesting ? 'animate-spin' : ''}`} />
                  <span>{isPingTesting ? 'Sedang Probing...' : '↺  Test Ping Ulang'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenLiveDashboard('topology')}
                    className="py-1.5 px-2 rounded-[6px] bg-[#152028] hover:bg-[#1a2530] border border-[#243139] text-[#f3f7f8] text-[11px] font-medium transition text-center cursor-pointer"
                  >
                    Edit Node
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLiveDashboard('topology')}
                    className="py-1.5 px-2 rounded-[6px] bg-[#241516] hover:bg-[#2e191b] border border-[#4d2d25] text-[#f58083] text-[11px] font-medium transition text-center cursor-pointer"
                  >
                    Hapus Node
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FEATURE 02 & 03: SIDE-BY-SIDE CARDS (Figma 3:9)
          ========================================================================= */}
      <section className="py-8 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 02: Diagnostic Utilities (Figma 3:1067..3:1079) */}
          <div className="bg-[#0e151b] border border-[#233039] rounded-[14px] p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-[11px] font-semibold text-[#6ce5b1] uppercase tracking-wider">
                02 / DIAGNOSTIC UTILITIES
              </div>
              <h3 className="text-[30px] font-bold text-[#f3f7f8] tracking-tight mt-1 mb-2">
                Dari dugaan ke jawaban.
              </h3>
              <p className="text-[14px] text-[#91a1ac] leading-relaxed mb-6">
                Uji koneksi dan telusuri gangguan secara real-time. Tanpa berpindah-pindah alat.
              </p>

              {/* Terminal Box matching Figma */}
              <div className="bg-[#070b0f] border border-[#233039] rounded-[8px] overflow-hidden">
                {/* Tabs */}
                <div className="bg-[#10171d] border-b border-[#233039] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-6 text-[13px]">
                    <button
                      type="button"
                      onClick={() => setActiveDiagTab('ping')}
                      className={`font-medium transition cursor-pointer ${
                        activeDiagTab === 'ping' ? 'text-[#6ce5b1] font-semibold' : 'text-[#91a1ac] hover:text-[#f3f7f8]'
                      }`}
                    >
                      Ping
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDiagTab('tcp')}
                      className={`font-medium transition cursor-pointer ${
                        activeDiagTab === 'tcp' ? 'text-[#6ce5b1] font-semibold' : 'text-[#91a1ac] hover:text-[#f3f7f8]'
                      }`}
                    >
                      TCP Check
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDiagTab('dns')}
                      className={`font-medium transition cursor-pointer ${
                        activeDiagTab === 'dns' ? 'text-[#6ce5b1] font-semibold' : 'text-[#91a1ac] hover:text-[#f3f7f8]'
                      }`}
                    >
                      DNS Lookup
                    </button>
                  </div>
                  <span className="text-[11px] text-[#6ce5b1] font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1] animate-pulse" />
                    LIVE
                  </span>
                </div>

                {/* Monospace Output */}
                <div className="p-4 font-mono text-[12px] space-y-2 min-h-[160px] overflow-x-auto leading-relaxed">
                  {activeDiagTab === 'ping' && (
                    <>
                      <div className="text-[#6ce5b1] font-medium">$ ping 10.0.10.10</div>
                      <div className="text-[#91a1ac]">64 bytes from 10.0.10.10 (srv-cbt-main): seq=1  ttl=64  time=1.2 ms</div>
                      <div className="text-[#91a1ac]">64 bytes from 10.0.10.10: seq=2  ttl=64  time=1.0 ms</div>
                      <div className="text-[#91a1ac]">64 bytes from 10.0.10.10: seq=3  ttl=64  time=1.1 ms</div>
                      <div className="text-[#edf4f5] pt-2 border-t border-[#1b262e] text-[11px]">
                        3 packets transmitted · 3 received · 0% packet loss (Server CBT Sekolah Normal)
                      </div>
                    </>
                  )}

                  {activeDiagTab === 'tcp' && (
                    <>
                      <div className="text-[#6ce5b1] font-medium">$ nc -zv 10.0.10.20 22 80 443 3306 5000</div>
                      <div className="text-[#91a1ac]">Connection to 10.0.10.20 3306 [tcp/mysql-siakad] succeeded! (1.4 ms)</div>
                      <div className="text-[#91a1ac]">Connection to 10.0.10.10 80 [tcp/cbt-anbk] succeeded! (0.9 ms)</div>
                      <div className="text-[#91a1ac]">Connection to 10.0.10.15 443 [tcp/moodle-lms] succeeded! (1.1 ms)</div>
                      <div className="text-[#f58083] pt-1">Connection to 10.0.10.30 5000 [tcp/nas-backup] connection refused/closed</div>
                    </>
                  )}

                  {activeDiagTab === 'dns' && (
                    <>
                      <div className="text-[#6ce5b1] font-medium">$ dig @10.0.0.1 cbt.sekolah.sch.id siakad.sekolah.sch.id A AAAA</div>
                      <div className="text-[#91a1ac]">;; ANSWER SECTION:</div>
                      <div className="text-[#91a1ac]">cbt.sekolah.sch.id.     300  IN  A     10.0.10.10</div>
                      <div className="text-[#91a1ac]">siakad.sekolah.sch.id.  300  IN  A     10.0.10.20</div>
                      <div className="text-[#edf4f5] pt-1">Query time: 1 msec · Server: 10.0.0.1 (MikroTik DNS) · Status: NOERROR</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => onOpenLiveDashboard('tools')}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6ce5b1] hover:underline cursor-pointer"
              >
                <span>Buka Network Tools Suite</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 03: Service and Host Status (Figma 3:1080..3:1205) */}
          <div className="bg-[#0e151b] border border-[#233039] rounded-[14px] p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-[11px] font-semibold text-[#6ce5b1] uppercase tracking-wider">
                03 / SERVICE &amp; HOST STATUS
              </div>
              <h3 className="text-[30px] font-bold text-[#f3f7f8] tracking-tight mt-1 mb-2">
                Status jelas. Riwayat terbaca.
              </h3>
              <p className="text-[14px] text-[#91a1ac] leading-relaxed mb-6">
                Uptime tick bars ala Beszel, dilengkapi latensi langsung. Ketahui mana yang sehat dan mana yang perlu perhatian.
              </p>

              {/* Status Table matching Figma */}
              <div className="bg-[#070b0f] border border-[#233039] rounded-[8px] p-4">
                <div className="grid grid-cols-12 text-[10px] font-semibold text-[#657d89] uppercase tracking-wider pb-2 border-b border-[#1b262e]">
                  <span className="col-span-4">HOST</span>
                  <span className="col-span-5 text-center">24 JAM TERAKHIR</span>
                  <span className="col-span-3 text-right">LATENSI</span>
                </div>

                <div className="space-y-4 py-3">
                  {/* Row 1: Server CBT */}
                  <div className="grid grid-cols-12 items-center text-[12px]">
                    <div className="col-span-4 font-medium text-[#f3f7f8] truncate" title="Server Utama CBT / ANBK">
                      Server Utama CBT
                    </div>
                    <div className="col-span-5 flex justify-center">
                      {renderUptimeTicks(false, 22)}
                    </div>
                    <div className="col-span-3 text-right font-mono text-[#6ce5b1] font-semibold">
                      1 ms UP
                    </div>
                  </div>

                  {/* Row 2: Database SIAKAD */}
                  <div className="grid grid-cols-12 items-center text-[12px]">
                    <div className="col-span-4 font-medium text-[#f3f7f8] truncate" title="Server Database SIAKAD">
                      Database SIAKAD
                    </div>
                    <div className="col-span-5 flex justify-center">
                      {renderUptimeTicks(false, 22)}
                    </div>
                    <div className="col-span-3 text-right font-mono text-[#6ce5b1] font-semibold">
                      2 ms UP
                    </div>
                  </div>

                  {/* Row 3: Storage NAS */}
                  <div className="grid grid-cols-12 items-center text-[12px]">
                    <div className="col-span-4 font-medium text-[#f3f7f8] truncate" title="Storage NAS & Backup Sekolah">
                      Storage NAS Sekolah
                    </div>
                    <div className="col-span-5 flex justify-center">
                      {renderUptimeTicks(true, 22)}
                    </div>
                    <div className="col-span-3 text-right font-mono text-[#f58083] font-bold">
                      DOWN
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#657d89] pt-2 border-t border-[#1b262e]">
                  <span>24 jam lalu</span>
                  <span>Sekarang</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => onOpenLiveDashboard('overview')}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6ce5b1] hover:underline cursor-pointer"
              >
                <span>Lihat semua bar ketersediaan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FEATURE 04: AUTOMATED EVENTS & ALERTS (Figma 3:10)
          ========================================================================= */}
      <section id="cara-kerja" className="py-12 px-6 scroll-mt-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Event Stream Card (7 cols, Figma 3:1207..3:1229) */}
          <div className="lg:col-span-7 bg-[#0e151b] border border-[#233039] rounded-[14px] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b262e]">
              <span className="text-[16px] font-bold text-[#f3f7f8]">Event stream</span>
              <span className="text-[11px] font-medium text-[#91a1ac] bg-[#152028] border border-[#243139] px-2.5 py-1 rounded-[5px]">
                SQLite · tersimpan
              </span>
            </div>

            {/* Event Table matching Figma */}
            <div className="divide-y divide-[#1b262e]">
              <div className="grid grid-cols-12 text-[10px] font-semibold text-[#657d89] uppercase tracking-wider py-2.5">
                <span className="col-span-3">WAKTU</span>
                <span className="col-span-6">EVENT</span>
                <span className="col-span-3 text-right">STATUS</span>
              </div>

              {/* Event 1 */}
              <div className="grid grid-cols-12 items-center py-3 text-[12px]">
                <span className="col-span-3 font-mono text-[#91a1ac]">14:32:08</span>
                <div className="col-span-6">
                  <div className="font-semibold text-[#f3f7f8]">Server CBT ANBK High Load</div>
                  <div className="text-[11px] text-[#91a1ac]">CPU 89.4% · Sesi 1 Ujian Simulasi ANBK berlangsung</div>
                </div>
                <div className="col-span-3 text-right">
                  <span className="inline-block px-2 py-0.5 rounded-[4px] bg-[#3a2818] border border-[#5c3e21] text-[#f5a742] text-[10px] font-bold">
                    WARNING
                  </span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="grid grid-cols-12 items-center py-3 text-[12px]">
                <span className="col-span-3 font-mono text-[#91a1ac]">14:30:46</span>
                <div className="col-span-6">
                  <div className="font-semibold text-[#f3f7f8]">Storage NAS Sekolah unreachable</div>
                  <div className="text-[11px] text-[#91a1ac]">10.0.10.30 · UP → DOWN</div>
                </div>
                <div className="col-span-3 text-right">
                  <span className="inline-block px-2 py-0.5 rounded-[4px] bg-[#341b1f] border border-[#5c2f32] text-[#f58083] text-[10px] font-bold">
                    DOWN
                  </span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="grid grid-cols-12 items-center py-3 text-[12px]">
                <span className="col-span-3 font-mono text-[#91a1ac]">14:28:12</span>
                <div className="col-span-6">
                  <div className="font-semibold text-[#f3f7f8]">AP Ruang Guru &amp; Staff recovered</div>
                  <div className="text-[11px] text-[#91a1ac]">10.0.40.1 · DOWN → UP</div>
                </div>
                <div className="col-span-3 text-right">
                  <span className="inline-block px-2 py-0.5 rounded-[4px] bg-[#14382b] border border-[#214f3f] text-[#6ce5b1] text-[10px] font-bold">
                    RECOVERED
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#91a1ac] pt-4 border-t border-[#1b262e] mt-2">
              <span className="flex items-center gap-1.5 text-[#6ce5b1]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6ce5b1]" />
                Auto-cleanup aktif
              </span>
              <span>Menampilkan 3 dari 100 log terbaru</span>
            </div>
          </div>

          {/* Right Text Column (5 cols, Figma 3:1230..3:1233) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-[11px] font-semibold text-[#6ce5b1] uppercase tracking-wider">
              04 / AUTOMATED EVENTS &amp; ALERTS
            </div>
            <h3 className="text-[34px] font-bold text-[#f3f7f8] tracking-tight leading-tight">
              Jangan lewatkan <br />
              sinyal penting.
            </h3>
            <p className="text-[14px] text-[#91a1ac] leading-relaxed">
              Perubahan status UP ↔ DOWN dan lonjakan CPU di atas 85% tercatat otomatis.
              Kamu tahu apa yang terjadi, dan kapan.
            </p>

            <div className="space-y-2.5 pt-2 text-[13px] text-[#f3f7f8]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#6ce5b1]" />
                <span>Riwayat tersimpan di SQLite lokal</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#6ce5b1]" />
                <span>Maksimal 100 log, dibersihkan otomatis</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenLiveDashboard('logs')}
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#6ce5b1] hover:underline cursor-pointer"
              >
                <span>Buka Connection Logs View</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FREQUENTLY ASKED QUESTIONS (FAQ - Persis Figma 3:1234)
          Hanya tulisan "FAQ" sesuai permintaan user, tata letak 3 kolom rapi.
          ========================================================================= */}
      <section id="faq" className="py-20 px-6 scroll-mt-24">
        <div className="max-w-[1200px] mx-auto">
          {/* Header FAQ simpel */}
          <div className="mb-10">
            <div className="text-[11px] font-semibold text-[#6ce5b1] uppercase tracking-wider">
              SEBELUM MULAI
            </div>
            <h2 className="text-[34px] md:text-[38px] font-bold text-[#f3f7f8] tracking-tight mt-1">
              FAQ
            </h2>
            <p className="text-[14px] text-[#91a1ac] mt-1.5">
              Sedikit jawaban. Langsung eksplorasi.
            </p>
          </div>

          {/* 3 Columns matching Figma 3:1237..3:1245 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Col 1 */}
            <div className="border-t border-[#233039] pt-6 space-y-3">
              <h3 className="text-[17px] font-bold text-[#f3f7f8]">
                Perlu instalasi atau akun?
              </h3>
              <p className="text-[14px] text-[#91a1ac] leading-relaxed">
                Tidak perlu. Demo bisa langsung dijelajahi dari browser, tanpa instalasi dan tanpa registrasi.
              </p>
            </div>

            {/* Col 2 */}
            <div className="border-t border-[#233039] pt-6 space-y-3">
              <h3 className="text-[17px] font-bold text-[#f3f7f8]">
                Apa yang bisa saya coba?
              </h3>
              <p className="text-[14px] text-[#91a1ac] leading-relaxed">
                Lihat telemetri, jelajahi topologi, periksa detail node, dan kenali alur diagnostik jaringan.
              </p>
            </div>

            {/* Col 3 */}
            <div className="border-t border-[#233039] pt-6 space-y-3">
              <h3 className="text-[17px] font-bold text-[#f3f7f8]">
                Seberapa cepat datanya diperbarui?
              </h3>
              <p className="text-[14px] text-[#91a1ac] leading-relaxed">
                Telemetri diperbarui setiap 2 detik. Utilitas diagnostik menampilkan hasil secara real-time.
              </p>
            </div>
          </div>

          {/* Optional Expandable Technical Deep-Dive */}
          <div className="mt-12 pt-8 border-t border-[#1a252e]">
            <div className="space-y-3">
              <div className="rounded-[8px] bg-[#0b1217] border border-[#233039] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenExtraFaq(openExtraFaq === 1 ? null : 1)}
                  className="w-full p-4 text-left flex items-center justify-between text-[13px] font-semibold text-[#f3f7f8] cursor-pointer"
                >
                  <span>Bagaimana cara kerja Auto-Discovery di jaringan lokal?</span>
                  <ChevronDown className={`w-4 h-4 text-[#6ce5b1] transition-transform ${openExtraFaq === 1 ? 'rotate-180' : ''}`} />
                </button>
                {openExtraFaq === 1 && (
                  <div className="px-4 pb-4 text-[12px] text-[#91a1ac] leading-relaxed border-t border-[#1a252e] pt-2">
                    PingKu membaca interface jaringan lokal, menentukan default gateway router, dan memindai port listening secara non-blocking melalui pustaka bawaan Node.js tanpa konfigurasi manual.
                  </div>
                )}
              </div>

              <div className="rounded-[8px] bg-[#0b1217] border border-[#233039] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenExtraFaq(openExtraFaq === 2 ? null : 2)}
                  className="w-full p-4 text-left flex items-center justify-between text-[13px] font-semibold text-[#f3f7f8] cursor-pointer"
                >
                  <span>Apakah sistem ini aman dari celah command injection?</span>
                  <ChevronDown className={`w-4 h-4 text-[#6ce5b1] transition-transform ${openExtraFaq === 2 ? 'rotate-180' : ''}`} />
                </button>
                {openExtraFaq === 2 && (
                  <div className="px-4 pb-4 text-[12px] text-[#91a1ac] leading-relaxed border-t border-[#1a252e] pt-2">
                    Sangat aman. PingKu dibangun dengan prinsip Secure by Design: query DNS menggunakan <code>dns.promises</code>, port scanner menggunakan <code>net.Socket</code>, tanpa pernah menggunakan raw shell execution terhadap input query pengguna.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. DEMO INVITATION (CALLOUT BANNER - Figma 3:11, 3:1246)
          ========================================================================= */}
      <section className="py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative rounded-[16px] bg-[#0c1619] border border-[#234538] p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            {/* Subtle glow */}
            <div className="absolute -left-12 -bottom-12 w-[300px] h-[300px] bg-[#6ce5b1]/10 blur-[100px] pointer-events-none" />

            <div className="space-y-3 max-w-[700px] z-10">
              <div className="text-[11px] font-semibold text-[#6ce5b1] uppercase tracking-wider">
                JARINGAN LEBIH TERLIHAT. KERJA LEBIH TENANG.
              </div>
              <h2 className="text-[34px] md:text-[40px] font-bold text-[#f3f7f8] tracking-tight leading-tight">
                Jangan cuma dibayangkan. <br />
                Coba sendiri dashboard-nya.
              </h2>
              <p className="text-[15px] text-[#91a1ac]">
                Buka demo, pilih node, dan lihat bagaimana semuanya terhubung.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2.5 shrink-0 z-10">
              <button
                type="button"
                onClick={() => onOpenLiveDashboard('overview')}
                className="bg-[#6ce5b1] hover:bg-[#5ce4bd] active:scale-[0.98] text-[#070b0f] font-bold text-[15px] px-8 py-4 rounded-[10px] flex items-center gap-2 shadow-lg shadow-[#6ce5b1]/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Buka live demo sekarang</span>
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </button>
              <span className="text-[12px] text-[#91a1ac]">Tanpa akun. Tanpa ribet.</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. FOOTER (Figma 3:12)
          Logo PingKu, tagline, copyright AGPL-3.0
          ========================================================================= */}
      <footer className="border-t border-[#233039] py-10 px-6 bg-[#070b0f]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#91a1ac]">
          <div className="flex items-center gap-3">
            <img
              src={pingkuLogo}
              alt="PingKu"
              className="h-8 sm:h-9 w-auto max-w-[180px] object-contain select-none"
            />
          </div>

          <div>
            Visibilitas penuh. Dari server ke setiap node.
          </div>

          <div>
            &copy; 2026 Arjuna Setya Ramadhani. AGPL-3.0 License.
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL: ADD NODE DEMO PREVIEW
          ========================================================================= */}
      {isAddNodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111921] border border-[#243139] rounded-[12px] w-full max-w-[420px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b262e]">
              <div className="flex items-center gap-2 font-bold text-[#f3f7f8] text-base">
                <Plus className="w-4 h-4 text-[#6ce5b1]" />
                <span>+ Add Node ke Topologi</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddNodeModalOpen(false)}
                className="text-[#91a1ac] hover:text-[#f3f7f8] text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#91a1ac]">
              Pada live dashboard, Anda dapat menambahkan perangkat/service apa saja ke peta topologi secara permanen.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#91a1ac] block mb-1">Nama Perangkat (Label)</label>
                <input
                  type="text"
                  defaultValue="Ubuntu Storage Server"
                  className="w-full bg-[#152028] border border-[#243139] rounded px-3 py-2 text-[#f3f7f8] outline-none font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#91a1ac] block mb-1">IP Address / Domain</label>
                  <input
                    type="text"
                    defaultValue="192.168.1.50"
                    className="w-full bg-[#152028] border border-[#243139] rounded px-3 py-2 text-[#f3f7f8] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#91a1ac] block mb-1">Port TCP</label>
                  <input
                    type="number"
                    defaultValue="22"
                    className="w-full bg-[#152028] border border-[#243139] rounded px-3 py-2 text-[#f3f7f8] outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddNodeModalOpen(false)}
                className="px-4 py-2 rounded-[6px] bg-[#152028] text-[#91a1ac] hover:text-[#f3f7f8] text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddNodeModalOpen(false);
                  onOpenLiveDashboard('topology');
                }}
                className="px-4 py-2 rounded-[6px] bg-[#6ce5b1] hover:bg-[#5ce4bd] text-[#070b0f] text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Buka di Live Topology</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal overview layout icon
function LayoutOverviewIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}
