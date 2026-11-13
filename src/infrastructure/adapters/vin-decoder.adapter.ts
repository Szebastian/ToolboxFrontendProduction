// Adapter VIN -> datos vehículo (sin API key, usa NHTSA gratuito)
// Alternativa para slice vehiculo-garaje y cotizacion-repuesto sin depender de patente.ar
// Docs: https://vpic.nhtsa.dot.gov/api/
// Cobertura principal USA: VINs argentinos (ej. 8AW...) suelen devolver vacío/404.
// Para Argentina, la fuente confiable es cédula verde + VIN físico + código motor.
export interface VehiculoDecodificado {
  marca: string;
  modelo: string;
  anio: number;
  motorCodigo: string;
  combustible: string;
  vin: string;
  [k: string]: unknown;
}

export class VinDecoderAdapter {
  async decodeVin(vin: string): Promise<VehiculoDecodificado> {
    const v = vin.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (v.length !== 17) throw new Error('VIN debe tener 17 caracteres');
    const url = `https://vpic.nhtsa.dot.gov/api/DecodeVin/${v}?format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NHTSA ${res.status}`);
    const json = await res.json() as { Results: Array<Record<string, string>> };
    const r = json.Results?.[0] ?? {};
    return {
      marca: r['Make'] ?? 'DESCONOCIDA',
      modelo: r['Model'] ?? 'DESCONOCIDO',
      anio: Number(r['ModelYear'] ?? 0),
      motorCodigo: r['EngineCylinders'] ? `CIL${r['EngineCylinders']}` : 'A_CONFIRMAR',
      combustible: r['FuelTypePrimary'] ?? 'Nafta',
      vin: v,
      raw: r,
    };
  }
}
