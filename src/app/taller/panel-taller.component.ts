import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// ── Modelos del panel (datos demo del taller; el cableado al backend viene después) ──

interface PiezaElegida {
  id: string;
  nombre: string;
  sub: string;
  img: string | null;
  fotoMuestra: string | null;
}

interface AutoTaller {
  id: string;
  patente: string;
  titulo: string;
  duenio: string;
  ubicacion: string;
  estado: string;
  estadoClase: string;
  motor: string;
  img: string | null;
  piezas: PiezaElegida[];
}

interface PiezaCatalogo {
  id: string;
  nombre: string;
  sub: string;
  img: string | null;
}

// Catálogo por modelo (demo del ejemplo; el buscador real ya vive en el home)
const CATALOGO: Record<string, PiezaCatalogo[]> = {
  passat: [
    { id: 'bomba', nombre: 'Bomba de agua c/ turbina metálica', sub: 'Dolz / SKF · OEM 03L 121 011 P', img: '/img/rep-bomba.svg' },
    { id: 'distribucion', nombre: 'Kit Distribución (Correa + Tensores)', sub: 'Gates / Continental · OEM 03L 198 119 F', img: null },
    { id: 'pastillas', nombre: 'Juego de Pastillas Delanteras c/ sensor', sub: 'Bosch / TRW · Sistema Lucas', img: '/img/rep-pastillas.jpg' },
    { id: 'shocks', nombre: 'Amortiguadores delanteros a gas 55mm', sub: 'Sachs / Corven Plus', img: null },
    { id: 'filtros', nombre: 'Pack Filtros Aceite + Gasoil', sub: 'Mann Filter / Mahle BKP', img: '/img/rep-filtro.jpg' },
    { id: 'clutch', nombre: 'Kit Embrague c/ Crapodina Hidráulica', sub: 'LuK 240mm bimasa compatible', img: null },
  ],
  hilux: [
    { id: 'filtros', nombre: 'Pack Filtros 2.8 D4D (Aire + Gasoil + Aceite)', sub: 'Toyota Genuine Parts / Mann', img: '/img/rep-filtro.jpg' },
    { id: 'pastillas', nombre: 'Pastillas de freno delanteras Heavy Duty', sub: 'Fras-le / Bendix para 4x4', img: '/img/rep-pastillas.jpg' },
    { id: 'shocks', nombre: 'Amortiguadores reforzados delanteros', sub: 'Rancho / Monroe OESpectrum', img: null },
    { id: 'clutch', nombre: 'Kit embrague para Hilux 2.8 1GD', sub: 'Aisin Japón / Valeo', img: null },
  ],
  ranger: [
    { id: 'distribucion', nombre: 'Cadena de distribución Kit 3.2 TDCi', sub: 'Ford OEM / Iwis', img: null },
    { id: 'bomba', nombre: 'Bomba de agua reforzada Ranger 3.2', sub: 'Dolz / Motorcraft', img: '/img/rep-bomba.svg' },
    { id: 'filtros', nombre: 'Kit 4 filtros para Puma 3.2', sub: 'Motorcraft original', img: '/img/rep-filtro.jpg' },
  ],
};

const CATALOGO_BASE: PiezaCatalogo[] = [
  { id: 'filtros', nombre: 'Pack Filtros de Mantenimiento', sub: 'Mann / Wega original', img: '/img/rep-filtro.jpg' },
  { id: 'pastillas', nombre: 'Pastillas de freno delanteras', sub: 'Bosch / TRW', img: '/img/rep-pastillas.jpg' },
  { id: 'shocks', nombre: 'Amortiguadores delanteros', sub: 'Sachs / Corven', img: null },
  { id: 'bomba', nombre: 'Bomba de agua', sub: 'Dolz / SKF', img: '/img/rep-bomba.svg' },
];

