import { Injectable, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { VehiculoActivoService } from '../../../application/services/vehiculo-activo.service';
import { DemoApiService } from '../../../application/services/demo-api.service';
import { PerfilPreventivoService } from '../../perfil-preventivo.service';

// Estado compartido de las etapas del panel comprador:
// Etapa 3 (Destino & Moto) · Etapa 4 (Pasarela de pago) · Etapa 5 (Moto en Ruta)
// Se provee en el componente raíz (PanelCompradorComponent) para que su ciclo de vida
// coincida con el del panel (el reloj y el mapa se destruyen al salir de la ruta).
@Injectable()
export class CompradorEstadoService implements OnDestroy {

  private readonly router = inject(Router);
  volver(): void { this.router.navigate(['/']); }
  private readonly activoSvc = inject(VehiculoActivoService);
  private readonly demoApi = inject(DemoApiService);
  /** Perfil preventivo (4 bloques de 25%): el mismo que muestra el anillo del buscador. */
  private readonly perfilSvc = inject(PerfilPreventivoService);
  autoActivo = this.activoSvc.activo;
  tab = signal('solicitudes');
  splitOpen = signal(false);
  altaOpen = signal(false);
  altaGuardando = signal(false);
  altaEscaneando = signal(false);
  altaError = signal('');
  altaPatente = '';
  altaMarca = '';
  altaModelo = '';
  altaAnio = '';
  altaVin = '';
  altaMotor = '';
  autos = signal<{ id?: string; nombre: string; version: string; patente: string; vin: string }[]>([]);

  respuestaElegida = signal<string | null>(null);
  venceFerodo = Date.now() + 41 * 60000;
  bannerVisible = signal(true);
  reloj = signal(Date.now());
  private timerId?: number;

  constructor() {
    // Badge "nuevas": si el usuario ya vio las respuestas en una visita anterior, arranca sin badge
    this.nuevasVistas.set(localStorage.getItem('tb_solicitudes_vistas') === '1');
    // Garaje real: los vehículos vienen del backend (tabla vehicles de Supabase)
    this.cargarGarajeReal();
    // Reloj en vivo para vencimientos de ofertas (tick por segundo)
    this.timerId = window.setInterval(() => this.reloj.set(Date.now()), 1000);
    // Notificación tipo toast: se autodescarta a los 5 segundos
    setTimeout(() => this.cerrarBanner(), 5000);
    // Mapa real (Leaflet): se genera al abrir la Etapa 5 y se destruye al cerrarla
    effect(() => {
      if (this.rutaAbierta()) {
        setTimeout(() => this.generarMapaCadete(), 120);
      } else if (this.mapa) {
        this.mapa.remove();
        this.mapa = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }
  }

  // Estados de las ofertas: 'nueva' (sin ver) · 'expira' (vencimiento en vivo) · elegida = respuestaElegida
  tiempoRestante(vence?: number): string {
    if (!vence) {
      return '';
    }
    const ms = vence - this.reloj();
    if (ms <= 0) {
      return 'VENCIDA';
    }
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const horas = Math.floor(min / 60);
    if (horas > 0) {
      return horas + 'h ' + String(min % 60).padStart(2, '0') + 'm';
    }
    return String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  cerrarBanner(): void {
    this.bannerVisible.set(false);
  }

  // Tabla compacta de alta densidad: 6 comercios respondieron (M1 envía 3 opciones)
  // Estados: 'nueva' = sin ver · 'expira' = oferta con vencimiento en vivo · elegida = respuestaElegida
  comerciosTabla: { id: string; mejor?: boolean; opciones?: string; nombre: string; detalle: string; marca: string; precio: string; eta: string; estado?: 'nueva' | 'expira'; vence?: number }[] = [
    { id: 'M1', mejor: true, opciones: '3 OPCIONES', estado: 'nueva', nombre: 'Repuestos Centro Trelew', detalle: 'Bosch OEM / Ferodo / Fras-le · San Martín 450', marca: 'Bosch desde', precio: 'Desde $21.500', eta: 'Moto en 15m' },
    { id: 'M2', estado: 'expira', vence: Date.now() + 22 * 60000, nombre: 'Autopartes Acceso Norte', detalle: 'Ferodo Premier Italy · Ruta 3 y Colombia', marca: 'Ferodo Italy', precio: '$28.400', eta: 'Moto en 20m' },
    { id: 'M3', estado: 'nueva', nombre: 'Casa de Repuestos Sur', detalle: 'LPR Brakes Italia · Av. Yrigoyen 1120', marca: 'LPR Italia', precio: '$25.200', eta: 'Moto en 25m' },
    { id: 'M4', nombre: 'Depósito Parque Industrial', detalle: 'Brembo P85075 · Parque Pesado', marca: 'Brembo', precio: '$29.800', eta: 'Moto en 25m' },
    { id: 'M5', estado: 'expira', vence: Date.now() + 8 * 60000, nombre: 'Warnes Patagonia Trelew', detalle: 'Textar Pro Germany · Fontana y Gales', marca: 'Textar Pro', precio: '$27.100', eta: 'Moto en 18m' },
    { id: 'M6', nombre: 'Frenos Fontana & Embragues', detalle: 'Raybestos USA · Av. Fontana 620', marca: 'Raybestos USA', precio: '$23.900', eta: 'Moto en 12m' },
  ];

  switchTab(t: string): void {
    this.tab.set(t);
    // Ver el tab de presupuestos cuenta como "leído": el badge deja de mostrar novedades
    if (t === 'solicitudes') this.marcarSolicitudesVistas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Ofertas sin ver (badge del tab). Desaparece cuando el usuario las abre,
   *  y queda visto entre visitas (localStorage). */
  nuevasVistas = signal(false);
  comerciosNuevas = computed(() => this.comerciosTabla.filter(c => c.estado === 'nueva').length);

  marcarSolicitudesVistas(): void {
    if (this.nuevasVistas()) return;
    this.nuevasVistas.set(true);
    try { localStorage.setItem('tb_solicitudes_vistas', '1'); } catch { /* almacenamiento no disponible */ }
  }

  elegirOpcion(articulo: string, precio: string): void {
    this.elegirRespuesta(articulo, precio);
  }

  // Acordeón de la mini-comparativa interna del comercio M1 (3 opciones del vendedor)
  opcionesM1Abiertas = signal(true);
  private readonly opcionesM1: { nombre: string; label: string; precio: string }[] = [
    { nombre: 'Fras-le Cerif Estándar', label: 'FRAS-LE (ECONÓMICA)', precio: '21.500' },
    { nombre: 'Ferodo Italy Eco-Friction', label: 'FERODO (INTERMEDIA)', precio: '24.800' },
    { nombre: 'Bosch OEM Germany', label: 'BOSCH (1ª MARCA OEM)', precio: '28.900' },
  ];

  abrirOpcionesM1(): void {
    this.opcionesM1Abiertas.set(!this.opcionesM1Abiertas());
  }

  // Marca tildada dentro del local M1 (null = sin definir)
  elegidaM1(): string | null {
    const encontrada = this.opcionesM1.find(o => this.esElegida(o.nombre));
    return encontrada ? encontrada.nombre : null;
  }

  opcionM1Label(nombre: string): string {
    const o = this.opcionesM1.find(x => x.nombre === nombre);
    return o ? o.label : nombre.toUpperCase();
  }

  elegidaM1Label(): string {
    const n = this.elegidaM1();
    return n ? this.opcionM1Label(n) : '';
  }

  precioM1Elegida(): string {
    const o = this.opcionesM1.find(x => this.esElegida(x.nombre));
    return o ? o.precio : '0.000';
  }

  // Lista de comercios ordenada de MENOR a MAYOR precio (lo más barato primero)
  comerciosOrdenados(): { id: string; mejor?: boolean; opciones?: string; nombre: string; detalle: string; marca: string; precio: string; eta: string; estado?: 'nueva' | 'expira'; vence?: number }[] {
    return [...this.comerciosTabla].sort((a, b) => this.aPrecio(a.precio) - this.aPrecio(b.precio));
  }

  private aPrecio(v: string): number {
    const num = v.replace(/[^\d]/g, '');
    return num ? parseInt(num, 10) : 0;
  }

  // Solo se habilita cuando el usuario tildó una marca exacta
  confirmarCompraM1(): void {
    const elegida = this.elegidaM1();
    if (!elegida) {
      return;
    }
    this.destinoAbierto.set(true);
  }

  // ══ PASARELA DE PAGO (Etapa 4: Pago y Despacho) ══
  pasarelaAbierta = signal(false);
  comprobanteAdjuntado = signal(false);
  aliasCopiado = signal(false);

  // ══ ETAPA 3: DESTINO Y MOTO ══
  destinoAbierto = signal(false);
  destinoElegido = signal<'taller' | 'gps'>('taller');
  gpsEscaneando = signal(false);
  gpsFijado = signal(false);

  elegirDestino(tipo: 'taller' | 'gps'): void {
    if (tipo === 'gps' && !this.gpsFijado()) {
      this.triggerGpsUbicacion();
      return;
    }
    this.destinoElegido.set(tipo);
  }

  // Escaneo satelital GPS: badge ámbar → fijado en verde al recibir señal
  triggerGpsUbicacion(): void {
    if (this.gpsEscaneando()) {
      return;
    }
    this.gpsEscaneando.set(true);
    setTimeout(() => {
      this.gpsEscaneando.set(false);
      this.gpsFijado.set(true);
      this.destinoElegido.set('gps');
    }, 350);
  }

  volverAPresupuestos(): void {
    this.destinoAbierto.set(false);
  }

  continuarAlPago(): void {
    this.destinoAbierto.set(false);
    this.pasarelaAbierta.set(true);
  }

  motoCosto(): string {
    return this.destinoElegido() === 'gps' ? '4.000' : '5.500';
  }

  rutaInfo(): string {
    return this.destinoElegido() === 'gps' ? '1.9 km · ~14 min' : '2.4 km · ~15 min';
  }

  pinDestino(): string {
    return this.destinoElegido() === 'gps' ? 'Mi GPS' : 'Taller';
  }

  destinoLabel(): string {
    return this.destinoElegido() === 'gps' ? 'Mi GPS: -43.2532°, -65.3094° (Trelew)' : 'Pellegrini 1240 (Taller)';
  }

  cerrarPasarela(): void {
    this.pasarelaAbierta.set(false);
  }

  copiarAlias(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('TOOLBOX.PATAGONIA.MP');
    }
    this.aliasCopiado.set(true);
    setTimeout(() => this.aliasCopiado.set(false), 2000);
  }

  adjuntarComprobante(): void {
    this.comprobanteAdjuntado.set(true);
  }

  // Pieza elegida + moto según el destino elegido en Etapa 3
  totalPasarela(): string {
    const n = this.aPrecio(this.precioM1Elegida()) + this.aPrecio(this.motoCosto());
    return n.toLocaleString('es-AR');
  }

  adquisicionAcreditada = signal(false);
  rutaAbierta = signal(false);

  validarComprobante(): void {
    // Sin validación: acreditación instantánea para probar el flujo + abre Etapa 5
    this.adquisicionAcreditada.set(true);
    this.rutaAbierta.set(true);
    this.pasarelaAbierta.set(false);
  }

  irAlPanel(): void {
    this.rutaAbierta.set(false);
    this.pasarelaAbierta.set(false);
    this.destinoAbierto.set(false);
  }

  volverAlPago(): void {
    this.rutaAbierta.set(false);
    this.pasarelaAbierta.set(true);
  }

  // ══ ETAPA 5: MOTO EN RUTA (telemetría del cadete) ══
  pasoRuta = signal(0);
  gpsRefrescando = signal(false);
  notaRuta = signal<string | null>(null);
  private readonly posicionesRuta: { top: string; left: string; min: number; km: string }[] = [
    { top: '50%', left: '50%', min: 12, km: '1.6' },
    { top: '42%', left: '56%', min: 8, km: '1.0' },
    { top: '34%', left: '63%', min: 5, km: '0.6' },
    { top: '26%', left: '72%', min: 2, km: '0.2' },
    { top: '24%', left: '76%', min: 0, km: 'Llegó' },
  ];

  // Coordenadas reales del trayecto en Trelew: San Martín 450 → Pellegrini 1240 (Taller Don Bosco)
  private readonly waypointsRuta: [number, number][] = [
    [-43.2507, -65.3081],
    [-43.2522, -65.3063],
    [-43.2541, -65.3046],
    [-43.2560, -65.3031],
    [-43.2571, -65.3019],
  ];
  private mapa: L.Map | null = null;
  private marcadorMoto: L.Marker | null = null;

  // Mapa Leaflet real: tiles oscuros + trayecto en cian + pin del cadete en vivo
  generarMapaCadete(): void {
    const cont = document.getElementById('mapaRutaLeaflet');
    if (!cont || this.mapa) {
      return;
    }
    const paso = this.posicionesRuta.map((p, i) => this.waypointsRuta[i]);

    this.mapa = L.map('mapaRutaLeaflet', { zoomControl: false, attributionControl: false, scrollWheelZoom: false });
    // Vista de la ciudad de Trelew completa: se ve el rótulo oficial "Trelew" y todo el valle
    this.mapa.setView([-43.2505, -65.3032], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.mapa);

    // Estilo global de Leaflet (scoped CSS de Angular no llega a los nodos que crea la librería)
    if (!document.getElementById('leaflet-tema-tbx')) {
      const est = document.createElement('style');
      est.id = 'leaflet-tema-tbx';
      est.textContent = '.leaflet-tooltip.tbx-tip{background:rgba(0,0,0,.82);border:1px solid rgba(255,255,255,.15);color:#E7E5E4;font-family:JetBrains Mono,monospace;font-size:10px;padding:2px 8px;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.5)}.leaflet-tooltip.tbx-tip::before{display:none}';
      document.head.appendChild(est);
    }

    // Tiles en modo oscuro (tema Apple Maps): filtro directo sobre el tile pane
    const paneTiles = this.mapa.getPane('tilePane');
    if (paneTiles) {
      paneTiles.style.filter = 'grayscale(0.72) brightness(0.42) contrast(1.12) saturate(0.7)';
    }

    // Trayecto: halo + línea sólida en cian
    L.polyline(paso, { color: '#06B6D4', weight: 8, opacity: 0.25, lineCap: 'round' }).addTo(this.mapa);
    L.polyline(paso, { color: '#22D3EE', weight: 4, opacity: 0.9, lineCap: 'round' }).addTo(this.mapa);

    // Origen: Repuestos Centro Trelew
    const divOrigen = L.divIcon({ className: '', html: '<div style="width:32px;height:32px;border-radius:9999px;background:#17151A;border:2px solid #FBBF24;color:#FCD34D;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;font-family:JetBrains Mono,monospace">M1</div>', iconSize: [32, 32], iconAnchor: [16, 16] });
    L.marker(paso[0], { icon: divOrigen }).addTo(this.mapa).bindTooltip('Origen: San Martín 450', { permanent: true, direction: 'bottom', className: 'tbx-tip' });

    // Destino: Taller Don Bosco
    const divDest = L.divIcon({ className: '', html: '<div style="width:36px;height:36px;border-radius:9999px;background:#34D399;color:#111;display:flex;align-items:center;justify-content:center;font-size:16px">📍</div>', iconSize: [36, 36], iconAnchor: [18, 18] });
    L.marker(paso[paso.length - 1], { icon: divDest }).addTo(this.mapa).bindTooltip('Destino: Pellegrini 1240 · Trelew', { permanent: true, direction: 'bottom', className: 'tbx-tip' });

    // Marcador de ciudad: rótulo Trelew al oeste del trayecto
    const divCiudad = L.divIcon({ className: '', html: '<div style="padding:2px 10px;border-radius:9999px;background:rgba(0,0,0,.85);border:1px solid rgba(255,255,255,.25);color:#fff;font-family:JetBrains Mono,monospace;font-size:11px;font-weight:700;white-space:nowrap">TRELEW · Chubut</div>', iconSize: [130, 22], iconAnchor: [65, 11] });
    L.marker([-43.2480, -65.3140], { icon: divCiudad, interactive: false }).addTo(this.mapa);

    // Moto del cadete (pin móvil)
    const divMoto = L.divIcon({ className: '', html: '<div style="width:48px;height:48px;border-radius:16px;background:#fff;border:2px solid #22D3EE;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 10px 30px rgba(0,0,0,.6)">🛵</div>', iconSize: [48, 48], iconAnchor: [24, 24] });
    this.marcadorMoto = L.marker(paso[this.pasoRuta()], { icon: divMoto, zIndexOffset: 900 }).addTo(this.mapa);

    setTimeout(() => this.mapa?.invalidateSize(), 150);
  }

  posicionActual(): { top: string; left: string; min: number; km: string } {
    return this.posicionesRuta[this.pasoRuta()];
  }

  llego(): boolean {
    return this.posicionActual().min === 0;
  }

  actualizarGps(): void {
    if (this.gpsRefrescando()) {
      return;
    }
    this.gpsRefrescando.set(true);
    const nuevo = (this.pasoRuta() + 1) % this.posicionesRuta.length;
    this.pasoRuta.set(nuevo);
    // El pin de la moto se mueve a su coordenada real en el mapa Leaflet
    if (this.marcadorMoto && this.mapa) {
      this.marcadorMoto.setLatLng(this.waypointsRuta[nuevo]);
      this.mapa.panTo(this.waypointsRuta[nuevo], { animate: true, duration: 0.7 });
    }
    const p = this.posicionesRuta[nuevo];
    this.notaRuta.set(p.min === 0 ? '¡El cadete Marcos llegó al Taller Don Bosco!' : 'Ubicación GPS actualizada: a ' + p.km + ' km (' + p.min + ' min)');
    setTimeout(() => {
      this.gpsRefrescando.set(false);
      setTimeout(() => this.notaRuta.set(null), 3500);
    }, 1000);
  }

  compartirUbicacion(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    this.notaRuta.set('Enlace de rastreo copiado para enviar por WhatsApp');
    setTimeout(() => this.notaRuta.set(null), 3500);
  }

  // Selección real de respuesta: se puede elegir cualquiera (tabla o cards) y cambiar cuantas veces se quiera
  elegirRespuesta(articulo: string, precio: string): void {
    this.respuestaElegida.set(articulo);
    // Un clic en la fila = ya fue vista: la etiqueta NUEVA desaparece definitivamente
    const fila = this.comerciosTabla.find(c => c.nombre === articulo);
    if (fila && fila.estado === 'nueva') {
      fila.estado = undefined;
    }
  }

  esElegida(articulo: string): boolean {
    return this.respuestaElegida() === articulo;
  }

  // Hay una elección definida: las demás filas se atenúan para resaltar la elegida
  hayElegida(): boolean {
    return this.respuestaElegida() !== null;
  }

  // Elegir una opción del acordeón del local M1 equivale a elegir ese comercio
  esElegidaFila(nombre: string): boolean {
    if (this.esElegida(nombre)) {
      return true;
    }
    if (this.opcionesM1.some(o => this.esElegida(o.nombre))) {
      return nombre === 'Repuestos Centro Trelew';
    }
    return false;
  }

  // Vehículos reales del usuario demo (backend FastAPI → Supabase)
  private cargarGarajeReal(): void {
    this.demoApi.garaje(this.demoApi.idComprador).subscribe({
      next: vehiculos => {
        this.autos.set(vehiculos.map(v => ({
          id: v.id,
          nombre: `${v.brand} ${v.model}`,
          version: `${v.engine_details ? v.engine_details + ' · ' : ''}${v.year}`,
          patente: v.license_plate,
          vin: v.vin ?? 'PENDIENTE',
        })));
        // Vehículo real en el garaje = cédula verde ya cargada → bloque de 25% del perfil
        this.perfilSvc.setBaseCedula(vehiculos.length > 0);
      },
      error: () => { /* backend caído: el garaje queda con lo que haya localmente */ },
    });
  }

  /** Foto de la Cédula Verde → OCR/vision del backend autocompleta el alta (mismos campos que el registro). */
  onFotoCedulaAlta(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    this.altaEscaneando.set(true);
    this.altaError.set('');
    this.demoApi.extraerCedula(files[0]).subscribe({
      next: (c) => {
        const limpio = (v: string | null) => (v && v !== 'NO DETECTADO' ? v : '');
        this.altaPatente = limpio(c.dominio) || this.altaPatente;
        this.altaMarca = limpio(c.marca) || this.altaMarca;
        this.altaModelo = limpio(c.modelo) || this.altaModelo;
        // El año suele venir en modelo_detalle: "Generación B6 (Año 2006)"
        const anio = (c.modelo_detalle ?? '').match(/(?:A[ñnio]+|year)\s*:?\s*(\d{4})/i)?.[1]
          ?? (c.modelo_detalle ?? '').match(/\b(19|20)\d{2}\b/)?.[0] ?? '';
        if (anio) this.altaAnio = anio;
        this.altaVin = limpio(c.chasis) || this.altaVin;
        this.altaMotor = limpio(c.motor_codigo) || this.altaMotor;
        if (!this.altaPatente && !this.altaMarca) {
          this.altaError.set('No se pudo leer la cédula. Probá con una foto más nítida o cargá los datos a mano.');
        }
        this.altaEscaneando.set(false);
        input.value = '';
      },
      error: () => {
        this.altaEscaneando.set(false);
        this.altaError.set('No se pudo escanear la cédula (¿backend dormido?). Podés cargar los datos a mano.');
        input.value = '';
      },
    });
  }

  /** Alta real del vehículo: POST /vehicles/ con los mismos datos del registro (patente, marca, modelo, año, chasis, motor). */
  guardarVehiculo(): void {
    const patente = this.altaPatente.trim().toUpperCase();
    const marca = this.altaMarca.trim();
    const modelo = this.altaModelo.trim();
    const anio = Number(this.altaAnio);
    if (!patente || !marca || !modelo || !anio || anio < 1900 || anio > 2100) {
      this.altaError.set('Completá patente, marca, modelo y un año válido.');
      return;
    }
    this.altaGuardando.set(true);
    this.altaError.set('');
    this.demoApi.altaVehiculo({
      ownerId: this.demoApi.idComprador,
      licensePlate: patente,
      brand: marca,
      model: modelo,
      year: anio,
      vin: this.altaVin.trim() || undefined,
      engineDetails: this.altaMotor.trim() || undefined,
    }).subscribe({
      next: () => {
        this.altaGuardando.set(false);
        this.altaOpen.set(false);
        this.altaPatente = ''; this.altaMarca = ''; this.altaModelo = '';
        this.altaAnio = ''; this.altaVin = ''; this.altaMotor = '';
        this.cargarGarajeReal();
        this.tab.set('garage');
        alert('¡Vehículo verificado, guardado en la base real e incorporado a Mi Garage!');
      },
      error: () => {
        this.altaGuardando.set(false);
        alert('No se pudo guardar en la base (¿el backend está corriendo en :10000?)');
      },
    });
  }

  /** ¿Es este auto del garage el que está activo en búsquedas? (badge del garage) */
  esActivo(a: { nombre: string; vin?: string }): boolean {
    const act = this.autoActivo();
    const nAct = (act?.nombre ?? '').toLowerCase();
    const nA = (a.nombre ?? '').toLowerCase();
    if (nAct && nA && (nAct === nA || nAct.includes(nA) || nA.includes(nAct))) return true;
    const vAct = (act?.vin ?? '').toUpperCase();
    const vA = (a.vin ?? '').toUpperCase();
    return !!vAct && !!vA && (vAct === vA || vAct.startsWith(vA) || vA.startsWith(vAct));
  }

  activarVehiculo(nombre: string, vin?: string, version?: string): void {
    this.activoSvc.set({ nombre, nombreLargo: nombre, resumen: version ?? 'Guardado en Mi Garage', vin: (vin ?? '').slice(0, 11) + '...' });
    alert('Filtro contextual activado para: ' + nombre + '. Las próximas búsquedas priorizarán sus piezas OEM.');
  }

  buscarPara(nombre: string, vin?: string, version?: string): void {
    this.activoSvc.set({ nombre, nombreLargo: nombre, resumen: version ?? 'Mi Garage', vin: (vin ?? '').slice(0, 11) + '...' });
    alert('Buscando repuestos para ' + nombre + ' — el buscador ya muestra este auto como activo.');
  }

  historial(car: string): void {
    alert('Historial técnico de repuestos para ' + car + ': Pastillas de freno OEM Bosch y Filtros oficiales.');
  }

  alert(msg: string): void { window.alert(msg); }

}
