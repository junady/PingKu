module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const logs = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      severity: 'INFO',
      message: 'PingKu NOC Live Telemetry siap dipantau.'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 180000).toISOString(),
      severity: 'RESOLVED',
      message: 'Core Switch L3 (Cisco Catalyst 3850) backbone 10G stabil.'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      severity: 'INFO',
      message: 'Router Gateway (MikroTik CCR2004) BGP & NAT sinkron.'
    }
  ];

  res.status(200).json(logs);
};
