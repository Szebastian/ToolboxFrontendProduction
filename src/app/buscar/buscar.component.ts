import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CatalogoRepuestosService } from '../../application/services/catalogo-repuestos.angular.service';
import { DemoApiService, usuarioSesion, VehiculoDecodificado } from '../../application/services/demo-api.service';
import { modeloBase, VehiculoActivoService } from '../../application/services/vehiculo-activo.service';

// Autos del garage demo (mismos que el home): para re-filtrar los resultados
const AUTOS = [
  { corto: 'VW Passat', nombreLargo: 'Volkswagen Passat', resumen: '2006' },
  { corto: 'VW Vento', nombreLargo: 'Volkswagen Vento', resumen: '2006' },
  { corto: 'Toyota Hilux', nombreLargo: 'Toyota Hilux', resumen: '2018' },
  { corto: 'Ford Ranger', nombreLargo: 'Ford Ranger', resumen: '2015' },
];

function datosVehiculo(nombreLargo: string): { marca: string; modelo: string } {
  const partes = nombreLargo.split(' ');
  const marcas = ['Volkswagen', 'Toyota', 'Ford', 'Chevrolet', 'Fiat', 'Renault', 'Peugeot'];
  const marca = partes.find(p => marcas.includes(p));
  const modelo = partes.filter(p => p !== marca).join(' ');
  return { marca: marca ?? '', modelo };
}

