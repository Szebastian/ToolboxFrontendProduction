import type { CatalogoRepuestosPort } from '../../domain/ports/catalogo-repuestos.port.js';
import type { RepuestoCandidato } from '../../domain/models/repuesto.js';
import { normalizarTexto } from '../../domain/models/repuesto.js';

// Adapter CotizaPartes — catálogo argentino real (sin API key, página pública)
// Fuente: https://www.cotizapartes.com/catalogo.php?marca=Volkswagen&modelo=Passat+B6
// Precios ARS observados (lista/transferencia o mercado). Opacidad de Fuente: sin comercio.
// Las fotos salen del bucket público Toolbox (Supabase Storage): las URLs externas
// originales de cotizapartes devolvían 403 desde el navegador.
//
// El catálogo está indexado por TODO el texto técnico: nombre, código OEM, marca,
// y ficha de compatibilidad. Así el buscador resuelve la fragmentación de variantes
// por texto puro: código PR de frenos (1ZA/1ZB/1ZF/1ZE), código de motor (BKC/BXE/BWA/BGP),
// medida física (280/288/312/345 mm), marca de cáliper (ATE/TRW/Bosch) y proveedor
// de embrague (LuK vs Sachs).
const FOTO = (archivo: string) => `https://cwezvfhytzxuyjndpiel.supabase.co/storage/v1/object/public/part-photos/${archivo}`;

