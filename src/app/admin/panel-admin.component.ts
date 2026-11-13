import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { HeatLayer } from 'leaflet.heat';

// ── Tipos ──
type Vista = 'dashboard' | 'demanda' | 'comercios' | 'cobertura' | 'incompatibilidades' | 'solicitudes' | 'facturacion' | 'usuarios' | 'logistica';
type CiudadKey = 'trelew' | 'madryn' | 'comodoro' | 'rawson' | 'neuquen';

interface CiudadInfo { label: string; pill: string; radio: string; }
const CIUDADES: Record<CiudadKey, CiudadInfo> = {
  trelew:   { label: 'Trelew (Chubut)',            pill: 'bg-amber-400/20 text-amber-300',    radio: 'Radio 12 km' },
  madryn:   { label: 'Puerto Madryn (Chubut)',     pill: 'bg-cyan-400/20 text-cyan-300',      radio: 'Radio 15 km' },
  comodoro: { label: 'Comodoro Rivadavia (Chubut)',pill: 'bg-emerald-400/20 text-emerald-300',radio: 'Radio 20 km' },
  rawson:   { label: 'Rawson (Chubut)',            pill: 'bg-indigo-400/20 text-indigo-300',  radio: 'Radio 10 km' },
  neuquen:  { label: 'Neuquén Capital',            pill: 'bg-rose-400/20 text-rose-300',      radio: 'Radio 25 km' },
};

interface Comercio {
  id: number;
  nombre: string;
  direccion: string;
  titular: string;
  cuit: string;
  aliasCuenta: string;
  cbu: string;
  ciudad: CiudadKey;
  radio: string;
  estado: 'Activo · En Línea' | 'Activo' | 'Suspendido';
  tiempoRespuesta: string;
  winRate: string;
}

interface DemandaItem {
  repuesto: string;
  marcas: string;
  categoria: string;
  categoriaClase: string;
  vehiculo: string;
  tipo: 'Auto' | 'Camioneta';
  pedidos: number;
  precio: string;
}

// ── Datos iniciales (muestra) ──
const COMERCIOS_INICIALES: Comercio[] = [
  { id: 1, nombre: 'Repuestos Centro Trelew', direccion: 'San Martín 450', titular: 'Carlos M.', cuit: '30-68492019-3', aliasCuenta: 'repuestos.centro.trelew', cbu: '0110684930190043185201', ciudad: 'trelew', radio: '12 km (Motos locales)', estado: 'Activo · En Línea', tiempoRespuesta: '~3.5 min', winRate: '78% (38/52)' },
  { id: 2, nombre: 'Distribuidora Chubut Autopartes', direccion: 'Pellegrini 1100', titular: 'Marcos V.', cuit: '30-71234600-1', aliasCuenta: 'chubut.autopartes', cbu: '0110712346010023641502', ciudad: 'trelew', radio: '12 km (Zona Centro)', estado: 'Activo', tiempoRespuesta: '~6.8 min', winRate: '61% (22/36)' },
  { id: 3, nombre: 'Madryn Frenos & Embragues', direccion: 'Av. Gales 820', titular: 'Gustavo P.', cuit: '30-71284910-4', aliasCuenta: 'madryn.frenos', cbu: '0020712849104001255870', ciudad: 'madryn', radio: '15 km (Parque Ind. + Centro)', estado: 'Activo · En Línea', tiempoRespuesta: '~2.9 min', winRate: '84% (42/50)' },
  { id: 4, nombre: 'Comodoro Diésel & Camionetas 4x4', direccion: 'Av. Yrigoyen 2400', titular: 'Javier B.', cuit: '33-69812450-9', aliasCuenta: 'comodoro.diesel4x4', cbu: '0150698124509003489210', ciudad: 'comodoro', radio: '20 km (Zona Norte/Sur)', estado: 'Activo', tiempoRespuesta: '~4.2 min', winRate: '72% (31/43)' },
  { id: 5, nombre: 'Autopartes Rawson Costa', direccion: 'Mariano Moreno 310', titular: 'Esteban F.', cuit: '20-25418902-3', aliasCuenta: 'rawson.costa', cbu: '0110254189021001845560', ciudad: 'rawson', radio: '10 km (Conexión Playa Unión)', estado: 'Activo', tiempoRespuesta: '~3.8 min', winRate: '69% (18/26)' },
  { id: 6, nombre: 'Distribuidora Alto Valle Repuestos', direccion: 'Ruta 22 Km 1215', titular: 'Héctor R.', cuit: '30-65231940-2', aliasCuenta: 'altovalle.rep', cbu: '0110652319402002978310', ciudad: 'neuquen', radio: '25 km (Neuquén + Cipolletti)', estado: 'Activo', tiempoRespuesta: '~5.1 min', winRate: '75% (24/32)' },
];

