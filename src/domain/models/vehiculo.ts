export interface VehiculoGaraje {
  marca: string;
  modelo: string;
  version: string;
  anio: number;
  vin: string;
  motorCodigo: string;
  combustible: string;
  registradoEn: string;
  updatedAt: string;
}

export function validarVehiculo(v: VehiculoGaraje): void {
  if (!v.vin || v.vin.length !== 17) throw new Error('VIN 17 dígitos requerido');
  if (!v.marca || !v.modelo) throw new Error('Marca/Modelo requeridos');
  if (!v.anio) throw new Error('Año requerido');
  if (!v.motorCodigo) throw new Error('Código motor requerido');
}

export const VEHICULO_EJEMPLO_PASSAT_2006 = {
  marca: 'VOLKSWAGEN',
  modelo: 'PASSAT',
  anio: 2006,
} as const;
