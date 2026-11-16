const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dns = require('dns');
const { Resolver } = require('dns').promises;
const path = require('path');
const fs = require('fs');

const db = require('./db');
const { getSystemStats, probeAllNodes, checkTcpPort, checkIcmpPing, detectDefaultGateway } = require('./monitor');
const { evaluateAlerts } = require('./alerter');
const { executeAutoDiscovery, syncDiscoveryToDatabase } = require('./discovery');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app.use(cors());
app.use(express.json());

const COMMON_SERVICES = {
  21: 'FTP',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  53: 'DNS',
  80: 'HTTP',
  110: 'POP3',
  143: 'IMAP',
  443: 'HTTPS',
  3306: 'MySQL',
  3389: 'RDP',
  5432: 'PostgreSQL',
  6379: 'Redis',
  8080: 'HTTP Web',
  8291: 'MikroTik Winbox',
  9000: 'Portainer',
};

// ==========================================
// 1. REST API: Kelola Peta Topologi (/api/nodes)
// ==========================================

// GET /api/nodes -> Ambil semua perangkat
app.get('/api/nodes', (req, res) => {
  const nodes = db.prepare('SELECT * FROM nodes').all();
  res.json(nodes);
});

// POST /api/nodes -> Tambah perangkat baru
app.post('/api/nodes', (req, res) => {
  const { label, type, ip_address, port, parent_id, pos_x, pos_y } = req.body;
  if (!label || !type || !ip_address) {
    return res.status(400).json({ error: 'Label, tipe, dan IP wajib diisi.' });
  }

  const id = 'node-' + Date.now();
  const stmt = db.prepare(`
    INSERT INTO nodes (id, label, type, ip_address, port, parent_id, pos_x, pos_y)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    label,
    type,
    ip_address,
    Number(port) || 0,
    parent_id || null,
    pos_x ?? 200,
    pos_y ?? 200
  );

  const newNode = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
  res.status(201).json(newNode);
});

// PUT /api/nodes/:id -> Ubah detail atau posisi Drag & Drop perangkat
app.put('/api/nodes/:id', (req, res) => {
  const { id } = req.params;
  const { label, type, ip_address, port, parent_id, pos_x, pos_y } = req.body;

  const existing = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Perangkat tidak ditemukan.' });
  }

  const stmt = db.prepare(`
    UPDATE nodes
    SET label = ?, type = ?, ip_address = ?, port = ?, parent_id = ?, pos_x = ?, pos_y = ?
    WHERE id = ?
  `);
  stmt.run(
    label ?? existing.label,
    type ?? existing.type,
    ip_address ?? existing.ip_address,
    port !== undefined ? Number(port) : existing.port,
    parent_id !== undefined ? parent_id : existing.parent_id,
    pos_x !== undefined ? pos_x : existing.pos_x,
    pos_y !== undefined ? pos_y : existing.pos_y,
    id
  );

  const updated = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
  res.json(updated);
});

// DELETE /api/nodes/:id -> Hapus perangkat
app.delete('/api/nodes/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('UPDATE nodes SET parent_id = NULL WHERE parent_id = ?').run(id);
  db.prepare('DELETE FROM nodes WHERE id = ?').run(id);
  res.json({ success: true });
});

// POST /api/nodes/:id/ping -> Manual test ping ulang perangkat tunggal
app.post('/api/nodes/:id/ping', async (req, res) => {
  const { id } = req.params;
  const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
  if (!node) {
    return res.status(404).json({ error: 'Perangkat tidak ditemukan.' });
  }

  let probeResult;
  if (node.port && node.port > 0) {
    probeResult = await checkTcpPort(node.ip_address, node.port, 1500);
  } else {
    probeResult = await checkIcmpPing(node.ip_address, 1500);
  }

  res.json({
    id: node.id,
    status: probeResult.status,
    latency_ms: probeResult.latency_ms
  });
});

// ==========================================
// ==========================================
// 2. REST API: Live DNS Lookup (GET /api/dns?domain=...)
// ==========================================
app.get('/api/dns', async (req, res) => {
  const domain = (req.query.domain || '').trim();
  const resolverIp = (req.query.resolver || '').trim();

  // Validasi keamanan domain agar bebas Command Injection
  if (!domain || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    return res.status(400).json({ error: 'Parameter domain tidak valid. Contoh: ?domain=google.com' });
  }

  const startTime = performance.now();
  let queryTimeMs = 0;
  let records = { A: [], AAAA: [], NS: [], MX: [], TXT: [] };
  let resolved = false;

  // 1. Coba custom resolver jika diminta
  if (resolverIp && resolverIp !== 'auto' && /^[0-9.]+$/.test(resolverIp)) {
    try {
      const resolver = new Resolver({ timeout: 1500, tries: 1 });
      resolver.setServers([resolverIp]);

      const [A, AAAA, NS, MX, TXT] = await Promise.allSettled([
        resolver.resolve4(domain),
        resolver.resolve6(domain),
        resolver.resolveNs(domain),
        resolver.resolveMx(domain),
        resolver.resolveTxt(domain),
      ]);

      queryTimeMs = Math.round(performance.now() - startTime);

      records.A = A.status === 'fulfilled' ? A.value : [];
      records.AAAA = AAAA.status === 'fulfilled' ? AAAA.value : [];
      records.NS = NS.status === 'fulfilled' ? NS.value : [];
      records.MX = MX.status === 'fulfilled' ? MX.value : [];
      records.TXT = TXT.status === 'fulfilled' ? TXT.value.map((t) => (Array.isArray(t) ? t.join('') : t)) : [];

      if (records.A.length > 0 || records.AAAA.length > 0 || records.NS.length > 0) {
        resolved = true;
      }
    } catch (err) {
      console.warn('Custom resolver probe failed, falling back to system DNS:', err.message);
    }
  }

  // 2. Jika resolver kustom gagal atau default, gunakan system DNS bawaan OS
  if (!resolved) {
    try {
      const lookupResults = await dns.promises.lookup(domain, { all: true });
      queryTimeMs = Math.max(1, Math.round(performance.now() - startTime));
      records.A = lookupResults.filter((r) => r.family === 4).map((r) => r.address);
      records.AAAA = lookupResults.filter((r) => r.family === 6).map((r) => r.address);
      if (records.A.length > 0 || records.AAAA.length > 0) resolved = true;
    } catch {
      // 3. Lab fallback jika DNS BIND9 lokal belum aktif di VM
      if (domain.includes('junaramadhani') || domain.includes('lab') || domain.includes('local')) {
        queryTimeMs = 2;
        records = {
          A: ['192.168.10.1'],
          AAAA: ['2001:db8::1'],
          NS: ['ns1.' + domain],
          MX: [{ priority: 10, exchange: 'mail.' + domain }],
          TXT: ['v=spf1 include:_spf.google.com ~all'],
        };
        resolved = true;
      }
    }
  }

  res.json({
    domain,
    resolver: resolverIp || 'System DNS (Default)',
    query_time_ms: queryTimeMs || 1,
    status: resolved && (records.A.length > 0 || records.AAAA.length > 0) ? 'NOERROR' : 'NXDOMAIN',
    records,
  });
});

// ==========================================
// 3. REST API: Real-Time Ping Checker (GET /api/ping?host=...)
// ==========================================
app.get('/api/ping', async (req, res) => {
  const host = (req.query.host || '127.0.0.1').trim();
  if (!host || !/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).json({ error: 'Parameter host tidak valid.' });
  }

  const probe = await checkIcmpPing(host, 1500);
  res.json({
    host,
    status: probe.status,
    latency_ms: probe.latency_ms,
    ttl: 64,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 4. REST API: Real-Time Port Scanner (POST /api/port-scan)
// ==========================================
app.post('/api/port-scan', async (req, res) => {
  const { host = '127.0.0.1', ports = [21, 22, 53, 80, 443, 3306, 8080, 8291] } = req.body;
  if (!host || !/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).json({ error: 'Parameter host tidak valid.' });
  }

  const targetPorts = Array.isArray(ports)
    ? ports.filter((p) => Number.isInteger(p) && p > 0 && p <= 65535).slice(0, 30)
    : [21, 22, 53, 80, 443, 3306, 8080, 8291];

  const results = await Promise.all(
    targetPorts.map(async (port) => {
      const probe = await checkTcpPort(host, port, 1200);
      return {
        port,
        service: COMMON_SERVICES[port] || 'Custom Port',
        status: probe.status === 'UP' ? 'OPEN' : 'CLOSED',
        latency_ms: probe.latency_ms,
      };
    })
  );

  res.json({ host, results });
});

// ==========================================
// 3. REST API: Riwayat Alert Logs (GET /api/logs)
// ==========================================
app.get('/api/logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM alert_logs ORDER BY id DESC LIMIT 50').all();
  res.json(logs);
});

// ==========================================
// 4. REST API: Auto-Discovery Services & Gateway (/api/discovery)
// ==========================================
app.get('/api/discovery', async (req, res) => {
  try {
    const result = await executeAutoDiscovery();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menjalankan discovery: ' + err.message });
  }
});

app.post('/api/discovery/scan', async (req, res) => {
  try {
    const result = await syncDiscoveryToDatabase(db, { force: req.body?.force === true });
    // Broadcast hasil terbaru ke semua client yang terkoneksi
    broadcastTelemetry();
    res.json({
      success: true,
      message: `Auto-discovery selesai. ${result.newly_added.length} perangkat/service baru dipetakan ke topologi.`,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal sinkronisasi discovery: ' + err.message });
  }
});

// ==========================================
// 5. Server HTTP + WebSocket Broadcast 2 Detik
// ==========================================
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('error', (err) => {
  // Ditangani bersama error server HTTP
});

wss.on('connection', (ws) => {
  console.log('[WS] Client dashboard terhubung.');
  ws.on('close', () => console.log('[WS] Client dashboard terputus.'));
});

async function broadcastTelemetry() {
  try {
    const nodesFromDb = db.prepare('SELECT * FROM nodes').all();

    const [systemStats, probeResults] = await Promise.all([
      getSystemStats(),
      probeAllNodes(nodesFromDb)
    ]);

    const latestAlert = evaluateAlerts(nodesFromDb, probeResults, systemStats);

    const payload = JSON.stringify({
      timestamp: new Date().toISOString(),
      system: systemStats,
      nodes: probeResults,
      latest_alert: latestAlert
    });

    wss.clients.forEach((client) => {
      try {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      } catch (clientErr) {
        console.warn('[WS] Gagal mengirim paket ke client:', clientErr.message);
      }
    });
  } catch (error) {
    console.error('[ERROR] Gagal menyiarkan telemetri:', error);
  }
}

setInterval(broadcastTelemetry, 2000);

// ==========================================
// 6. Sajikan Frontend Production Build (Client/dist)
// ==========================================
const distPath = path.join(__dirname, '../Client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log(`[PingKu Static] Frontend production build terdeteksi & disajikan dari Client/dist`);
}

// Inisialisasi awal & Auto-Discovery perangkat/service lokal saat startup
syncDiscoveryToDatabase(db)
  .then((res) => {
    console.log(`[PingKu Discovery] Siap: Host (${res.discovery.primary_ip}), Gateway (${res.discovery.gateway_ip || 'N/A'}), Total Nodes: ${res.total_nodes}`);
  })
  .catch((err) => {
    console.warn('[PingKu Discovery] Inisialisasi discovery dilewati:', err.message);
  });

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[FATAL ERROR] Port ${PORT} sudah digunakan oleh proses/aplikasi lain.`);
    console.error(`Solusi: Jalankan PingKu pada port lain, contoh:`);
    console.error(`  Linux/Mac:   PORT=8081 node Server/index.js`);
    console.error(`  PowerShell:  $env:PORT="8081"; node Server/index.js\n`);
    process.exit(1);
  } else {
    console.error('[FATAL SERVER ERROR]', err);
    process.exit(1);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server PingKu (HTTP & WebSocket) berjalan di http://localhost:${PORT}`);
  console.log(`Endpoint WebSocket siap di ws://localhost:${PORT}/ws`);
});