const DEMANDA_INICIAL: DemandaItem[] = [
  { repuesto: 'Kit de Embrague (Placa, Disco y Crapodina)', marcas: 'Marcas más buscadas: Valeo / Luk', categoria: 'Transmisión', categoriaClase: 'bg-cyan-400/20 text-cyan-300', vehiculo: 'Toyota Hilux 2.8 / 3.0 D-4D', tipo: 'Camioneta', pedidos: 54, precio: '$ 168.000' },
  { repuesto: 'Pastillas de Freno Delanteras (Pinza Teves)', marcas: 'Marcas más buscadas: Fras-le / Bosch', categoria: 'Frenos', categoriaClase: 'bg-emerald-400/20 text-emerald-300', vehiculo: 'Volkswagen Gol Trend / Power 1.6', tipo: 'Auto', pedidos: 48, precio: '$ 19.500' },
  { repuesto: 'Amortiguadores Delanteros Reforzados', marcas: 'Marcas más buscadas: Monroe / Fric-Rot', categoria: 'Suspensión', categoriaClase: 'bg-purple-400/20 text-purple-300', vehiculo: 'Ford Ranger 2.2 / 3.2 TDCi', tipo: 'Camioneta', pedidos: 42, precio: '$ 88.000' },
  { repuesto: 'Bomba de Agua con turbina metálica', marcas: 'Marcas más buscadas: Dolz / SKF', categoria: 'Motor', categoriaClase: 'bg-rose-400/20 text-rose-300', vehiculo: 'VW Passat Sedán / Vento 2.0 TDI', tipo: 'Auto', pedidos: 36, precio: '$ 34.000' },
  { repuesto: 'Kit de Distribución con Bomba y Tensores', marcas: 'Marcas más buscadas: Gates / Continental', categoria: 'Motor', categoriaClase: 'bg-rose-400/20 text-rose-300', vehiculo: 'Volkswagen Amarok 2.0 BiTDI', tipo: 'Camioneta', pedidos: 31, precio: '$ 124.000' },
  { repuesto: 'Kit de Filtros (Aceite, Aire y Habitáculo)', marcas: 'Marcas más buscadas: Mann Filter / Wega', categoria: 'Service', categoriaClase: 'bg-amber-400/20 text-amber-300', vehiculo: 'Peugeot 208 1.6 16V / 1.2', tipo: 'Auto', pedidos: 29, precio: '$ 28.500' },
];

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './panel-admin.component.html',
  styleUrl: './panel-admin.component.css',
})
export class PanelAdminComponent implements OnDestroy {

  private readonly router = inject(Router);

