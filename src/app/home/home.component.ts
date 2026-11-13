import { Component, computed, effect, HostListener, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { rolSesion as rolSesionGlobal, setRolSesion } from '../sesion';
import type { VehiculoActivo } from '../../application/services/vehiculo-activo.service';
import { VehiculoActivoService } from '../../application/services/vehiculo-activo.service';
import { VehiculoGarajeService } from '../../application/services/vehiculo-garaje.angular.service';
import { SearchQueryService } from '../../application/services/search-query.service';
import { CatalogoRepuestosService } from '../../application/services/catalogo-repuestos.angular.service';

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
  imports: [FormsModule, RouterLink],
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
  resultados = this.catalogo.resultados;
  cargando = this.catalogo.cargando;
  seleccionadoId = signal<string | null>(null);

  // Autos de Mi Garage (tabs directos sobre el buscador) — vacíos sin sesión de comprador
  garageAutos = signal<GarageAuto[]>([]);

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

  autoCorto(): string {
    const largo = this.autoActivo().nombreLargo;
    if (largo.includes('Passat')) return 'Passat';
    if (largo.includes('Hilux')) return 'Hilux';
    if (largo.includes('Ranger')) return 'Ranger';
    return largo.split(' ').slice(-1)[0] || 'Passat';
  }

  elegirAuto(i: number): void {
    this.tabAuto.set(i);
    const a = this.garageAutos()[i];
    this.activoSvc.set({ nombre: a.corto, nombreLargo: a.nombreLargo, resumen: a.resumen, vin: a.vin, img: a.img });
  }

  // Auto del garage actualmente seleccionado (con imagen garantizada)
  autoGarageActivo() {
    return this.garageAutos()[this.tabAuto()] || this.garageAutos()[0];
  }

  // Menú desplegable del garage: lista de todos los autos del comprador
  listaAutosAbierta = signal(false);

  alternarListaAutos(): void {
    this.listaAutosAbierta.update(v => !v);
  }

  elegirAutoDeLista(i: number): void {
    this.elegirAuto(i);
    this.listaAutosAbierta.set(false);
  }

  cargarAuto(): void {
    // Cargar autos es acción del comprador: sin su sesión, abrimos el menú de inicio de sesión
    if (rolSesionGlobal() !== 'comprador') {
      this.alternarMenuSesion();
      return;
    }
    const val = prompt('Ingresá patente o modelo (ej. AE 345 BB):');
    if (val && val.trim()) {
      const codigo = val.trim().toUpperCase();
      this.garageAutos.update(list => [...list, {
        garageId: 'auto-' + Date.now(),
        corto: codigo,
        nombreLargo: codigo,
        resumen: 'Recién cargado',
        vin: 'VIN-' + codigo.replace(/[^A-Z0-9]/g, '').slice(0, 6),
        img: URL_RANGER,
      }]);
      this.elegirAuto(this.garageAutos().length - 1);
    }
  }

  lineaAccionVisible = computed(() => this.busquedaRapida.trim().length > 1 || !!this.piezaActiva());

  limpiarBusqueda(ev: Event): void {
    ev.stopPropagation();
    this.busquedaRapida = '';
    this.piezaActiva.set(null);
    this.drawerAbierto.set(false);
  }

  focoBuscador(): void {
    this.drawerAbierto.set(true);
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
    if (v.trim().length > 2) { this.catalogo.buscar(v); this.q.set(v, ''); }
  }

  onBlur(): void { if (this.busquedaRapida.trim().length <= 1) this.drawerAbierto.set(false); }

  tieneVehiculo = computed(() => !!this.svc?.vehiculo?.());
  autoActivo!: WritableSignal<VehiculoActivo>;
  constructor(
    private svc: VehiculoGarajeService,
    private readonly q: SearchQueryService,
    private readonly activoSvc: VehiculoActivoService,
    private readonly router: Router,
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
    { id: 'comprador' as const, nombre: 'Comprador de Repuestos', detalle: 'Lucas R. · Taller Don Bosco · Trelew', desc: 'Presupuestos y compras de repuestos', inicial: 'LR', destino: '/cliente', color: 'text-amber-300', chip: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'repuestero' as const, nombre: 'Vendedor de repuestos', detalle: 'Repuestos Centro Trelew · San Martín 450', desc: 'Cotizaciones en 3 clicks y stock', inicial: 'RC', destino: '/mostrador', color: 'text-emerald-300', chip: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'repartidor' as const, nombre: 'Repartidor', detalle: 'Flota Toolbox · Cadete en 30 min', desc: 'Rutas, entregas y cobros en viaje', inicial: 'RP', destino: '/repartidor', color: 'text-cyan-300', chip: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { id: 'admin' as const, nombre: 'Administrador', detalle: 'Consola global · Marketplace Toolbox', desc: 'Auditoría, altas manuales y métricas', inicial: 'AD', destino: '/admin', color: 'text-rose-300', chip: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  ];

  alternarMenuSesion(): void {
    this.menuSesionAbierto.update(v => !v);
  }

  cerrarMenuSesion(): void {
    this.menuSesionAbierto.set(false);
  }

  iniciarSesionComo(rol: 'comprador' | 'repuestero' | 'repartidor' | 'admin', destino: string): void {
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
    this.vaciarDatosUsuario();
    this.svc.limpiar(); // vehículo registrado en Mi Garage (localStorage)
    this.cerrarMenuSesion();
    if (this.router.url !== '/') this.router.navigate(['/']);
  }

  // ── Registro de comprador: modal en 2 pasos (cuenta + Cédula Verde) ──
  registroAbierto = signal(false);
  registroPaso = signal(1);
  cedulaEscaneada = signal(false);
  regNombre = '';
  regWhatsapp = '';
  regPass = '';

  abrirRegistro(): void {
    this.cerrarMenuSesion();
    this.irPaso1();
    this.registroAbierto.set(true);
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
    this.registroPaso.set(2);
  }

  escanearCedula(): void {
    // Simulación de lectura de Cédula Verde: extrae el Número de Chasis oficial
    this.cedulaEscaneada.set(true);
  }

  confirmarRegistro(): void {
    setRolSesion('comprador');
    this.cargarDatosComprador();
    this.cerrarRegistro();
    this.router.navigate(['/cliente']);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cerrarRegistro();
    this.cerrarMenuSesion();
  }

  private cargarDatosComprador(): void {
    this.garageAutos.set(GARAGE_COMPRADOR.map(a => ({ ...a })));
    this.carrito.set(CARRITO_COMPRADOR.map(i => ({ ...i })));
    this.notifPendientes.set(2);
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
    const pieza = this.busquedaRapida.trim() || this.piezaActiva() || 'Pastillas de freno delanteras';
    this.q.set(pieza, pieza);
    this.q.requestFlow();
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