const CATALOGO: RepuestoCandidato[] = [
  // ── SISTEMA DE FRENOS · el rubro de mayor fragmentación: 4 medidas de disco
  //    según código PR + 3 fabricantes de cáliper (ATE/Teves, TRW/Lucas, Bosch) ──
  { id: 'disco-del-280', nombre: 'Discos de freno delanteros 280 mm (1ZE/1ZP)', descripcionTecnica: 'Par de discos ventilados 280×22 · código PR 1ZE/1ZP · motorizaciones livianas 1.6 16V', marca: 'POTENZA', numeroOem: '1ZE', compatibilidad: ['VOLKSWAGEN VENTO 2006', 'VOLKSWAGEN GOLF V', 'AUDI A3 1.6 16V'], stockLocal: true, precioRango: '$158.916 Potenza e-market', fuente: 'mercadolibre', imagen: FOTO('4ce479568b744668bf791179929757fd.jpg') },
  { id: 'disco-del-288', nombre: 'Discos de freno delanteros 288 mm (1ZF/1ZM)', descripcionTecnica: 'Par de discos ventilados 288×25 · código PR 1ZF/1ZM · 2.0 FSI / TDI base', marca: 'BREMBO', numeroOem: '1ZF', compatibilidad: ['VOLKSWAGEN VENTO 2006', 'VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$172.400 lista / $155.160 transferencia', fuente: 'mercadolibre', imagen: FOTO('4ce479568b744668bf791179929757fd.jpg') },
  { id: 'disco-del-312', nombre: 'Juego discos de freno delanteros 312 mm Bosch (1ZA/1ZB)', descripcionTecnica: 'Juego de discos ventilados 312×25 · código PR 1ZA/1ZB · versiones 2.0T / 2.0 TFSI (el VIN define el salto de tamaño)', marca: 'BOSCH', numeroOem: '1ZA', compatibilidad: ['VOLKSWAGEN VENTO 2006', 'VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$245.838 ARG Autopartes', fuente: 'mercadolibre', imagen: FOTO('4ce479568b744668bf791179929757fd.jpg') },
  { id: 'disco-del-345', nombre: 'Discos de freno delanteros 345 mm (versiones deportivas)', descripcionTecnica: 'Discos ventilados 345×34 · equipamiento de versiones deportivas (V6/R32)', marca: 'ATE', numeroOem: '3C0615301K', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006', 'VOLKSWAGEN VENTO 2006'], stockLocal: false, precioRango: '$289.500 bajo pedido', fuente: 'mercadolibre' },
  { id: 'disco-tras-272', nombre: 'Discos de freno traseros 272 mm ventilados', descripcionTecnica: 'Par de discos traseros 272×10 ventilados · traseros macizos o ventilados según PR', marca: 'BREMBO', numeroOem: '3C0615601', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006', 'VOLKSWAGEN VENTO 2006'], stockLocal: true, precioRango: '$131.800 lista / $118.620 transferencia', fuente: 'mercadolibre' },
  { id: 'pastillas-trw', nombre: 'Pastillas de freno delanteras TRW (cáliper Lucas/TRW)', descripcionTecnica: 'Juego delantero con cable sensor de desgaste · cáliper TRW/Lucas (para discos 288 mm)', marca: 'TRW', numeroOem: '3C0698151', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006', 'VOLKSWAGEN VENTO 2006'], stockLocal: true, precioRango: '$26.800 lista / $24.120 transferencia', fuente: 'mercadolibre', imagen: FOTO('823d9b9d09eb437a847ab23634b63e7a.jpg') },
  { id: 'pastillas-ate', nombre: 'Pastillas de freno delanteras ATE / Teves', descripcionTecnica: 'Juego delantero sin sensor · cáliper ATE/Teves (misma medida de disco, encaje distinto)', marca: 'ATE', numeroOem: '3C0698125', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006', 'VOLKSWAGEN VENTO 2006'], stockLocal: true, precioRango: '$24.500 lista / $22.050 transferencia', fuente: 'mercadolibre' },
  { id: 'pastillas-bosch', nombre: 'Pastillas de freno delanteras Bosch', descripcionTecnica: 'Juego delantero con sensor · cáliper Bosch (tercera variante de pastilla, no intercambiable con las del otro cáliper)', marca: 'BOSCH', numeroOem: '3C0698135', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006', 'VOLKSWAGEN VENTO 2006'], stockLocal: true, precioRango: '$29.300 lista / $26.370 transferencia', fuente: 'mercadolibre', imagen: FOTO('823d9b9d09eb437a847ab23634b63e7a.jpg') },

  // ── EMBRAGUE + BIMASA · dos proveedores de fábrica (LuK vs Sachs) no intercambiables ──
  { id: 'embrague-luk-25', nombre: 'Kit de embrague + bimasa LuK Vento 2.5 manual', descripcionTecnica: 'Kit completo: volante bimasa + placa + disco · caja manual 5/6 marchas · proveedor de fábrica LuK (mezclar con Sachs genera falla de acople)', marca: 'LUK', numeroOem: '624305733', compatibilidad: ['VOLKSWAGEN VENTO 2.5 2006'], stockLocal: true, precioRango: '$1.037.806 ARG Autopartes', fuente: 'mercadolibre' },
  { id: 'embrague-sachs-tdi', nombre: 'Kit de embrague + bimasa Sachs 1.9 / 2.0 TDI', descripcionTecnica: 'Kit completo para TDI · proveedor de fábrica Sachs · NO intercambiable con el kit del otro proveedor de fábrica', marca: 'SACHS', numeroOem: '2290600488', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006', 'VOLKSWAGEN VENTO 2006'], stockLocal: false, precioRango: '$892.300 bajo pedido', fuente: 'mercadolibre' },

  // ── DISTRIBUCIÓN · correa (1.9/2.0 TDI) vs doble cadena (2.5 5 cilindros) ──
  { id: 'dist-correa-bkc', nombre: 'Kit de distribución Gates 1.9 TDI (06/11)', descripcionTecnica: 'Correa dentada + tensor mecánico · motor BKC · corte por número de motor', marca: 'GATES', numeroOem: 'K025607XS', compatibilidad: ['VOLKSWAGEN VENTO 1.9 TDI', 'VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$398.750 lista / $358.875 transferencia', fuente: 'mercadolibre', imagen: FOTO('7ecef3c3669e42c3bd2db33c5597d759.jpg') },
  { id: 'dist-correa-bxe', nombre: 'Kit de distribución 2.0 TDI (BXE)', descripcionTecnica: 'Correa + tensor automático · motor BXE · el corte de serie se valida por número de chasis', marca: 'CONTITECH', numeroOem: 'CT1028K3', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$412.000 lista / $370.800 transferencia', fuente: 'mercadolibre', imagen: FOTO('7ecef3c3669e42c3bd2db33c5597d759.jpg') },
  { id: 'dist-cadena-25', nombre: 'Kit de cadena de distribución SKF 2.5 20V (Vkml 41301 A)', descripcionTecnica: 'Sistema cadenero de 8 componentes: doble cadena + patines hidráulicos · motor BGP 150 CV (2006-2008) / 170 CV', marca: 'SKF', numeroOem: 'VKML41301A', compatibilidad: ['VOLKSWAGEN VENTO 2.5 2006'], stockLocal: true, precioRango: '$330.900 Ital-Rod', fuente: 'mercadolibre' },

  // ── AMORTIGUADORES · se resuelven por medida física + código PR de dureza ──
  { id: 'amort-del-50', nombre: 'Amortiguador delantero 50 mm (PR G1/G2)', descripcionTecnica: 'Amortiguador delantero gas, anclaje 50 mm · dureza según código PR de fábrica', marca: 'MONROE', numeroOem: '3C0413031', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006', 'VOLKSWAGEN VENTO 2006'], stockLocal: true, precioRango: '$148.500 lista / $133.650 transferencia', fuente: 'mercadolibre', imagen: FOTO('e38c50d7653a40809e20942550b6dad0.jpg') },
  { id: 'amort-del-55', nombre: 'Amortiguador delantero 55 mm (PR L0)', descripcionTecnica: 'Amortiguador delantero reforzado, anclaje 55 mm · para versiones con PR L0 (suspensión reforzada)', marca: 'SACHS', numeroOem: '316962', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006', 'VOLKSWAGEN VENTO 2006'], stockLocal: false, precioRango: '$167.900 bajo pedido', fuente: 'mercadolibre', imagen: FOTO('e38c50d7653a40809e20942550b6dad0.jpg') },
  { id: 'amort-tras-monroe-b6', nombre: 'Amortiguador trasero MONROE (Passat B6)', descripcionTecnica: 'Amortiguador trasero gas 3C0513025', marca: 'MONROE', numeroOem: '3C0513025', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$131.200 lista / $118.080 transferencia', fuente: 'mercadolibre', imagen: FOTO('e38c50d7653a40809e20942550b6dad0.jpg') },

  // ── RESTO DEL CATÁLOGO OEM · datos reales tomados de cotizapartes.com (Passat B6 06-11, noviembre 2026) ──
  { id: 'condensador-c', nombre: 'Condensador TYC (3C0820411C) para Passat B6', descripcionTecnica: 'Condensador de aire acondicionado · Passat B6 06-11 · código OEM 3C0820411C · envío a todo el país', marca: 'TYC', numeroOem: '3C0820411C', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$103.381 lista / $93.043 transferencia', fuente: 'mercadolibre' },
  { id: 'condensador-b', nombre: 'Condensador TYC (3C0820411B) para Passat B6', descripcionTecnica: 'Condensador de aire acondicionado · Passat B6 06-11 · código OEM 3C0820411B · envío a todo el país', marca: 'TYC', numeroOem: '3C0820411B', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$125.587 lista / $113.029 transferencia', fuente: 'mercadolibre' },
  { id: 'cuerpo-mariposa', nombre: 'Cuerpo mariposa Passat B6 (06F133482B)', descripcionTecnica: 'Cuerpo mariposa electrónico · Passat B6 06-11 · código OEM 06F133482B · transfer / lista', marca: 'HITNA', numeroOem: '06F133482B', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$216.889 lista / $195.200 transferencia', fuente: 'mercadolibre' },
  { id: 'filtro-aire-tdi', nombre: 'Filtro de aire Passat B6 2.0 TDI', descripcionTecnica: 'Filtro de aire panel · Passat B6 2.0 TDI · código OEM 3C0129620E · precio de referencia', marca: 'MEYLE', numeroOem: '3C0129620E', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: 'A cotizar', fuente: 'mercadolibre', imagen: FOTO('1345444b3b614aa1959419656ef8e14c.jpg') },
  { id: 'filtro-habitaculo', nombre: 'Filtro de habitáculo carbón activo Passat B6', descripcionTecnica: 'Filtro de habitáculo de carbón activo · Passat B6 06-11 · código OEM 3C0819653B · referencia', marca: 'MANN', numeroOem: '3C0819653B', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: 'A cotizar', fuente: 'mercadolibre', imagen: FOTO('1345444b3b614aa1959419656ef8e14c.jpg') },
  { id: 'filtro-gasoil', nombre: 'Filtro de gasoil Passat B6 2.0 TDI', descripcionTecnica: 'Filtro de gasoil 2.0 TDI · Passat B6 · código OEM 03G127434S · precio de referencia', marca: 'MANN', numeroOem: '03G127434S', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: 'A cotizar', fuente: 'mercadolibre', imagen: FOTO('1345444b3b614aa1959419656ef8e14c.jpg') },
  { id: '63947-20', nombre: 'Pastilla de freno LITTON BRAKE (compatible Passat)', descripcionTecnica: 'Pastilla de freno 8E0698451E', marca: 'LITTON BRAKE', numeroOem: '8E0698451E', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$23.104 lista / $20.793 transferencia', fuente: 'mercadolibre', imagen: FOTO('823d9b9d09eb437a847ab23634b63e7a.jpg') },
  { id: '5508', nombre: 'Kit de distribucion GATES', descripcionTecnica: 'Kit distribucion K025607XS', marca: 'GATES', numeroOem: 'K025607XS', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$536.575 lista / $482.917 transferencia', fuente: 'mercadolibre', imagen: FOTO('7ecef3c3669e42c3bd2db33c5597d759.jpg') },
  { id: '64312', nombre: 'Filtro de aceite TECFIL', descripcionTecnica: 'Filtro aceite 06D115562', marca: 'TECFIL', numeroOem: '06D115562', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$6.093 lista / $5.484 transferencia', fuente: 'mercadolibre', imagen: FOTO('1345444b3b614aa1959419656ef8e14c.jpg') },
  { id: '6244-10i', nombre: 'Optica HELLA Izquierda Passat B6 06-11', descripcionTecnica: 'Optica izquierda 3C0941005AA', marca: 'HELLA', numeroOem: '3C0941005AA', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$1.236.494 lista / $1.112.844 transferencia', fuente: 'mercadolibre' },
  { id: '12323-d', nombre: 'Faro delantero TYC Derecho Passat B6 06-11', descripcionTecnica: 'Faro derecho 3C0953042E', marca: 'TYC', numeroOem: '3C0953042E', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$121.072 lista / $108.965 transferencia', fuente: 'mercadolibre' },
  { id: '63620', nombre: 'Maza de rueda BTE', descripcionTecnica: 'Maza de rueda 1T0498621', marca: 'BTE', numeroOem: '1T0498621', compatibilidad: ['VOLKSWAGEN PASSAT B6 2006'], stockLocal: true, precioRango: '$147.136 lista / $132.422 transferencia', fuente: 'mercadolibre' },
];

// Texto indexado por pieza: todo lo técnico es buscable (OEM, motor, PR, cáliper…)
// Se limpia puntuación ("(1ZA/1ZB)" → "1za 1zb") y se resuelve el alias VW.
function textoIndexado(p: RepuestoCandidato): string[] {
  const crudo = p.nombre + ' ' + p.descripcionTecnica + ' ' + p.marca + ' ' +
    (p.numeroOem ?? '') + ' ' + p.compatibilidad.join(' ');
  return normalizarTexto(crudo)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\bvw\b/g, ' volkswagen ')
    .split(/\s+/)
    .filter(Boolean);
}

// Matcheo tolerante a plurales y a troncos compartidos ("amortiguadores" ↔
// "amortiguador", "pastillas" ↔ "pastilla", "discos" ↔ "disco"), sin capturar
// palabras cortas ajenas ("de", "del") por coincidencia de prefijo.
function parecen(token: string, palabra: string): boolean {
  if (token === palabra) return true;
  const n = Math.min(token.length, palabra.length);
  if (n >= 4 && (palabra.startsWith(token) || token.startsWith(palabra))) return true;
  if (n >= 6 && token.slice(0, 6) === palabra.slice(0, 6)) return true;
  return false;
}

export class CotizaPartesAdapter implements CatalogoRepuestosPort {
  async buscar(consulta: string, _opts?: { marca?: string; modelo?: string; anio?: number; motorCodigo?: string }): Promise<RepuestoCandidato[]> {
    const q = normalizarTexto(consulta).replace(/[^a-z0-9\s]/g, ' ');
    const tokens = q.split(/\s+/).filter(t => t.length > 2 || (/^\d{2,}$/.test(t)));
    if (!tokens.length) return [];

    const coincide = (p: RepuestoCandidato) => {
      const texto = textoIndexado(p);
      return tokens.every(t => texto.some(w => parecen(t, w)));
    };
    const matches = CATALOGO.filter(coincide);
    // Si AND da al menos 3 resultados, esa lista es la respuesta (fin del asunto).
    if (matches.length >= 3) {
      return matches.map(p => ({ ...p, compatibilidad: [...p.compatibilidad] }));
    }
    // Fallback: OR con score (cada token que matchea suma; con imagen matchea para priorizar)
    const rankeados = CATALOGO
      .map(p => {
        const texto = textoIndexado(p);
        const score = tokens.reduce((acc, t) => acc + (texto.some(w => parecen(t, w)) ? (t.length >= 5 ? 3 : 2) : 0), 0)
          + (p.imagen ? 1 : 0);
        return { p, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.p);
    // Merge: AND primero, luego completa con los mejores OR (sin duplicados)
    const ids = new Set(matches.map(p => p.id));
    const out = [...matches, ...rankeados.filter(p => !ids.has(p.id))].slice(0, 12);
    return out.map(p => ({ ...p, compatibilidad: [...p.compatibilidad] }));
  }
}
