import { Component, inject } from '@angular/core';
import { CompradorEstadoService } from './comprador-estado.service';
import { COMPRADOR_STYLES } from './comprador-styles';

// Etapa 4: Pasarela de pago y despacho
@Component({
  selector: 'app-comprador-pasarela',
  standalone: true,
  imports: [],
  styles: COMPRADOR_STYLES,
  template: `
  <!-- ═══════════ PASARELA DE PAGO A SCREEN COMPLETO (ETAPA 4: PAGO Y DESPACHO) ═══════════ -->
  @if (estado.pasarelaAbierta()) {
    <div class="fixed inset-0 z-[80] overflow-y-auto" style="background:radial-gradient(120% 90% at 50% -10%, #D49B7A 0%, #D9A07E 22%, #CF8E6C 48%, #A85A3A 78%, #7C361E 100%)">
      <div class="min-h-full flex flex-col justify-between selection:bg-amber-400 selection:text-stone-950">

        <!-- Apple Minimal Top Navigation -->
        <header class="w-full pt-6 px-6 sm:px-10 z-40">
          <div class="max-w-6xl mx-auto flex items-center justify-between">

            <!-- LOGO TOOLBOX PATAGONIA (clic = estado.volver al panel) -->
            <a href="#" (click)="estado.cerrarPasarela(); $event.preventDefault()" class="flex items-center gap-3 group">
              <div class="w-9 h-9 rounded-2xl bg-[#171412] p-1 border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden group-hover:scale-105 transition-all">
                <img src="/logo.svg" alt="Toolbox Logo" class="w-full h-full object-contain rounded-xl mix-blend-screen contrast-125 brightness-110">
              </div>
              <span class="text-base font-extrabold tracking-tight text-[#171412] group-hover:text-black transition">
                Toolbox Patagonia
              </span>
            </a>

            <!-- PASO DEL FLUJO Y VEHÍCULO VINCULADO -->
            <div class="flex items-center gap-3 text-xs font-mono">
              <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181412]/80 border border-white/10 text-stone-200 shadow-md">
                <span class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]"></span>
                <span class="text-stone-400">Paso 4 de 7:</span>
                <span class="font-bold text-white">Pago Seguro &amp; Despacho</span>
              </div>

              <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181412] border border-amber-400/40 text-amber-300 font-bold shadow-lg">
                <span class="text-xs">🚗</span>
                <span class="truncate max-w-[130px] sm:max-w-none">VW Passat 2.0 TDI</span>
              </div>
            </div>

          </div>
        </header>

        <!-- STEPPER DE PROGRESIÓN DEL FLUJO DE COMPRA -->
        <div class="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-1 z-30">
          <div class="glass-capsule p-2 rounded-2xl flex items-center justify-between gap-1 overflow-x-auto text-xs font-mono">

            <!-- Paso 1 -->
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-300 shrink-0">
              <span class="text-emerald-400 font-bold">✓</span>
              <span>1. Buscar</span>
            </div>

            <span class="text-stone-600">→</span>

            <!-- Paso 2 -->
            <button (click)="estado.cerrarPasarela(); estado.destinoAbierto.set(false)" class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-300 hover:text-white shrink-0 cursor-pointer">
              <span class="text-emerald-400 font-bold">✓</span>
              <span>2. Presupuestos</span>
            </button>

            <span class="text-stone-600">→</span>

            <!-- Paso 3 -->
            <button (click)="estado.pasarelaAbierta.set(false); estado.destinoAbierto.set(true)" class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-300 hover:text-white shrink-0 cursor-pointer">
              <span class="text-emerald-400 font-bold">✓</span>
              <span>3. Destino &amp; Moto</span>
            </button>

            <span class="text-stone-600">→</span>

            <!-- Paso 4: Pago Activo -->
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 text-stone-950 font-bold shrink-0 shadow-md">
              <span>4. Pago Seguro</span>
            </div>

            <span class="text-stone-600">→</span>

            <!-- Paso 5 -->
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-stone-400 shrink-0">
              <span>5. Moto en Ruta</span>
            </div>

          </div>
        </div>

        <!-- Central Arena -->
        <main class="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8 max-w-4xl mx-auto w-full">

          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181412]/75 border border-white/10 text-stone-300 text-xs font-mono tracking-wide mb-3 shadow-md">
            <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse"></span>
            <span>ACREDITACIÓN DIRECTA A REPUESTOS CENTRO TRELEW</span>
          </div>

          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-center text-[#171412] mb-2">
            Transferí &#36;{{ estado.totalPasarela() }} y sale la moto
          </h1>

          <p class="text-stone-900/80 text-sm sm:text-base text-center max-w-xl mb-7 font-medium leading-relaxed">
            Copiá el alias o escaneá el código QR. Al adjuntar el comprobante bancario, el cadete en moto retira la pieza en mostrador y va al taller.
          </p>

          <!-- CONSOLA CENTRAL FLOTANTE -->
          <div class="glass-capsule rounded-3xl p-6 sm:p-7 w-full max-w-3xl space-y-5 text-white">

            <!-- VISTA PREVIA DEL REPUESTO SELECCIONADO Y DESPACHO -->
            <div class="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-3.5 min-w-0">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center p-2 shrink-0 border border-amber-400/40 shadow-inner">
                  <img src="/img/rep-pastillas.svg" alt="Pastillas Bosch" class="w-full h-full object-contain filter contrast-125 drop-shadow-xl">
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="px-2 py-0.5 rounded bg-cyan-400 text-stone-950 text-[9px] font-mono font-black">OEM BOSCH GERMANY</span>
                    <span class="text-[10px] font-mono text-emerald-400 font-bold">Stock en Mano</span>
                  </div>
                  <h3 class="text-base sm:text-lg font-bold text-white tracking-tight truncate">Pastillas de Freno Delanteras Bosch</h3>
                  <div class="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-400 mt-1">
                    <span>De: <strong class="text-stone-200">Repuestos Centro Trelew</strong></span>
                    <span class="text-stone-600">→</span>
                    <span class="inline-flex items-center gap-1 text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                      <svg class="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span>{{ estado.destinoLabel() }}</span>
                    </span>
                    <button (click)="estado.pasarelaAbierta.set(false); estado.destinoAbierto.set(true)" class="text-amber-400 hover:text-amber-300 underline font-sans text-[11px] ml-1 cursor-pointer">
                      Cambiar destino o moto
                    </button>
                  </div>
                </div>
              </div>

              <div class="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 font-mono">
                <div class="text-[11px] text-stone-400">Pieza: &#36;{{ estado.precioM1Elegida() }} + Moto: &#36;{{ estado.motoCosto() }}</div>
                <div class="text-2xl font-black text-amber-300 mt-0.5">&#36;{{ estado.totalPasarela() }}</div>
                <div class="text-[9px] text-emerald-400">Sin comisiones extra</div>
              </div>
            </div>

            <!-- GRID: ALIAS Y QR (IZQ) + SUBIDA COMPROBANTE (DER) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

              <!-- Columna 1: Alias y Datos Bancarios -->
              <div class="payment-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div class="text-[11px] font-mono tracking-wider text-amber-400 uppercase font-bold mb-3 flex items-center justify-between">
                    <span>1. Datos de Transferencia</span>
                    <span class="text-stone-400 font-normal">CVU / CBU</span>
                  </div>

                  <!-- Botón Copiar Alias Interactivo -->
                  <div (click)="estado.copiarAlias()" class="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-amber-400/30 hover:border-amber-400 transition cursor-pointer flex items-center justify-between group mb-3 shadow">
                    <div>
                      <div class="text-[10px] text-stone-400 font-mono">Alias Mercado Pago / Bancario</div>
                      <div class="text-base font-bold font-mono text-white group-hover:text-amber-300 transition">
                        TOOLBOX.PATAGONIA.MP
                      </div>
                    </div>
                    <span class="text-xs font-mono font-bold px-3 py-1 rounded-lg shadow" [class]="estado.aliasCopiado() ? 'bg-emerald-400 text-stone-950' : 'bg-amber-400 text-stone-950'">
                      {{ estado.aliasCopiado() ? '¡Copiado!' : 'Copiar' }}
                    </span>
                  </div>

                  <div class="space-y-1.5 text-xs font-mono text-stone-400">
                    <div class="flex justify-between">
                      <span class="text-stone-500">Titular:</span>
                      <span class="text-stone-200 font-medium">Toolbox Patagonia Red Oficial</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-stone-500">CUIT:</span>
                      <span class="text-stone-200">30-71489201-4</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-stone-500">Banco:</span>
                      <span class="text-stone-200">Banco del Chubut</span>
                    </div>
                  </div>
                </div>

                <div class="pt-3 border-t border-white/[0.08] flex items-center gap-3">
                  <div class="w-11 h-11 rounded-xl bg-white p-1 shrink-0 shadow">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?data=TOOLBOX.PATAGONIA.MP&size=140x140" alt="QR" class="w-full h-full object-contain">
                  </div>
                  <div class="text-[11px] text-stone-400 font-sans leading-tight">
                    Escaneá directo desde <strong class="text-white">Mercado Pago, BNA+, MODO</strong> o tu home banking.
                  </div>
                </div>
              </div>

              <!-- Columna 2: Subida de Comprobante -->
              <div class="payment-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div class="text-[11px] font-mono tracking-wider text-cyan-400 uppercase font-bold mb-3 flex items-center justify-between">
                    <span>2. Comprobante de Pago</span>
                    <span class="text-stone-400 font-normal">Paso rápido</span>
                  </div>

                  <div (click)="estado.adjuntarComprobante()" class="rounded-xl p-5 border-2 transition cursor-pointer text-center group bg-black/40" [class]="estado.comprobanteAdjuntado() ? 'border-solid border-emerald-400/60 bg-emerald-500/[0.08]' : 'border-dashed border-white/20 hover:border-cyan-400/60'">
                    @if (!estado.comprobanteAdjuntado()) {
                      <div class="w-10 h-10 rounded-xl bg-cyan-400/10 text-cyan-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                      </div>
                    }
                    <div class="text-xs font-bold mb-0.5" [class]="estado.comprobanteAdjuntado() ? 'text-emerald-400' : 'text-white'">
                      {{ estado.comprobanteAdjuntado() ? '✓ transf_macro_' + estado.totalPasarela().replace(/[.]/g, '') + '.pdf adjuntado' : 'Tocá para adjuntar comprobante' }}
                    </div>
                    <p class="text-[11px] font-mono" [class]="estado.comprobanteAdjuntado() ? 'text-emerald-300' : 'text-stone-400'">
                      {{ estado.comprobanteAdjuntado() ? 'Listo para validación inmediata' : 'Captura de pantalla o PDF bancario' }}
                    </p>
                  </div>
                </div>

                <div class="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span class="text-stone-400 text-[11px]">¿Transferiste por celular?</span>
                  <a href="https://wa.me/?text=Hola%20Toolbox%20Patagonia,%20adjunto%20comprobante%20de%20$29.000%20para%20despacho%20de%20pastillas%20Passat" target="_blank" class="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1 transition">
                    <span>Avisar por WhatsApp</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

            </div>

            <!-- BOTÓN PRINCIPAL DE ACCIÓN -->
            <div class="pt-2">
              <button (click)="estado.validarComprobante()" class="btn-apple-cta w-full py-4 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xl group cursor-pointer">
                <span>Validar comprobante y ver moto en ruta en vivo</span>
                <svg class="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>

              <!-- Micro-texto de confianza ultra limpio -->
              <p class="text-[11px] text-stone-400 text-center font-mono mt-3">
                El mostrador confirma la acreditación en segundos y activa el rastreo GPS en tiempo real.
              </p>

              <!-- Toast de acreditación instantánea (sin validación, modo prueba) -->
              @if (estado.adquisicionAcreditada()) {
                <div class="mt-3 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/50 flex items-center justify-between gap-3 toast-in">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span class="text-[11px] font-mono text-emerald-300 truncate">
                      ✓ ACREDITADO — Moto en ruta: el cadete tiene tu pieza precintada y llega en ~15 min
                    </span>
                  </div>
                  <span class="px-2 py-0.5 rounded-full bg-emerald-400 text-stone-950 text-[9px] font-mono font-black shrink-0">ETAPA 5 LISTA</span>
                </div>
              }
            </div>

          </div>

        </main>

        <!-- Footer Steve Jobs -->
        <footer class="w-full py-6 px-8 border-t border-stone-900/10 text-xs text-stone-900 font-mono font-medium">
          <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>© 2026 Toolbox Patagonia. Simplicidad y precisión en autopartes patagónicas.</div>
            <div class="flex items-center gap-4 text-stone-700 font-semibold">
              <span>Trelew • Rawson • Gaiman</span>
              <span>·</span>
              <a href="#" (click)="estado.cerrarPasarela(); $event.preventDefault()" class="hover:text-black underline">Mi Panel de Comprador</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  }`,
})
export class CompradorPasarelaComponent {
  protected readonly estado = inject(CompradorEstadoService);
}
