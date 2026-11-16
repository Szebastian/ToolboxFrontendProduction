import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoApiService, SolicitudBackend, CotizacionBackend, PedidoBackend } from '../../../application/services/demo-api.service';

// Sección REAL del panel comprador: lista de espera de cotizaciones + pedidos,
// contra el backend FastAPI (que persiste en Supabase). La búsqueda de repuestos
// vive en el home: acá solo se espera la respuesta de los repuesteros, se acepta
// la cotización y se paga el pedido. Convive con la demo mock diseñada de abajo.
@Component({
  selector: 'app-comprador-real',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .console-real{background:rgba(10,12,14,.92);border:1px solid rgba(34,211,238,.25);border-radius:28px;box-shadow:0 25px 60px -20px rgba(0,0,0,.7)}
    .real-tag{background:rgba(34,211,238,.15);border:1px solid rgba(34,211,238,.45);color:#67E8F9}
  `],
  template: `
  <div class="console-real p-5 sm:p-6 space-y-5 text-white">

    <!-- Encabezado -->
    <div class="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
      <div class="flex items-center gap-2.5">
        <span class="real-tag px-2 py-0.5 rounded-full text-[10px] font-mono font-black tracking-wider">⚡ REAL · BACKEND v2</span>
        <h3 class="text-sm font-extrabold tracking-tight">Cotizaciones de Repuestos</h3>
      </div>
      <button (click)="recargar()" class="text-[11px] font-mono text-cyan-300 hover:text-cyan-200 transition cursor-pointer">↻ actualizar</button>
    </div>

    <p class="text-[11px] font-mono text-stone-500">Pedí repuestos desde el inicio (Buscar repuesto) — acá esperás las cotizaciones de los repuesteros y gestionás tus pedidos.</p>

    @if (mensaje()) {
      <p class="text-[11px] font-mono text-cyan-300">{{ mensaje() }}</p>
    }

    <!-- Lista de solicitudes + cotizaciones recibidas -->
    <div class="space-y-3">
      @if (cargando()) {
        <p class="text-xs text-stone-500 font-mono">Cargando solicitudes…</p>
      } @else if (solicitudes().length === 0) {
        <p class="text-xs text-stone-500 font-mono">Todavía no tenés solicitudes activas — buscá un repuesto en el inicio para empezar.</p>
      }

      @for (s of solicitudes(); track s.id) {
        <div class="bg-black/40 border border-white/10 rounded-2xl p-4">
          <div class="flex items-center justify-between gap-3 mb-2">
            <span class="text-[10px] font-mono text-stone-500">{{ s.created_at | date:'dd/MM HH:mm' }} · URGENCIA {{ s.urgency_level }}</span>
            <span class="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[9px] font-mono font-black border border-amber-400/40">{{ s.status }}</span>
          </div>

          @for (it of s.items; track it.id) {
            <div class="flex items-center gap-3">
              @if (it.sample_photo_url) {
                <img [src]="it.sample_photo_url" alt="Foto de la pieza" class="h-12 w-12 rounded-lg object-cover border border-white/15 shrink-0" />
              }
              <p class="text-sm font-bold text-stone-100">{{ it.part_name }} <span class="text-stone-500 font-normal">× {{ it.quantity }}</span></p>
            </div>
          }

          <!-- Cotizaciones recibidas -->
          <div class="mt-3 space-y-1.5">
            @if (s.cotizaciones === undefined) {
              <p class="text-[11px] font-mono text-stone-600">Buscando cotizaciones…</p>
            } @else if (s.cotizaciones && s.cotizaciones.length > 0) {
              @for (c of s.cotizaciones; track c.id) {
                <div class="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <div class="flex items-center gap-3 min-w-0">
                    @if (c.item_photo_url) {
                      <img [src]="c.item_photo_url" alt="Foto del repuesto real" class="h-12 w-12 rounded-lg object-cover border border-emerald-400/30 shrink-0" />
                    }
                    <div class="min-w-0">
                      <p class="text-[11px] font-bold text-stone-200 truncate">Repuestero demo ({{ c.status }})</p>
                      @if (c.notes) { <p class="text-[10px] text-stone-500 truncate">{{ c.notes }}</p> }
                    </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <div class="text-right">
                      <p class="text-sm font-black text-emerald-300">{{ c.currency }} $ {{ formato(c.total_amount) }}</p>
                      <p class="text-[9px] font-mono text-stone-500">vence {{ c.expires_at | date:'dd/MM HH:mm' }}</p>
                    </div>
                    @if (c.status === 'SUBMITTED') {
                      <button (click)="aceptar(c)" [disabled]="aceptandoId() === c.id"
                        class="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-stone-950 text-[10px] font-black transition cursor-pointer">
                        {{ aceptandoId() === c.id ? '…' : 'ACEPTAR' }}
                      </button>
                    }
                  </div>
                </div>
              }
            } @else {
              <p class="text-[11px] font-mono text-stone-600">⏳ Sin cotizaciones todavía — los repuesteros la ven al instante.</p>
            }
          </div>
        </div>
      }
    </div>

    <!-- Mis pedidos (órdenes reales generadas al aceptar una cotización) -->
    <div class="pt-3 border-t border-white/10 space-y-2">
      <h4 class="text-[11px] font-mono font-black text-stone-300 uppercase tracking-wider">Mis pedidos</h4>
      @if (pedidos().length === 0) {
        <p class="text-[11px] font-mono text-stone-600">Todavía no hay pedidos — aceptá una cotización para generar el primero.</p>
      }
      @for (p of pedidos(); track p.id) {
        <div class="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <div class="min-w-0">
            <p class="text-[11px] font-bold text-stone-200 truncate">Pedido #{{ p.id.slice(0, 8) }}</p>
            <p class="text-[9px] font-mono text-stone-500">{{ p.created_at | date:'dd/MM HH:mm' }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <p class="text-sm font-black text-emerald-300">$ {{ formato(p.total_amount) }}</p>
            @if (p.status === 'pending_payment') {
              <span class="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[9px] font-mono font-black border border-amber-400/40">PENDIENTE DE PAGO</span>
              <button (click)="pagar(p)" [disabled]="pagandoId() === p.id"
                class="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-stone-950 text-[10px] font-black transition cursor-pointer">
                {{ pagandoId() === p.id ? '…' : 'CONFIRMAR PAGO' }}
              </button>
            } @else if (p.status === 'paid') {
              <span class="px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 text-[9px] font-mono font-black border border-emerald-400/40">PAGADO</span>
            } @else {
              <span class="px-2 py-0.5 rounded-full bg-white/10 text-stone-300 text-[9px] font-mono font-black border border-white/20">{{ p.status }}</span>
            }
          </div>
        </div>
      }
    </div>
  </div>
  `
})
export class CompradorRealComponent implements OnInit {

  private readonly api = inject(DemoApiService);

  solicitudes = signal<(SolicitudBackend & { cotizaciones?: CotizacionBackend[] })[]>([]);
  pedidos = signal<PedidoBackend[]>([]);
  cargando = signal(false);
  aceptandoId = signal<string | null>(null);
  pagandoId = signal<string | null>(null);
  mensaje = signal<string | null>(null);

  ngOnInit(): void {
    this.recargar();
  }

  recargar(): void {
    this.cargando.set(true);
    this.mensaje.set(null);

    this.api.solicitudesAbiertas().subscribe({
      next: todas => {
        // La lista "abierta" es global (la usa el vendedor): filtramos las nuestras
        this.solicitudes.set(todas.filter(s => s.customer_id === this.api.idComprador));
        this.cargando.set(false);
        this.solicitudes().forEach(s => this.cargarCotizaciones(s.id));
      },
      error: () => {
        this.cargando.set(false);
        this.mensaje.set('⚠ Backend no disponible — ¿el backend está corriendo en :10000?');
      },
    });

    this.api.pedidos(this.api.idComprador).subscribe({
      next: pedidos => this.pedidos.set(pedidos),
      error: () => this.pedidos.set([]),
    });
  }

  private cargarCotizaciones(requestId: string): void {
    this.api.cotizacionesDeSolicitud(requestId).subscribe({
      next: cotizaciones => this.solicitudes.update(lista =>
        lista.map(s => (s.id === requestId ? { ...s, cotizaciones } : s))
      ),
      error: () => this.solicitudes.update(lista =>
        lista.map(s => (s.id === requestId ? { ...s, cotizaciones: [] } : s))
      ),
    });
  }

  aceptar(c: CotizacionBackend): void {
    if (!window.confirm(`¿Aceptás la cotización de $ ${this.formato(c.total_amount)}? Se generará un pedido pendiente de pago.`)) {
      return;
    }
    this.aceptandoId.set(c.id);
    this.api.aceptarCotizacion(c.id, this.api.idComprador).subscribe({
      next: orden => {
        this.aceptandoId.set(null);
        this.mensaje.set(`✅ Pedido generado — pendiente de pago ($ ${this.formato(orden.total_amount)}).`);
        this.recargar();
      },
      error: err => {
        this.aceptandoId.set(null);
        this.mensaje.set(`⚠ No se pudo aceptar: ${err?.error?.detail ?? 'error del backend'}`);
      },
    });
  }

  pagar(p: PedidoBackend): void {
    if (!window.confirm(`¿Confirmás el pago de $ ${this.formato(p.total_amount)}?`)) {
      return;
    }
    this.pagandoId.set(p.id);
    this.api.marcarPagado(p.id, this.api.idComprador).subscribe({
      next: () => {
        this.pagandoId.set(null);
        this.mensaje.set('✅ Pago registrado — el repuestero ya puede preparar tu pedido.');
        this.recargar();
      },
      error: err => {
        this.pagandoId.set(null);
        this.mensaje.set(`⚠ No se pudo registrar el pago: ${err?.error?.detail ?? 'error del backend'}`);
      },
    });
  }

  formato(n: number): string {
    return n.toLocaleString('es-AR');
  }
}
