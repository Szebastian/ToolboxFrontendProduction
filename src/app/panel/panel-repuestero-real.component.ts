import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoApiService, SolicitudBackend } from '../../application/services/demo-api.service';

// Sección REAL del panel repuestero: solicitudes abiertas de clientes + envío
// de cotización, contra el backend FastAPI (persistido en Supabase).
// Convive arriba de la demo mock diseñada del mostrador.
@Component({
  selector: 'app-repuestero-real',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .console-real{background:rgba(10,12,14,.92);border:1px solid rgba(245,158,11,.3);border-radius:28px;box-shadow:0 25px 60px -20px rgba(0,0,0,.7)}
    .queue-item{background:rgba(14,12,10,.55);border:1px solid rgba(255,255,255,.08);transition:all .2s ease;cursor:pointer}
    .queue-item:hover{border-color:rgba(245,158,11,.45)}
    .queue-item.active{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.7)}
  `],
  template: `
  <div class="console-real p-5 sm:p-6 space-y-5 text-white">

    <div class="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
      <div class="flex items-center gap-2.5">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-black tracking-wider bg-amber-400/15 border border-amber-400/45 text-amber-300">⚡ REAL · BACKEND v2</span>
        <h3 class="text-sm font-extrabold tracking-tight">Solicitudes Abiertas (todos los clientes)</h3>
      </div>
      <button (click)="cargar()" class="text-[11px] font-mono text-amber-300 hover:text-amber-200 transition cursor-pointer">↻ actualizar</button>
    </div>

    @if (cargando()) {
      <p class="text-xs text-stone-500 font-mono">Cargando solicitudes abiertas…</p>
    } @else if (solicitudes().length === 0) {
      <p class="text-xs text-stone-500 font-mono">No hay solicitudes abiertas ahora mismo.</p>
    }

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Cola de solicitudes -->
      <div class="space-y-2.5">
        @for (s of solicitudes(); track s.id) {
          <div (click)="elegir(s)" [class]="'queue-item rounded-2xl p-3.5 ' + (elegida()?.id === s.id ? 'active' : '')">
            <div class="flex items-center justify-between gap-3 mb-1">
              <span class="px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 text-[9px] font-mono font-black uppercase">OPEN FOR QUOTING</span>
              <span class="text-[10px] font-mono text-stone-500">{{ s.created_at | date:'dd/MM HH:mm' }}</span>
            </div>
            @for (it of s.items; track it.id) {
              <div class="flex items-center gap-2.5">
                @if (it.sample_photo_url) {
                  <img [src]="it.sample_photo_url" alt="Foto del cliente" class="h-10 w-10 rounded-lg object-cover border border-white/15 shrink-0" />
                }
                <p class="text-xs font-bold text-stone-100">{{ it.part_name }} <span class="text-stone-500 font-normal">× {{ it.quantity }}</span></p>
              </div>
            }
            @if (s.urgency_level === 'URGENT') {
              <span class="inline-block mt-1 text-[9px] font-mono font-black text-rose-300">🚨 URGENTE</span>
            }
          </div>
        }
      </div>

      <!-- Formulario de cotización -->
      <div class="bg-black/40 border border-white/10 rounded-2xl p-4">
        @if (!elegida()) {
          <p class="text-xs text-stone-500 font-mono">← Elegí una solicitud de la cola para cotizar.</p>
        } @else {
          <div class="space-y-3">
            <div>
              <span class="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Cotizando</span>
              <p class="text-sm font-bold text-white">{{ primeraParte() }}</p>
            </div>

            @if (fotoCliente()) {
              <div>
                <span class="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Foto del cliente (lo que hay que cambiar)</span>
                <img [src]="fotoCliente()!" alt="Foto del cliente" class="mt-1 h-24 rounded-xl object-cover border border-white/15" />
              </div>
            }

            <label class="block">
              <span class="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Precio total (ARS)</span>
              <input [(ngModel)]="monto" type="number" min="1" placeholder="21500" class="mt-1 w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:border-amber-400/60 outline-none" />
            </label>
            <label class="block">
              <span class="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Nota para el cliente (opcional)</span>
              <input [(ngModel)]="notas" placeholder="Ej: Fras-le en stock, retiro en Fontana 500" class="mt-1 w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-600 focus:border-amber-400/60 outline-none" />
            </label>
            <div>
              <span class="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Foto del repuesto real (obligatoria)</span>
              <p class="text-[9px] font-mono text-stone-500 mb-1">Confirmá con la foto de tu estante — alimenta el catálogo del marketplace.</p>
              <input type="file" accept="image/*" class="hidden" (change)="elegirFoto($event)" #fotoInput />
              <div class="flex items-center gap-2">
                <button type="button" (click)="fotoInput.click()" class="px-3 py-2 rounded-xl border border-white/15 bg-black/50 text-[11px] font-mono hover:border-amber-400/60 transition cursor-pointer">
                  {{ fotoPreview() ? '📷 cambiar foto' : '📷 adjuntar foto' }}
                </button>
                @if (fotoPreview()) {
                  <img [src]="fotoPreview()!" alt="Foto del repuesto" class="h-12 w-12 rounded-lg object-cover border border-amber-400/40" />
                  <button type="button" (click)="quitarFoto()" class="text-[11px] font-mono text-stone-400 hover:text-red-300 transition cursor-pointer">✕</button>
                }
              </div>
            </div>
            <button (click)="cotizar()" [disabled]="enviando() || !monto || !fotoArchivo()" class="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 text-xs font-black transition cursor-pointer">
              {{ enviando() ? 'ENVIANDO…' : 'ENVIAR COTIZACIÓN →' }}
            </button>
            @if (mensaje()) {
              <p class="text-[11px] font-mono" [class.text-emerald-300]="exito()" [class.text-rose-300]="!exito()">{{ mensaje() }}</p>
            }
          </div>
        }
      </div>
    </div>
  </div>
  `
})
export class RepuesteroRealComponent implements OnInit {

  private readonly api = inject(DemoApiService);

  solicitudes = signal<SolicitudBackend[]>([]);
  elegida = signal<SolicitudBackend | null>(null);
  monto: number | null = null;
  notas = '';
  fotoArchivo = signal<File | null>(null);
  fotoPreview = signal<string | null>(null);
  cargando = signal(false);
  enviando = signal(false);
  mensaje = signal<string | null>(null);
  exito = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.api.solicitudesAbiertas().subscribe({
      next: lista => {
        this.solicitudes.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.mensaje.set('⚠ Backend no disponible — ¿está corriendo en :10000?');
        this.exito.set(false);
      },
    });
  }

  elegir(s: SolicitudBackend): void {
    this.elegida.set(s);
    this.monto = null;
    this.notas = '';
    this.quitarFoto();
    this.mensaje.set(null);
  }

  fotoCliente(): string | null {
    const s = this.elegida();
    return s?.items?.find(it => it.sample_photo_url)?.sample_photo_url ?? null;
  }

  elegirFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.fotoArchivo.set(file);
    const reader = new FileReader();
    reader.onload = () => this.fotoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  quitarFoto(): void {
    this.fotoArchivo.set(null);
    this.fotoPreview.set(null);
  }

  primeraParte(): string {
    const s = this.elegida();
    return s && s.items.length > 0 ? s.items[0].part_name : '';
  }

  cotizar(): void {
    const s = this.elegida();
    if (!s || !this.monto || this.monto <= 0 || !this.fotoArchivo() || this.enviando()) {
      return;
    }
    this.enviando.set(true);

    // La foto del repuesto real es obligatoria: primero se sube a Storage y
    // luego se envía la cotización (la foto también alimenta el catálogo).
    this.api.subirFoto(this.fotoArchivo()!).subscribe({
      next: url => {
        this.api.cotizar({
          partsRequestId: s.id,
          vendorId: this.api.idRepuestero,
          totalAmount: this.monto!,
          notes: this.notas.trim() || undefined,
          itemPhotoUrl: url,
        }).subscribe({
          next: () => {
            this.enviando.set(false);
            this.mensaje.set('✓ Cotización enviada — el cliente la ve al instante en su panel.');
            this.exito.set(true);
            this.elegida.set(null);
            this.monto = null;
            this.notas = '';
            this.quitarFoto();
            this.cargar();
          },
          error: () => {
            this.enviando.set(false);
            this.mensaje.set('⚠ Error enviando la cotización (el precio debe ser mayor a 0).');
            this.exito.set(false);
          },
        });
      },
      error: () => {
        this.enviando.set(false);
        this.mensaje.set('⚠ No se pudo subir la foto del repuesto — probá de nuevo.');
        this.exito.set(false);
      },
    });
  }
}
