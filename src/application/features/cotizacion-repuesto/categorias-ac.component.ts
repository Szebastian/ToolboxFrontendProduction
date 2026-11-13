import { Component, inject } from '@angular/core';
import { SearchQueryService } from '../../services/search-query.service';

const CATEGORIAS = [
  { slug: 'ac-compressor', nombre: 'A/C Compressor', icono: 'ac_unit' },
  { slug: 'ac-compressor-kit', nombre: 'A/C Compressor & Kit', icono: 'build' },
  { slug: 'ac-compressor-valve', nombre: 'A/C Compressor Valve', icono: 'tune' },
  { slug: 'ac-condenser', nombre: 'A/C Condenser', icono: 'grid_on' },
  { slug: 'ac-evaporator', nombre: 'A/C Evaporator Core', icono: 'waves' },
  { slug: 'ac-expansion-valve', nombre: 'A/C Expansion Valve', icono: 'expand' },
  { slug: 'ac-receiver-drier', nombre: 'A/C Receiver Drier', icono: 'water_drop' },
  { slug: 'ac-desiccant', nombre: 'A/C Desiccant Element', icono: 'filter_alt' },
  { slug: 'ac-hose', nombre: 'A/C Refrigerant Hose', icono: 'hose' },
  { slug: 'ac-oil', nombre: 'A/C Refrigerant Oil', icono: 'oil_barrel' },
  { slug: 'ac-temp-sensor', nombre: 'A/C Temp Sensor', icono: 'thermostat' },
  { slug: 'ac-o-rings', nombre: 'A/C O-Rings / Seals', icono: 'donut_small' },
  { slug: 'ac-service-valve', nombre: 'A/C Service Valve', icono: 'valve' },
  { slug: 'ambient-air-sensor', nombre: 'Ambient Air Sensor', icono: 'air' },
  { slug: 'ambient-temp-sensor', nombre: 'Ambient Temp Sensor', icono: 'device_thermostat' },
  { slug: 'blower-motor', nombre: 'Blower Motor', icono: 'fan' },
  { slug: 'blower-module', nombre: 'Blower Motor Module', icono: 'electric_bolt' },
  { slug: 'cabin-filter', nombre: 'Cabin Air Filter', icono: 'filter_alt' },
  { slug: 'cabin-temp-sensor', nombre: 'Cabin Temp Sensor', icono: 'thermostat_auto' },
  { slug: 'climate-module', nombre: 'Climate Control Module', icono: 'tune' },
  { slug: 'heater-actuator', nombre: 'Heater Door Actuator', icono: 'door_open' },
  { slug: 'heater-core', nombre: 'Heater Core', icono: 'local_fire_department' },
  { slug: 'heater-temp-sensor', nombre: 'Heater Temp Sensor', icono: 'device_thermostat' },
  { slug: 'heater-hose', nombre: 'Heater Hose', icono: 'hose' },
  { slug: 'heater-connector', nombre: 'Heater Hose Connector', icono: 'link' },
];

@Component({
  selector: 'app-categorias-ac',
  standalone: true,
  template: `
  <div>
    <p class="text-xs font-semibold" style="color:#F5F5F7;margin:0 0 8px">Heat &amp; Air Conditioning — Passat 2006 (25)</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px">
      @for (c of categorias; track c.slug) {
        <button type="button" (click)="elegir(c.nombre)" style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:#F5F5F7;text-align:left">
          <span class="material-symbols-outlined" style="color:#30D158">{{ c.icono }}</span>
          <span style="font-size:12px;line-height:1.2">{{ c.nombre }}</span>
        </button>
      }
    </div>
  </div>
  `,
})
export class CategoriasAcComponent {
  categorias = CATEGORIAS;
  private readonly q = inject(SearchQueryService);
  elegir(n: string): void {
    this.q.set(n, n);
    document.getElementById('buscar')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
