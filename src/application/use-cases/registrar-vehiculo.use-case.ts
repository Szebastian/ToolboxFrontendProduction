import { validarVehiculo, type VehiculoGaraje } from '../../domain/models/vehiculo.js';
import type { GarajeVehiculoPort } from '../../domain/ports/garaje-vehiculo.port.js';

export class RegistrarVehiculoUseCase {
  constructor(private readonly garaje: GarajeVehiculoPort) {}
  execute(datos: Omit<VehiculoGaraje, 'registradoEn' | 'updatedAt'>): VehiculoGaraje {
    const v: VehiculoGaraje = {
      ...datos,
      registradoEn: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    validarVehiculo(v);
    this.garaje.guardar(v);
    return v;
  }
}

export class ObtenerVehiculoUseCase {
  constructor(private readonly garaje: GarajeVehiculoPort) {}
  execute(): VehiculoGaraje | null {
    return this.garaje.obtener();
  }
}
