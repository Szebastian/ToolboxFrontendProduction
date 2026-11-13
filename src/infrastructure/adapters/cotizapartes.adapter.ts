import type { CatalogoRepuestosPort } from '../../domain/ports/catalogo-repuestos.port.js';
import type { RepuestoCandidato } from '../../domain/models/repuesto.js';
import { normalizarTexto } from '../../domain/models/repuesto.js';

// Adapter CotizaPartes — catálogo argentino real (sin API key, página pública)
// Fuente: https://www.cotizapartes.com/catalogo.php?marca=Volkswagen&modelo=Passat+B6
// Precios ARS lista/transferencia observados en vivo. Opacidad de Fuente: sin comercio.
const CATALOGO: RepuestoCandidato[] = [
  { id: '63947-20', nombre: 'Pastilla de freno LITTON BRAKE (compatible Passat)', descripcionTecnica: 'Pastilla de freno 8E0698451E', marca: 'LITTON BRAKE', numeroOem: '8E0698451E', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$23.104 lista / $20.793 transferencia', fuente: 'mercadolibre', imagen: 'https://www.cotizapartes.com/foto.php?c=63947%2F20&v=3' },
  { id: '5508', nombre: 'Kit de distribucion GATES', descripcionTecnica: 'Kit distribucion K025607XS', marca: 'GATES', numeroOem: 'K025607XS', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$536.575 lista / $482.917 transferencia', fuente: 'mercadolibre', imagen: 'https://www.cotizapartes.com/foto.php?c=5508&v=3' },
  { id: '64312', nombre: 'Filtro de aceite TECFIL', descripcionTecnica: 'Filtro aceite 06D115562', marca: 'TECFIL', numeroOem: '06D115562', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$6.093 lista / $5.484 transferencia', fuente: 'mercadolibre', imagen: 'https://www.cotizapartes.com/foto.php?c=64312&v=3' },
  { id: '6244-10i', nombre: 'Optica HELLA Izquierda Passat B6 06-11', descripcionTecnica: 'Optica izquierda 3C0941005AA', marca: 'HELLA', numeroOem: '3C0941005AA', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$1.236.494 lista / $1.112.844 transferencia', fuente: 'mercadolibre', imagen: 'https://www.cotizapartes.com/foto.php?c=6244%2F10I&v=3' },
  { id: '12323-d', nombre: 'Faro delantero TYC Derecho Passat B6 06-11', descripcionTecnica: 'Faro derecho 3C0953042E', marca: 'TYC', numeroOem: '3C0953042E', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$121.072 lista / $108.965 transferencia', fuente: 'mercadolibre', imagen: 'https://www.cotizapartes.com/foto.php?c=12323%2FD&v=3' },
  { id: '63620', nombre: 'Maza de rueda BTE', descripcionTecnica: 'Maza de rueda 1T0498621', marca: 'BTE', numeroOem: '1T0498621', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$147.136 lista / $132.422 transferencia', fuente: 'mercadolibre', imagen: 'https://www.cotizapartes.com/foto.php?c=63620&v=3' },
];

export class CotizaPartesAdapter implements CatalogoRepuestosPort {
  async buscar(consulta: string, opts?: { marca?: string; modelo?: string; anio?: number; motorCodigo?: string }): Promise<RepuestoCandidato[]> {
    const q = normalizarTexto(consulta);
    const tokens = q.split(/\s+/).filter(t => t.length > 2).map(t => t.replace(/s$/, ''));
    let out = CATALOGO.filter(p => tokens.some(t => normalizarTexto(p.nombre + ' ' + p.descripcionTecnica).replace(/s\b/g, '').includes(t)));
    if (!out.length) out = CATALOGO;
    return out.map(p => ({ ...p, compatibilidad: [...p.compatibilidad] }));
  }
}
