import { Component, inject } from '@angular/core';
import { CompradorEstadoService } from './comprador-estado.service';
import { COMPRADOR_STYLES } from './comprador-styles';

// Etapa 3: Destino & Moto a pantalla completa
@Component({
  selector: 'app-comprador-destino',
  standalone: true,
  imports: [],
  styles: COMPRADOR_STYLES,
  template: `
  @if (estado.destinoAbierto()) {
    <div class="fixed inset-0 z-[80] overflow-y-auto" style="background:radial-gradient(120% 90% at 50% -10%, #D49B7A 0%, #D9A07E 22%, #CF8E6C 48%, #A85A3A 78%, #7C361E 100%)">
      <div class="min-h-[1024px] flex flex-col justify-between selection:bg-amber-400 selection:text-stone-950 antialiased">

        <!-- TOP BAR / HEADER -->
        <header class="w-full max-w-6xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between z-30">

          <!-- Logo Oficial Toolbox Patagonia (clic = estado.volver al panel) -->
          <a href="#" (click)="estado.cerrarPasarela(); estado.destinoAbierto.set(false); $event.preventDefault()" class="flex items-center gap-3.5 group">
            <div class="w-10 h-10 rounded-2xl bg-[#171412] p-1 border border-white/15 shadow-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img src="/logo.svg" alt="Toolbox Patagonia Logo" class="w-full h-full object-contain rounded-xl mix-blend-screen contrast-125 brightness-110">
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-extrabold text-base tracking-tight text-[#171412]">Toolbox</span><span class="font-semibold text-xs tracking-wider uppercase text-amber-950 font-mono">Patagonia</span>
              </div>
              <p class="text-[10px] font-mono text-stone-800 tracking-wider">Trelew · Rawson · Madryn</p>
            </div>
          </a>

          <!-- Píldora Chasis y Avatar Cliente -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181412] border border-amber-400/40 text-xs shadow-lg">
              <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]"></span>
              <span class="font-mono text-amber-300 font-bold">Passat 2.0 TDI</span>
              <span class="text-stone-400 text-[10px] font-mono hidden sm:inline">2006</span>
            </div>
            <button (click)="estado.cerrarPasarela(); estado.destinoAbierto.set(false)" class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-300 p-0.5 flex items-center justify-center text-stone-950 font-mono font-extrabold text-xs shadow-md hover:scale-105 transition cursor-pointer" title="Mi Panel de Comprador">
              LR
            </button>
          </div>

        </header>

        <!-- STEPPER DE FLUJO INTEGRADO -->
        <div class="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-1 z-30">
          <div class="glass-capsule p-2 rounded-2xl flex items-center justify-between gap-1 overflow-x-auto text-xs font-mono">

            <!-- Paso 1 -->
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-300 shrink-0">
              <span class="text-emerald-400 font-bold">✓</span>
              <span>1. Buscar</span>
            </div>

            <span class="text-stone-600">→</span>

            <!-- Paso 2 -->
            <button (click)="estado.volverAPresupuestos()" class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-300 hover:text-white shrink-0 cursor-pointer">
              <span class="text-emerald-400 font-bold">✓</span>
              <span>2. Presupuestos</span>
            </button>

            <span class="text-stone-600">→</span>

            <!-- Paso 3: Activo -->
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 text-stone-950 font-bold shrink-0 shadow-md">
              <span>3. Destino &amp; Moto</span>
            </div>

            <span class="text-stone-600">→</span>

            <!-- Paso 4 -->
            <button (click)="estado.continuarAlPago()" class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-400 hover:text-stone-200 shrink-0 cursor-pointer">
              <span>4. Pago</span>
            </button>

            <span class="text-stone-600">→</span>

            <!-- Paso 5 -->
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-400 shrink-0">
              <span>5. Moto en Ruta</span>
            </div>

          </div>
        </div>

        <!-- CONTENIDO CENTRAL: SELECCIÓN DE DESTINO Y DESPACHO EN TRELEW -->
        <main class="flex-1 my-auto flex flex-col justify-center items-center px-4 sm:px-6 py-6 w-full max-w-5xl mx-auto z-20">

          <div class="text-center mb-6 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181412]/80 text-amber-300 text-xs font-mono mb-2 border border-amber-500/20 shadow">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Despacho Inmediato en Trelew · Moto Lista</span>
            </div>
            <h1 class="text-3xl sm:text-5xl font-extrabold text-[#171412] tracking-tight leading-tight">
              ¿A dónde despachamos la moto?
            </h1>
            <p class="text-sm sm:text-base text-stone-900/80 font-medium mt-1.5 max-w-xl mx-auto leading-relaxed">
              El cadete retira en <strong>Repuestos Centro Trelew (San Martín 450)</strong> y lleva el repuesto precintado a tu taller o domicilio.
            </p>
          </div>

          <!-- TARJETA PRINCIPAL EN VIDRIO LÍQUIDO -->
          <div class="w-full max-w-4xl glass-capsule p-6 sm:p-8 rounded-[36px] border border-white/15 shadow-2xl text-white">

            <!-- Fila de Resumen de Repuesto Elegido -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/60 border border-white/10 mb-6">
              <div class="flex items-center gap-3.5 min-w-0">
                <div class="w-14 h-14 p-1.5 bg-neutral-950 rounded-2xl border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                  <img src="/img/rep-pastillas.svg" alt="Pastillas Bosch" class="w-full h-full object-contain filter contrast-125">
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="px-2 py-0.2 rounded bg-cyan-400 text-stone-950 text-[9px] font-mono font-black">1. OEM BOSCH GERMANY</span>
                    <span class="text-[10px] font-mono text-emerald-400 font-bold">Stock Físico Confirmado</span>
                  </div>
                  <h3 class="text-sm font-bold text-white leading-tight truncate">Pastillas de Freno Delanteras Bosch (Pinza TRW)</h3>
                  <p class="text-xs font-mono text-stone-400 mt-0.5">Precio pieza: <strong class="text-cyan-300 font-black">&#36;{{ estado.precioM1Elegida() }}</strong> · Mostrador San Martín 450</p>
                </div>
              </div>
              <div class="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-400/30 shrink-0">
                ✓ Opción confirmada
              </div>
            </div>

            <!-- MAPA PREVIO DE LA RUTA EN TRELEW + OPCIONES DE DESTINO -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">

              <!-- MAPA DE TRAYECTO (5 COLS) -->
              <div class="lg:col-span-5 rounded-3xl bg-black/70 border border-white/10 p-4 relative overflow-hidden flex flex-col justify-between min-h-[230px]">
                <!-- Fondo neutro (costo fijo por destino: sin estado.mapa) -->
                <div class="absolute inset-0 opacity-60" style="background:radial-gradient(90% 120% at 20% 0%, rgba(24,20,16,0) 0%, rgba(10,8,6,0.9) 100%);background-color:#141210"></div>

                <div class="relative z-10 flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded-full bg-black/85 backdrop-blur text-[10px] font-mono text-amber-300 border border-white/10 font-bold">
                    Ruta Trelew
                  </span>
                  <span class="px-2.5 py-1 rounded-full bg-cyan-400 text-stone-950 text-[10px] font-mono font-black shadow">
                    {{ estado.rutaInfo() }}
                  </span>
                </div>

                <!-- Gráfico de Ruta Visual con Cadete Moto -->
                <div class="relative z-10 my-4 flex items-center justify-between px-2">
                  <div class="text-center">
                    <span class="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 font-mono font-black text-xs flex items-center justify-center mx-auto shadow">M1</span>
                    <span class="text-[9px] font-mono text-stone-300 block mt-1 font-bold">Centro</span>
                  </div>

                  <!-- Línea de Trayecto Punteada -->
                  <div class="flex-1 mx-3 border-t-2 border-dashed border-cyan-400/70 relative">
                    <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-cyan-400 text-stone-950 flex items-center justify-center text-[10px] shadow-lg animate-bounce">
                      🛵
                    </div>
                  </div>

                  <div class="text-center">
                    <span class="w-8 h-8 rounded-xl bg-emerald-400 text-stone-950 font-mono font-black text-xs flex items-center justify-center mx-auto shadow">📍</span>
                    <span class="text-[9px] font-mono text-stone-300 block mt-1 font-bold">{{ estado.pinDestino() }}</span>
                  </div>
                </div>

                <div class="relative z-10 text-[11px] font-mono text-stone-300 bg-black/80 p-2 rounded-xl border border-white/10 text-center">
                  Cadete con caja precintada para resguardar la pieza
                </div>
              </div>

              <!-- OPCIONES DE DESTINO (7 COLS) -->
              <div class="lg:col-span-7 space-y-3">

                <!-- Opción 1: Taller Mecánico -->
                <div (click)="estado.elegirDestino('taller')" class="dest-card active p-4 rounded-2xl cursor-pointer flex items-start justify-between gap-3" [class.active]="estado.destinoElegido() === 'taller'">
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-xl bg-cyan-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 shadow font-bold">
                      <svg class="w-5 h-5 text-stone-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h4 class="text-sm font-bold text-white">Taller Mecánico Don Bosco</h4>
                        <span class="px-2 py-0.2 rounded-full bg-cyan-400 text-stone-950 text-[9px] font-mono font-black">
                          RECOMENDADO
                        </span>
                      </div>
                      <p class="text-xs font-mono text-stone-300 mt-0.5">Pellegrini 1240 · Don Bosco, Trelew</p>
                      <p class="text-[11px] text-stone-400 font-sans mt-1">
                        Entrega directa en fosa para instalación inmediata.
                      </p>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="text-base font-mono font-black" [class]="estado.destinoElegido() === 'taller' ? 'text-cyan-300' : 'text-stone-200'">$5.500</span>
                    <span class="block text-[10px] font-mono text-stone-400">Monto Fijo · Taller / Parque Industrial</span>
                  </div>
                </div>

                <!-- Opción 2: Rastrear Mi Ubicación Actual por GPS -->
                <div (click)="estado.triggerGpsUbicacion()" class="dest-card p-4 rounded-2xl cursor-pointer flex items-start justify-between gap-3 relative overflow-hidden group" [class.active]="estado.destinoElegido() === 'gps'">
                  <div class="flex items-start gap-3 min-w-0">
                    <div class="relative w-9 h-9 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 font-bold border border-cyan-400/40 shadow">
                      <svg class="w-5 h-5 text-cyan-400 animate-spin" style="animation-duration:6s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                      <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE] animate-ping"></span>
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>Mi Ubicación Actual por GPS</span>
                          <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        </h4>
                        @if (estado.gpsEscaneando()) {
                          <span class="px-2 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[9px] font-mono font-black animate-pulse">ESCANEANDO SATÉLITES...</span>
                        } @else if (estado.gpsFijado()) {
                          <span class="px-2 py-0.2 rounded-full bg-emerald-400 text-stone-950 text-[9px] font-mono font-black">PRECISIÓN 3 METROS (FIJADA)</span>
                        } @else {
                          <span class="px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold">GPS ACTIVO</span>
                        }
                      </div>
                      <p class="text-xs font-mono text-cyan-300 mt-0.5 truncate">
                        {{ estado.gpsFijado() ? '-43.2532°, -65.3094° (Av. Fontana y 9 de Julio, Trelew)' : '-43.2532°, -65.3094° · Av. Fontana y 9 de Julio' }}
                      </p>
                      <p class="text-[11px] text-stone-400 font-sans mt-1">
                        @if (estado.gpsFijado()) { <strong class="text-emerald-300">✓ Señal GPS bloqueada:</strong> El cadete recibirá tu punto en vivo en su estado.mapa. }
                        @else { Rastreo satelital instantáneo: el cadete va directo a donde estás con el celular o taller móvil. }
                      </p>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="text-base font-mono font-bold text-stone-200">$4.000</span>
                    <span class="block text-[10px] font-mono text-stone-400">Monto Fijo · Domicilio (Zona Urbana)</span>
                  </div>
                </div>

              </div>

            </div>

            <!-- BARRA DE ACCIÓN INFERIOR DENTRO DE LA TARJETA -->
            <div class="pt-5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">

              <div class="flex items-center gap-2 text-xs font-mono text-stone-300 shrink-0">
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22D3EE]"></span>
                <span>Destino: <strong>{{ estado.destinoLabel() }}</strong></span>
              </div>

              <div class="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
                <button (click)="estado.volverAPresupuestos()" class="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-stone-300 font-mono text-xs font-bold transition text-center shrink-0 cursor-pointer">
                  ← Volver a Presupuestos
                </button>

                <button (click)="estado.continuarAlPago()" class="px-6 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm tracking-tight shadow-xl shadow-cyan-500/20 transition text-center flex items-center justify-center gap-2 shrink-0 whitespace-nowrap cursor-pointer">
                  <span>Continuar al Pago Seguro →</span>
                </button>
              </div>

            </div>

          </div>

        </main>

        <!-- FOOTER -->
        <footer class="w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-900 font-mono font-medium z-20 border-t border-stone-900/10 mt-4">
          <div class="flex items-center gap-2">
            <span class="font-bold text-[#171412]">Toolbox Patagonia</span>
            <span>·</span>
            <span>Logística Motorizada Trelew &amp; Valle</span>
          </div>
          <div class="flex items-center gap-4 mt-2 sm:mt-0 text-[11px] text-stone-700 font-semibold">
            <span>Cadete con Caja Térmica</span>
            <span>·</span>
            <span>Entrega en 15-20 min</span>
            <span>·</span>
            <span>Trelew • Rawson • Gaiman</span>
          </div>
        </footer>

      </div>
    </div>
  }`,
})
export class CompradorDestinoComponent {
  protected readonly estado = inject(CompradorEstadoService);
}
