const Database = require('better-sqlite3');
const path = require('path');

// Membuat/membuka file database PingKu.db
const db = new Database(path.join(__dirname, 'PingKu.db'));

// 1. Membuat tabel sesuai Skema Database di Bagian 4 PRD
db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    type TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    port INTEGER DEFAULT 0,
    parent_id TEXT,
    pos_x REAL DEFAULT 0,
    pos_y REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS alert_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    severity TEXT NOT NULL,
    message TEXT NOT NULL
  );
`);

// 2. Seed data sesuai tangkapan layar UI/UX
const countNodes = db.prepare('SELECT COUNT(*) AS count FROM nodes').get();

if (countNodes.count === 0) {
  const insertNode = db.prepare(`
    INSERT INTO nodes (id, label, type, ip_address, port, parent_id, pos_x, pos_y)
    VALUES (@id, @label, @type, @ip_address, @port, @parent_id, @pos_x, @pos_y)
  `);

  const seedNodes = [
    {
      id: 'node-1',
      label: 'Router MikroTik',
      type: 'router',
      ip_address: '192.168.10.254',
      port: 8291,
      parent_id: null,
      pos_x: 80,
      pos_y: 260
    },
    {
      id: 'node-2',
      label: 'Main Switch',
      type: 'switch',
      ip_address: '192.168.10.253',
      port: 0,
      parent_id: 'node-1',
      pos_x: 340,
      pos_y: 260
    },
    {
      id: 'node-3',
      label: 'DNS Server BIND9',
      type: 'server',
      ip_address: '192.168.10.1',
      port: 53,
      parent_id: 'node-2',
      pos_x: 600,
      pos_y: 80
    },
    {
      id: 'node-4',
      label: 'Debian Server 12',
      type: 'server',
      ip_address: '192.168.10.2',
      port: 22,
      parent_id: 'node-2',
      pos_x: 600,
      pos_y: 170
    },
    {
      id: 'node-5',
      label: 'CBT Simulator',
      type: 'server',
      ip_address: '192.168.10.3',
      port: 80,
      parent_id: 'node-2',
      pos_x: 600,
      pos_y: 260
    },
    {
      id: 'node-6',
      label: 'Client-3',
      type: 'client',
      ip_address: '192.168.10.15',
      port: 0,
      parent_id: 'node-2',
      pos_x: 600,
      pos_y: 350
    },
    {
      id: 'node-7',
      label: 'Client-1',
      type: 'client',
      ip_address: '192.168.10.20',
      port: 0,
      parent_id: 'node-2',
      pos_x: 600,
      pos_y: 440
    }
  ];

  const insertMany = db.transaction((nodes) => {
    for (const node of nodes) insertNode.run(node);
  });

  insertMany(seedNodes);
  console.log('Seed nodes sesuai mockup berhasil ditambahkan ke PingKu.db!');
}

// Seed alert logs jika kosong
const countLogs = db.prepare('SELECT COUNT(*) AS count FROM alert_logs').get();
if (countLogs.count === 0) {
  const insertLog = db.prepare(`
    INSERT INTO alert_logs (timestamp, severity, message)
    VALUES (?, ?, ?)
  `);
  insertLog.run(new Date(Date.now() - 1000 * 60 * 15).toISOString(), 'CRITICAL', 'Client-3 connection lost (192.168.10.15)');
  insertLog.run(new Date(Date.now() - 1000 * 60 * 45).toISOString(), 'WARNING', 'CPU utilization spike (>80%) on Debian 12 Server');
  insertLog.run(new Date(Date.now() - 1000 * 60 * 90).toISOString(), 'RESOLVED', 'BGP Peering established with MikroTik Router');
}

module.exports = db;
