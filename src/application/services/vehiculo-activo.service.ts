import { Injectable, inject, signal } from '@angular/core';
import { DemoApiService, usuarioSesion } from './demo-api.service';

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

  private readonly api = inject(DemoApiService);

  constructor() {
    // Si hay una sesión real (usuario del registro), el auto activo arranca
    // con el primer vehículo de SU garaje (no con el mock).
    const sesion = usuarioSesion();
    if (sesion) {
      this.sincronizarConGaraje(sesion.id);
    }
  }

  set(v: VehiculoActivo): void {
    this.activo.set(v);
  }

  /** Trae el primer vehículo real del owner y lo marca como activo. */
  sincronizarConGaraje(ownerId: string): void {
    this.api.garaje(ownerId).subscribe({
      next: (autos) => {
        const v = autos[0];
        if (!v) return; // garaje vacío: queda el mock de demo
        const modeloCorto = (v.model || '').split(' · ')[0];
        this.activo.set({
          nombre: `${v.brand} ${modeloCorto}`.trim(),
          nombreLargo: `${v.brand} ${v.model}`.trim(),
          resumen: [v.year, v.engine_details?.split(' · ')[0]].filter(Boolean).join(' · '),
          vin: v.vin ?? 'SIN VIN',
        });
      },
      error: () => { /* backend caído: queda el auto activo actual */ },
    });
  }
}
