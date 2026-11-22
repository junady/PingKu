const dns = require('dns').promises;

// Proteksi DoS: Cache in-memory DNS per domain (TTL 10 detik)
const dnsCache = new Map();
// Proteksi DoS: Rate Limiter per client IP (maks 30 req/menit)
const ipRateMap = new Map();

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Rate Limiting per IP
  const clientIp = (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'anonymous'
  ).trim();

  const now = Date.now();
  const ipEntry = ipRateMap.get(clientIp);

  if (!ipEntry || now > ipEntry.resetTime) {
    ipRateMap.set(clientIp, { count: 1, resetTime: now + 60000 });
  } else if (ipEntry.count >= 30) {
    const retryAfter = Math.max(1, Math.ceil((ipEntry.resetTime - now) / 1000));
    res.setHeader('Retry-After', retryAfter);
    res.setHeader('X-RateLimit-Limit', 30);
    res.setHeader('X-RateLimit-Remaining', 0);
    return res.status(429).json({
      error: 'Terlalu banyak permintaan DNS (maksimum 30 query/menit per IP). Silakan tunggu.',
      retry_after_sec: retryAfter,
    });
  } else {
    ipEntry.count += 1;
  }

  const domain = (req.query.domain || 'google.com').trim().toLowerCase();

  // Validasi keamanan domain
  if (!domain || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    return res.status(400).json({ error: 'Parameter domain tidak valid. Contoh: ?domain=google.com' });
  }

  // 2. Cek Cache DNS Response (TTL 10 detik)
  const cached = dnsCache.get(domain);
  if (cached && now < cached.expiresAt) {
    return res.status(200).json({
      ...cached.data,
      cached: true,
      query_time_ms: 1,
    });
  }

  const startTime = Date.now();

  try {
    const [a, aaaa, ns, mx, txt] = await Promise.allSettled([
      dns.resolve4(domain),
      dns.resolve6(domain),
      dns.resolveNs(domain),
      dns.resolveMx(domain),
      dns.resolveTxt(domain),
    ]);

    const records = {
      A: a.status === 'fulfilled' ? a.value : [],
      AAAA: aaaa.status === 'fulfilled' ? aaaa.value : [],
      NS: ns.status === 'fulfilled' ? ns.value : [],
      MX: mx.status === 'fulfilled' ? mx.value : [],
      TXT: txt.status === 'fulfilled' ? txt.value.map((t) => (Array.isArray(t) ? t.join('') : t)) : [],
    };

    const resolved = records.A.length > 0 || records.AAAA.length > 0 || records.NS.length > 0;
    const responsePayload = {
      domain,
      resolver: 'Vercel Edge DNS (Live Internet)',
      query_time_ms: Math.max(1, Date.now() - startTime),
      status: resolved ? 'NOERROR' : 'NXDOMAIN',
      records,
    };

    // Simpan ke cache DNS
    dnsCache.set(domain, {
      data: responsePayload,
      expiresAt: Date.now() + 10000,
    });
    if (dnsCache.size > 200) {
      const oldest = dnsCache.keys().next().value;
      if (oldest) dnsCache.delete(oldest);
    }

    return res.status(200).json(responsePayload);
  } catch (err) {
    return res.status(200).json({
      domain,
      resolver: 'Vercel Edge DNS',
      query_time_ms: Math.max(1, Date.now() - startTime),
      status: 'NXDOMAIN',
      records: { A: [], AAAA: [], NS: [], MX: [], TXT: [] },
      error: err.message,
    });
  }
};
