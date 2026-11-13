import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// Panel de Repartidor (placeholder): entregas y logística de la flota Toolbox.
// Estética consistente con el resto de los paneles (consola oscura + fondo cálido).
@Component({
  selector: 'app-panel-repartidor',
  standalone: true,
  styles: [`
    :host{display:block;min-height:100vh;min-height:100svh;background:radial-gradient(120% 90% at 50% -10%, #8B4527 0%, #6B3418 30%, #3A1B0D 65%, #120B08 100%);color:#F3F4F6;font-family:'Plus Jakarta Sans',sans-serif}
    .dark-console{background:rgba(14,15,18,.92);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border:1px solid rgba(255,255,255,.12);box-shadow:0 30px 70px -15px rgba(0,0,0,.8),0 0 0 1px rgba(0,0,0,.4)}
    .metric{background:#181A1F;border:1px solid rgba(255,255,255,.07);transition:all .22s cubic-bezier(.16,1,.3,1)}
    .metric:hover{border-color:rgba(56,189,248,.5);background:#1F2229;transform:translateY(-2px);box-shadow:0 12px 30px -10px rgba(56,189,248,.15)}
  `],
  template: `
  <button (click)="volver()" style="position:fixed;bottom:14px;left:14px;z-index:40;margin:0;background:rgba(14,15,18,.65);color:#D6D3D1;border:1px solid rgba(255,255,255,.14);padding:7px 14px;border-radius:999px;font-weight:600;font-size:12px;font-family:'JetBrains Mono',monospace;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);cursor:pointer;transition:all .2s ease">← Volver</button>

  <div class="max-w-6xl mx-auto px-6 py-10">
    <!-- HEADER -->
    <header class="flex items-center justify-between mb-10">
      <a href="#" (click)="volver(); $event.preventDefault()" class="flex items-center gap-3 group">
        <img src="/toolboxLogo.webp" alt="Toolbox Logo" class="w-12 h-12 rounded-2xl object-contain group-hover:scale-105 transition-transform duration-300" />
        <div>
          <div class="text-base font-extrabold tracking-tight leading-none">Toolbox <span class="font-mono text-amber-400">PATAGONIA</span></div>
          <div class="text-[10px] text-stone-400 font-mono tracking-wider mt-1">Panel de Repartidor · Flota & Cadetería</div>
        </div>
      </a>
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10">
        <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
        <span class="text-[10px] font-mono font-bold text-sky-300 tracking-wider">SESIÓN: REPARTIDOR</span>
      </div>
    </header>

    <!-- CONSOLA -->
    <section class="dark-console rounded-3xl p-8">
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight">Consola de Reparto</h1>
          <p class="text-sm text-stone-400 mt-1">Entregas del día, rutas activas y retiros en comercios.</p>
        </div>
        <span class="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-mono font-bold tracking-widest">EN CONSTRUCCIÓN</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="metric rounded-2xl p-5">
          <div class="text-[10px] font-mono text-stone-400 tracking-widest mb-2">ENTREGAS HOY</div>
          <div class="text-3xl font-extrabold text-white">12</div>
          <div class="text-xs text-emerald-400 font-mono mt-1">▲ 8 completadas</div>
        </div>
        <div class="metric rounded-2xl p-5">
          <div class="text-[10px] font-mono text-stone-400 tracking-widest mb-2">EN RUTA</div>
          <div class="text-3xl font-extrabold text-white">3</div>
          <div class="text-xs text-sky-400 font-mono mt-1">promedio 22 min</div>
        </div>
        <div class="metric rounded-2xl p-5">
          <div class="text-[10px] font-mono text-stone-400 tracking-widest mb-2">RETIROS EN COMERCIO</div>
          <div class="text-3xl font-extrabold text-white">4</div>
          <div class="text-xs text-amber-400 font-mono mt-1">2 esperando retiro</div>
        </div>
        <div class="metric rounded-2xl p-5">
          <div class="text-[10px] font-mono text-stone-400 tracking-widest mb-2">GANANCIAS HOY</div>
          <div class="text-3xl font-extrabold text-white">$18.400</div>
          <div class="text-xs text-stone-400 font-mono mt-1">12 viajes completados</div>
        </div>
      </div>

      <div class="mt-8 rounded-2xl border border-white/10 bg-[#14110F] p-5">
        <div class="text-xs font-mono text-stone-400">El módulo de reparto está en desarrollo. Esta consola es un placeholder visual: las métricas son datos de ejemplo.</div>
      </div>
    </section>
  </div>
  `,
})
export class PanelRepartidorComponent {
  private readonly router = inject(Router);
  volver(): void { this.router.navigate(['/']); }
}
