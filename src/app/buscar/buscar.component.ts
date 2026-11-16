import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogoRepuestosService } from '../../application/services/catalogo-repuestos.angular.service';
import { VehiculoActivoService } from '../../application/services/vehiculo-activo.service';

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
    .btn-volver{position:fixed;top:14px;left:14px;z-index:50;display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:rgba(14,15,18,.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#F3F4F6;border:1px solid rgba(255,255,255,.14);font-weight:600;font-size:12px;font-family:'JetBrains Mono',monospace;cursor:pointer;transition:all .2s ease;text-decoration:none}
    .btn-volver:hover{background:rgba(14,15,18,.95)}
    .console{margin:0;background:transparent;border:0;border-radius:0;box-shadow:none;color:#fff;padding:76px clamp(16px,4vw,72px) 80px}
    .search-row{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);border-radius:18px;padding:12px 16px}
    .search-row input{flex:1;background:transparent;border:0;outline:0;color:#fff;font-size:15px;font-weight:500;min-width:0}
    .search-row input::placeholder{color:#78716C}
    .btn-buscar{padding:9px 18px;border-radius:14px;background:#FBBF24;color:#1C1917;font-weight:800;font-size:12px;cursor:pointer;border:0;transition:all .2s ease}
    .btn-buscar:hover{background:#FCD34D}
    .filtros{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:14px}
    .chip-auto{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.4);color:#FBBF24;font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;letter-spacing:.06em}
    .chip-auto select{background:transparent;border:0;color:#FBBF24;font:inherit;cursor:pointer;outline:0}
    .chip-auto option{background:#1C1917;color:#FDE68A}
    .encabezado{margin-top:20px}
    .titulo{font-size:22px;font-weight:800;letter-spacing:-.01em}
    .titulo q{color:#FCD34D}
    .sub{margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#A8A29E;letter-spacing:.05em}
    .grid{margin-top:20px;display:flex;flex-direction:column;gap:12px}
    .fila{display:flex;align-items:stretch;gap:18px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:16px 20px;transition:all .22s cubic-bezier(.16,1,.3,1)}
    .fila:hover{border-color:rgba(251,191,36,.5);background:rgba(255,255,255,.07);transform:translateX(3px)}
    .fila img{width:150px;height:104px;object-fit:cover;border-radius:14px;background:#292524;flex-shrink:0;align-self:center}
    .fila-info{min-width:0;display:flex;flex-direction:column;gap:8px;justify-content:center}
    .fila .nombre{font-size:16px;font-weight:700;line-height:1.3;letter-spacing:-.01em}
    .chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
    .chip{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;color:#D6D3D1;letter-spacing:.04em}
    .chip-marca{background:rgba(251,191,36,.12);border-color:rgba(251,191,36,.35);color:#FCD34D}
    .fila .tecnico{font-size:12px;color:#9C968E;line-height:1.45}
    .compat{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
    .compat .etiqueta{font-family:'JetBrains Mono',monospace;font-size:10px;color:#78716C;letter-spacing:.1em;text-transform:uppercase}
    .pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;background:rgba(103,232,249,.09);border:1px solid rgba(103,232,249,.3);color:#7DD3FC;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.04em}
    .vacio{margin-top:26px;padding:22px;border:1px dashed rgba(255,255,255,.2);border-radius:18px;text-align:center;color:#D6D3D1;font-size:13px;line-height:1.5}
    .cta{display:inline-block;margin-top:12px;padding:10px 18px;border-radius:14px;background:#67E8F9;color:#082F49;font-weight:800;font-size:12px;cursor:pointer;border:0}
    .cargando{margin-top:26px;color:#A8A29E;font-family:'JetBrains Mono',monospace;font-size:12px}
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

      <!-- Buscador de la página limpia -->
      <div class="search-row">
        <svg style="width:18px;height:18px;color:#FBBF24;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input #input type="text" [(ngModel)]="texto" (keyup.enter)="buscarAhora()" placeholder="Repuesto + código o medida (pastillas TRW, discos 312, kit BKC, bimasa LuK)..." autocomplete="off" />
        <button class="btn-buscar" (click)="buscarAhora()">Buscar</button>
      </div>

      <!-- Auto activo para el filtro de compatibilidad -->
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

      <!-- Encabezado de resultados -->
      @if (!cargando()) {
        <div class="encabezado">
          <h1 class="titulo">Resultados para “<span style="color:#FCD34D">{{ texto }}</span>”</h1>
          @if (resultados().length) {
            <p class="sub">✓ {{ resultados().length }} resultado{{ resultados().length === 1 ? '' : 's' }} compatibles con tu {{ autoActual().nombreLargo }} {{ autoActual().resumen }} — refiná por texto: código PR (1ZA/1ZE), motor (BKC/BXE/BWA), medida (312) o cáliper (TRW/ATE/Bosch)</p>
          }
        </div>
      }

      <!-- Lista de resultados: filas cómodas, sin precios -->
      @if (cargando()) {
        <p class="cargando">Buscando en el catálogo…</p>
      } @else if (resultados().length) {
        <div class="grid">
          @for (p of resultados(); track p.id) {
            <div class="fila">
              <img [src]="p.imagen" [alt]="p.nombre" onerror="this.style.display='none'" />
              <div class="fila-info">
                <p class="nombre">{{ p.nombre }}</p>
                <div class="chips">
                  <span class="chip chip-marca">{{ p.marca }}</span>
                  @if (p.numeroOem) { <span class="chip">Cód. {{ p.numeroOem }}</span> }
                </div>
                <p class="tecnico">{{ p.descripcionTecnica }}</p>
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
          Sin repuestos compatibles con tu {{ autoActual().nombreLargo }} para “{{ texto }}”.
          <br />Podés pedir cotización igual: los repuesteros cotizan por descripción y foto, y el catálogo crece con cada cotización.
          <br /><a routerLink="/" class="cta">Pedir cotización desde el inicio →</a>
        </div>
      }

    </div>
  </div>
  `
})
export class BuscarComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogo = inject(CatalogoRepuestosService);
  private readonly activoSvc = inject(VehiculoActivoService);

  readonly autos = AUTOS;
  autoIdx = signal(0);
  texto = '';
  resultados = this.catalogo.resultados;
  cargando = this.catalogo.cargando;

  ngOnInit(): void {
    // La query viene del home: /buscar?q=discos+312
    const q = this.route.snapshot.queryParamMap.get('q') ?? '';
    if (q) {
      this.texto = q;
      this.buscarAhora();
    }
    // El auto activo global manda si es uno del garage
    const activo = this.activoSvc.activo();
    const idx = this.autos.findIndex(a => a.nombreLargo === activo.nombreLargo);
    if (idx >= 0) this.autoIdx.set(idx);
  }

  autoActual() { return this.autos[this.autoIdx()]; }

  buscarAhora(): void {
    if (!this.texto.trim()) return;
    this.router.navigate([], { queryParams: { q: this.texto.trim() }, replaceUrl: true });
    this.catalogo.buscar(this.texto.trim(), datosVehiculo(this.autoActual().nombreLargo));
  }

  cambiarAuto(i: string | number): void {
    const idx = Number(i);
    this.autoIdx.set(idx);
    const a = this.autos[idx];
    this.activoSvc.set({ nombre: a.corto, nombreLargo: a.nombreLargo, resumen: a.resumen, vin: 'DEMO', img: '' });
    if (this.texto.trim()) this.buscarAhora();
  }
}
