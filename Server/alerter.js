const db = require('./db');

// Memori sementara untuk menyimpan status terakhir tiap node (contoh: { 'node-1': 'UP' })
const previousNodeStatus = {};
let lastCpuAlertTime = 0; // Mencegah spam log CPU setiap 2 detik

// Fungsi pembantu untuk menyimpan log ke SQLite & membatasi maksimal 100 baris (FR-05)
function saveAlertLog(severity, message) {
  try {
    const insertStmt = db.prepare(`
      INSERT INTO alert_logs (timestamp, severity, message)
      VALUES (datetime('now', 'localtime'), ?, ?)
    `);
    insertStmt.run(severity, message);

    // Hapus log terlama jika jumlahnya melebihi 100 baris sesuai spesifikasi FR-05
    db.exec(`
      DELETE FROM alert_logs
      WHERE id NOT IN (
        SELECT id FROM alert_logs ORDER BY id DESC LIMIT 100
      )
    `);
  } catch (err) {
    console.warn('[Alerter] Gagal menyimpan log ke database:', err.message);
  }

  // Kembalikan objek log terbaru untuk dikirim lewat WebSocket ('latest_alert')
  return {
    timestamp: new Date().toISOString(),
    severity,
    message
  };
}

// Fungsi utama yang dipanggil setiap 2 detik
function evaluateAlerts(nodesFromDb, probeResults, systemStats) {
  if (!Array.isArray(nodesFromDb) || !Array.isArray(probeResults)) return null;
  let latestAlert = null;

  // 1. Cek perubahan status setiap node (UP -> DOWN atau DOWN -> UP)
  for (const result of probeResults) {
    const nodeInfo = nodesFromDb.find((n) => n.id === result.id);
    const nodeLabel = nodeInfo ? `${nodeInfo.label} (${nodeInfo.ip_address})` : result.id;
    const prevStatus = previousNodeStatus[result.id];
    const currStatus = result.status;

    // Jika ini bukan pengecekan pertama kali dan statusnya berubah
    if (prevStatus && prevStatus !== currStatus) {
      if (currStatus === 'DOWN') {
        const msg = `CRITICAL: Perangkat ${nodeLabel} tidak merespons (UP -> DOWN).`;
        latestAlert = saveAlertLog('CRITICAL', msg);
        console.log('[ALERT]', msg);
      } else if (currStatus === 'UP') {
        const msg = `INFO: Perangkat ${nodeLabel} kembali terhubung (DOWN -> UP, ${result.latency_ms}ms).`;
        latestAlert = saveAlertLog('INFO', msg);
        console.log('[ALERT]', msg);
      }
    }

    // Perbarui ingatan status terakhir untuk perbandingan 2 detik berikutnya
    previousNodeStatus[result.id] = currStatus;
  }

  // 2. Cek ambang batas penggunaan CPU (> 85% sesuai FR-05)
  if (systemStats && systemStats.cpu_percent > 85) {
    const now = Date.now();
    // Beri jeda minimal 30 detik antar peringatan CPU tinggi agar log tidak penuh sesak
    if (now - lastCpuAlertTime > 30000) {
      const msg = `WARNING: Penggunaan CPU server tinggi mencapai ${systemStats.cpu_percent}%.`;
      latestAlert = saveAlertLog('WARNING', msg);
      lastCpuAlertTime = now;
      console.log('[ALERT]', msg);
    }
  }

  return latestAlert;
}

// ==========================================
// Tes Simulasi Perubahan Status lewat Terminal
// ==========================================
if (require.main === module) {
  const nodes = db.prepare('SELECT * FROM nodes').all();
  console.log('Menjalankan simulasi perubahan status...');

  // Detik ke-0: Semua perangkat dianggap UP
  evaluateAlerts(nodes, [{ id: 'node-1', status: 'UP', latency_ms: 2 }], { cpu_percent: 20 });

  // Detik ke-2: node-1 tiba-tiba berubah menjadi DOWN
  const alertBaru = evaluateAlerts(nodes, [{ id: 'node-1', status: 'DOWN', latency_ms: null }], { cpu_percent: 22 });

  console.log('Hasil latest_alert yang tercipta:', alertBaru);
  console.log('Isi tabel alert_logs di database:', db.prepare('SELECT * FROM alert_logs').all());
}

module.exports = { evaluateAlerts, saveAlertLog };
