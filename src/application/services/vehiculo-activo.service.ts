import { Injectable, signal } from '@angular/core';

export interface VehiculoActivo {
  nombre: string;
  nombreLargo: string;
  resumen: string;
  vin: string;
  img?: string;
}

@Injectable({ providedIn: 'root' })
export class VehiculoActivoService {
  activo = signal<VehiculoActivo>({
    nombre: 'VW Passat',
    nombreLargo: 'Volkswagen Passat',
    resumen: '2006 · 2.0 TDI',
    vin: 'PD-514',
    img: '/img/veh-passat.jpg',
  });

  set(v: VehiculoActivo): void {
    this.activo.set(v);
  }
}
