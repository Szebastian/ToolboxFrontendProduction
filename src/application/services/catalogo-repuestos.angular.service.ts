import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { RepuestoCandidato } from '../../domain/models/repuesto.js';
import { normalizarTexto } from '../../domain/models/repuesto.js';
import { CotizaPartesAdapter } from '../../infrastructure/adapters/cotizapartes.adapter.js';
import { BuscarRepuestosUseCase } from '../use-cases/buscar-repuestos.use-case.js';
import { DemoApiService, ParteCatalogoBackend } from './demo-api.service.js';

// Modelos conocidos para saber si una pieza menciona OTRO auto
const MARCAS: Array<[string, string]> = [
  ['vw', 'volkswagen'], ['volkswagen', 'volkswagen'], ['toyota', 'toyota'], ['ford', 'ford'],
  ['chevrolet', 'chevrolet'], ['fiat', 'fiat'], ['renault', 'renault'], ['peugeot', 'peugeot'],
];
const MODELOS = ['passat', 'vento', 'gol', 'saveiro', 'polo', 'golf', 'bora', 'amarok', 'hilux', 'sw4', 'corolla', 'ranger', 'ecosport', 'corsa', 'agile', 'onix', 'crono', 'palio', 'argo', 'sandero', '208'];

@Injectable({ providedIn: 'root' })
export class CatalogoRepuestosService {
  private readonly uc = new BuscarRepuestosUseCase(new CotizaPartesAdapter());
  private readonly api = inject(DemoApiService);
  resultados = signal<RepuestoCandidato[]>([]);
  cargando = signal(false);

  async buscar(consulta: string, vehiculo?: { marca?: string; modelo?: string; anio?: number; motorCodigo?: string }): Promise<void> {
    this.cargando.set(true);
    try {
      // Dos fuentes en paralelo: el catálogo acumulado REAL (backend → Supabase,
      // con fotos y precios de las cotizaciones) + el catálogo de referencia OEM.
      const [mock, delBackend] = await Promise.all([
        this.uc.execute(consulta, vehiculo),
        firstValueFrom(this.api.catalogo(consulta)).catch(() => [] as ParteCatalogoBackend[]),
      ]);

      const mapeados: RepuestoCandidato[] = delBackend.map(p => ({
        id: 'tb-' + p.id,
        nombre: titular(p.part_name),
        descripcionTecnica: p.times_quoted === 1
          ? 'Cotizado 1 vez en la red Toolbox'
          : `Cotizado ${p.times_quoted} veces en la red Toolbox`,
        marca: 'Red Toolbox',
        numeroOem: p.part_number ?? undefined,
        compatibilidad: [],
        stockLocal: p.last_quoted_price != null,
        precioRango: p.last_quoted_price != null ? `desde $ ${p.last_quoted_price.toLocaleString('es-AR')}` : 'A cotizar',
        fuente: 'toolbox-backend',
        imagen: p.default_photo_url ?? undefined,
      }));

      // Compatibilidad con el auto registrado: una pieza que menciona otro
      // auto ("...vw gol", "...toyota") queda fuera del auto activo.
      const todos = [...mapeados, ...mock].filter(p => this.esCompatible(p, vehiculo));
      this.resultados.set(todos);
    } finally {
      this.cargando.set(false);
    }
  }

  private esCompatible(p: RepuestoCandidato, veh?: { marca?: string; modelo?: string; anio?: number }): boolean {
    if (!veh) return true;
    // 1) Ficha explícita de compatibilidad (catálogo de referencia OEM)
    if (p.compatibilidad.length) {
      const marcaActiva = normalizarTexto(veh.marca ?? '');
      const modelosActivos = normalizarTexto(veh.modelo ?? '').split(/\s+/);
      return p.compatibilidad.some(c => {
        const ficha = normalizarTexto(c);
        return (marcaActiva.length > 2 && ficha.includes(marcaActiva)) || modelosActivos.some(m => m.length > 2 && ficha.includes(m));
      });
    }
    // 2) Sin ficha: heurística sobre el nombre (catálogo acumulado del backend)
    const tokens = normalizarTexto(p.nombre + ' ' + p.descripcionTecnica).split(/\s+/);
    const marcaActiva = normalizarTexto(veh.marca ?? '');
    const modelosActivos = normalizarTexto(veh.modelo ?? '').split(/\s+/);
    const marcaParte = MARCAS.find(([clave]) => tokens.includes(clave))?.[1];
    const modelosParte = tokens.filter(t => MODELOS.includes(t));
    if (modelosParte.length) {
      // Menciona un modelo: compatible solo si es el del auto activo
      return modelosParte.some(m => modelosActivos.includes(m));
    }
    if (marcaParte) return marcaParte === marcaActiva;
    return true; // pieza genérica: sirve para cualquier auto
  }
}

function titular(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
