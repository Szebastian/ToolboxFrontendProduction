import type { CatalogoRepuestosPort } from '../../domain/ports/catalogo-repuestos.port.js';
import type { RepuestoCandidato } from '../../domain/models/repuesto.js';

export class BuscarRepuestosUseCase {
  constructor(private readonly port: CatalogoRepuestosPort) {}
  async execute(consulta: string, vehiculo?: { marca?: string; modelo?: string; anio?: number; motorCodigo?: string }): Promise<RepuestoCandidato[]> {
    if (!consulta.trim()) return [];
    return this.port.buscar(consulta, vehiculo);
  }
}