const AUTOS_DEMO: AutoTaller[] = [
  { id: 'passat', patente: 'AB 412 TX', titulo: 'VW Passat 2.0 TDI', duenio: 'Martín Galván', ubicacion: 'Box 1', estado: 'Armando lista', estadoClase: 'bg-amber-400/20 text-amber-300', motor: 'Motor BKP 140 CV', img: '/img/veh-passat.jpg', piezas: [] },
  { id: 'hilux', patente: 'AD 789 LK', titulo: 'Toyota Hilux 2.8 D4D', duenio: 'Lucas R.', ubicacion: 'Box 2', estado: 'Lista enviada', estadoClase: 'bg-emerald-500/20 text-emerald-300', motor: 'Motor 1GD-FTV 177 CV', img: '/img/veh-hilux.jpg', piezas: [] },
  { id: 'ranger', patente: 'PM 552 ZK', titulo: 'Ford Ranger 3.2 TDCi', duenio: 'Transportes Chubut', ubicacion: 'Box 3', estado: 'Pendiente', estadoClase: 'bg-amber-400/20 text-amber-300', motor: 'Motor Puma 3.2 200 CV', img: '/img/veh-ranger.jpg', piezas: [] },
  { id: 'cruze', patente: 'AE 992 CD', titulo: 'Chevrolet Cruze 1.4 Turbo', duenio: 'Santiago M.', ubicacion: 'Elevador 1', estado: 'En espera', estadoClase: 'bg-blue-500/20 text-blue-300', motor: 'Motor Ecotec 153 CV', img: null, piezas: [] },
  { id: 'kangoo', patente: 'AF 114 PK', titulo: 'Renault Kangoo 1.5 dCi', duenio: 'Ferretería del Valle', ubicacion: 'Box 4', estado: 'Moto en ruta', estadoClase: 'bg-emerald-500/20 text-emerald-300', motor: 'Motor K9K Turbodiésel', img: null, piezas: [] },
];

@Component({
  selector: 'app-panel-taller',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './panel-taller.component.html',
  styleUrl: './panel-taller.component.css',
})
export class PanelTallerComponent {

  private readonly router = inject(Router);

  // ── Estado del taller ──
  autos = signal<AutoTaller[]>(AUTOS_DEMO.map(a => ({ ...a, piezas: a.piezas.map(p => ({ ...p })) })));
  autoId = signal<string | null>(null); // sin auto pre-seleccionado: el mecánico elige
  busquedaAuto = signal('');
  fotoGeneral = signal<string | null>(null);

  // ── Flujo Typeform: una pantalla por vez (1 Auto → 2 Repuestos → 3 Cotizar) ──
  paso = signal<1 | 2 | 3>(1);

  // ── Modal de búsqueda de piezas (flujo typeform interno) ──
  modalAbierto = signal(false);
  queryPieza = signal('');
  confirmacion = signal<{ pieza: PiezaCatalogo; foto: string | null } | null>(null);

  // ── Confirmación final: pedido recibido por las repuesteras ──
  pedidoEnviado = signal(false);

  toast = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Computados ──
  autoActivo = computed<AutoTaller | null>(() => {
    const id = this.autoId();
    return id ? (this.autos().find(a => a.id === id) ?? null) : null;
  });

  autosFiltrados = computed(() => {
    const q = this.busquedaAuto().toLowerCase().trim();
    if (!q) return this.autos();
    return this.autos().filter(a => (a.patente + ' ' + a.titulo + ' ' + a.duenio).toLowerCase().includes(q));
  });

  resultados = computed(() => {
    const act = this.autoActivo();
    const base = act ? (CATALOGO[act.id] ?? CATALOGO_BASE) : CATALOGO_BASE;
    const q = this.queryPieza().toLowerCase().trim();
    if (!q) return base;
    return base.filter(p => (p.nombre + ' ' + p.sub).toLowerCase().includes(q));
  });