// Página limpia de resultados: buscás y los repuestos compatibles con el auto
// registrado aparecen acá, en cards con todo el detalle técnico (código PR,
// motor, medida, cáliper), lejos del ruido de la pantalla de inicio.
@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    :host{display:block;min-height:100vh;min-height:100svh;background:radial-gradient(120% 90% at 50% -10%, #2A231D 0%, #17130F 50%, #0B0908 100%);font-family:'Plus Jakarta Sans',sans-serif;color:#fff}
    .shell{max-width:none;margin:0 auto;padding:0}
    .btn-volver{position:fixed;top:14px;left:14px;z-index:50;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;padding:8px 16px;border-radius:999px;background:rgba(14,15,18,.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#F3F4F6;border:1px solid rgba(255,255,255,.14);font-weight:600;font-size:12px;font-family:'JetBrains Mono',monospace;cursor:pointer;transition:all .2s ease;text-decoration:none}
    .btn-volver:hover{background:rgba(14,15,18,.95)}
    .console{margin:0;background:transparent;border:0;border-radius:0;box-shadow:none;color:#fff;padding:76px clamp(16px,4vw,72px) 80px}
    .search-row{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);border-radius:18px;padding:12px 16px}
    .search-row input{flex:1;background:transparent;border:0;outline:0;color:#fff;font-size:15px;font-weight:500;min-width:0;min-height:44px}
    .search-row input::placeholder{color:#78716C}
    .btn-buscar{min-height:44px;padding:9px 18px;border-radius:14px;background:#FBBF24;color:#1C1917;font-weight:800;font-size:12px;cursor:pointer;border:0;transition:all .2s ease}
    .btn-buscar:hover{background:#FCD34D}
    .filtros{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:14px}
    .chip-auto{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;border-radius:999px;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.4);color:#FBBF24;font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;letter-spacing:.06em}
    .chip-auto select{background:transparent;border:0;color:#FBBF24;font:inherit;cursor:pointer;outline:0;min-height:44px}
    .chip-auto option{background:#1C1917;color:#FDE68A}
    .encabezado{margin-top:20px}
    .titulo{font-size:22px;font-weight:800;letter-spacing:-.01em}
    .titulo q{color:#FCD34D}
    .sub{margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#A8A29E;letter-spacing:.05em}
    .ml-link{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;margin-top:12px;padding:10px 16px;border-radius:14px;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.4);color:#FCD34D;font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:700;text-decoration:none;letter-spacing:.04em;transition:all .2s ease}
    .ml-link:hover{background:rgba(251,191,36,.2);border-color:rgba(251,191,36,.65)}
    .grid{margin-top:20px;display:flex;flex-direction:column;gap:12px}
    .fila{display:flex;align-items:stretch;gap:18px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:16px 20px;transition:all .22s cubic-bezier(.16,1,.3,1)}
    .fila:hover{border-color:rgba(251,191,36,.5);background:rgba(255,255,255,.07);transform:translateX(3px)}
    .fila img{width:150px;height:104px;object-fit:cover;border-radius:14px;background:#292524;flex-shrink:0;align-self:center}
    .fila-info{min-width:0;display:flex;flex-direction:column;gap:8px;justify-content:center}
    .fila .nombre{font-size:16px;font-weight:700;line-height:1.3;letter-spacing:-.01em}
    .chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
    .chip{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;color:#D6D3D1;letter-spacing:.04em}
    .chip-marca{background:rgba(251,191,36,.12);border-color:rgba(251,191,36,.35);color:#FCD34D}
    .chip-stock{background:rgba(103,232,249,.09);border-color:rgba(103,232,249,.3);color:#7DD3FC}
    .fila .tecnico{font-size:12px;color:#9C968E;line-height:1.45}
    .head{display:flex;align-items:flex-start;gap:10px;justify-content:space-between}
    .source{display:inline-flex;align-items:center;gap:5px;flex-shrink:0;padding:3px 9px;border-radius:999px;font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border:1px solid transparent}
    .source svg{width:11px;height:11px}
    .source-toolbox{background:rgba(251,191,36,.14);color:#FCD34D;border-color:rgba(251,191,36,.35)}
    .source-oem{background:rgba(255,255,255,.05);color:#A8A29E;border-color:rgba(255,255,255,.14)}
    .precio{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:#FCD34D;margin-top:2px}
    .compat{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
    .compat .etiqueta{font-family:'JetBrains Mono',monospace;font-size:10px;color:#78716C;letter-spacing:.1em;text-transform:uppercase}
    .pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;background:rgba(103,232,249,.09);border:1px solid rgba(103,232,249,.3);color:#7DD3FC;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.04em}
    .vacio{margin-top:26px;padding:22px;border:1px dashed rgba(255,255,255,.2);border-radius:18px;text-align:center;color:#D6D3D1;font-size:13px;line-height:1.5}
    .cta{display:inline-block;margin-top:12px;padding:10px 18px;border-radius:14px;background:#67E8F9;color:#082F49;font-weight:800;font-size:12px;cursor:pointer;border:0}
    .cargando{margin-top:26px;color:#A8A29E;font-family:'JetBrains Mono',monospace;font-size:12px}
    .idle{margin-top:30px;text-align:center;padding:8px 12px 18px}
    .idle-kicker{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#78716C}
    .idle-title{margin-top:10px;font-size:clamp(20px,5.2vw,26px);font-weight:800;letter-spacing:-.02em;line-height:1.25}
    .idle-sub{margin:12px auto 0;max-width:46ch;font-size:13px;color:#A8A29E;line-height:1.55}
    .idle-chips{margin-top:18px;display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
    .idle-chip{min-height:44px;padding:12px 16px;border-radius:999px;background:rgba(251,191,36,.09);border:1px solid rgba(251,191,36,.3);color:#FDE68A;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;cursor:pointer;transition:all .18s}
    .idle-chip:hover{background:rgba(251,191,36,.16);border-color:rgba(251,191,36,.5)}
    /* ── MENÚ INFERIOR MÓVIL: idéntico al panel del comprador (mismo ícono activo: Solicitudes) ── */
    .mobile-bar{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;align-items:stretch;justify-content:space-between;gap:4px;padding:.5rem .5rem calc(.5rem + env(safe-area-inset-bottom));background:linear-gradient(to top,#14110E 0%,rgba(20,17,14,.96) 80%,rgba(20,17,14,0) 100%);border-top:1px solid rgba(255,255,255,.08)}
    .mb-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.15rem;min-width:0;min-height:52px;color:#A8A29E;text-decoration:none;border-radius:.8rem;transition:all .15s}
    .mb-item svg{width:22px;height:22px}
    .mb-label{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.02em}
    .mb-item:hover,.mb-item:focus-visible{color:#fff}
    .mb-activo{color:#FBBF24;background:rgba(251,191,36,.08)}
    .mb-activo svg{color:#FBBF24}
    .mb-solicitud{gap:.1rem}
    .mb-plus{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:.85rem;background:linear-gradient(to bottom,#FDE68A,#F59E0B);color:#1C1917;box-shadow:0 2px 10px rgba(245,158,11,.45)}
    .mb-plus svg{width:20px;height:20px}
    .mb-solicitud-label{color:#FBBF24}

    @media (max-width:767px){
      .console{padding:76px .75rem calc(96px + env(safe-area-inset-bottom))}
      .fila{flex-direction:column;gap:10px;padding:14px}
      .fila img{width:100%;height:160px;border-radius:14px;align-self:auto}
      .search-row{flex-direction:column;gap:10px;padding:10px 12px;border-radius:16px}
      .search-row input{font-size:15px;width:100%}
      .btn-buscar{width:100%;text-align:center;padding:12px}
    }
    @media (min-width:768px){
      .mobile-bar{display:none}
    }
    /* ── Pantallas grandes: más ancho útil, tipografía y cards escaladas ── */
    @media (min-width:1024px){
      .console{padding:88px 72px 96px}
      .search-row{padding:16px 22px;border-radius:20px}
      .search-row input{font-size:17px}
      .btn-buscar{padding:11px 26px;font-size:13px}
      .titulo{font-size:clamp(26px, 2.6vw, 38px)}
      .sub{font-size:12.5px;line-height:1.6}
      .grid{margin-top:26px;gap:14px}
      .fila{padding:20px 24px;border-radius:20px;gap:22px}
      .fila img{width:190px;height:126px;border-radius:16px}
      .fila .nombre{font-size:18.5px}
      .fila .tecnico{font-size:13px}
      .chip{font-size:11.5px}
      .pill{font-size:11px}
      .vacio{padding:36px;font-size:15px}
    }
  `],
  template: `
  <div class="shell">

    <a routerLink="/" class="btn-volver">← Inicio</a>

    <div class="console">

      <!-- Un solo buscador. El VIN del garaje se aplica por detrás, sin pedirlo
           ni mostrarlo: la app decide el contexto del vehículo automáticamente. -->
      <div class="search-row">
        <svg style="width:18px;height:18px;color:#FBBF24;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input #input type="text" [(ngModel)]="texto" (keyup.enter)="buscarAhora()" placeholder="Repuesto + código o medida (pastillas TRW, discos 312, kit BKC, bimasa LuK)..." autocomplete="off" />
        <button class="btn-buscar" (click)="buscarAhora()">Buscar</button>
      </div>

      <!-- Sin VIN aplicado, el auto activo define la compatibilidad. Con VIN del
           garaje no se muestra nada: el chasis ya determina el vehículo. -->
      @if (!vin) {
        <div class="filtros">
          <span class="chip-auto">
            <span style="width:7px;height:7px;border-radius:999px;background:#FBBF24"></span>
            Compatibilidad:
            <select [ngModel]="autoIdx()" (ngModelChange)="cambiarAuto($event)">
              @for (a of autos; track a.corto; let i = $index) {
                <option [value]="i">{{ a.nombreLargo }} {{ a.resumen }}</option>
              }
            </select>
          </span>
        </div>
      }

      <!-- Idle: aún no se buscó nada (ej. al entrar desde "Solicitar") -->
      @if (!buscado()) {
        <div class="idle">
          <p class="idle-kicker">Catálogo Toolbox · 14 rubros</p>
          <p class="idle-title">¿Qué repuesto llevará tu<br /><span style="color:#FCD34D">{{ autoActual().nombreLargo }} {{ autoActual().resumen }}</span>?</p>
          <p class="idle-sub">Escribí arriba por pieza, código OEM o medida (ej: <em>pastillas TRW</em>, <em>discos 312</em>) — o tocá una búsqueda frecuente:</p>
          <div class="idle-chips">
            @for (s of sugerencias; track s) {
              <button class="idle-chip" type="button" (click)="buscarSugerencia(s)">{{ s }}</button>
            }
          </div>
        </div>
      }

      <!-- Encabezado de resultados -->
      @if (buscado() && !cargando()) {
        <div class="encabezado">
          <h1 class="titulo">Resultados para “<span style="color:#FCD34D">{{ texto }}</span>”</h1>
          @if (resultados().length) {
            <p class="sub">✓ {{ resultados().length }} resultado{{ resultados().length === 1 ? '' : 's' }} del catálogo real para {{ etiquetaVehiculo() }} — foto, precio y stock de fuentes verificables</p>
          }
          @if (mercadoLibreUrl()) {
            <a class="ml-link" [href]="mercadoLibreUrl()" target="_blank" rel="noopener noreferrer"
               title="Abre el listado público de Mercado Libre para esta búsqueda y este auto">
              Ver listado completo en Mercado Libre ↗
            </a>
          }
        </div>
      }

      <!-- Lista de resultados: filas cómodas, sin precios -->
      @if (buscado()) {
      @if (cargando()) {
        <p class="cargando">Buscando en el catálogo…</p>
      } @else if (resultados().length) {
        <div class="grid">
          @for (p of resultados(); track p.id) {
            <div class="fila">
              <img [src]="p.imagen" [alt]="p.nombre" onerror="this.style.display='none'" />
              <div class="fila-info">
                <div class="head">
                  <p class="nombre">{{ p.nombre }}</p>
                  @if (p.fuente === 'toolbox-backend') {
                    <span class="source source-toolbox" title="Pieza real publicada en la red Toolbox">
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12l4 4 6-6"></path></svg>
                      Toolbox
                    </span>
                  } @else if (p.fuente === 'mercado_libre') {
                    <span class="source source-oem" title="Tu publicación en Mercado Libre">ML propio</span>
                  } @else if (p.fuente === 'tiendanube') {
                    <span class="source source-tn" title="Catálogo público real de tu tienda Tiendanube">Tienda</span>
                  } @else if (p.fuente === 'mercadolibre') {
                    <span class="source source-oem" title="Catálogo de referencia OEM">OEM ref.</span>
                  }
                </div>
                <div class="chips">
                  <span class="chip chip-marca">{{ p.marca }}</span>
                  @if (p.numeroOem) { <span class="chip">Cód. {{ p.numeroOem }}</span> }
                  @if (p.stockDisponible != null) { <span class="chip chip-stock">Stock {{ p.stockDisponible }}</span> }
                </div>
                <p class="tecnico">{{ p.descripcionTecnica }}</p>
                @if (p.precioRango) {
                  <p class="precio">{{ p.precioRango }}</p>
                }
                @if (p.permalink) {
                  <a class="ver-fuente" [href]="p.permalink" target="_blank" rel="noopener noreferrer">Ver en la fuente ↗</a>
                }
                @if (p.compatibilidad.length) {
                  <div class="compat">
                    <span class="etiqueta">Compatible con</span>
                    @for (v of p.compatibilidad; track v) { <span class="pill">{{ v }}</span> }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="vacio">
          Sin repuestos compatibles con {{ etiquetaVehiculo() }} para “{{ texto }}”.
          <br />Podés pedir cotización igual: los repuesteros cotizan por descripción y foto, y el catálogo crece con cada cotización.
          <br /><a routerLink="/cliente" class="cta">Ir al panel del comprador →</a>
        </div>
      }
      }

    </div>

    <!-- MENÚ INFERIOR MÓVIL (coincide con el panel del comprador; icono activo = Solicitudes) -->
    <nav class="mobile-bar" aria-label="Navegación del comprador">
      <a routerLink="/cliente" class="mb-item" aria-label="Inicio">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9M5 10v10h4v-6h6v6h4V10"></path></svg>
        <span class="mb-label">Inicio</span>
      </a>
      <a routerLink="/cliente" [queryParams]="{ vista: 'garaje' }" class="mb-item" aria-label="Garaje">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v4c0 .6.4 1 1 1h2m14 0a2 2 0 100 4 2 2 0 000-4zm-14 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
        <span class="mb-label">Garaje</span>
      </a>
      <a routerLink="/cliente" class="mb-item mb-solicitud" aria-label="Solicitar repuestos">
        <span class="mb-plus">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16m8-8H4"></path></svg>
        </span>
        <span class="mb-label mb-solicitud-label">Solicitar</span>
      </a>
      <a routerLink="/cliente" [queryParams]="{ vista: 'solicitudes' }" class="mb-item mb-activo" aria-label="Solicitudes" aria-current="page">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
        <span class="mb-label">Solicitudes</span>
      </a>
      <a routerLink="/cliente" [queryParams]="{ vista: 'pedidos' }" class="mb-item" aria-label="Pedidos">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
        <span class="mb-label">Pedidos</span>
      </a>
    </nav>
  </div>
  `
})
export class BuscarComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogo = inject(CatalogoRepuestosService);
  private readonly activoSvc = inject(VehiculoActivoService);
  private readonly api = inject(DemoApiService);

  readonly autos = AUTOS;
  autoIdx = signal(0);
  texto = '';
  resultados = this.catalogo.resultados;
  cargando = this.catalogo.cargando;
  /** true una vez que el usuario disparó una búsqueda (evita mostrar "Resultados para ''" al aterrizar) */
  buscado = signal(false);
  readonly sugerencias = ['pastillas de freno', 'discos 312', 'filtro de aceite', 'filtro de aire', 'bomba de agua', 'kit de distribución'];

  /** VIN aplicado automáticamente (garaje del usuario o link con ?vin=). */
  vin = '';
  motorVin = '';
  modeloVin = '';
  vehiculoVin = signal<VehiculoDecodificado | null>(null);

  ngOnInit(): void {
    // La query viene del home: /buscar?q=discos+312 (o de un link con ?vin=…)
    const q = this.route.snapshot.queryParamMap.get('q') ?? '';
    const vin = this.route.snapshot.queryParamMap.get('vin') ?? '';
    // El auto activo global manda si es uno del garage
    const activo = this.activoSvc.activo();
    const idx = this.autos.findIndex(a => a.nombreLargo === activo.nombreLargo);
    if (idx >= 0) this.autoIdx.set(idx);

    if (q) this.texto = q;

    if (vin) {
      this.vin = this.limpiarVin(vin);
      if (q) void this.buscarAhora();
      return;
    }

    // Usuario registrado: su VIN ya está en el garaje. Lo traemos y buscamos
    // con él, sin pedirle que lo escriba.
    if (usuarioSesion()) {
      void this.cargarVehiculoRegistrado(q);
      return;
    }
    if (q) this.buscarAhora();
  }

  /** Toma el primer vehículo con VIN válido del garaje del usuario y dispara
   *  la búsqueda por chasis. Si no hay VIN usable, cae al modo texto. */
  private async cargarVehiculoRegistrado(q: string): Promise<void> {
    try {
      const vehiculos = await firstValueFrom(this.api.garaje(this.api.idComprador));
      const v = vehiculos.find(item => this.limpiarVin(item.vin ?? '').length === 17);
      if (!v) {
        if (q && !this.buscado()) this.buscarAhora();
        return;
      }
      this.vin = this.limpiarVin(v.vin ?? '');
      this.motorVin = v.engine_details ?? '';
      this.modeloVin = modeloBase(v.model) || this.activoSvc.activo().nombreLargo;
      if (q) await this.buscarAhora();
    } catch {
      // Si el garaje no responde, se mantiene el modo texto de siempre.
      if (q && !this.buscado()) this.buscarAhora();
    }
  }

  autoActual() { return this.autos[this.autoIdx()]; }

  limpiarVin(valor: string): string {
    return (valor || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17);
  }

  etiquetaVehiculo(): string {
    const v = this.vehiculoVin();
    if (v) {
      return `${v.brand ?? ''} ${this.modeloVin || v.model || ''}`.trim() || 'tu vehículo';
    }
    return `${this.autoActual().nombreLargo} ${this.autoActual().resumen}`.trim();
  }

  /** Link al listado público real de ML para la pieza + auto activo (se abre en otra pestaña). */
  mercadoLibreUrl(): string {
    const q = (this.texto || '').trim();
    if (!q) return '';
    const normalizar = (s: string) => s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const pieza = normalizar(q)
      .replace(/[^a-z0-9\s]/g, '')
      .trim().replace(/\s+/g, '-')
      // ML usa "parilla" (una sola r) en el slug de esta búsqueda.
      .replace(/\bparrilla\b/g, 'parilla');
    const modelo = this.vehiculoVin()
      ? normalizar(this.modeloVin || this.vehiculoVin()?.model || '').split(/\s+/).pop() || ''
      : normalizar(this.autoActual().nombreLargo).split(/\s+/).pop() || '';
    if (!pieza || !modelo) return '';
    const sufijo = `${pieza}-${modelo}`;
    return `https://listado.mercadolibre.com.ar/${sufijo}#D[A:${encodeURIComponent(`${pieza} ${modelo}`)}]`;
  }

  /** Un único buscador: si hay VIN del garaje se aplica por detrás; si no,
   *  se usa el auto activo. El usuario nunca ve ni tipea el VIN. */
  buscarAhora(): void {
    const q = this.texto.trim();
    if (!q) return;
    this.buscado.set(true);
    if (this.vin.length === 17) {
      void this.buscarConVin(q);
      return;
    }
    this.vehiculoVin.set(null);
    this.router.navigate([], { queryParams: { q }, replaceUrl: true });
    this.catalogo.buscar(q, datosVehiculo(this.autoActual().nombreLargo));
  }

  buscarSugerencia(s: string): void {
    this.texto = s;
    this.buscarAhora();
  }

  /** Decodificación interna del VIN ya registrado: filtra por ese vehículo. */
  private async buscarConVin(pieza: string): Promise<void> {
    const motor = this.motorVin.trim() || undefined;
    this.cargando.set(true);
    try {
      const dec = await firstValueFrom(this.api.decodeVin(this.vin, motor));
      this.vehiculoVin.set(dec);
      if (!this.modeloVin.trim() && dec.model) this.modeloVin = dec.model;
      await this.catalogo.buscar(pieza, {
        marca: dec.brand,
        modelo: this.modeloVin.trim() || dec.model || undefined,
        anio: dec.year ?? undefined,
        motorCodigo: dec.engine?.prefix ?? undefined,
      }, { vin: this.vin, engineNumber: motor });
      this.router.navigate([], { queryParams: { q: pieza, vin: this.vin }, replaceUrl: true });
    } catch {
      // Si falla la decodificación, la búsqueda libre sigue funcionando.
      this.vehiculoVin.set(null);
      this.catalogo.buscar(pieza, datosVehiculo(this.autoActual().nombreLargo));
      this.router.navigate([], { queryParams: { q: pieza }, replaceUrl: true });
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarAuto(i: string | number): void {
    const idx = Number(i);
    this.autoIdx.set(idx);
    const a = this.autos[idx];
    this.activoSvc.set({ nombre: a.corto, nombreLargo: a.nombreLargo, resumen: a.resumen, vin: 'DEMO', img: '' });
    // Cambiar el auto descarta el VIN: es una decisión manual del usuario.
    this.vin = '';
    this.vehiculoVin.set(null);
    if (this.texto.trim()) this.buscarAhora();
  }
}