  ngOnDestroy(): void {
    this.mapa?.remove();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  volver(): void { this.router.navigate(['/']); }

  // ── Navegación de vistas ──
  vista = signal<Vista>('dashboard');
  readonly vistasSidebar: { id: Vista; titulo: string; sub: string; subClase: string; iconoClase: string }[] = [
    { id: 'dashboard', titulo: 'Dashboard', sub: 'KPIs de la red', subClase: 'text-stone-400', iconoClase: '' },
    { id: 'demanda', titulo: 'Demanda', sub: 'Autos y camionetas top', subClase: 'text-amber-300', iconoClase: 'text-amber-400' },
    { id: 'comercios', titulo: 'Comercios', sub: 'Registro manual y CUIT', subClase: 'text-stone-400', iconoClase: '' },
    { id: 'cobertura', titulo: 'Mapa de Calor', sub: 'Cobertura regional', subClase: 'text-cyan-300', iconoClase: 'text-cyan-400' },
    { id: 'incompatibilidades', titulo: 'Incompatibilidades', sub: 'Disputas de calce', subClase: 'text-rose-300', iconoClase: 'text-rose-400' },
    { id: 'solicitudes', titulo: 'Auditoría', sub: 'VINs, tokens y calce', subClase: 'text-stone-400', iconoClase: '' },
    { id: 'facturacion', titulo: 'Facturación', sub: 'Comisión 3% y CBU', subClase: 'text-stone-400', iconoClase: '' },
    { id: 'usuarios', titulo: 'Usuarios', sub: 'Cédulas verdes y reclamos', subClase: 'text-stone-400', iconoClase: '' },
    { id: 'logistica', titulo: 'Flota de Motos', sub: 'Cadetería en ruta', subClase: 'text-stone-400', iconoClase: '' },
  ];

  mostrarVista(v: Vista): void {
    this.vista.set(v);
    if (v === 'incompatibilidades') { this.incompatVisto.set(true); }
    if (v === 'comercios') { this.comerciosVisto.set(true); }
    if (v === 'cobertura') { setTimeout(() => this.armarMapa(), 60); }
  }

  // Badge de notificaciones: reclamos abiertos sin revisar (desaparece al ver el módulo)
  incompatVisto = signal(false);
  // Badge de notificaciones: comercios habilitados sin revisar (desaparece al ver el módulo)
  comerciosVisto = signal(false);

  // ── Flota de Motos: requisitos, documentación y cadetes (mock; se reemplaza por backend) ──
  readonly REQUISITOS_CADETE: { titulo: string; detalle: string }[] = [
    { titulo: 'Mayor de 18 años', detalle: 'Edad mínima para reparto remunerado.' },
    { titulo: 'DNI vigente', detalle: 'O residencia precaria en caso de ser extranjero.' },
    { titulo: 'CUIL / CUIT activo', detalle: 'Situación fiscal regularizada en AFIP.' },
    { titulo: 'Antecedentes penales', detalle: 'Certificado vigente al momento del alta.' },
    { titulo: 'CBU / CVU a tu nombre', detalle: 'Cuenta bancaria o billetera virtual para recibir el pago semanal.' },
    { titulo: 'Android con datos móviles', detalle: 'Celular con la app de cadetería y datos activos en cada viaje.' },
  ];

  readonly DOCS_MOTO: { titulo: string; detalle: string }[] = [
    { titulo: 'Licencia de conducir vigente', detalle: 'Acorde a la categoría de motovehículos.' },
    { titulo: 'Cédula verde o azul', detalle: 'La azul si la moto no está a nombre del cadete.' },
    { titulo: 'Seguro obligatorio al día', detalle: 'Póliza de la moto vigente y cargada en la app.' },
  ];

  // Requisitos extra según jurisdicción (varían por ciudad; el ejemplo oficial es CABA)
  readonly ZONAS_LOGISTICA: { key: CiudadKey; requisito: string; extra: boolean }[] = [
    { key: 'trelew', requisito: 'Sin requisitos locales extra. Solo la documentación base del cadete y de la moto.', extra: false },
    { key: 'rawson', requisito: 'Sin requisitos locales extra. Solo la documentación base del cadete y de la moto.', extra: false },
    { key: 'madryn', requisito: 'Sin requisitos locales extra. Solo la documentación base del cadete y de la moto.', extra: false },
    { key: 'comodoro', requisito: 'Sin requisitos locales extra. Solo la documentación base del cadete y de la moto.', extra: false },
    { key: 'neuquen', requisito: 'Registro local de mensajería + curso de seguridad vial obligatorio, además de la documentación base.', extra: true },
  ];

  // Zona logística seleccionada (Trelew por defecto)
  zonaLogistica = signal<CiudadKey>('trelew');

  seleccionarZonaLogistica(key: CiudadKey): void {
    this.zonaLogistica.set(key);
  }

  zonaLogisticaPillClase(key: CiudadKey): string {
    const activo = this.zonaLogistica() === key;
    const base = activo
      ? 'bg-rose-500/30 text-rose-200 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
      : 'bg-white/5 text-stone-400 border-white/10 hover:text-stone-200';
    return `flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition text-center ${base}`;
  }

  zonaLogisticaActual(): { key: CiudadKey; requisito: string; extra: boolean } {
    return this.ZONAS_LOGISTICA.find(z => z.key === this.zonaLogistica()) || this.ZONAS_LOGISTICA[0];
  }

  cadetesDeZona(key: CiudadKey): typeof this.CADETES[number][] {
    return this.CADETES.filter(c => c.ciudad === key);
  }

  readonly CADETES: {
    id: number; nombre: string; ciudad: CiudadKey; moto: string;
    docs: { personales: boolean; licencia: boolean; cedula: boolean; seguro: boolean };
    pagoSemanal: string;
  }[] = [
    { id: 1, nombre: 'Matías Ojeda', ciudad: 'trelew', moto: 'ABC 123 · Honda Wave 110', docs: { personales: true, licencia: true, cedula: true, seguro: true }, pagoSemanal: '$ 38.500' },
    { id: 2, nombre: 'Sofía Nahuelquir', ciudad: 'trelew', moto: 'DEF 456 · Yamaha Crypton', docs: { personales: true, licencia: true, cedula: true, seguro: false }, pagoSemanal: '$ 41.200' },
    { id: 3, nombre: 'Ramiro Alvarez', ciudad: 'rawson', moto: 'GHI 789 · Gilera Smash', docs: { personales: true, licencia: true, cedula: true, seguro: true }, pagoSemanal: '$ 22.800' },
    { id: 4, nombre: 'Camila Sosa', ciudad: 'madryn', moto: 'JKL 012 · Honda CG 150', docs: { personales: false, licencia: true, cedula: true, seguro: true }, pagoSemanal: '$ 47.900' },
    { id: 5, nombre: 'Nicolás Pérez', ciudad: 'comodoro', moto: 'MNO 345 · Zanella ZB 110', docs: { personales: true, licencia: false, cedula: true, seguro: true }, pagoSemanal: '$ 52.300' },
  ];

  docsCadeteEstado(c: typeof this.CADETES[number]): { label: string; clase: string } {
    const faltantes = [
      !c.docs.personales && 'Requisitos personales',
      !c.docs.licencia && 'Licencia',
      !c.docs.cedula && 'Cédula',
      !c.docs.seguro && 'Seguro',
    ].filter(Boolean) as string[];
    if (!faltantes.length) return { label: 'Habilitado', clase: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' };
    return { label: 'Falta: ' + faltantes.join(', '), clase: 'bg-rose-500/20 text-rose-300 border border-rose-500/40' };
  }

  cadetesHabilitados(): number {
    return this.CADETES.filter(c => !this.docsCadeteEstado(c).label.startsWith('Falta')).length;
  }

  // ── Mapa real de cobertura + calor de demanda (Leaflet + OSM) ──
  private mapa: L.Map | null = null;

  readonly CIUDAD_MAPA: Record<CiudadKey, { coords: [number, number]; radioKm: number; color: string }> = {
    trelew:   { coords: [-43.248, -65.305], radioKm: 12, color: '#FBBF24' },
    rawson:   { coords: [-43.300, -65.102], radioKm: 8,  color: '#22D3EE' },
    madryn:   { coords: [-42.769, -65.036], radioKm: 15, color: '#34D399' },
    comodoro: { coords: [-45.867, -67.490], radioKm: 20, color: '#6EE7B7' },
    neuquen:  { coords: [-38.951, -68.045], radioKm: 25, color: '#FB7185' },
  };

  // Zonas de venta por ciudad (compras del último mes) — bases para el mapa de calor
  readonly ZONAS_DEMANDA: Record<CiudadKey, { zona: string; compras: number; coords: [number, number] }[]> = {
    trelew: [
      { zona: 'Centro (San Martín y Belgrano)', compras: 128, coords: [-43.246, -65.302] },
      { zona: 'Zona Norte (Av. Fontana)', compras: 94, coords: [-43.235, -65.295] },
      { zona: 'Ferroviaria (Hendré)', compras: 61, coords: [-43.255, -65.312] },
      { zona: 'Industrial (RP 1)', compras: 47, coords: [-43.230, -65.320] },
      { zona: 'Sur (25 de Mayo)', compras: 38, coords: [-43.262, -65.298] },
    ],
    rawson: [
      { zona: 'Centro (Moreno)', compras: 72, coords: [-43.299, -65.100] },
      { zona: 'Playa Unión', compras: 58, coords: [-43.315, -65.045] },
      { zona: 'Puerto y Zona Costera', compras: 41, coords: [-43.290, -65.095] },
      { zona: 'Villa Dodge', compras: 27, coords: [-43.290, -65.130] },
    ],
    madryn: [
      { zona: 'Centro (Güemes)', compras: 96, coords: [-42.767, -65.034] },
      { zona: 'Parque Industrial', compras: 63, coords: [-42.755, -65.055] },
      { zona: 'Golfo San Jorge', compras: 35, coords: [-42.780, -65.020] },
    ],
    comodoro: [
      { zona: 'Centro (San Martín)', compras: 88, coords: [-45.865, -67.488] },
      { zona: 'Km 5 (Comercial)', compras: 52, coords: [-45.845, -67.510] },
      { zona: 'Zona Norte (Barrio Militar)', compras: 44, coords: [-45.830, -67.470] },
    ],
    neuquen: [
      { zona: 'Centro (Alto Comahue)', compras: 75, coords: [-38.950, -68.043] },
      { zona: 'Cipolletti (Ruta 22)', compras: 49, coords: [-38.938, -68.000] },
    ],
  };

  // Ciudad seleccionada para el mapa de calor (solo una a la vez; Trelew al iniciar)
  ciudadesHeat = signal<Set<CiudadKey>>(new Set<CiudadKey>(['trelew']));

  toggleHeat(c: CiudadKey): void {
    const actual = this.ciudadesHeat();
    if (actual.has(c) && actual.size === 1) return; // ya es la única seleccionada
    this.ciudadesHeat.set(new Set<CiudadKey>([c]));
    if (this.vista() === 'cobertura') { this.armarMapa(); }
  }

  heatBtnClase(c: CiudadKey): string {
    return this.ciudadesHeat().has(c)
      ? 'px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-bold shrink-0'
      : 'px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-stone-300 hover:text-white shrink-0';
  }

  totalCompras(c: CiudadKey): number {
    return this.ZONAS_DEMANDA[c].reduce((acc, z) => acc + z.compras, 0);
  }

  heatCiudades(): { key: CiudadKey; label: string; compras: number }[] {
    return (Object.keys(this.ZONAS_DEMANDA) as CiudadKey[]).map(k => ({
      key: k, label: CIUDADES[k].label, compras: this.totalCompras(k),
    }));
  }

  private armarMapa(): void {
    const el = document.getElementById('mapaCobertura');
    if (!el) return;
    this.mapa?.remove();
    this.mapa = null;

    const map = L.map(el, { zoomControl: true, attributionControl: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const seleccion = this.ciudadesHeat();

    // ── Capa de densidad (heatmap real): puntos difuminados por zona ──
    const zonas = Array.from(seleccion).flatMap(key => this.ZONAS_DEMANDA[key]);
    const max = Math.max(...zonas.map(z => z.compras), 1);
    const puntosCalor: [number, number, number][] = [];
    for (const z of zonas) {
      for (const [lat, lng, w] of this.semillaCalor(z, max)) {
        puntosCalor.push([lat, lng, w]);
      }
    }
    new HeatLayer(puntosCalor, {
      radius: 36,          // radio de influencia de cada punto (px)
      blur: 24,            // difuminado: bordes sin definición
      minOpacity: 0.28,    // las zonas frías apenas se insinúan
      max: 1,
      gradient: {
        0.10: '#0E7490',   // azul/verde agua: demanda baja
        0.30: '#22D3EE',
        0.48: '#FACC15',   // amarillo brillante: demanda media
        0.66: '#F59E0B',   // naranja
        0.84: '#EF4444',   // rojo puro: demanda alta
        1.00: '#F43F5E',   // magenta neón: pico máximo
      },
    }).addTo(map);

    // ── Áreas invisibles de hover: datos solo al pasar el mouse ──
    for (const z of zonas) {
      L.circleMarker(z.coords, {
        radius: Math.max(150, z.compras * 7),
        stroke: false, fillOpacity: 0, fill: true,
      })
        .bindTooltip(`${z.zona} · ${z.compras} compras/mes`, {
          direction: 'top', className: 'tt-admin-tip', sticky: true,
        })
        .addTo(map);
    }

    // Encuadre de las zonas filtradas
    if (seleccion.size === 1) {
      const unica = [...seleccion][0];
      map.setView(this.CIUDAD_MAPA[unica].coords, 12);
    } else if (zonas.length) {
      const todos = zonas.flatMap(z => this.semillaCalor(z, max).map(s => [s[0], s[1]] as L.LatLngTuple));
      map.fitBounds(L.latLngBounds(todos).pad(0.2));
    }
    setTimeout(() => map.invalidateSize(), 200);
    this.mapa = map;
  }

  /**
   * Semilla de calor para una zona: punto central + anillo satélite,
   * con intensidad relativa al máximo global (0..1).
   */
  private semillaCalor(z: { coords: [number, number]; compras: number }, max: number): [number, number, number][] {
    const [lat, lng] = z.coords;
    const spread = Math.max(0.005, z.compras * 0.00009); // dispersión del foco (grados)
    const val = z.compras / max;
    const satelites: [number, number, number][] = [
      [1, 0, 0.62], [-1, 0, 0.55], [0, 1, 0.6], [0, -1, 0.52],
      [0.7, 0.7, 0.48], [-0.7, 0.7, 0.5], [0.7, -0.7, 0.45], [-0.7, -0.7, 0.42],
    ];
    return [
      [lat, lng, val],
      ...satelites.map(([ox, oy, f]) => [lat + oy * spread * f, lng + ox * spread * 1.3 * f, val * f] as [number, number, number]),
    ];
  }

  pillClase(v: Vista): string {
    return this.vista() === v
      ? 'px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-bold shrink-0 transition'
      : 'px-3 py-1.5 rounded-xl text-stone-300 hover:text-white shrink-0 transition flex items-center gap-1.5';
  }

  navClase(v: Vista): string {
    return 'nav-admin-link w-full p-3 rounded-2xl flex items-center gap-3 text-left' + (this.vista() === v ? ' active' : '');
  }

  // ── Comercios ──
  comercios = signal<Comercio[]>(COMERCIOS_INICIALES.map(c => ({ ...c })));
  totalComercios = computed(() => this.comercios().length);
  // Filtro de comercios: Trelew seleccionado por defecto
  ciudadFiltro = signal<'all' | CiudadKey>('trelew');

  porCiudad = computed(() => {
    const out: Record<CiudadKey, number> = { trelew: 0, madryn: 0, comodoro: 0, rawson: 0, neuquen: 0 };
    for (const c of this.comercios()) out[c.ciudad]++;
    return out;
  });

  comerciosFiltrados = computed(() => {
    const f = this.ciudadFiltro();
    return f === 'all' ? this.comercios() : this.comercios().filter(c => c.ciudad === f);
  });

  // Tabla resumen del dashboard: primeros 5 locales
  comerciosResumen = computed(() => this.comercios().slice(0, 5));

  ciudadPill(key: CiudadKey): string { return CIUDADES[key].pill; }
  ciudadLabel(key: CiudadKey): string { return CIUDADES[key].label; }

  ciudadBtnClase(c: 'all' | CiudadKey): string {
    return this.ciudadFiltro() === c
      ? 'px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-bold shrink-0'
      : 'px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-stone-300 hover:text-white shrink-0';
  }

  ciudadPillDashboard(): { key: 'all' | CiudadKey; texto: string }[] {
    const p = this.porCiudad();
    return [
      { key: 'all', texto: `Todas las Plazas (${this.totalComercios()})` },
      { key: 'trelew', texto: `Trelew (${p.trelew})` },
      { key: 'madryn', texto: `Puerto Madryn (${p.madryn})` },
      { key: 'comodoro', texto: `Comodoro Rivadavia (${p.comodoro})` },
      { key: 'rawson', texto: `Rawson (${p.rawson})` },
      { key: 'neuquen', texto: `Neuquén Capital (${p.neuquen})` },
    ];
  }

  suspender(c: Comercio): void {
    const nuevoEstado: Comercio['estado'] = c.estado === 'Suspendido' ? 'Activo' : 'Suspendido';
    this.comercios.update(list => list.map(x => x.id === c.id ? { ...x, estado: nuevoEstado } : x));
    this.mostrarToast(`Comercio "${c.nombre}" marcado como ${nuevoEstado.toUpperCase()} en base de datos.`);
  }

  reenviarAcceso(c: Comercio): void {
    this.mostrarToast(`Credenciales y enlace seguro reenviados a ${c.nombre}.`);
  }

  // ── Demanda ──
  demanda = signal<DemandaItem[]>(DEMANDA_INICIAL.map(d => ({ ...d })));
  filtroDemanda = signal<'all' | 'trucks' | 'cars'>('all');
  demandaFiltrada = computed(() => {
    const f = this.filtroDemanda();
    return f === 'all' ? this.demanda() : this.demanda().filter(d => f === 'trucks' ? d.tipo === 'Camioneta' : d.tipo === 'Auto');
  });

  demandaBtnClase(f: 'all' | 'trucks' | 'cars'): string {
    return this.filtroDemanda() === f
      ? 'px-3 py-1.5 rounded-lg bg-amber-400 text-stone-950 font-bold'
      : 'px-3 py-1.5 rounded-lg text-stone-400 hover:text-white';
  }

  // ── Modal de Alta Manual ──
  modalAltaAbierto = signal(false);
  altaNombre = '';
  altaCuit = '';
  altaTitular = '';
  altaDireccion = '';
  altaCiudad: CiudadKey = 'trelew';
  altaWhatsapp = '';
  altaAlias = '';
  altaCbu = '';

  abrirModalAlta(): void {
    this.modalAltaAbierto.set(true);
  }

  cerrarModalAlta(): void {
    this.modalAltaAbierto.set(false);
  }

  /** Copia los datos de transferencia (alias + CBU) de un comercio al portapapeles. */
  async copiarCuenta(c: Comercio): Promise<void> {
    const texto = `Alias: ${c.aliasCuenta}\nCBU: ${c.cbu}\nTitular: ${c.titular} · ${c.nombre}`;
    try {
      await navigator.clipboard.writeText(texto);
      this.mostrarToast(`Datos de transferencia de "${c.nombre}" copiados (alias + CBU).`);
    } catch {
      this.mostrarToast(`No pude acceder al portapapeles. Alias: ${c.aliasCuenta} · CBU: ${c.cbu}`);
    }
  }

  confirmarAlta(): void {
    if (!this.altaNombre.trim() || !this.altaCuit.trim() || !this.altaTitular.trim() || !this.altaDireccion.trim()) {
      this.mostrarToast('Completá nombre, CUIT, responsable y dirección para confirmar el alta.');
      return;
    }
    const nuevo: Comercio = {
      id: Date.now(),
      nombre: this.altaNombre.trim(),
      direccion: this.altaDireccion.trim(),
      titular: this.altaTitular.trim(),
      cuit: this.altaCuit.trim(),
      aliasCuenta: this.altaAlias.trim() || 'a designar',
      cbu: this.altaCbu.trim() || 'a designar',
      ciudad: this.altaCiudad,
      radio: CIUDADES[this.altaCiudad].radio.replace('Radio ', ''),
      estado: 'Activo',
      tiempoRespuesta: 's/d',
      winRate: 'nuevo',
    };
    this.comercios.update(list => [...list, nuevo]);
    this.modalAltaAbierto.set(false);
    this.mostrarToast(`¡Alta exitosa! Se habilitó a "${nuevo.nombre}" (CUIT: ${nuevo.cuit}) en ${CIUDADES[nuevo.ciudad].label}. Se generó su link oficial de mostrador.`);
    this.altaNombre = ''; this.altaCuit = ''; this.altaTitular = ''; this.altaDireccion = ''; this.altaWhatsapp = '';
    this.altaAlias = ''; this.altaCbu = '';
  }

  // ── Incompatibilidades ──
  disputaResuelta = signal<'pendiente' | 'reembolso' | 'cambio'>('pendiente');

  // Reclamos por ciudad (mock; se reemplaza por datos del backend)
  readonly RECLAMOS_POR_CIUDAD: { key: CiudadKey; abiertos: number; resueltos: number }[] = [
    { key: 'trelew', abiertos: 2, resueltos: 3 },
    { key: 'rawson', abiertos: 1, resueltos: 1 },
    { key: 'madryn', abiertos: 1, resueltos: 2 },
    { key: 'comodoro', abiertos: 0, resueltos: 1 },
    { key: 'neuquen', abiertos: 0, resueltos: 0 },
  ];

  totalReclamos(tipo: 'abiertos' | 'resueltos'): number {
    return this.RECLAMOS_POR_CIUDAD.reduce((acc, r) => acc + r[tipo], 0);
  }

  // Ciudad seleccionada en el monitor de reclamos (Trelew por defecto)
  reclamoCiudad = signal<CiudadKey>('trelew');

  seleccionarReclamoCiudad(key: CiudadKey): void {
    this.reclamoCiudad.set(key);
  }

  reclamoPillClase(r: { abiertos: number; key: CiudadKey }): string {
    const activo = this.reclamoCiudad() === r.key;
    const base = activo
      ? 'bg-rose-500/30 text-rose-200 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
      : 'bg-white/5 text-stone-400 border-white/10';
    return `flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition ${base}`;
  }

  readonly CASOS_RECLAMOS: {
    id: string; ciudad: CiudadKey; titulo: string; partes: string;
    monto: string; estado: string; detallado?: boolean;
  }[] = [
    { id: 'DISP-1082', ciudad: 'trelew', titulo: 'Pastilla de freno con ranura incorrecta', partes: 'Cliente: Lucas R. (Taller Don Bosco) vs. Repuestos Don Bosco SRL', monto: '$ 26.800 ARS', estado: 'En auditoría', detallado: true },
    { id: 'DISP-1090', ciudad: 'trelew', titulo: 'Amortiguador trasero de modelo distinto', partes: 'Cliente: Verónica S. vs. Repuestos Centro Trelew', monto: '$ 41.250 ARS', estado: 'Esperando muestra del cliente' },
    { id: 'DISP-1079', ciudad: 'rawson', titulo: 'Batería 12V con terminales invertidos', partes: 'Cliente: Taller Puerto vs. Autopartes Rawson Costa', monto: '$ 18.700 ARS', estado: 'En auditoría' },
    { id: 'DISP-1071', ciudad: 'rawson', titulo: 'Filtro de aceite con rosca incorrecta', partes: 'Cliente: Taller del Valle vs. Autopartes Rawson Costa', monto: '$ 12.900 ARS', estado: 'Resuelto: reposición' },
    { id: 'DISP-1055', ciudad: 'madryn', titulo: 'Correa dentada con dientes desgastados', partes: 'Cliente: Rodrigo M. vs. Madryn Frenos & Embragues', monto: '$ 33.400 ARS', estado: 'En auditoría' },
  ];

  casosDeCiudad() {
    return this.CASOS_RECLAMOS.filter(c => c.ciudad === this.reclamoCiudad());
  }

  estadoClase(estado: string): string {
    if (estado.startsWith('Resuelto')) return 'bg-emerald-500/20 text-emerald-300';
    return 'bg-amber-500/20 text-amber-300';
  }

  resolverDisputa(accion: 'reembolso' | 'cambio'): void {
    this.disputaResuelta.set(accion);
    this.mostrarToast(accion === 'reembolso'
      ? 'Reembolso de $26.800 emitido hacia la cuenta del comprador.'
      : 'Orden de retiro y reposición prioritaria emitida a la moto.');
  }

  // ── Tokens ──
  tokenRevocado = signal(false);
  revocarToken(): void {
    this.tokenRevocado.set(true);
    this.mostrarToast('Token trw-fxn892-passat revocado inmediatamente por seguridad.');
  }

  // ── Toast ──
  toastVisible = signal(false);
  toastMensaje = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  mostrarToast(msg: string): void {
    this.toastMensaje.set(msg);
    this.toastVisible.set(true);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 3500);
  }
}
