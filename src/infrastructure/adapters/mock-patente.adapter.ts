import type { ConsultaPatentePort, VehiculoResuelto } from '../../domain/ports/consulta-patente.port.js';
import { normalizarPatente, esPatenteValida } from '../../domain/models/patente.js';

// Mock determinista patente -> vehículo para testing sin API key.
// Mismo contrato que el adapter real. En producción se reemplaza por patente.ar.
const DB: Record<string, VehiculoResuelto> = {
  AB123CD: { vin: '8AWZZZ5U7CD012345', marca: 'VOLKSWAGEN', modelo: 'GOL TREND', version: '1.4 8V', anio: 2012, motorCodigo: 'CCRA', combustible: 'Nafta' },
};

export class MockPatenteAdapter implements ConsultaPatentePort {
  async resolverPorPatente(patente: string): Promise<VehiculoResuelto> {
    const n = normalizarPatente(patente);
    if (!esPatenteValida(n)) throw new Error('Formato patente inválido (AA123BB o ABC123)');
    if (DB[n]) return DB[n];
    // Genera VIN pseudo-real determinista desde patente (solo para mock)
    let hash = 0;
    for (const c of n) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
    const suf = String(hash).padStart(8, '0').slice(0, 8);
    const vin = `8AWZZZ5U7C${suf}`.slice(0, 17);
    return { vin, marca: 'VOLKSWAGEN', modelo: 'GOL TREND', version: '1.4 8V', anio: 2012, motorCodigo: 'CCRA', combustible: 'Nafta' };
  }
}