  /** Progreso Typeform: una pantalla por vez. 1 Auto (0%) → 2 Repuestos (33/66%) → 3 Cotizar (100%) */
  progreso = computed(() => {
    const p = this.paso();
    const act = this.autoActivo();
    const n = act ? act.piezas.length : 0;
    if (p === 1 || !act) {
      return {
        paso: 1,
        etiqueta: 'Paso 1 de 3: Elegí el vehículo del box',
        badge: '0% completado',
        badgeClase: 'bg-white/10 text-stone-300',
        hint: this.autos().length + ' vehículos en taller. Tocá un auto para abrir su consola de repuestos.',
        pct: 0,
        pasos: [true, false, false] as boolean[],
      };
    }
    if (p === 2) {
      return {
        paso: 2,
        etiqueta: 'Paso 2 de 3: Buscar repuestos compatibles',
        badge: n > 0 ? '66% completado' : '33% completado',
        badgeClase: n > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-400/20 text-amber-300',
        hint: n === 0
          ? act.patente + ' seleccionado. Tocá "Abrir Buscador" para sumar la primera pieza.'
          : n + ' repuesto' + (n !== 1 ? 's' : '') + ' listo' + (n !== 1 ? 's' : '') + '. Continuá cuando quieras a la cotización.',
        pct: n > 0 ? 66 : 33,
        pasos: [false, true, false] as boolean[],
      };
    }
    return {
      paso: 3,
      etiqueta: 'Paso 3 de 3: Listo para cotizar',
      badge: '100% completado',
      badgeClase: 'bg-emerald-500/20 text-emerald-300',
      hint: n + ' repuesto' + (n !== 1 ? 's' : '') + ' para ' + act.patente + '. Asociá foto general (opcional) y dispará la cotización.',
      pct: 100,
      pasos: [false, false, true] as boolean[],
    };
  });

  totalPiezas = computed(() => this.autos().reduce((acc, a) => acc + a.piezas.length, 0));
  listasPorCotizar = computed(() => this.autos().filter(a => a.piezas.length > 0).length);

  // ── Acciones ──
  volver(): void { this.router.navigate(['/']); }

  /** Navegación del flujo Typeform: solo una pantalla visible por vez */
  irAPaso(n: 1 | 2 | 3): void {
    this.pedidoEnviado.set(false);
    this.paso.set(n);
  }

  /** Volver al punto de partida para armar otra lista */
  nuevaLista(): void {
    this.pedidoEnviado.set(false);
    this.fotoGeneral.set(null);
    this.autoId.set(null); // sin selección: el mecánico vuelve a elegir
    this.paso.set(1);
  }

  elegirAuto(id: string): void {
    this.autoId.set(id);
    this.fotoGeneral.set(null);
    this.pedidoEnviado.set(false);
    this.paso.set(2); // al tocar un auto, aparece la siguiente pantalla (Repuestos)
  }

  nuevoAuto(): void {
    // Flujo de agenda con permiso del cliente (reemplaza el prompt crudo)
    this.abrirAgenda();
  }

  // ── Agenda de nuevo vehículo: permiso vía notificación al cliente ──
  agendaAbierto = signal(false);
  agPatente = signal('');
  agDuenio = signal('');
  agModelo = signal('');
  agUbicacion = signal('Box libre');
  agError = signal('');
  readonly boxes = ['Box 1', 'Box 2', 'Box 3', 'Box 4', 'Elevador 1', 'Box libre'];

  abrirAgenda(): void {
    this.agPatente.set('');
    this.agDuenio.set('');
    this.agModelo.set('');
    this.agUbicacion.set('Box libre');
    this.agError.set('');
    this.agendaAbierto.set(true);
  }

  cerrarAgenda(): void {
    this.agendaAbierto.set(false);
  }

  /** Carga patente + dueño y le envía al cliente la notificación para aceptar el permiso.
   *  El auto queda 'Pendiente de permiso' hasta que el cliente acepta desde su teléfono. */
  pedirPermiso(): void {
    const patente = this.agPatente().trim().toUpperCase();
    const duenio = this.agDuenio().trim();
    const modelo = this.agModelo().trim();
    if (!patente) { this.agError.set('Ingresá la patente del vehículo.'); return; }
    if (duenio.length < 3) { this.agError.set('Ingresá el nombre del dueño del vehículo.'); return; }
    if (this.autos().some(a => a.patente === patente)) { this.agError.set('Ese auto ya está en la agenda del taller.'); return; }
    const id = 'auto-' + Date.now();
    this.autos.update(list => [...list, {
      id, patente, titulo: modelo || patente, duenio,
      ubicacion: this.agUbicacion(),
      estado: 'Pendiente de permiso', estadoClase: 'bg-cyan-500/20 text-cyan-300',
      motor: modelo, img: null, piezas: [],
    }]);
    this.agendaAbierto.set(false);
    this.mostrarToast('Pedido de permiso enviado a ' + duenio + '. Cuando acepte desde su teléfono, se habilita la lista.');
  }

