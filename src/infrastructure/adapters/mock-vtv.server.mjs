// Servidor mock local que replica POST /v1/consultas de patente.ar
// Uso: npm run vtv:mock  -> http://localhost:3001/v1/consultas
import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || !req.url.startsWith('/v1/consultas')) {
    res.writeHead(404, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ error: 'not found' }));
  }
  let data = '';
  req.on('data', (c) => (data += c));
  req.on('end', () => {
    const payload = JSON.parse(data || '{}');
    const patente = payload.patente?.[0] ?? 'AB123CD';
    let hash = 0;
    for (const c of String(patente)) hash = (hash * 31 + c.charCodeAt(0)) % 100;
    const vencido = hash % 3 === 0;
    res.writeHead(202, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      code: 202,
      status: 'accepted',
      message: vencido ? 'MOCK: VTV vencida (simulado)' : 'MOCK: VTV vigente (simulado)',
      requestId: `req_mock_${hash}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      patente,
      jurisdiccion: payload.jurisdiccion ?? ['chubut'],
      idempotencyKey: req.headers['idempotency-key'] ?? null,
      xToken: req.headers['x-token'] ?? null,
    }));
  });
});

server.listen(process.env.PORT ?? 3001, () => {
  console.log('Mock VTV en http://localhost:3001/v1/consultas');
});
