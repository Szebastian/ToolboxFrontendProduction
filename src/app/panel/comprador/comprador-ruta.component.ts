import { Component, inject } from '@angular/core';
import { CompradorEstadoService } from './comprador-estado.service';
import { COMPRADOR_STYLES } from './comprador-styles';

// Etapa 5: Moto en ruta y telemetría en vivo
@Component({
  selector: 'app-comprador-ruta',
  standalone: true,
  imports: [],
  styles: COMPRADOR_STYLES,
  template: `
  <!-- ═══════════ ETAPA 5: MOTO EN RUTA Y TELEMETRÍA EN VIVO ═══════════ -->
  @if (estado.rutaAbierta()) {
    <div class="fixed inset-0 z-[80] overflow-y-auto" style="background:radial-gradient(120% 90% at 50% -10%, #D49B7A 0%, #D9A07E 22%, #CF8E6C 48%, #A85A3A 78%, #7C361E 100%)">
      <div class="min-h-full flex flex-col justify-between selection:bg-amber-400 selection:text-stone-950">

        <!-- Apple Minimal Top Navigation -->
        <header class="w-full pt-6 px-6 sm:px-10 z-40">
          <div class="max-w-7xl mx-auto flex items-center justify-between">

            <!-- LOGO TOOLBOX PATAGONIA -->
            <a href="#" (click)="estado.irAlPanel(); $event.preventDefault()" class="flex items-center gap-3 group">
              <div class="w-9 h-9 rounded-2xl bg-[#171412] p-1 border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden group-hover:scale-105 transition-all">
                <img src="/logo.svg" alt="Toolbox Logo" class="w-full h-full object-contain rounded-xl mix-blend-screen contrast-125 brightness-110">
              </div>
              <span class="text-base font-extrabold tracking-tight text-[#171412] group-hover:text-black transition">
                Toolbox Patagonia
              </span>
            </a>

            <!-- AUTO ACTIVO & VOLVER -->
            <div class="flex items-center gap-3">
              <button (click)="estado.volverAlPago()" class="text-xs font-mono text-stone-800 hover:text-black transition flex items-center gap-1 cursor-pointer">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                <span>Volver al Pago</span>
              </button>
              <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181412] border border-amber-400/40 text-amber-300 font-bold text-xs shadow-lg">
                <span>🚗</span>
                <span class="truncate max-w-[120px] sm:max-w-none">VW Passat 2.0 TDI</span>
              </div>
            </div>

          </div>
        </header>

        <!-- STEPPER DE PROGRESIÓN INTERACTIVO -->
        <div class="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-1 z-30">
          <div class="glass-capsule p-2 rounded-2xl flex items-center justify-between gap-1 overflow-x-auto text-xs font-mono">

            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-300 shrink-0">
              <span class="text-emerald-400 font-bold">✓</span>
              <span>1. Buscar</span>
            </div>

            <span class="text-stone-600">→</span>

            <button (click)="estado.irAlPanel()" class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-300 hover:text-white shrink-0 cursor-pointer">
              <span class="text-emerald-400 font-bold">✓</span>
              <span>2. Presupuestos</span>
            </button>

            <span class="text-stone-600">→</span>

            <button (click)="estado.rutaAbierta.set(false); estado.destinoAbierto.set(true)" class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-300 hover:text-white shrink-0 cursor-pointer">
              <span class="text-emerald-400 font-bold">✓</span>
              <span>3. Destino &amp; Moto</span>
            </button>

            <span class="text-stone-600">→</span>

            <button (click)="estado.volverAlPago()" class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-300 hover:text-white shrink-0 cursor-pointer">
              <span class="text-emerald-400 font-bold">✓</span>
              <span>4. Pago Validado</span>
            </button>

            <span class="text-stone-600">→</span>

            <!-- Paso 5: Moto en Ruta Activo -->
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 text-stone-950 font-bold shrink-0 shadow-md">
              <span>5. Moto en Ruta</span>
            </div>

          </div>
        </div>

        <!-- Central Arena -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">

          <div class="text-center max-w-2xl mx-auto mb-6">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181412]/80 border border-white/10 text-emerald-400 text-xs font-mono mb-2 shadow-md">
              <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse"></span>
              <span>PASO 5: MOTO EN RUTA · MONITOREO GPS ACTIVO</span>
            </div>
            <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#171412] mb-2">
              El cadete está en viaje al taller
            </h1>
            <p class="text-stone-900/80 text-sm sm:text-base font-medium">
              Repuestos Centro Trelew entregó la caja precintada de pastillas Bosch OEM a Marcos V.
            </p>
          </div>

          <!-- Main Grid: Live Map + Cadete Telemetry & Receipt Confirmation -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-white">

            <!-- LEFT: Live Interactive GPS Map & Real-time Courier Telemetry (7 Cols) -->
            <div class="lg:col-span-7 space-y-6">

              <!-- MAP CONTAINER CARD -->
              <div class="glass-capsule rounded-3xl p-2 relative overflow-hidden shadow-2xl">
                <!-- Top Floating Status Overlay -->
                <div class="absolute top-5 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
                  <div class="pointer-events-auto flex items-center gap-3 bg-black/85 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/15 shadow-xl">
                    <span class="relative flex h-3 w-3">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
                    </span>
                    <div>
                      <div class="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Llegada Estimada</div>
                      <div class="text-base font-bold text-white tracking-tight flex items-baseline gap-1.5 font-mono">
                        @if (estado.llego()) {
                          <span class="text-white font-mono text-lg font-bold">¡En puerta!</span>
                        } @else {
                          <span class="text-cyan-300 text-lg font-black">{{ estado.posicionActual().min }}</span>
                          <span>minutos</span>
                          <span class="text-xs text-stone-400 font-normal">· {{ estado.posicionActual().km }} km restantes</span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Speed & Weather Badge -->
                  <div class="pointer-events-auto hidden sm:flex items-center gap-2 bg-black/85 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-white/15 text-xs font-mono text-stone-300">
                    <svg class="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    <span>38 km/h</span>
                    <span class="text-stone-600">|</span>
                    <span>San Martín → Pellegrini</span>
                  </div>
                </div>

                <!-- MAP VIEWPORT (Mapa Real Leaflet) -->
                <div class="relative w-full h-[450px] rounded-2xl overflow-hidden bg-neutral-950">
                  <!-- Contenedor de Leaflet -->
                  <div id="mapaRutaLeaflet" class="absolute inset-0 z-0"></div>

                  <!-- Vignette vertical sutil para profundidad -->
                  <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>

                  <!-- Bottom Floating Quick Refresh & Telemetry Bar -->
                  <div class="absolute bottom-4 left-4 right-4 z-20 bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-wrap items-center justify-between text-xs gap-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-cyan-400">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                      </div>
                      <div>
                        <div class="text-stone-400 text-[10px] font-mono">UBICACIÓN GPS EN TIEMPO REAL</div>
                        <div class="text-white font-bold">Av. Fontana &amp; 25 de Mayo (Trelew)</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button (click)="estado.actualizarGps()" class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/10 flex items-center gap-1.5 active:scale-95 cursor-pointer">
                        <svg class="w-3.5 h-3.5" [class]="estado.gpsRefrescando() ? 'animate-spin' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                        <span>Actualizar GPS</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CADETE & VEHÍCULO PROFILE CARD -->
              <div class="glass-capsule rounded-3xl p-5 sm:p-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div class="flex items-center gap-4">
                    <div class="relative">
                      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-300 p-0.5 shadow-lg">
                        <div class="w-full h-full rounded-[14px] bg-[#181412] flex items-center justify-center text-amber-300 font-bold font-mono text-base">MV</div>
                      </div>
                      <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-black"></span>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="text-base font-extrabold text-white">Marcos V.</h3>
                        <span class="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-400/30">Cadete Oficial Trelew</span>
                      </div>
                      <p class="text-stone-400 text-xs mt-0.5">Moto Honda CG 150 Titan · Patente A142KY</p>
                      <div class="flex items-center gap-2 mt-1 text-xs text-stone-300 font-mono">
                        <span class="text-amber-400 font-bold">★ 4.96</span>
                        <span>·</span>
                        <span>1.240 envíos sin demoras</span>
                      </div>
                    </div>
                  </div>

                  <!-- Direct Contact Actions -->
                  <div class="flex items-center gap-2">
                    <a href="tel:+542804558899" class="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition border border-white/10" title="Llamar al cadete">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </a>
                    <a href="https://wa.me/5492804558899?text=Hola%20Marcos,%20estoy%20esperando%20el%20paquete%20en%20Pellegrini%201240" target="_blank" class="px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs transition flex items-center gap-2 shadow-lg active:scale-95">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                      <span>WhatsApp Cadete</span>
                    </a>
                  </div>
                </div>

                <!-- Step-by-Step Delivery Progress -->
                <div class="border-t border-white/10 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                  <div class="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <div class="text-[10px] text-stone-400">11:42</div>
                    <div class="text-xs text-white font-bold mt-0.5">Transferencia</div>
                    <span class="inline-block mt-1 text-[10px] text-emerald-400 font-bold">✓ Acreditada</span>
                  </div>
                  <div class="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <div class="text-[10px] text-stone-400">11:46</div>
                    <div class="text-xs text-white font-bold mt-0.5">Retiro Mostrador</div>
                    <span class="inline-block mt-1 text-[10px] text-emerald-400 font-bold">✓ En Caja Moto</span>
                  </div>
                  <div class="bg-cyan-500/15 rounded-xl p-2.5 border border-cyan-400/40">
                    <div class="text-[10px] text-cyan-300 font-bold">11:51</div>
                    <div class="text-xs text-white font-bold mt-0.5">En Moto</div>
                    <span class="inline-block mt-1 text-[10px] text-cyan-300 font-bold animate-pulse" [class]="estado.llego() ? 'text-emerald-400' : 'text-cyan-300 animate-pulse'">● {{ estado.llego() ? 'Entregado' : 'En Ruta' }}</span>
                  </div>
                  <div class="bg-white/5 rounded-xl p-2.5 border border-white/5" [class]="estado.llego() ? 'opacity-100' : 'opacity-60'">
                    <div class="text-[10px] text-stone-500">12:05 (Est.)</div>
                    <div class="text-xs text-stone-300 font-bold mt-0.5">Entrega Taller</div>
                    <span class="inline-block mt-1 text-[10px] font-bold" [class]="estado.llego() ? 'text-emerald-400' : 'text-stone-500'">{{ estado.llego() ? '✓ Llegó' : 'Pendiente' }}</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- RIGHT: Payment Receipt & Part Details (5 Cols) -->
            <div class="lg:col-span-5 space-y-6">

              <!-- VALIDATION BADGE & RECEIPT CONFIRMATION -->
              <div class="glass-capsule rounded-3xl p-6 relative overflow-hidden">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-emerald-400 text-stone-950 flex items-center justify-center font-bold">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
                    </div>
                    <div>
                      <h3 class="text-base font-extrabold text-white">Pago Acreditado</h3>
                      <p class="text-xs text-emerald-400 font-mono">Sin intermediarios ni comisiones</p>
                    </div>
                  </div>
                  <span class="text-xs font-mono text-stone-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">#TRW-8942</span>
                </div>

                <!-- Receipt Details Breakdown -->
                <div class="bg-black/60 rounded-2xl p-4 border border-white/10 space-y-2.5 font-mono text-xs">
                  <div class="flex justify-between items-center text-stone-400 pb-2 border-b border-white/10">
                    <span>Total Pagado:</span>
                    <span class="text-amber-300 text-lg font-black">&#36;{{ estado.totalPasarela() }} ARS</span>
                  </div>
                  <div class="flex justify-between items-center text-stone-400">
                    <span>Pastillas Bosch OEM:</span>
                    <span class="text-stone-200">&#36;{{ estado.precioM1Elegida() }}</span>
                  </div>
                  <div class="flex justify-between items-center text-stone-400">
                    <span>Cadetería Moto Express Trelew:</span>
                    <span class="text-stone-200">&#36;{{ estado.motoCosto() }}</span>
                  </div>
                  <div class="flex justify-between items-center text-stone-400 pt-2 border-t border-white/10">
                    <span>Mostrador Oficial:</span>
                    <span class="text-white font-bold">Repuestos Centro Trelew</span>
                  </div>
                  <div class="flex justify-between items-center text-stone-400">
                    <span>Comprobante:</span>
                    <span class="text-emerald-400 flex items-center gap-1 font-sans font-medium">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/></svg>
                      transf_macro_{{ estado.totalPasarela().replace(/[.]/g, '') }}.pdf
                    </span>
                  </div>
                </div>
              </div>

              <!-- PACKAGE & PART BEING TRANSPORTED -->
              <div class="glass-capsule rounded-3xl p-6 space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">Pieza en la Caja de la Moto</h3>
                  <span class="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-mono font-bold">OEM Precintada</span>
                </div>

                <div class="flex items-center gap-4 bg-black/60 p-4 rounded-2xl border border-white/10">
                  <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-neutral-950 flex items-center justify-center p-2 shrink-0 border border-white/10">
                    <img src="/img/rep-pastillas.svg" alt="Pastillas Bosch" class="w-full h-full object-contain filter contrast-125 drop-shadow-xl">
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-bold text-white truncate">Pastillas Delanteras Bosch OEM</h4>
                    <p class="text-xs text-stone-300 mt-0.5 font-mono">VW Passat 2.0 TDI (2006)</p>
                    <div class="mt-2 flex items-center gap-2">
                      <span class="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">Pinza Lucas/TRW</span>
                      <span class="text-[10px] text-stone-400 font-mono">Garantía oficial 1 año</span>
                    </div>
                  </div>
                </div>

                <!-- Destination Info -->
                <div class="bg-black/40 rounded-2xl p-4 border border-white/10 space-y-1.5 font-sans">
                  <div class="text-[11px] font-mono text-cyan-300 uppercase font-bold">Destino de Entrega:</div>
                  <div class="text-sm font-bold text-white">{{ estado.destinoElegido() === 'gps' ? 'Mi GPS · Av. Fontana y 9 de Julio' : 'Pellegrini 1240 · Taller Don Bosco' }}</div>
                  <div class="text-xs text-stone-400">Entregar en mano a Don Mario para instalación inmediata.</div>
                </div>

                <!-- Safety Pin Code for Delivery -->
                <div class="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-center font-mono">
                  <div class="text-[10px] text-amber-300 uppercase tracking-wider mb-1 font-bold">CÓDIGO DE RECEPCIÓN (MOSTRAR AL CADETE)</div>
                  <div class="text-2xl font-black tracking-widest text-amber-300">
                    TRW - 482
                  </div>
                  <div class="text-[10px] text-stone-400 mt-1">
                    Indicá este código a Marcos al recibir la caja para validar la entrega.
                  </div>
                </div>

                <!-- Final Controls & Action -->
                <div class="pt-2 flex flex-col gap-2.5">
                  <button (click)="estado.compartirUbicacion()" class="w-full py-3.5 px-4 rounded-2xl bg-white text-stone-950 font-bold text-xs sm:text-sm hover:bg-neutral-200 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                    <svg class="w-4 h-4 text-stone-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    <span>Compartir Ubicación en Vivo con el Taller</span>
                  </button>
                  <button (click)="estado.irAlPanel()" class="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-200 font-bold text-xs transition text-center border border-white/10 cursor-pointer">
                    Ir a Mi Panel de Comprador
                  </button>
                </div>
              </div>

            </div>

          </div>

        </main>

        <!-- TOAST NOTIFICATION -->
        <div class="fixed bottom-6 right-6 z-50 transition-all duration-300 pointer-events-none bg-[#181412] border border-cyan-400/40 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2" [class]="estado.notaRuta() ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'">
          <svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          <span>{{ estado.notaRuta() || 'Enlace de rastreo copiado.' }}</span>
        </div>

        <!-- Footer Steve Jobs -->
        <footer class="w-full py-6 px-8 border-t border-stone-900/10 text-xs text-stone-900 font-mono font-medium">
          <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>© 2026 Toolbox Patagonia. Simplicidad y precisión en autopartes patagónicas.</div>
            <div class="flex items-center gap-4 text-stone-700 font-semibold">
              <span>Trelew • Rawson • Gaiman</span>
              <span>·</span>
              <button (click)="estado.irAlPanel()" class="hover:text-black underline cursor-pointer">Mi Panel de Comprador</button>
            </div>
          </div>
        </footer>

      </div>
    </div>
  }`,
})
export class CompradorRutaComponent {
  protected readonly estado = inject(CompradorEstadoService);
}
