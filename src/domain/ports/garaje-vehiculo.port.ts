import type { VehiculoGaraje } from '../models/vehiculo.js';

export interface GarajeVehiculoPort {
  obtener(): VehiculoGaraje | null;
  guardar(v: VehiculoGaraje): void;
  limpiar(): void;
}
