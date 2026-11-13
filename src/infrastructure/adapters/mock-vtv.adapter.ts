import type { SolicitudVtv, RespuestaVtvAceptada, VtvConsultaPort } from '../../domain/ports/vtv-consulta.port.js';

// Mock local para testing sin API key de patente.ar.
// Respeta el mismo contrato: POST /v1/consultas -> 202 {code,status,requestId,timestamp}
export class MockVtvAdapter implements VtvConsultaPort {
  async consultarVtv(solicitud: SolicitudVtv, opts?: { idempotencyKey?: string; xToken?: string }): Promise<RespuestaVtvAceptada> {
    const patente = solicitud.patente[0] ?? 'AB123CD';
    // determinista: hash simple de patente para simular vencido/vigente
    let hash = 0;
    for (const c of patente) hash = (hash * 31 + c.charCodeAt(0)) % 100;
    const vencido = hash % 3 === 0;
    return {
      code: 202,
      status: 'accepted',
      message: vencido ? 'MOCK: VTV vencida (simulado)' : 'MOCK: VTV vigente (simulado)',
      requestId: `req_mock_${hash}_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
}
