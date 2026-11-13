import type { RepuestoCandidato } from '../models/repuesto.js';

export interface CatalogoRepuestosPort {
  buscar(consulta: string, opts?: { marca?: string; modelo?: string; anio?: number; motorCodigo?: string }): Promise<RepuestoCandidato[]>;
}
