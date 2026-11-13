import type { SolicitudVtv, RespuestaVtvAceptada, VtvConsultaPort } from '../../domain/ports/vtv-consulta.port.js';

export class PatenteVtvAdapter implements VtvConsultaPort {
  constructor(private readonly apiBase: string, private readonly apiKey: string) {
    if (!this.apiKey || this.apiKey === 'pa_live_replace_me') throw new Error('PATENTE_API_KEY no configurada. Copiá .env.example a .env y pegá tu pa_live_xxx.');
  }
  async consultarVtv(solicitud: SolicitudVtv, opts?: { idempotencyKey?: string; xToken?: string }): Promise<RespuestaVtvAceptada> {
    const res = await fetch(this.apiBase, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
        'idempotency-key': opts?.idempotencyKey ?? 'vtv-demo-001',
        'x-token': opts?.xToken ?? 'orden-externa-001',
      },
      body: JSON.stringify(solicitud),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`Patente VTV ${res.status}: ${JSON.stringify(body)}`);
    return body as RespuestaVtvAceptada;
  }
}
