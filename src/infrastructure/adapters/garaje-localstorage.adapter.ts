import type { VehiculoGaraje } from '../../domain/models/vehiculo.js';
import type { GarajeVehiculoPort } from '../../domain/ports/garaje-vehiculo.port.js';

const KEY = 'vehiculo_garaje_v1';

export class GarajeLocalStorageAdapter implements GarajeVehiculoPort {
  obtener(): VehiculoGaraje | null {
    try {
      const raw = globalThis.localStorage?.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as VehiculoGaraje & { patente?: string };
      const { patente, ...rest } = parsed;
      return rest as VehiculoGaraje;
    } catch {
      return null;
    }
  }
  guardar(v: VehiculoGaraje): void {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(v));
  }
  limpiar(): void {
    globalThis.localStorage?.removeItem(KEY);
  }
}
