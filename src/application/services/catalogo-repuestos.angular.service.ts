import { Injectable, signal } from '@angular/core';
import type { RepuestoCandidato } from '../../domain/models/repuesto.js';
import { CotizaPartesAdapter } from '../../infrastructure/adapters/cotizapartes.adapter.js';
import { BuscarRepuestosUseCase } from '../use-cases/buscar-repuestos.use-case.js';

@Injectable({ providedIn: 'root' })
export class CatalogoRepuestosService {
  private readonly uc = new BuscarRepuestosUseCase(new CotizaPartesAdapter());
  resultados = signal<RepuestoCandidato[]>([]);
  cargando = signal(false);

  async buscar(consulta: string, vehiculo?: { marca?: string; modelo?: string; anio?: number; motorCodigo?: string }): Promise<void> {
    this.cargando.set(true);
    try {
      const r = await this.uc.execute(consulta, vehiculo);
      this.resultados.set(r);
    } finally {
      this.cargando.set(false);
    }
  }
}
