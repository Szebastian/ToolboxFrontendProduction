import { Injectable, inject, computed } from '@angular/core';
import { VehiculoGarajeService } from './vehiculo-garaje.angular.service.js';
import { CarImagesAdapter } from '../../infrastructure/adapters/carimages.adapter.js';
import { environment } from '../../environments/environment.js';

@Injectable({ providedIn: 'root' })
export class ImagenVehiculoAngularService {
  private readonly garaje = inject(VehiculoGarajeService);
  // En frontend usá key pública con domain-lock. Para SSR/firmados, proxy en backend con api_secret.
  private readonly adapter = new CarImagesAdapter(environment.carImagesApiKey ?? 'ci_your_api_key');

  imagenUrl = computed(() => {
    const v = this.garaje.vehiculo();
    if (!v) return this.adapter.url({ make: 'Volkswagen', model: 'Passat', year: 2006, view: 'front34', width: 800 });
    return this.adapter.url({ make: v.marca, model: v.modelo, year: v.anio, view: 'front34', width: 800 });
  });

  esDemo = computed(() => !this.garaje.vehiculo());
}
