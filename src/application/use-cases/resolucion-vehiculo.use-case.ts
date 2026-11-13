import type { ConsultaPatentePort, VehiculoResuelto } from '../../domain/ports/consulta-patente.port.js';
import { normalizarPatente, esPatenteValida } from '../../domain/models/patente.js';

export class ResolucionVehiculoUseCase {
  private cache = new Map<string, VehiculoResuelto>();
  constructor(private readonly port: ConsultaPatentePort) {}

  async execute(patenteRaw: string): Promise<VehiculoResuelto> {
    const patente = normalizarPatente(patenteRaw);
    if (!esPatenteValida(patente)) throw new Error('Patente inválida. Usá formato AA123BB o ABC123.');
    if (this.cache.has(patente)) return this.cache.get(patente)!;
    const data = await this.port.resolverPorPatente(patente);
    this.cache.set(patente, data);
    return data;
  }
}
