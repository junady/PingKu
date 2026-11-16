const os = require('os');
const si = require('systeminformation');
const { checkTcpPort, checkIcmpPing } = require('./monitor');

// Definisi service umum untuk dipindai secara otomatis pada host
const COMMON_SERVICES = [
  { port: 80, label: 'HTTP Web Server', type: 'server', category: 'Web' },
  { port: 443, label: 'HTTPS Web Server', type: 'server', category: 'Web' },
  { port: 22, label: 'SSH Remote Server', type: 'server', category: 'Remote' },
  { port: 3306, label: 'MySQL Database', type: 'server', category: 'Database' },
  { port: 5432, label: 'PostgreSQL Database', type: 'server', category: 'Database' },
  { port: 6379, label: 'Redis Cache', type: 'server', category: 'Cache' },
  { port: 27017, label: 'MongoDB', type: 'server', category: 'Database' },
  { port: 53, label: 'DNS Resolver', type: 'server', category: 'Network' },
  { port: 3000, label: 'Node.js / React Web', type: 'server', category: 'Web' },
  { port: 8080, label: 'PingKu Core API', type: 'server', category: 'Management' },
  { port: 8291, label: 'MikroTik Winbox', type: 'router', category: 'Network' },
  { port: 9000, label: 'Portainer / Container', type: 'server', category: 'DevOps' },
  { port: 3389, label: 'RDP Remote Desktop', type: 'client', category: 'Remote' },
];

// Cari IP LAN utama perangkat host
function getPrimaryLocalIp() {
  try {
    const ifaces = os.networkInterfaces();
    for (const name in ifaces) {
      for (const net of ifaces[name]) {
        if (net.family === 'IPv4' && !net.internal && net.address !== '127.0.0.1') {
          return { ip: net.address, iface: name };
        }
      }
    }
  } catch (err) {
    console.warn('[Discovery] Gagal membaca interface jaringan:', err.message);
  }
  return { ip: '127.0.0.1', iface: 'lo' };
}

// Deteksi gateway aktif
async function getGatewayIp() {
  try {
    const gw = await si.networkGatewayDefault();
    if (gw && typeof gw === 'string' && /^[0-9.]+$/.test(gw) && gw !== '0.0.0.0') {
      return gw;
    }
  } catch {}
  return null;
}

// Pindai service & port lokal yang sedang aktif (listening)
async function scanLocalServices(targetIp = '127.0.0.1') {
  const detected = [];

  await Promise.all(
    COMMON_SERVICES.map(async (service) => {
      try {
        const probe = await checkTcpPort(targetIp, service.port, 400);
        if (probe.status === 'UP') {
          detected.push({
            ...service,
            latency_ms: probe.latency_ms,
            status: 'UP',
          });
        }
      } catch {}
    })
  );

  return detected.sort((a, b) => a.port - b.port);
}

// Eksekusi auto-discovery lengkap
async function executeAutoDiscovery() {
  const hostInfo = {
    hostname: os.hostname() || 'localhost',
    arch: os.arch() || 'x64',
    platform: os.platform(),
  };

  const primaryNet = getPrimaryLocalIp();
  const gatewayIp = await getGatewayIp();
  const localServices = await scanLocalServices('127.0.0.1');

  return {
    host: hostInfo,
    primary_ip: primaryNet.ip,
    interface: primaryNet.iface,
    gateway_ip: gatewayIp,
    services: localServices,
  };
}

// Sinkronkan hasil discovery ke database SQLite
async function syncDiscoveryToDatabase(db, options = { force: false }) {
  const discovery = await executeAutoDiscovery();
  const existingNodes = db.prepare('SELECT * FROM nodes').all();
  const newlyAdded = [];

  const hostIp = discovery.primary_ip || '127.0.0.1';
  const hostname = discovery.host.hostname;

  // 1. Pastikan Node Host Server ada
  let hostNode = existingNodes.find((n) => n.id === 'node-1' || n.type === 'server' && !n.parent_id);
  if (!hostNode) {
    const insertHost = db.prepare(`
      INSERT INTO nodes (id, label, type, ip_address, port, parent_id, pos_x, pos_y)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const hostLabel = `Host Server (${hostname})`;
    insertHost.run('node-1', hostLabel, 'server', hostIp, 8080, null, 280, 200);
    hostNode = { id: 'node-1', label: hostLabel, ip_address: hostIp, port: 8080 };
    newlyAdded.push(hostNode);
  } else if (options.force || hostNode.ip_address === '127.0.0.1' && hostIp !== '127.0.0.1') {
    // Perbarui IP host jika sebelumnya hanya 127.0.0.1 tapi sekarang terdeteksi IP LAN
    db.prepare('UPDATE nodes SET ip_address = ? WHERE id = ?').run(hostIp, hostNode.id);
  }

  // 2. Sinkronkan Default Gateway
  if (discovery.gateway_ip) {
    const gwNode = existingNodes.find((n) => n.type === 'router' || n.id === 'node-2');
    if (!gwNode) {
      const insertGw = db.prepare(`
        INSERT INTO nodes (id, label, type, ip_address, port, parent_id, pos_x, pos_y)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertGw.run('node-2', 'Default Gateway', 'router', discovery.gateway_ip, 0, hostNode.id, 620, 200);
      newlyAdded.push({ id: 'node-2', label: 'Default Gateway', ip_address: discovery.gateway_ip });
    } else if (gwNode.ip_address !== discovery.gateway_ip) {
      db.prepare('UPDATE nodes SET ip_address = ? WHERE id = ?').run(discovery.gateway_ip, gwNode.id);
    }
  }

  // 3. Tambahkan Service Lokal yang Aktif
  const insertService = db.prepare(`
    INSERT INTO nodes (id, label, type, ip_address, port, parent_id, pos_x, pos_y)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let serviceOffsetX = 280;
  let serviceOffsetY = 380;

  discovery.services.forEach((srv) => {
    // Jangan duplikasi jika port sudah terdaftar
    const isAlreadyRegistered = existingNodes.some(
      (n) => n.port === srv.port && (n.ip_address === '127.0.0.1' || n.ip_address === hostIp)
    );

    if (!isAlreadyRegistered && srv.port !== 8080) {
      const serviceId = `svc-${srv.port}`;
      insertService.run(
        serviceId,
        srv.label,
        srv.type,
        '127.0.0.1',
        srv.port,
        hostNode.id,
        serviceOffsetX,
        serviceOffsetY
      );

      newlyAdded.push({
        id: serviceId,
        label: srv.label,
        port: srv.port,
        type: srv.type,
        ip_address: '127.0.0.1',
      });

      serviceOffsetX += 260;
      if (serviceOffsetX > 800) {
        serviceOffsetX = 280;
        serviceOffsetY += 160;
      }
    }
  });

  // Catat log jika ada node baru ditemukan
  if (newlyAdded.length > 0) {
    try {
      db.prepare(`
        INSERT INTO alert_logs (severity, message)
        VALUES (?, ?)
      `).run(
        'INFO',
        `Auto-discovery: ${newlyAdded.length} perangkat/service lokal berhasil dipetakan ke topologi.`
      );
    } catch {}
  }

  return {
    discovery,
    newly_added: newlyAdded,
    total_nodes: db.prepare('SELECT COUNT(*) as count FROM nodes').get().count,
  };
}

module.exports = {
  executeAutoDiscovery,
  syncDiscoveryToDatabase,
  getPrimaryLocalIp,
  scanLocalServices,
  COMMON_SERVICES,
};
