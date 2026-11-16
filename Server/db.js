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
      label: 'Local Server',
      type: 'server',
      ip_address: '127.0.0.1',
      port: 8080,
      parent_id: null,
      pos_x: 280,
      pos_y: 200
    },
    {
      id: 'node-2',
      label: 'Default Gateway',
      type: 'router',
      ip_address: '192.168.1.1',
      port: 0,
      parent_id: 'node-1',
      pos_x: 560,
      pos_y: 200
    }
  ];

  const insertMany = db.transaction((nodes) => {
    for (const node of nodes) insertNode.run(node);
  });

  insertMany(seedNodes);
  console.log('Seed nodes sesuai mockup berhasil ditambahkan ke PingKu.db!');
}

// alert_logs dibiarkan bersih pada inisialisasi awal, akan diisi secara live oleh alerter.js

module.exports = db;
