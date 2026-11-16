import { Injectable, inject, signal } from '@angular/core';
import { DemoApiService, usuarioSesion } from './demo-api.service';

export interface VehiculoActivo {
  nombre: string;
  nombreLargo: string;
  resumen: string;
  vin: string;
  img?: string;
}

/** Cache local del auto activo por usuario: la píldora del hero pinta al instante
 *  sin esperar el cold start del backend (Render free ~50-60 s). */
const claveCache = (id: string) => `tb_auto_activo_${id}`;

function vehiculoDesdeCache(id: string): VehiculoActivo | null {
  try {
    const crudo = localStorage.getItem(claveCache(id));
    if (!crudo) return null;
    const v = JSON.parse(crudo);
    if (v && typeof v.nombre === 'string' && typeof v.nombreLargo === 'string') return v as VehiculoActivo;
  } catch { /* cache corrupto: se ignora */ }
  return null;
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
      // 1) Cache local: el auto se ve al instante (stale)
      const cacheado = vehiculoDesdeCache(sesion.id);
      if (cacheado) {
        this.activo.set(cacheado);
      } else {
        // Primera visita sin cache: placeholder neutral en vez del mock demo
        this.activo.set({ nombre: 'Tu auto', nombreLargo: 'tu auto', resumen: '', vin: 'SIN VIN' });
      }
      // 2) Refresh en segundo plano (revalidate)
      this.sincronizarConGaraje(sesion.id);
    }
  }

  set(v: VehiculoActivo): void {
    this.activo.set(v);
    // Cambio manual de auto (selector del garaje): también queda cacheado
    const sesion = usuarioSesion();
    if (sesion) {
      try { localStorage.setItem(claveCache(sesion.id), JSON.stringify(v)); } catch { /* almacenamiento lleno/no disponible */ }
    }
  }

  /** Trae el primer vehículo real del owner y lo marca como activo. */
  sincronizarConGaraje(ownerId: string): void {
    this.api.garaje(ownerId).subscribe({
      next: (autos) => {
        const v = autos[0];
        if (!v) {
          // Garaje vacío confirmado por el backend: cache obsoleto fuera
          try { localStorage.removeItem(claveCache(ownerId)); } catch { /* noop */ }
          // Con sesión real no prometemos un auto mock
          if (usuarioSesion()) {
            this.activo.set({ nombre: 'Tu auto', nombreLargo: 'tu auto', resumen: '', vin: 'SIN VIN' });
          }
          return;
        }
        const modelo = modeloBase(v.model);
        const activo: VehiculoActivo = {
          nombre: `${v.brand} ${modelo}`.trim(),
          nombreLargo: `${v.brand} ${modelo}`.trim(),
          resumen: [v.year, v.engine_details?.split(' · ')[0]].filter(Boolean).join(' · '),
          vin: v.vin ?? 'SIN VIN',
        };
        this.activo.set(activo);
        // Queda cacheado para la próxima visita (stale-while-revalidate)
        try { localStorage.setItem(claveCache(ownerId), JSON.stringify(activo)); } catch { /* noop */ }
      },
      error: () => {
        // Backend caído: si hay cache se mantiene lo mostrado; si no, honesto 'tu auto'
        if (usuarioSesion() && !vehiculoDesdeCache(ownerId)) {
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
