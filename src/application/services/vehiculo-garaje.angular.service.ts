import { Injectable, signal, computed } from '@angular/core';
import type { VehiculoGaraje } from '../../domain/models/vehiculo.js';
import { GarajeLocalStorageAdapter } from '../../infrastructure/adapters/garaje-localstorage.adapter.js';
import { RegistrarVehiculoUseCase, ObtenerVehiculoUseCase } from '../use-cases/registrar-vehiculo.use-case.js';

@Injectable({ providedIn: 'root' })
export class VehiculoGarajeService {
  private readonly adapter = new GarajeLocalStorageAdapter();
  private readonly registrarUC = new RegistrarVehiculoUseCase(this.adapter);
  private readonly obtenerUC = new ObtenerVehiculoUseCase(this.adapter);

  vehiculo = signal<VehiculoGaraje | null>(this.obtenerUC.execute());
  tieneVehiculo = computed(() => !!this.vehiculo());
  vehiculoConfirmado = computed(() => {
    const v = this.vehiculo();
    return v ? `${v.marca} ${v.modelo} ${v.anio} (Motor ${v.motorCodigo})` : '';
  });

  registrar(datos: Omit<VehiculoGaraje, 'registradoEn' | 'updatedAt'>): void {
    const v = this.registrarUC.execute(datos);
    this.vehiculo.set(v);
  }

  limpiar(): void {
    this.adapter.limpiar();
    this.vehiculo.set(null);
  }
}
