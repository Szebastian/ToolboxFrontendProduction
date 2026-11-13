import type { SolicitudVtv, RespuestaVtvAceptada, VtvConsultaPort } from '../../domain/ports/vtv-consulta.port.js';

function normalizarPatente(p: string): string {
  return p.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

export class ConsultarVtvUseCase {
  constructor(private readonly port: VtvConsultaPort) {}

  async execute(patentes: string[], jurisdicciones: string[] = ['pba', 'caba']): Promise<RespuestaVtvAceptada> {
    const patenteNorm = patentes.map(normalizarPatente).filter(Boolean);
    if (!patenteNorm.length) throw new Error('Patente requerida');
    const solicitud: SolicitudVtv = { patente: patenteNorm, jurisdiccion: jurisdicciones.map(j => j.toLowerCase()) };
    const idempotencyKey = `vtv-${patenteNorm.join('-')}-${Date.now()}`;
    const xToken = `orden-${patenteNorm[0]}`;
    return this.port.consultarVtv(solicitud, { idempotencyKey, xToken });
  }
}
