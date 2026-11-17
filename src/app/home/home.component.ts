import { Component, computed, effect, HostListener, inject, signal, WritableSignal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { rolSesion as rolSesionGlobal, setRolSesion } from '../sesion';
import { PerfilPreventivoService } from '../perfil-preventivo.service';
import type { VehiculoActivo } from '../../application/services/vehiculo-activo.service';
import { modeloBase, VehiculoActivoService } from '../../application/services/vehiculo-activo.service';
import { VehiculoGarajeService } from '../../application/services/vehiculo-garaje.angular.service';
import { SearchQueryService } from '../../application/services/search-query.service';
import { CatalogoRepuestosService } from '../../application/services/catalogo-repuestos.angular.service';
import { SupabaseService, type RolSupabase } from '../../application/services/supabase.service';
import { DemoApiService, type MecanicoBackend, setUsuarioSesion, usuarioSesion } from '../../application/services/demo-api.service';

// Assets locales (public/img): las URLs externas originales (lh3.googleusercontent.com) devolvían 403.
const URL_PASSAT = '/img/veh-passat.jpg';
const URL_HILUX = '/img/veh-hilux.jpg';
const URL_RANGER = '/img/veh-ranger.jpg';
const URL_PASSAT_SEDAN = '/img/veh-passat.jpg';
const URL_BOMBA = '/img/rep-bomba.svg';
const URL_PASTILLAS_TRW = '/img/rep-pastillas.svg';
const URL_MUESTRA_PASTILLAS = '/img/muestra-pastillas.jpg';
export const IMAGENES_EJEMPLO = { URL_PASSAT, URL_HILUX, URL_RANGER, URL_PASSAT_SEDAN, URL_BOMBA, URL_PASTILLAS_TRW, URL_MUESTRA_PASTILLAS };

// ── Datos de la sesión COMPRADOR (Lucas R.) ──
// Pertenecen al usuario: solo se cargan con sesión de comprador activa y se
// vacían al cerrar sesión o cambiar de rol.
interface GarageAuto { garageId: string; corto: string; nombreLargo: string; resumen: string; vin: string; img: string; }
const GARAGE_COMPRADOR: GarageAuto[] = [
  { garageId: 'passat', corto: 'VW Passat', nombreLargo: 'Volkswagen Passat', resumen: '2006', vin: 'PD-514', img: URL_PASSAT },
  { garageId: 'vento', corto: 'VW Vento', nombreLargo: 'Volkswagen Vento', resumen: '2006', vin: 'VN-207', img: URL_PASSAT },
  { garageId: 'hilux', corto: 'Toyota Hilux', nombreLargo: 'Toyota Hilux', resumen: '2018', vin: 'HL-920', img: URL_HILUX },
  { garageId: 'ranger', corto: 'Ford Ranger', nombreLargo: 'Ford Ranger', resumen: '2015', vin: 'RG-340', img: URL_RANGER },
];

interface CarritoItem { id: number; refId: string | null; categoria: string; nombre: string; detalle: string; precio: string; comercio: string; cantidad: number; muestra: boolean; muestraSrc: string | null; img: string; chipCatalogo: string; chipClase: string; notaCatalogo: string; refCatalogo: string; hintMuestra: string; exitoMuestra: string; }
const CARRITO_COMPRADOR: CarritoItem[] = [
  { id: 1, refId: null, categoria: 'Motor & Refrigeración', nombre: 'Bomba de agua', detalle: 'Turbina reforzada · Polea dentada para Passat B6 2.0 TDI', precio: '$28.900', comercio: 'Centro', cantidad: 1, muestra: false, muestraSrc: null, img: URL_BOMBA, chipCatalogo: 'CATÁLOGO OEM', chipClase: 'amber', notaCatalogo: 'Turbina 19 dientes · Brida metálica', refCatalogo: 'Referencia exacta del sistema de refrigeración de tu Passat 2.0 TDI.', hintMuestra: 'Cuerpo, turbina o etiqueta', exitoMuestra: 'Muestra cargada' },
  { id: 2, refId: null, categoria: 'Sistema de Frenos', nombre: 'Pastillas de freno', detalle: 'Juego delantero · Con cable sensor de desgaste (Pinza Lucas / TRW)', precio: '$26.800', comercio: 'Fontana', cantidad: 1, muestra: true, muestraSrc: URL_MUESTRA_PASTILLAS, img: URL_PASTILLAS_TRW, chipCatalogo: 'CATÁLOGO BOSCH', chipClase: 'cyan', notaCatalogo: 'Con cable de contacto eléctrico', refCatalogo: 'Especificación de fábrica para sistema de frenos delantero TRW.', hintMuestra: 'Etiqueta o pestañas', exitoMuestra: 'Pestañas y cable coinciden' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected readonly garaje = this;
  marca = 'VOLKSWAGEN';
  modelo = 'PASSAT';
  version = '2.0 FSI';
  anio = 2006;
  vin = '';
  motorCodigo = '';
  combustible = 'Nafta';
  mensaje = signal('');
  dark = signal(false);
  busquedaRapida = '';
  mostrarRegistro = signal(false);
  verCarrito = signal(false);
  verModalFoto = signal(false);
  verToast = signal(true);
  // Testigo de notificaciones pendientes en el perfil (solo con sesión de comprador)
  notifPendientes = signal(0);
  drawerAbierto = signal(false);
  fotoPreview = signal<string | null>(null);
  piezaActiva = signal<string | null>(null);
  tabAuto = signal(0);
  private readonly catalogo = inject(CatalogoRepuestosService);
  private readonly api = inject(DemoApiService);
  resultados = this.catalogo.resultados;
  cargando = this.catalogo.cargando;
  seleccionadoId = signal<string | null>(null);

  // Autos de Mi Garage (tabs directos sobre el buscador) — vacíos sin sesión de comprador
  garageAutos = signal<GarageAuto[]>([]);

  // ══ ALTA DE VEHÍCULO (modal): mismos datos que el registro por Cédula Verde ══
  altaVehiculoOpen = signal(false);
  altaGuardando = signal(false);
  altaEscaneando = signal(false);
  altaError = signal('');
  altaPatente = '';
  altaMarca = '';
  altaModelo = '';
  altaAnio = '';
  altaVin = '';
  altaMotor = '';

  // Carrito / Lista de cotización — vacío sin sesión de comprador
  carrito = signal<CarritoItem[]>([]);

  quitarCarrito(id: number): void {
    this.carrito.update(list => list.filter(i => i.id !== id));
  }

  // ══ PASO 3: CARRITO & MUESTRAS (pantalla completa al tocar el Carrito del header) ══
  carritoPasoAbierto = signal(false);
  disparoExitoso = signal(false);

  ajustarCantidad(id: number, delta: number): void {
    this.carrito.update(list => list.map(i => i.id === id ? { ...i, cantidad: Math.max(1, Math.min(10, i.cantidad + delta)) } : i));
  }

  subirMuestra(id: number, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => this.carrito.update(list => list.map(i => i.id === id ? { ...i, muestraSrc: String(e.target?.result ?? ''), muestra: true } : i));
      reader.readAsDataURL(input.files[0]);
      input.value = '';
    }
  }

  quitarMuestra(id: number): void {
    this.carrito.update(list => list.map(i => i.id === id ? { ...i, muestraSrc: null, muestra: false } : i));
  }

  dispararLista(): void {
    this.disparoExitoso.set(true);
    setTimeout(() => {
      this.disparoExitoso.set(false);
      this.carritoPasoAbierto.set(false);
      // La lista ya está en los mostradores: el carrito queda vacío
      this.carrito.set([]);
    }, 1600);
  }

  // ══ ELECCIÓN DE MODO ANTES DEL BUSCADOR (dos caminos, Apple-style) ══
  // false: se muestran las dos opciones y el buscador queda oculto;
  // true: aparece el buscador spotlight ("Buscar yo").
  modoBusqueda = signal(false);

  elegirBuscarYo(): void {
    this.modoBusqueda.set(true);
    setTimeout(() => this.focoBuscador(), 60);
  }

  // ══ DELEGACIÓN DE LA LISTA A UN MECÁNICO HABILITADO ══
  // El comprador puede dejar que un mecánico de la red especifique los repuestos:
  // se crea una solicitud real (PENDING_MECHANIC) + token de acceso 48h con link.
  verMecanicos = signal(false);
  mecanicos = signal<MecanicoBackend[]>([]);
  mecanicosCargando = signal(false);
  delegando = signal(false);
  delegarError = signal('');
  delegacionHecha = signal<{ nombre: string; link: string; vence: string } | null>(null);

  abrirMecanicos(): void {
    this.verMecanicos.set(true);
    this.delegacionHecha.set(null);
    this.delegarError.set('');
    if (!this.mecanicos().length) {
      this.mecanicosCargando.set(true);
      this.api.mecanicos().subscribe({
        next: ms => { this.mecanicos.set(ms); this.mecanicosCargando.set(false); },
        error: () => { this.delegarError.set('No se pudo cargar la lista de mecánicos.'); this.mecanicosCargando.set(false); },
      });
    }
  }

  cerrarMecanicos(): void {
    this.verMecanicos.set(false);
    if (this.delegacionHecha()) {
      // Delegó con éxito: la lista ya viajó al mecánico, el carrito queda vacío
      this.carrito.set([]);
      this.delegacionHecha.set(null);
    }
  }

  delegarA(m: MecanicoBackend): void {
    if (this.delegando() || !this.carrito().length) return;
    if (!m.phone) { this.delegarError.set(m.full_name + ' no tiene teléfono cargado.'); return; }
    this.delegando.set(true);
    this.delegarError.set('');
    // La solicitud viaja con el vehículo real del garaje del comprador
    this.api.garaje(this.api.idComprador).subscribe({
      next: autos => {
        const vehiculo = autos[0];
        if (!vehiculo) {
          this.delegando.set(false);
          this.delegarError.set('No hay un vehículo registrado en tu garaje.');
          return;
        }
        // Si el comprador delega sin carrito, la ficha queda libre para que el mecánico marque las piezas
        const items = this.carrito().length
          ? this.carrito().map(i => ({
              partName: i.nombre,
              partNumber: this.oemDe(i),
              description: i.detalle,
              quantity: i.cantidad,
            }))
          : [{
              partName: 'A especificar por el mecánico',
              description: 'Ficha técnica libre: el mecánico define los repuestos necesarios para el vehículo.',
              quantity: 1,
            }];
        this.api.crearSolicitud({
          customerId: this.api.idComprador,
          vehicleId: vehiculo.id,
          isDelegated: true,
          urgencyLevel: 'STANDARD',
          items,
        }).subscribe({
          next: sol => {
            this.api.delegar({
              partsRequestId: sol.id,
              mechanicName: m.business_name || m.full_name,
              mechanicPhone: m.phone!,
            }).subscribe({
              next: d => {
                this.delegando.set(false);
                this.delegacionHecha.set({ nombre: m.business_name || m.full_name, link: d.accessUrl, vence: d.expiresAt });
              },
              error: () => { this.delegando.set(false); this.delegarError.set('No se pudo crear la delegación.'); },
            });
          },
          error: () => { this.delegando.set(false); this.delegarError.set('No se pudo crear la solicitud.'); },
        });
      },
      error: () => { this.delegando.set(false); this.delegarError.set('No se pudo cargar tu garaje.'); },
    });
  }

  private oemDe(i: CarritoItem): string | undefined {
    const m = /OEM\s+([^\s·]+)/.exec(i.detalle);
    return m ? m[1] : undefined;
  }

  // Identidad de la píldora de sesión: usuario real del registro si existe,
  // si no los nombres demo por rol (Lucas R., Rep. Centro, etc.)
  get inicialesPildora(): string {
    const s = usuarioSesion();
    if (s) {
      return s.nombre.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'LR';
    }
    switch (this.rolSesion()) {
      case 'repuestero': return 'RC';
      case 'admin': return 'AD';
      case 'repartidor': return 'RP';
      default: return 'LR';
    }
  }

  get nombrePildora(): string {
    const s = usuarioSesion();
    if (s) return s.nombre;
    switch (this.rolSesion()) {
      case 'repuestero': return 'Rep. Centro';
      case 'admin': return 'Admin';
      case 'repartidor': return 'Flota TB';
      default: return 'Lucas R.';
    }
  }

  autoCorto(): string {
    const largo = this.autoActivo().nombreLargo;
    if (/^tu auto$/i.test(largo)) return 'tu auto'; // sin garaje (o backend caído)
    if (largo.includes('Passat')) return 'Passat';
    if (largo.includes('Hilux')) return 'Hilux';
    if (largo.includes('Ranger')) return 'Ranger';
    const palabras = largo.split(' ').filter(Boolean);
    // El modelo sin la marca (ej. "RENAULT TWINGO ALIZE" → "TWINGO ALIZE")
    const modelo = palabras.slice(1).join(' ') || palabras[0] || '';
    if (!modelo || /no detectado/i.test(modelo)) return 'tu auto';
    // Legibilidad: separa letras y números pegados (COROLLAXLI1.8M/T → COROLLA XLI 1.8 M/T)
    const legible = modelo.replace(/(?<=[A-Za-z])(?=\d)|(?<=\d)(?=[A-Za-z])/g, ' ').trim();
    return legible.length > 20 ? legible.split(' ')[0] : legible;
  }

  elegirAuto(i: number): void {
    this.tabAuto.set(i);
    const a = this.garageAutos()[i];
    this.activoSvc.set({ nombre: a.corto, nombreLargo: a.nombreLargo, resumen: a.resumen, vin: a.vin, img: a.img });
  }

  // Auto del garage actualmente seleccionado (undefined si el garaje está vacío)
  autoGarageActivo(): GarageAuto | undefined {
    return this.garageAutos()[this.tabAuto()] ?? this.garageAutos()[0];
  }

  // Menú desplegable del garage: lista de todos los autos del comprador
  listaAutosAbierta = signal(false);

  alternarListaAutos(): void {
    this.listaAutosAbierta.update(v => !v);
  }

  elegirAutoDeLista(i: number): void {
    this.elegirAuto(i);
    this.listaAutosAbierta.set(false);
    // Si hay una búsqueda en curso, se refiltra por el auto recién elegido
    if (this.busquedaRapida.trim().length > 2) this.catalogo.buscar(this.busquedaRapida, this.datosAutoActivo());
  }

  cargarAuto(): void {
    // Cargar autos es acción del comprador: sin su sesión, abrimos el menú de inicio de sesión
    if (rolSesionGlobal() !== 'comprador') {
      this.alternarMenuSesion();
      return;
    }
    this.altaError.set('');
    this.altaVehiculoOpen.set(true);
  }

  // ══ ANILLO DE PERFIL PREVENTIVO (avatar del buscador) ══
  /** 4 bloques de 25%: cédula + km + último service + uso. */
  protected readonly perfil = inject(PerfilPreventivoService);

  /** El anillo sobre el avatar lleva al panel, donde se completa el cuestionario. */
  irAPerfilPreventivo(ev: Event): void {
    ev.stopPropagation();
    this.router.navigate(['/cliente']);
  }

  cerrarAltaVehiculo(): void {
    if (this.altaGuardando()) return;
    this.altaVehiculoOpen.set(false);
  }

  /** Foto de la Cédula Verde → OCR/vision del backend autocompleta el formulario
   *  (mismos campos que se piden en el registro). */
  onFotoCedulaAlta(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    this.altaEscaneando.set(true);
    this.altaError.set('');
    this.api.extraerCedula(files[0]).subscribe({
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
        this.altaError.set('No se pudo escanear la cédula (¿backend dormido? esperá un momento y reintentá). Podés cargar los datos a mano.');
        input.value = '';
      },
    });
  }

  /** Alta real del vehículo: POST /vehicles/ con la sesión del comprador. */
  guardarVehiculoAlta(): void {
    if (this.altaGuardando()) return;
    const ses = usuarioSesion();
    const patente = this.altaPatente.trim().toUpperCase();
    const marca = this.altaMarca.trim();
    const modelo = this.altaModelo.trim();
    const anio = Number(this.altaAnio);
    if (!ses) { this.alternarMenuSesion(); this.altaVehiculoOpen.set(false); return; }
    if (!patente || !marca || !modelo || !anio || anio < 1900 || anio > 2100) {
      this.altaError.set('Completá patente, marca, modelo y un año válido.');
      return;
    }
    this.altaGuardando.set(true);
    this.altaError.set('');
    this.api.altaVehiculo({
      ownerId: ses.id,
      licensePlate: patente,
      brand: marca,
      model: modelo,
      year: anio,
      vin: this.altaVin.trim() || undefined,
      engineDetails: this.altaMotor.trim() || undefined,
    }).subscribe({
      next: (v) => {
        const modeloLimpio = modeloBase(v.model);
        const nuevo: GarageAuto = {
          garageId: v.id,
          corto: `${v.brand} ${modeloLimpio}`.trim(),
          nombreLargo: `${v.brand} ${modeloLimpio}`.trim(),
          resumen: [v.year, v.engine_details?.split(' · ')[0]].filter(Boolean).join(' · '),
          vin: v.vin ?? 'SIN VIN',
          img: this.imgDeVehiculo(this.garageAutos().length),
        };
        this.garageAutos.update(list => [...list.filter(a => a.garageId !== 'cache'), nuevo]);
        this.elegirAuto(this.garageAutos().length - 1);
        this.altaGuardando.set(false);
        this.altaVehiculoOpen.set(false);
        this.altaPatente = ''; this.altaMarca = ''; this.altaModelo = '';
        this.altaAnio = ''; this.altaVin = ''; this.altaMotor = '';
      },
      error: (err) => {
        this.altaGuardando.set(false);
        const detalle = err?.error?.detail;
        this.altaError.set(typeof detalle === 'string' ? detalle : 'No se pudo guardar el vehículo. Reintentá en un momento.');
      },
    });
  }

  lineaAccionVisible = computed(() => this.busquedaRapida.trim().length > 1 || !!this.piezaActiva());

  limpiarBusqueda(ev: Event): void {
    ev.stopPropagation();
    this.busquedaRapida = '';
    this.piezaActiva.set(null);
    this.drawerAbierto.set(false);
  }

  focoBuscador(): void {
    // El panel de sugerencias solo aparece cuando hay algo buscado (>1 letra),
    // no con el buscador vacío.
    this.drawerAbierto.set(this.busquedaRapida.trim().length > 1);
    const el = document.getElementById('spotlightSearch') as HTMLInputElement | null;
    el?.focus();
  }

  onFoto(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result ?? '');
      this.fotoPreview.set(data);
      this.q.fotosCliente.update(list => [...list, data].slice(0, 4));
      if (!this.q.fotoCliente()) this.q.fotoCliente.set(data);
    };
    reader.readAsDataURL(files[0]);
  }

  pedirConFoto(): void {
    this.verModalFoto.set(false);
    const pieza = this.busquedaRapida.trim() || this.piezaActiva() || 'Pieza de repuesto';
    this.q.set(pieza, pieza);
    this.q.requestFlow();
  }

  pedirSinFoto(): void {
    this.q.fotosCliente.set([]);
    this.q.fotoCliente.set(null);
    this.pedirConFoto();
  }

  elegirResultado(p: { id: string; nombre: string; marca?: string; numeroOem?: string; imagen?: string }): void {
    this.seleccionadoId.set(p.id);
    this.busquedaRapida = p.nombre;
    // La pieza elegida en el buscador entra al carrito y lleva directo al Paso 3: Carrito & Muestras
    if (!this.carrito().some(i => i.refId === p.id)) {
      this.carrito.update(list => [...list, {
        id: Math.max(0, ...list.map(i => i.id)) + 1,
        refId: p.id as string | null,
        categoria: 'Repuesto',
        nombre: p.nombre,
        detalle: (p.marca ?? 'Línea original') + ' · OEM ' + (p.numeroOem ?? 's/d'),
        precio: 'A cotizar',
        comercio: 'Trelew',
        cantidad: 1,
        muestra: false,
        muestraSrc: null as string | null,
        img: p.imagen ?? URL_PASTILLAS_TRW,
        chipCatalogo: 'CATÁLOGO OEM',
        chipClase: 'amber',
        notaCatalogo: 'OEM ' + (p.numeroOem ?? 's/d'),
        refCatalogo: 'Referencia de catálogo para tu ' + this.autoActivo().nombreLargo + '.',
        hintMuestra: 'Etiqueta o cuerpo de la pieza',
        exitoMuestra: 'Muestra cargada',
      }]);
    }
    this.q.set(p.nombre, p.nombre);
    this.carritoPasoAbierto.set(true);
  }

  alEscribir(v: string): void {
    this.busquedaRapida = v;
    this.piezaActiva.set(null);
    this.drawerAbierto.set(v.trim().length > 1);
    if (v.trim().length > 2) { this.catalogo.buscar(v, this.datosAutoActivo()); this.q.set(v, ''); }
  }

  // Datos del auto activo para filtrar compatibilidad de repuestos
  datosAutoActivo(): { marca: string; modelo: string } {
    const partes = this.autoActivo().nombreLargo.split(' ');
    const marcas = ['Volkswagen', 'Toyota', 'Ford', 'Chevrolet', 'Fiat', 'Renault', 'Peugeot'];
    const marca = partes.find(p => marcas.includes(p));
    const modelo = partes.filter(p => p !== marca).join(' ');
    return { marca: marca ?? '', modelo };
  }

  onBlur(): void { if (this.busquedaRapida.trim().length <= 1) this.drawerAbierto.set(false); }

  tieneVehiculo = computed(() => !!this.svc?.vehiculo?.());
  autoActivo!: WritableSignal<VehiculoActivo>;
  constructor(
    private svc: VehiculoGarajeService,
    private readonly q: SearchQueryService,
    private readonly activoSvc: VehiculoActivoService,
    private readonly router: Router,
    private readonly supa: SupabaseService,
  ) {
    this.autoActivo = activoSvc.activo;
    // Sesión persistida: si se recargó la página con sesión de comprador, se restauran sus datos
    if (rolSesionGlobal() === 'comprador') this.cargarDatosComprador();
    const saved = localStorage.getItem('theme');
    this.dark.set(saved === 'dark' || (!saved && window.matchMedia?.('(prefers-color-scheme: dark)').matches));
    this.aplicar();
    // La solicitud de cotización (Paso 4) abre la vista de flujo por ruta
    effect(() => {
      if (this.q.openFlow()) {
        this.q.openFlow.set(false);
        this.router.navigate(['/cotizacion']);
      }
    });
    // Notificación de presupuestos: se muestra 5 segundos y desaparece sola
    setTimeout(() => this.verToast.set(false), 5000);
  }

  abrirPanelCliente(): void {
    // Al entrar al panel, las notificaciones quedan leídas: el testigo desaparece
    this.notifPendientes.set(0);
    this.router.navigate(['/cliente']);
  }

  // ── Menú de inicio de sesión por rol ──
  menuSesionAbierto = signal(false);
  rolSesion = rolSesionGlobal; // señal global: sobrevive la navegación (ver src/app/sesion.ts)

  rolesSesion = [
    { id: 'comprador' as const, nombre: 'Comprador de Repuestos', detalle: 'Lucas R. · Cliente particular · Trelew', desc: 'Presupuestos y compras de repuestos', inicial: 'LR', destino: '/cliente', color: 'text-amber-300', chip: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'repuestero' as const, nombre: 'Vendedor de repuestos', detalle: 'Repuestos Centro Trelew · San Martín 450', desc: 'Cotizaciones en 3 clicks y stock', inicial: 'RC', destino: '/mostrador', color: 'text-emerald-300', chip: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'repartidor' as const, nombre: 'Repartidor', detalle: 'Flota Toolbox · Cadete en 30 min', desc: 'Rutas, entregas y cobros en viaje', inicial: 'RP', destino: '/repartidor', color: 'text-cyan-300', chip: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { id: 'mecanico' as const, nombre: 'Mecánico / Taller', detalle: 'Taller Don Bosco · Rivadavia 890', desc: 'Fichas técnicas y listas de repuestos', inicial: 'TDB', destino: '/taller', color: 'text-lime-300', chip: 'bg-lime-500/20 text-lime-300 border-lime-500/30' },
    { id: 'admin' as const, nombre: 'Administrador', detalle: 'Consola global · Marketplace Toolbox', desc: 'Auditoría, altas manuales y métricas', inicial: 'AD', destino: '/admin', color: 'text-rose-300', chip: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  ];

  alternarMenuSesion(): void {
    this.menuSesionAbierto.update(v => !v);
  }

  cerrarMenuSesion(): void {
    this.menuSesionAbierto.set(false);
  }

  iniciarSesionComo(rol: 'comprador' | 'repuestero' | 'repartidor' | 'admin' | 'mecanico', destino: string): void {
    setRolSesion(rol);
    this.cerrarMenuSesion();
    if (rol === 'comprador') {
      // Los datos del garage/carrito/notificaciones pertenecen al comprador
      this.cargarDatosComprador();
    } else {
      this.vaciarDatosUsuario();
    }
    this.router.navigate([destino]);
  }

  cerrarSesion(): void {
    setRolSesion(null);
    this.supa.cerrarSesion().catch(() => {}); // cierra también la sesión real de Supabase
    this.vaciarDatosUsuario();
    this.svc.limpiar(); // vehículo registrado en Mi Garage (localStorage)
    this.cerrarMenuSesion();
    if (this.router.url !== '/') this.router.navigate(['/']);
  }

  // ── Login REAL con Supabase Auth (email + contraseña) ──
  loginEmail = '';
  loginPass = '';
  loginCargando = signal(false);
  loginError = signal('');

  /** Mapea el rol de la base (profiles) al rol de la app (el frontend usa otros nombres) */
  private rolDeBase(rol: RolSupabase): 'comprador' | 'repuestero' | 'repartidor' | 'admin' | 'mecanico' {
    switch (rol) {
      case 'vendor': return 'repuestero';
      case 'courier': return 'repartidor';
      case 'mechanic': return 'mecanico';
      case 'customer': return 'comprador';
      default: return rol;
    }
  }

  private destinoDeRol(rol: 'comprador' | 'repuestero' | 'repartidor' | 'admin' | 'mecanico'): string {
    return this.rolesSesion.find(r => r.id === rol)?.destino ?? '/';
  }

  async iniciarSesionReal(): Promise<void> {
    if (!this.loginEmail.trim() || !this.loginPass) return;
    this.loginCargando.set(true);
    this.loginError.set('');
    try {
      const ses = await this.supa.iniciarSesion(this.loginEmail.trim(), this.loginPass);
      const rolApp = this.rolDeBase(ses.rol);
      setRolSesion(rolApp);
      // Sesión real: identidad + auto activo del garaje del usuario
      setUsuarioSesion({ id: ses.id, email: ses.email, nombre: ses.nombre });
      this.activoSvc.sincronizarConGaraje(ses.id);
      if (rolApp === 'comprador') this.cargarDatosComprador();
      else this.vaciarDatosUsuario();
      this.cerrarMenuSesion();
      this.loginPass = '';
      this.router.navigate([this.destinoDeRol(rolApp)]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error de conexión';
      this.loginError.set(
        msg.includes('Invalid login credentials') ? 'Email o contraseña incorrectos.'
        : msg.includes('Email not confirmed') ? 'Confirmá tu email antes de entrar.'
        : 'No se pudo iniciar sesión. Intentá de nuevo.',
      );
    } finally {
      this.loginCargando.set(false);
    }
  }

  // ── Registro de comprador: modal en 2 pasos (cuenta + Cédula Verde) ──
  registroAbierto = signal(false);
  registroPaso = signal(1);
  cedulaEscaneada = signal(false);
  regNombre = '';
  regWhatsapp = '';
  regEmail = '';
  regPass = '';

  abrirRegistro(): void {
    this.cerrarMenuSesion();
    this.router.navigate(['/registro']); // registro Typeform dedicado (/registro)
  }

  cerrarRegistro(): void {
    this.registroAbierto.set(false);
    this.irPaso1();
  }

  irPaso1(): void {
    this.registroPaso.set(1);
  }

  irPaso2(): void {
    if (!this.regNombre.trim() || !this.regWhatsapp.trim()) {
      alert('Por favor completá tu nombre y WhatsApp para crear tu cuenta.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(this.regEmail.trim())) {
      alert('Ingresá un email válido: con él vas a entrar a tu cuenta.');
      return;
    }
    if (this.regPass.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    this.registroPaso.set(2);
  }

  escanearCedula(): void {
    // Simulación de lectura de Cédula Verde: extrae el Número de Chasis oficial
    this.cedulaEscaneada.set(true);
  }

  async confirmarRegistro(): Promise<void> {
    try {
      // Cuenta REAL en Supabase: el trigger handle_new_user crea el perfil
      // en public.users con rol 'comprador' (ver /supabase/01_schema.sql)
      const res = await this.supa.registrarComprador(this.regEmail.trim(), this.regPass, this.regNombre.trim());
      if (res.necesitaConfirmar) {
        alert('¡Cuenta creada! Revisá tu email para confirmarla antes de entrar.');
      }
      setRolSesion('comprador');
      this.cargarDatosComprador();
      this.cerrarRegistro();
      this.router.navigate(['/cliente']);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error de conexión';
      alert(
        msg.includes('already registered') ? 'Ese email ya está registrado. Iniciá sesión.'
        : msg.includes('Password') ? 'La contraseña debe tener al menos 6 caracteres.'
        : 'No se pudo crear la cuenta: ' + msg,
      );
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cerrarRegistro();
    this.cerrarMenuSesion();
  }

  private cargarDatosComprador(): void {
    // Con usuario real de sesión: carrito y notificaciones arrancan vacíos
    // (nada de datos mock); el garaje se trae del backend.
    const ses = usuarioSesion();
    if (ses) {
      this.carrito.set([]);
      this.notifPendientes.set(0);
      // Seed desde cache: el hero muestra el auto al instante, sin esperar al backend
      // (stale-while-revalidate: la respuesta de abajo reemplaza esto con datos frescos)
      const a = this.autoActivo();
      if (a.nombreLargo && !/^tu auto$/i.test(a.nombreLargo)) {
        this.garageAutos.set([{
          garageId: 'cache',
          corto: a.nombre,
          nombreLargo: a.nombreLargo,
          resumen: a.resumen,
          vin: a.vin,
          img: this.imgDeVehiculo(0),
        }]);
      }
      this.api.garaje(ses.id).subscribe({
        next: vehiculos => {
          this.garageAutos.set(vehiculos.map((v, i) => ({
            garageId: v.id,
            corto: `${v.brand} ${modeloBase(v.model)}`.trim(),
            nombreLargo: `${v.brand} ${modeloBase(v.model)}`.trim(),
            resumen: [v.year, v.engine_details?.split(' · ')[0]].filter(Boolean).join(' · '),
            vin: v.vin ?? 'SIN VIN',
            img: this.imgDeVehiculo(i),
          })));
          this.tabAuto.set(0);
          // Vehículo real = cédula verde ya cargada → 25% del perfil preventivo
          this.perfil.setBaseCedula(vehiculos.length > 0);
        },
        error: () => {
          // Backend caído: si el seed del cache ya pobló el garaje, se conserva
          // (mejor un auto cacheado que una pantalla vacía)
          if (!this.garageAutos().length) this.garageAutos.set([]);
        },
      });
      return;
    }
    // Sesión demo por rol: datos mock de Lucas R.
    this.garageAutos.set(GARAGE_COMPRADOR.map(a => ({ ...a })));
    // La cédula/garaje demo también arranca con el bloque 1 completado
    this.perfil.setBaseCedula(true);
    this.carrito.set(CARRITO_COMPRADOR.map(i => ({ ...i })));
    this.notifPendientes.set(2);
  }

  /** Imagen por vehículo del garaje (rotando entre las disponibles) */
  private imgDeVehiculo(i: number): string {
    const urls = [URL_PASSAT, URL_RANGER];
    return urls[i % urls.length];
  }

  private vaciarDatosUsuario(): void {
    this.garageAutos.set([]);
    this.carrito.set([]);
    this.notifPendientes.set(0);
  }

  elegirTag(tag: string): void {
    this.busquedaRapida = tag;
    this.q.set(tag, tag);
  }
  irBuscar(): void {
    const pieza = this.busquedaRapida.trim() || this.piezaActiva() || '';
    if (!pieza) return;
    this.q.set(pieza, pieza);
    // Los resultados abren en una página limpia dedicada
    this.router.navigate(['/buscar'], { queryParams: { q: pieza } });
  }

  toggleDark(): void {
    this.dark.update(v => !v);
    this.aplicar();
  }

  private aplicar(): void {
    document.documentElement.classList.toggle('dark', this.dark());
    // Sincroniza color-scheme: el navegador ajusta scrollbars, form controls
    // y colores nativos (canvas, inputs) al modo activo.
    document.documentElement.style.colorScheme = this.dark() ? 'dark' : 'light';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'color-scheme';
      document.head.appendChild(meta);
    }
    meta.content = this.dark() ? 'dark' : 'light';
    localStorage.setItem('theme', this.dark() ? 'dark' : 'light');
  }

  registrar(): void {
    try {
      this.svc.registrar({
        marca: this.marca.toUpperCase(),
        modelo: this.modelo.toUpperCase(),
        version: this.version.toUpperCase(),
        anio: this.anio,
        vin: this.vin.replace(/[^A-Z0-9]/gi, '').toUpperCase(),
        motorCodigo: this.motorCodigo.toUpperCase(),
        combustible: this.combustible,
      });
      this.mensaje.set('Passat 2006 registrado una vez. Ya no te pedimos datos.');
    } catch (e) {
      this.mensaje.set(e instanceof Error ? e.message : 'Error');
    }
  }
}
