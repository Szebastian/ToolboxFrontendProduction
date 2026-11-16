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
        if (!v) {
          // Garaje vacío (o backend caído): con sesión real no prometemos un auto mock
          if (usuarioSesion()) {
            this.activo.set({ nombre: 'Tu auto', nombreLargo: 'tu auto', resumen: '', vin: 'SIN VIN' });
          }
          return;
        }
        const modelo = modeloBase(v.model);
        this.activo.set({
          nombre: `${v.brand} ${modelo}`.trim(),
          nombreLargo: `${v.brand} ${modelo}`.trim(),
          resumen: [v.year, v.engine_details?.split(' · ')[0]].filter(Boolean).join(' · '),
          vin: v.vin ?? 'SIN VIN',
        });
      },
      error: () => {
        // Backend caído: con sesión real el hero no debe mostrar un auto que no es
        if (usuarioSesion()) {
          this.activo.set({ nombre: 'Tu auto', nombreLargo: 'tu auto', resumen: '', vin: 'SIN VIN' });
        }
      },
    });
  }
}

/** Parte útil del modelo que llega del OCR: "TWINGO ALIZE · SEDAN 3P" → "TWINGO ALIZE".
 *  Descarta los tramos "NO DETECTADO" y devuelve '' si no quedó nada legible. */
export function modeloBase(model: string | null | undefined): string {
  if (!model) return '';
  const legible = (model.split(' · ') || [])
    .map(p => p.trim())
    .filter(p => p && !/no detectado/i.test(p));
  return legible[0] ?? '';
}
