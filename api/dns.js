const dns = require('dns').promises;

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const domain = (req.query.domain || 'google.com').trim();
  const startTime = Date.now();

  if (!domain || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    return res.status(400).json({ error: 'Parameter domain tidak valid. Contoh: ?domain=google.com' });
  }

  try {
    const [a, aaaa, ns, mx, txt] = await Promise.allSettled([
      dns.resolve4(domain),
      dns.resolve6(domain),
      dns.resolveNs(domain),
      dns.resolveMx(domain),
      dns.resolveTxt(domain)
    ]);

    const records = {
      A: a.status === 'fulfilled' ? a.value : [],
      AAAA: aaaa.status === 'fulfilled' ? aaaa.value : [],
      NS: ns.status === 'fulfilled' ? ns.value : [],
      MX: mx.status === 'fulfilled' ? mx.value : [],
      TXT: txt.status === 'fulfilled' ? txt.value.map((t) => (Array.isArray(t) ? t.join('') : t)) : []
    };

    const resolved = records.A.length > 0 || records.AAAA.length > 0 || records.NS.length > 0;

    return res.status(200).json({
      domain,
      resolver: 'Vercel Edge DNS (Live Internet)',
      query_time_ms: Math.max(1, Date.now() - startTime),
      status: resolved ? 'NOERROR' : 'NXDOMAIN',
      records
    });
  } catch (err) {
    return res.status(200).json({
      domain,
      resolver: 'Vercel Edge DNS',
      query_time_ms: Math.max(1, Date.now() - startTime),
      status: 'NXDOMAIN',
      records: { A: [], AAAA: [], NS: [], MX: [], TXT: [] },
      error: err.message
    });
  }
};
