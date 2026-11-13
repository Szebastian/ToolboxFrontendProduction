import type { CatalogoRepuestosPort } from '../../domain/ports/catalogo-repuestos.port.js';
import type { RepuestoCandidato } from '../../domain/models/repuesto.js';
import { normalizarTexto } from '../../domain/models/repuesto.js';

// Mock con catálogo realista Passat 2006 (B6) para testing sin key.
// En producción se reemplaza por adapter Mercado Libre o WhatsApp.
// No expone comercios (Opacidad de Fuente): stockLocal genérico.

const CATALOGO: RepuestoCandidato[] = [
  { id: 'pastillas-del-passat-2006', nombre: 'Juego de pastillas de freno delanteras', descripcionTecnica: 'Pastillas delanteras Teves/Varga traba alta/baja', marca: 'FRAS-LE', numeroOem: '1K0698151', compatibilidad: ['VOLKSWAGEN PASSAT 2006'], stockLocal: true, precioRango: 'Consultar', fuente: 'mock-demo' },
  { id: 'correa-distr-passat-2006', nombre: 'Kit correa de distribución', descripcionTecnica: 'Correa + tensores + rodillos', marca: 'GATES', numeroOem: '06B198119A', compatibilidad: ['VOLKSWAGEN PASSAT 2006'], stockLocal: true, precioRango: 'Consultar', fuente: 'mock-demo' },
  { id: 'amortiguador-passat-2006', nombre: 'Amortiguador delantero', descripcionTecnica: 'Amortiguador gas delantero', marca: 'SACHS', numeroOem: '3C0413031', compatibilidad: ['VOLKSWAGEN PASSAT 2006'], stockLocal: false, precioRango: 'Consultar', fuente: 'mock-demo' },
  { id: 'bomba-agua-passat-2006', nombre: 'Bomba de agua', descripcionTecnica: 'Bomba de agua con correa dentada', marca: 'DOLZ', numeroOem: '06B121011P', compatibilidad: ['VOLKSWAGEN PASSAT 2006'], stockLocal: true, precioRango: 'Consultar', fuente: 'mock-demo' },
  { id: 'bujias-passat-2006', nombre: 'Juego de bujías iridium', descripcionTecnica: 'Bujías iridium grado térmico OEM', marca: 'NGK', numeroOem: '06H905611', compatibilidad: ['VOLKSWAGEN PASSAT 2006'], stockLocal: true, precioRango: 'Consultar', fuente: 'mock-demo' },
];

export class MockRepuestosAdapter implements CatalogoRepuestosPort {
  async buscar(consulta: string, opts?: { marca?: string; modelo?: string; anio?: number; motorCodigo?: string }): Promise<RepuestoCandidato[]> {
    const q = normalizarTexto(consulta);
    const tokens = q.split(/\s+/).filter(t => t.length > 2);
    let out = CATALOGO.filter(p => tokens.some(t => normalizarTexto(p.nombre + ' ' + p.descripcionTecnica).includes(t)));
    if (!out.length) out = CATALOGO;
    if (opts?.marca || opts?.modelo) {
      const f = out.filter(p => p.compatibilidad.some(c => c.includes(opts.marca ?? '') && c.includes(opts.modelo ?? '')));
      if (f.length) out = f;
    }
    return out.map(p => ({ ...p, compatibilidad: [...p.compatibilidad] }));
  }
}
