import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { RepuestoCandidato } from '../../domain/models/repuesto.js';
import { normalizarTexto } from '../../domain/models/repuesto.js';
import { DemoApiService, ParteCatalogoBackend } from './demo-api.service.js';

// Modelos conocidos para saber si una pieza menciona OTRO auto
const MARCAS: Array<[string, string]> = [
  ['vw', 'volkswagen'], ['volkswagen', 'volkswagen'], ['toyota', 'toyota'], ['ford', 'ford'],
  ['chevrolet', 'chevrolet'], ['fiat', 'fiat'], ['renault', 'renault'], ['peugeot', 'peugeot'],
];
const MODELOS = ['passat', 'vento', 'gol', 'saveiro', 'polo', 'golf', 'bora', 'amarok', 'hilux', 'sw4', 'corolla', 'ranger', 'ecosport', 'corsa', 'agile', 'onix', 'crono', 'palio', 'argo', 'sandero', '208'];

@Injectable({ providedIn: 'root' })
export class CatalogoRepuestosService {
  private readonly api = inject(DemoApiService);
  resultados = signal<RepuestoCandidato[]>([]);
  cargando = signal(false);

  async buscar(
    consulta: string,
    vehiculo?: { marca?: string; modelo?: string; anio?: number; motorCodigo?: string },
    ctx: { vin?: string; engineNumber?: string } = {},
  ): Promise<void> {
    this.cargando.set(true);
    try {
      // Solo fuentes reales: catálogo acumulado (backend → Supabase) y
      // publicaciones PROPIAS del vendedor en ML (con stock). Sin referencias OEM.
      const [delBackend, hibrido] = await Promise.all([
        firstValueFrom(this.api.catalogo(consulta)).catch(() => [] as ParteCatalogoBackend[]),
        firstValueFrom(this.api.buscarHibrido(consulta, {
          limit: 20,
          vin: ctx.vin,
          engineNumber: ctx.engineNumber,
        })).catch(() => null),
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

      // Publicaciones propias en ML: el backend ya filtra por el dueño de la cuenta.
      const propiosMl: RepuestoCandidato[] = (hibrido?.results ?? [])
        .filter(p => p.source === 'mercado_libre')
        .map((p, i) => ({
          id: 'ml-' + (p.permalink ?? i),
          nombre: titular(p.title || consulta),
          descripcionTecnica: p.stock != null
            ? `${p.stock} unidad(es) disponibles en tu publicación de Mercado Libre`
            : 'Tu publicación de Mercado Libre',
          marca: 'Mercado Libre',
          numeroOem: p.oem ?? undefined,
          compatibilidad: [],
          stockLocal: true,
          stockDisponible: p.stock ?? undefined,
          precioRango: p.price != null ? `$ ${p.price.toLocaleString('es-AR')}` : 'A cotizar',
          fuente: 'mercado_libre',
          imagen: p.image_url ?? undefined,
          permalink: p.permalink ?? undefined,
        }));

      // Catálogo libre: Storefront API pública de Tiendanube/Nuvemshop.
      // Datos reales de la tienda configurada (foto, precio y stock), sin scraping.
      const tiendanube: RepuestoCandidato[] = (hibrido?.results ?? [])
        .filter(p => p.source === 'tiendanube')
        .map((p, i) => ({
          id: 'tn-' + (p.permalink ?? i),
          nombre: titular(p.title || consulta),
          descripcionTecnica: p.stock != null
            ? `${p.stock} unidad(es) disponibles en la tienda`
            : 'Disponibilidad informada por la tienda',
          marca: 'Tiendanube',
          numeroOem: p.oem ?? undefined,
          compatibilidad: [],
          stockLocal: true,
          stockDisponible: p.stock ?? undefined,
          precioRango: p.price != null
            ? `$ ${p.price.toLocaleString('es-AR')} ${p.currency ?? ''}`.trim()
            : 'A cotizar',
          fuente: 'tiendanube',
          imagen: p.image_url ?? undefined,
          permalink: p.permalink ?? undefined,
        }));

      // Compatibilidad con el auto registrado: una pieza que menciona otro
      // auto ("...vw gol", "...toyota") queda fuera del auto activo.
      const todos = [...mapeados, ...propiosMl, ...tiendanube].filter(p => this.esCompatible(p, vehiculo));
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