  /** El cliente aceptó la notificación en su teléfono → se habilita el armado de la lista */
  registrarAcepto(): void {
    const act = this.autoActivo();
    if (!act || act.estado !== 'Pendiente de permiso') return;
    this.autos.update(list => list.map(a =>
      a.id === act.id ? { ...a, estado: 'Recién ingresado', estadoClase: 'bg-blue-500/20 text-blue-300' } : a
    ));
    this.mostrarToast('Permiso aceptado por ' + act.duenio + '. Ya podés armarle la lista de repuestos.');
  }

  /** Clase de la fila según estado: activa (ámbar), enviada (esmeralda), pendiente de permiso (cian) o neutra */
  claseFila(a: AutoTaller): string {
    if (a.id === this.autoId()) return 'car-row-active bg-white/[0.04] border border-amber-400';
    if (a.estado === 'Lista enviada') return 'bg-emerald-500/[0.07] border border-emerald-400/50 hover:border-emerald-400/80';
    if (a.estado === 'Pendiente de permiso') return 'bg-cyan-500/[0.05] border border-cyan-400/40 hover:border-cyan-400/80';
    return 'bg-white/[0.03] border border-white/10 hover:border-white/30';
  }

  abrirModal(): void {
    this.confirmacion.set(null);
    this.queryPieza.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.confirmacion.set(null);
  }

  elegirPieza(p: PiezaCatalogo): void {
    this.confirmacion.set({ pieza: p, foto: null });
  }

  cancelarConfirmacion(): void {
    this.confirmacion.set(null);
  }

  onFotoMuestra(ev: Event): void {
    this.leerImagen(ev, data => this.confirmacion.update(c => c ? { ...c, foto: data } : c));
  }

  onFotoGeneral(ev: Event): void {
    this.leerImagen(ev, data => this.fotoGeneral.set(data));
  }

  quitarFotoGeneral(ev: Event): void {
    ev.stopPropagation();
    this.fotoGeneral.set(null);
  }

  confirmarPieza(): void {
    const c = this.confirmacion();
    const act = this.autoActivo();
    if (!c || !act) return;
    this.autos.update(list => list.map(a => a.id === act.id ? {
      ...a,
      piezas: [...a.piezas.filter(p => p.id !== c.pieza.id), {
        id: c.pieza.id, nombre: c.pieza.nombre, sub: c.pieza.sub, img: c.pieza.img, fotoMuestra: c.foto,
      }],
    } : a));
    this.cerrarModal();
    this.mostrarToast(c.pieza.nombre + ' confirmada para ' + act.patente + '.');
  }

  quitarPieza(id: string): void {
    const act = this.autoActivo();
    if (!act) return;
    this.autos.update(list => list.map(a => a.id === act.id ? { ...a, piezas: a.piezas.filter(p => p.id !== id) } : a));
  }

  enviarLista(): void {
    const act = this.autoActivo();
    if (!act) return;
    if (!act.piezas.length) {
      this.mostrarToast('Agregá al menos 1 repuesto antes de disparar la cotización.');
      return;
    }
    this.autos.update(list => list.map(a => a.id === act.id ? { ...a, estado: 'Lista enviada', estadoClase: 'bg-emerald-500/20 text-emerald-300' } : a));
    this.pedidoEnviado.set(true); // aparece el cartel de "Pedido enviado a mostradores"
  }

  private mostrarToast(msg: string): void {
    this.toast.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }

  private leerImagen(ev: Event, cb: (data: string) => void): void {
    const input = ev.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => cb(String(e.target?.result ?? ''));
    reader.readAsDataURL(input.files[0]);
    input.value = '';
  }
}
