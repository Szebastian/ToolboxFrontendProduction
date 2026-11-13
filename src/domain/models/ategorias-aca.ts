export interface CategoriaAca {
  slug: string;
  nombre: string;
  icono: string;
}

export const CATEGORIAS_AC: CategoriaAca[] = [
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
