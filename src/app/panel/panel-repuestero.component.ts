import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

type TabKey = 'quotes' | 'logistics' | 'winrate' | 'finance';
type StockMode = 'imm' | 'dep' | 'out';

// Imágenes locales (public/img): las URLs externas originales devolvían 403.
const IMG_PASSAT = '/img/veh-passat.jpg';
const IMG_LOGO = '/toolboxLogo.webp';
const IMG_BOMBA = '/img/rep-bomba.svg';
const IMG_PASTILLAS = '/img/rep-pastillas.svg';
const IMG_MUESTRA_CLIENTE = '/img/muestra-pastillas.jpg';

@Component({
  selector: 'app-panel-repuestero',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .glass-shell{background:rgba(22,19,17,.94);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,.12);box-shadow:0 35px 80px -20px rgba(0,0,0,.7),0 0 0 1px rgba(0,0,0,.35)}
    .segment-tab{transition:all .2s cubic-bezier(.16,1,.3,1);cursor:pointer;color:#9CA3AF}
    .segment-tab.active{background:#F59E0B;color:#120F0D;font-weight:800;box-shadow:0 4px 14px rgba(245,158,11,.35)}
    .segment-tab:not(.active):hover{color:#FFF;background:rgba(255,255,255,.06)}
    .queue-card{background:rgba(14,12,10,.5);border:1px solid rgba(255,255,255,.06);transition:all .2s cubic-bezier(.16,1,.3,1);cursor:pointer}
    .queue-card:hover{border-color:rgba(245,158,11,.4);background:rgba(24,20,17,.8)}
    .queue-card.active{background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.7);box-shadow:0 0 20px rgba(245,158,11,.12)}
    .part-box{background:rgba(14,12,10,.6);border:1px solid rgba(255,255,255,.08);transition:all .2s ease}
    .part-box:hover{border-color:rgba(245,158,11,.35)}
    .tag-availability{cursor:pointer;transition:all .15s ease}
    .tag-availability.active-in{background:rgba(52,211,153,.18);border-color:#34D399;color:#34D399;font-weight:700}
    .tag-availability.active-dep{background:rgba(245,158,11,.18);border-color:#F59E0B;color:#F59E0B;font-weight:700}
    .tag-availability.active-out{background:rgba(248,113,113,.18);border-color:#F87171;color:#F87171;font-weight:700}
    .btn-steve-send{background:#F59E0B;color:#120F0D;transition:all .2s cubic-bezier(.16,1,.3,1);box-shadow:0 10px 24px -6px rgba(245,158,11,.5)}
    .btn-steve-send:hover{background:#FBBF24;transform:translateY(-1px);box-shadow:0 14px 28px -6px rgba(245,158,11,.65)}
  `],
  template: `
  <button (click)="volver()" style="position:fixed;bottom:14px;left:14px;z-index:40;margin:0;background:rgba(14,15,18,.65);color:#D6D3D1;border:1px solid rgba(255,255,255,.14);padding:7px 14px;border-radius:999px;font-weight:600;font-size:12px;font-family:'JetBrains Mono',monospace;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);cursor:pointer;transition:all .2s ease">← Volver</button>
  <div class="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-7">

    <!-- ======================================================== -->
    <!-- 1. HEADER: IDENTIDAD, SEGMENTED CONTROL & PAUSA          -->
    <!-- ======================================================== -->
    <header class="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pb-4 z-20">

      <!-- Logo & Local Oficial -->
      <div class="flex items-center gap-3.5 self-start md:self-auto">
        <div class="w-10 h-10 rounded-2xl bg-[#171412] p-1 border border-white/10 shadow-lg flex items-center justify-center overflow-hidden">
          <img [src]="imgLogo" alt="Toolbox Patagonia" class="w-full h-full object-contain mix-blend-screen contrast-125 brightness-110" />
        </div>
        <div>
          <div class="flex items-center gap-2 leading-none">
            <span class="font-extrabold text-base tracking-tight text-[#171412]">Toolbox</span>
            <span class="px-2 py-0.5 rounded-full bg-stone-950 text-amber-300 font-mono text-[9px] font-black uppercase tracking-wider">MOSTRADOR OFICIAL</span>
          </div>
          <p class="text-xs font-mono text-stone-800 font-medium mt-0.5">Repuestos Centro · San Martín 450, Trelew</p>
        </div>
      </div>

      <!-- Segmented Control tipo macOS -->
      <div class="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 font-mono text-xs shadow-inner">
        <button type="button" (click)="tab.set('quotes')" [class]="tab()==='quotes' ? 'segment-tab active px-3.5 py-1.5 rounded-xl flex items-center gap-1.5' : 'segment-tab px-3.5 py-1.5 rounded-xl flex items-center gap-1.5'">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
          <span>Cotizaciones (3)</span>
        </button>
        <button type="button" (click)="tab.set('logistics')" [class]="tab()==='logistics' ? 'segment-tab active px-3.5 py-1.5 rounded-xl flex items-center gap-1.5' : 'segment-tab px-3.5 py-1.5 rounded-xl flex items-center gap-1.5'">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          <span>Logística Moto</span>
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        </button>
        <button type="button" (click)="tab.set('winrate')" [class]="tab()==='winrate' ? 'segment-tab active px-3.5 py-1.5 rounded-xl flex items-center gap-1.5' : 'segment-tab px-3.5 py-1.5 rounded-xl flex items-center gap-1.5'">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          <span>Win Rate (78%)</span>
        </button>
        <button type="button" (click)="tab.set('finance')" [class]="tab()==='finance' ? 'segment-tab active px-3.5 py-1.5 rounded-xl flex items-center gap-1.5' : 'segment-tab px-3.5 py-1.5 rounded-xl flex items-center gap-1.5'">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          <span>Ventas &amp; CBU</span>
        </button>
      </div>

      <!-- Controles Rápidos: Pausa / En Línea + Operador -->
      <div class="flex items-center gap-3 self-end md:self-auto font-mono text-xs">

        <button type="button" (click)="toggleStoreStatus()" class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181412] border border-white/15 text-stone-200 hover:border-amber-400/40 shadow-sm transition cursor-pointer" title="Pausá las alertas si el mostrador se llena de gente para no demorar respuestas">
          <span [class]="online() ? 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse' : 'w-2 h-2 rounded-full bg-rose-400'"></span>
          <span [class]="online() ? 'font-bold text-emerald-300' : 'font-bold text-rose-300'">{{ online() ? 'MOSTRADOR EN LÍNEA' : 'MOSTRADOR PAUSADO' }}</span>
          <span class="text-stone-500">|</span>
          <span class="text-stone-400 text-[11px] underline">{{ online() ? 'Pausar' : 'Reactivar' }}</span>
        </button>

        <div class="hidden lg:flex items-center gap-2 text-stone-900 font-semibold pl-1">
          <span class="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs">RC</span>
          <span>Carlos M.</span>
        </div>

      </div>

    </header>

    <!-- ===================================================================== -->
    <!-- VISTA 1: COTIZACIÓN EN 3 TOQUES                                       -->
    <!-- ===================================================================== -->
    <main [class.hidden]="tab() !== 'quotes'" class="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 z-10 items-start">

      <!-- COLUMNA IZQUIERDA: COLA DE TRABAJO -->
      <aside class="lg:col-span-4 glass-shell rounded-[28px] p-5 text-white space-y-4">

        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span class="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Cola de Trabajo</span>
            <h2 class="text-sm font-extrabold text-white">Solicitudes de Clientes</h2>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-cyan-400 text-stone-950 font-mono text-[11px] font-black">3 activas</span>
        </div>

        <div class="space-y-2.5">

          <!-- Solicitud 1: Activa (Lucas R. - Passat 2 piezas) -->
          <div (click)="elegirSolicitud(1)" [class]="solicitudActiva()===1 ? 'queue-card active p-3.5 rounded-2xl relative overflow-hidden' : 'queue-card p-3.5 rounded-2xl relative overflow-hidden'">
            <div class="flex items-center justify-between text-[10px] font-mono mb-1">
              <span class="px-1.5 py-0.2 rounded bg-amber-400 text-stone-950 font-black uppercase">COTIZANDO AHORA</span>
              <span class="text-stone-400">Hace 2m · Trelew</span>
            </div>
            <div class="flex items-center gap-3 my-1.5">
              <div class="w-10 h-10 rounded-xl overflow-hidden bg-neutral-900 border border-amber-400/40 shrink-0">
                <img [src]="imgPassat" alt="Passat" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0">
                <h3 class="text-xs font-bold text-white truncate">Lucas R. · VW Passat 2.0 TDI</h3>
                <p class="text-[11px] text-stone-300 font-mono">Bomba agua + Pastillas freno</p>
              </div>
            </div>
            <div class="flex items-center justify-between text-[10px] font-mono text-emerald-400 pt-2 border-t border-white/10">
              <span>✓ Incluye foto de muestra</span>
              <span class="text-amber-300 font-bold">2 ítems</span>
            </div>
          </div>

          <!-- Solicitud 2: Marcos T. - Toyota Hilux -->
          <div (click)="elegirSolicitud(2)" [class]="solicitudActiva()===2 ? 'queue-card active p-3.5 rounded-2xl' : 'queue-card p-3.5 rounded-2xl opacity-75 hover:opacity-100'">
            <div class="flex items-center justify-between text-[10px] font-mono mb-1">
              <span class="text-stone-400">Hilux 2018 · Diesel</span>
              <span class="text-stone-400">Hace 14m</span>
            </div>
            <div class="flex items-center gap-3 my-1.5">
              <div class="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-xs shrink-0">🛻</div>
              <div class="min-w-0">
                <h3 class="text-xs font-bold text-white truncate">Marcos T. · Toyota Hilux</h3>
                <p class="text-[11px] text-stone-400 font-mono">Kit de embrague y rulemán</p>
              </div>
            </div>
            <div class="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-2 border-t border-white/10">
              <span>Sin fotos · Solo VIN</span>
              <span class="text-stone-300">Pendiente →</span>
            </div>
          </div>

          <!-- Solicitud 3: Taller Don Bosco - Ford Ranger -->
          <div (click)="elegirSolicitud(3)" [class]="solicitudActiva()===3 ? 'queue-card active p-3.5 rounded-2xl' : 'queue-card p-3.5 rounded-2xl opacity-75 hover:opacity-100'">
            <div class="flex items-center justify-between text-[10px] font-mono mb-1">
              <span class="text-stone-400">Ranger 3.2 · 2015</span>
              <span class="text-stone-400">Hace 28m</span>
            </div>
            <div class="flex items-center gap-3 my-1.5">
              <div class="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-xs shrink-0">🔧</div>
              <div class="min-w-0">
                <h3 class="text-xs font-bold text-white truncate">Taller Don Bosco · Ranger</h3>
                <p class="text-[11px] text-stone-400 font-mono">Amortiguadores delanteros</p>
              </div>
            </div>
            <div class="flex items-center justify-between text-[10px] font-mono text-emerald-400 pt-2 border-t border-white/10">
              <span>✓ Muestra de soporte</span>
              <span class="text-emerald-400">Respondido</span>
            </div>
          </div>

        </div>

        <!-- Tip de Steve Jobs -->
        <div class="p-3 rounded-2xl bg-black/40 border border-white/10 text-[11px] font-mono text-stone-300 flex items-start gap-2">
          <svg class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
          <span><strong>Regla de 3 Clicks:</strong> Disponibilidad + Precio + Enviar. Sin formularios eternos.</span>
        </div>

      </aside>

      <!-- COLUMNA CENTRAL: PANTALLA DE DETALLE -->
      <section class="lg:col-span-8 glass-shell rounded-[28px] p-6 text-white space-y-5">

        <!-- CABECERA: DATOS REALES DEL AUTO -->
        <div class="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div class="flex items-center gap-3.5">
            <div class="w-14 h-14 rounded-2xl bg-neutral-900 overflow-hidden border border-amber-400/40 shrink-0 shadow">
              <img [src]="imgPassat" alt="VW Passat" class="w-full h-full object-cover" />
            </div>
            <div>
              <div class="flex items-center gap-2 font-mono text-[10px]">
                <span class="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-bold uppercase">SOLICITUD #TRW-8942</span>
                <span class="text-emerald-400 font-bold flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Chasis Verificado
                </span>
              </div>
              <h1 class="text-lg font-extrabold tracking-tight text-white mt-1">Volkswagen Passat Sedán 2.0 TDI (2006)</h1>
              <p class="text-xs font-mono text-stone-400 mt-0.5">Motor BKP / BMP · VIN: <strong class="text-stone-200">WVWZZZ3CZ6P108422</strong> · Patente: <strong class="text-stone-200">FXW 892</strong></p>
            </div>
          </div>

          <div class="text-left sm:text-right font-mono text-xs shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10 space-y-1">
            <div class="text-stone-400">Cliente en Trelew:</div>
            <div class="font-bold text-white text-sm">Lucas R. (Taller Don Bosco)</div>

            <!-- Selector de Volatilidad Económica -->
            <div class="pt-0.5 flex items-center sm:justify-end gap-1.5 text-stone-300">
              <span class="text-[11px] text-stone-400">Validez del precio:</span>
              <select class="bg-black/70 border border-amber-400/30 rounded-md px-2 py-0.5 text-amber-300 font-bold text-xs focus:outline-none">
                <option selected>Válido por 2 horas</option>
                <option>Válido por 4 horas</option>
                <option>Válido solo hoy</option>
              </select>
            </div>
          </div>

        </div>

        <!-- REPUESTOS EN CONSULTA -->
        <div class="space-y-4">

          <div class="flex items-center justify-between pb-1">
            <h2 class="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">Repuestos en Consulta (2 ítems del carrito)</h2>
            <span class="text-[11px] font-mono text-stone-400">Tildá el stock y cargá tu precio numérico</span>
          </div>

          <!-- REPUESTO 1: BOMBA DE AGUA -->
          <div class="part-box p-4 sm:p-5 rounded-2xl space-y-3.5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-neutral-950 p-1.5 border border-white/10 shrink-0 flex items-center justify-center">
                  <img [src]="imgBomba" alt="Bomba" class="w-full h-full object-contain" />
                </div>
                <div>
                  <span class="text-[10px] font-mono text-amber-400 font-bold uppercase">ÍTEM 1 · MOTOR</span>
                  <h3 class="text-sm font-bold text-white leading-tight">Bomba de agua con turbina reforzada</h3>
                  <p class="text-xs font-mono text-stone-400">Cantidad: <strong>1 unidad</strong> · Motor BKP 16V</p>
                </div>
              </div>

              <div class="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono">
                <span class="text-xs text-stone-400">Tu precio:</span>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-stone-400 text-xs">$</span>
                  <input type="text" [(ngModel)]="precioWp" (input)="recalcTotal()" class="w-28 bg-black/80 border border-white/20 focus:border-amber-400 rounded-xl py-1.5 pl-6 pr-2.5 text-white font-bold text-sm text-right focus:outline-none" />
                </div>
                <span class="text-[10px] text-stone-400">ARS</span>
              </div>
            </div>

            <!-- Selector de Estado de Stock a 1 Click -->
            <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 font-mono text-xs">
              <span class="text-[10px] text-stone-400 uppercase tracking-wider">Disponibilidad:</span>

              <button type="button" (click)="setStock('wp','imm')" [class]="claseStock('wp','imm')">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Stock en Mostrador (Inmediato)</span>
              </button>

              <button type="button" (click)="setStock('wp','dep')" [class]="claseStock('wp','dep')">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>En Depósito (Demora 2 hs)</span>
              </button>

              <button type="button" (click)="setStock('wp','out')" [class]="claseStock('wp','out')">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>Sin Stock</span>
              </button>
            </div>

            <div class="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div class="flex items-center gap-2.5">
                <span class="text-amber-300 font-bold uppercase text-[10px]">OEM:</span>
                <span class="text-stone-300 text-[11px]">19 dientes, brida de 3 agujeros para Passat 2.0 TDI</span>
              </div>
              <div class="flex items-center gap-2 text-stone-400 text-[11px] shrink-0">
                <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
                <span>Calce verificado por VIN</span>
              </div>
            </div>
          </div>

          <!-- REPUESTO 2: PASTILLAS DE FRENO -->
          <div class="part-box p-4 sm:p-5 rounded-2xl space-y-3.5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-neutral-950 p-1.5 border border-white/10 shrink-0 flex items-center justify-center">
                  <img [src]="imgPastillas" alt="Pastillas" class="w-full h-full object-contain" />
                </div>
                <div>
                  <span class="text-[10px] font-mono text-cyan-400 font-bold uppercase">ÍTEM 2 · FRENOS</span>
                  <h3 class="text-sm font-bold text-white leading-tight">Pastillas de freno delanteras (Pinza TRW)</h3>
                  <p class="text-xs font-mono text-stone-400">1 juego (4 piezas) · Con conector de desgaste</p>
                </div>
              </div>

              <div class="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono">
                <span class="text-xs text-stone-400">Tu precio:</span>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-stone-400 text-xs">$</span>
                  <input type="text" [(ngModel)]="precioBrk" (input)="recalcTotal()" class="w-28 bg-black/80 border border-emerald-400/50 focus:border-emerald-400 rounded-xl py-1.5 pl-6 pr-2.5 text-emerald-300 font-bold text-sm text-right focus:outline-none" />
                </div>
                <span class="text-[10px] text-stone-400">ARS</span>
              </div>
            </div>

            <!-- Selector de Estado de Stock a 1 Click -->
            <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 font-mono text-xs">
              <span class="text-[10px] text-stone-400 uppercase tracking-wider">Disponibilidad:</span>

              <button type="button" (click)="setStock('brk','imm')" [class]="claseStock('brk','imm')">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Stock en Mostrador (Inmediato)</span>
              </button>

              <button type="button" (click)="setStock('brk','dep')" [class]="claseStock('brk','dep')">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>En Depósito (Demora 3 hs)</span>
              </button>

              <button type="button" (click)="setStock('brk','out')" [class]="claseStock('brk','out')">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>Sin Stock</span>
              </button>
            </div>

            <!-- Muestra Fotográfica Comparativa -->
            <div class="p-3 rounded-xl bg-black/40 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-2.5">
                <img [src]="imgMuestra" alt="Muestra" class="w-9 h-9 rounded-lg object-cover border border-emerald-400 shrink-0" />
                <div>
                  <span class="text-emerald-400 font-bold font-mono text-[10px] uppercase block flex items-center gap-1">✓ Foto de Muestra del Cliente</span>
                  <span class="text-stone-200 text-[11px]">Pastilla desmontada coincide al 100% en conector y ranura</span>
                </div>
              </div>
              <span class="text-stone-400 font-mono text-[11px] shrink-0">Catálogo Bosch OEM</span>
            </div>
          </div>

        </div>

        <!-- BARRA DE CIERRE INFERIOR -->
        <div class="p-4 sm:p-5 rounded-2xl bg-black/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div class="font-mono">
            <div class="text-[11px] text-stone-400 uppercase tracking-wider">Total presupuesto enviado al cliente:</div>
            <div class="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">&#36;{{ totalTxt() }} <span class="text-xs font-sans text-stone-400 font-normal">ARS (por ambos repuestos)</span></div>
            <div class="text-[11px] text-emerald-400 mt-0.5">✓ Stock confirmado · Válido por 2 horas en Trelew</div>
          </div>

          <button type="button" (click)="enviarAlComprador()" class="btn-steve-send px-8 py-4 rounded-2xl font-black text-sm tracking-tight flex items-center justify-center gap-2.5 cursor-pointer shadow-lg active:scale-95">
            <span>Enviar Presupuesto al Comprador</span>
            <svg class="w-4 h-4 text-stone-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>

        </div>

      </section>

    </main>

    <!-- ===================================================================== -->
    <!-- VISTA 2: LOGÍSTICA & DESPACHO EN MOTO (KANBAN)                        -->
    <!-- ===================================================================== -->
    <main [class.hidden]="tab() !== 'logistics'" class="hidden w-full max-w-7xl mx-auto flex-1 glass-shell rounded-[28px] p-6 text-white space-y-6 z-10">

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span class="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Flujo de Salida de Mercadería</span>
          <h2 class="text-xl font-bold tracking-tight text-white mt-0.5">Control de Despacho &amp; Cadetería en Trelew</h2>
          <p class="text-xs font-mono text-stone-400 mt-0.5">Mantené informada a la moto en tiempo real con 1 click por etapa.</p>
        </div>

        <button type="button" class="px-4 py-2 rounded-xl bg-black/60 border border-white/20 text-xs font-mono text-amber-300 font-bold flex items-center gap-2 hover:bg-black/90">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
          <span>Adjuntar Factura Electrónica</span>
        </button>
      </div>

      <!-- 4 COLUMNAS KANBAN -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <!-- Columna 1: Pendiente -->
        <div class="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span class="font-bold text-amber-300">1. Pendiente</span>
            <span class="text-stone-400">1 orden</span>
          </div>

          <div class="part-box p-3.5 rounded-xl space-y-2 border-l-4 border-l-amber-400 text-xs">
            <div class="flex justify-between font-mono text-[10px]">
              <span class="text-emerald-400 font-bold">Pago Acreditado</span>
              <span class="text-stone-400">Hace 3m</span>
            </div>
            <div class="font-bold text-white">Lucas R. · Passat 2.0 TDI</div>
            <div class="font-mono text-[11px] text-stone-300">Bomba Agua + Pastillas TRW</div>
            <button type="button" (click)="advanceKanban('Preparando')" class="w-full mt-2 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 font-mono text-[11px] font-bold hover:bg-amber-400 hover:text-stone-950 transition">Empaquetar →</button>
          </div>
        </div>

        <!-- Columna 2: Preparando -->
        <div class="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span class="font-bold text-cyan-300">2. Preparando</span>
            <span class="text-stone-400">1 orden</span>
          </div>

          <div class="part-box p-3.5 rounded-xl space-y-2 border-l-4 border-l-cyan-400 text-xs">
            <div class="flex justify-between font-mono text-[10px]">
              <span class="text-stone-300 font-mono">Ticket AFIP #004-98</span>
              <span class="text-stone-400">Hace 11m</span>
            </div>
            <div class="font-bold text-white">Marcos T. · Hilux 2018</div>
            <div class="font-mono text-[11px] text-stone-300">Kit embrague Valeo empaquetado</div>
            <button type="button" (click)="advanceKanban('Listo en mostrador')" class="w-full mt-2 py-1.5 rounded-lg bg-cyan-400/20 text-cyan-300 font-mono text-[11px] font-bold hover:bg-cyan-400 hover:text-stone-950 transition">Listo para Retiro →</button>
          </div>
        </div>

        <!-- Columna 3: Esperando cadete -->
        <div class="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span class="font-bold text-emerald-300">3. Esperando Cadete</span>
            <span class="text-stone-400">1 orden</span>
          </div>

          <div class="part-box p-3.5 rounded-xl space-y-2 border-l-4 border-l-emerald-400 text-xs">
            <div class="flex justify-between font-mono text-[10px]">
              <span class="text-emerald-400 font-bold">Moto a 2 cuadras (~2m)</span>
              <span class="text-stone-400">ID #MOT-44</span>
            </div>
            <div class="font-bold text-white">Gustavo P. · Ford Fiesta</div>
            <div class="font-mono text-[11px] text-stone-300">Correa + Tensor Gates</div>
            <button type="button" (click)="advanceKanban('Entregado al motoquero')" class="w-full mt-2 py-1.5 rounded-lg bg-emerald-400/20 text-emerald-300 font-mono text-[11px] font-bold hover:bg-emerald-400 hover:text-stone-950 transition">Entregar a la Moto →</button>
          </div>
        </div>

        <!-- Columna 4: En ruta -->
        <div class="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span class="font-bold text-stone-300">4. En Ruta al Cliente</span>
            <span class="text-stone-400">2 hoy</span>
          </div>

          <div class="part-box p-3.5 rounded-xl space-y-1.5 opacity-75 text-xs">
            <div class="flex justify-between font-mono text-[10px]">
              <span class="text-stone-400">Despachado 15:40</span>
              <span class="text-emerald-400">✓ En Viaje</span>
            </div>
            <div class="font-bold text-white">Taller Don Bosco · Ranger</div>
            <div class="font-mono text-[11px] text-stone-400">Amortiguadores Monroe (x2)</div>
          </div>
        </div>

      </div>

    </main>

    <!-- ===================================================================== -->
    <!-- VISTA 3: COMPETITIVIDAD Y WIN RATE                                    -->
    <!-- ===================================================================== -->
    <main [class.hidden]="tab() !== 'winrate'" class="hidden w-full max-w-7xl mx-auto flex-1 glass-shell rounded-[28px] p-6 text-white space-y-6 z-10">

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span class="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Competitividad en Trelew</span>
          <h2 class="text-xl font-bold tracking-tight text-white mt-0.5">Tasa de Cierre (Win Rate) y Motivos de Elección</h2>
          <p class="text-xs font-mono text-stone-400 mt-0.5">Datos anónimos de comportamiento de compra en tu zona.</p>
        </div>

        <div class="text-right font-mono text-xs">
          <span class="text-stone-400">Rendimiento mensual:</span>
          <div class="text-lg font-black text-emerald-400">73.1% Ganadas</div>
        </div>
      </div>

      <!-- 3 MÉTRICAS GRANDES -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div class="p-5 rounded-2xl bg-black/50 border border-white/10 text-center">
          <span class="text-stone-400 text-xs uppercase block">Cotizaciones Enviadas</span>
          <div class="text-3xl font-black text-white mt-1">52</div>
          <span class="text-[10px] text-emerald-400 mt-1 block">+14% vs mes anterior</span>
        </div>

        <div class="p-5 rounded-2xl bg-black/50 border border-emerald-400/40 text-center">
          <span class="text-stone-400 text-xs uppercase block">Ventas Concretadas</span>
          <div class="text-3xl font-black text-emerald-300 mt-1">38</div>
          <span class="text-[10px] text-emerald-400 mt-1 block">Tasa de cierre superior al promedio</span>
        </div>

        <div class="p-5 rounded-2xl bg-black/50 border border-white/10 text-center">
          <span class="text-stone-400 text-xs uppercase block">Tiempo Medio de Respuesta</span>
          <div class="text-3xl font-black text-amber-300 mt-1">3.5 min</div>
          <span class="text-[10px] text-stone-300 mt-1 block">El más rápido del centro</span>
        </div>
      </div>

      <!-- MOTIVOS DE RECHAZO & RANKING DE PIEZAS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">

        <div class="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3 font-mono text-xs">
          <h3 class="font-bold text-amber-300 flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            <span>¿Por qué eligieron a otro comercio? (14 casos)</span>
          </h3>

          <div class="space-y-3 pt-2">
            <div>
              <div class="flex justify-between text-stone-300 mb-1">
                <span>Entrega inmediata (tenían stock físico en mano)</span>
                <span class="font-bold text-amber-300">50% (7)</span>
              </div>
              <div class="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden"><div class="bg-amber-400 h-1.5 rounded-full" style="width:50%"></div></div>
            </div>

            <div>
              <div class="flex justify-between text-stone-300 mb-1">
                <span>Diferencia de precio menor a $3.000 ARS</span>
                <span class="font-bold text-cyan-300">28.5% (4)</span>
              </div>
              <div class="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden"><div class="bg-cyan-400 h-1.5 rounded-full" style="width:28.5%"></div></div>
            </div>

            <div>
              <div class="flex justify-between text-stone-300 mb-1">
                <span>Cercanía geográfica para retiro personal</span>
                <span class="font-bold text-stone-400">21.5% (3)</span>
              </div>
              <div class="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden"><div class="bg-stone-500 h-1.5 rounded-full" style="width:21.5%"></div></div>
            </div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3 font-mono text-xs">
          <h3 class="font-bold text-emerald-300 flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            <span>Repuestos Más Buscados en Trelew</span>
          </h3>

          <div class="space-y-2 pt-1">
            <div class="flex items-center justify-between p-2 rounded-xl bg-white/5">
              <span class="text-white font-bold">1. Pastillas de freno Gol Power / Trend</span>
              <span class="text-emerald-400 font-bold">142 consultas</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-white/5">
              <span class="text-white font-bold">2. Kit distribución Hilux 2.8 / 3.0</span>
              <span class="text-emerald-400 font-bold">98 consultas</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-white/5">
              <span class="text-white font-bold">3. Bomba de agua Passat / Vento 2.0 TDI</span>
              <span class="text-emerald-400 font-bold">76 consultas</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-white/5">
              <span class="text-white font-bold">4. Filtros aceite y aire Ranger 3.2</span>
              <span class="text-emerald-400 font-bold">64 consultas</span>
            </div>
          </div>
        </div>

      </div>

    </main>

    <!-- ===================================================================== -->
    <!-- VISTA 4: CONTROL FINANCIERO Y AUDITORÍA                               -->
    <!-- ===================================================================== -->
    <main [class.hidden]="tab() !== 'finance'" class="hidden w-full max-w-7xl mx-auto flex-1 glass-shell rounded-[28px] p-6 text-white space-y-6 z-10">

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span class="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">Auditoría &amp; Liquidaciones</span>
          <h2 class="text-xl font-bold tracking-tight text-white mt-0.5">Libro Diario de Ventas &amp; Desglose de Comisión</h2>
          <p class="text-xs font-mono text-stone-400 mt-0.5">Cobros directos en CBU sin sorpresas ni costos fijos mensuales.</p>
        </div>

        <button type="button" class="px-4 py-2 rounded-xl bg-black/60 border border-white/20 text-xs font-mono text-amber-300 font-bold flex items-center gap-2 hover:bg-black/90">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          <span>Descargar Conciliación Excel</span>
        </button>
      </div>

      <!-- 4 MÉTRICAS DE LIQUIDACIÓN -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div class="p-4 rounded-2xl bg-black/50 border border-white/10">
          <span class="text-stone-400 block uppercase text-[10px]">Facturado Mes</span>
          <div class="text-xl font-bold text-white mt-1">$ 1.840.000</div>
          <span class="text-emerald-400 text-[10px]">38 ventas cerradas</span>
        </div>

        <div class="p-4 rounded-2xl bg-black/50 border border-white/10">
          <span class="text-stone-400 block uppercase text-[10px]">Comisión Plataforma (3%)</span>
          <div class="text-xl font-bold text-amber-300 mt-1">$ 55.200</div>
          <span class="text-stone-400 text-[10px]">Sin abono fijo</span>
        </div>

        <div class="p-4 rounded-2xl bg-black/50 border border-white/10">
          <span class="text-stone-400 block uppercase text-[10px]">Neto Cobrado en CBU</span>
          <div class="text-xl font-bold text-cyan-300 mt-1">$ 1.784.800</div>
          <span class="text-stone-400 text-[10px]">Acreditación directa</span>
        </div>

        <div class="p-4 rounded-2xl bg-black/50 border border-emerald-400/40">
          <span class="text-emerald-300 block uppercase text-[10px]">Saldo Pendiente</span>
          <div class="text-xl font-bold text-emerald-300 mt-1">$ 0,00</div>
          <span class="text-stone-400 text-[10px]">Cuenta al día</span>
        </div>
      </div>

      <!-- TABLA DE TRANSACCIONES -->
      <div class="p-4 rounded-2xl bg-black/50 border border-white/10 overflow-x-auto">
        <table class="w-full text-left font-mono text-xs">
          <thead class="text-stone-400 border-b border-white/10 pb-2">
            <tr>
              <th class="p-2">HORA</th>
              <th class="p-2">ID PEDIDO</th>
              <th class="p-2">CLIENTE</th>
              <th class="p-2">REPUESTOS</th>
              <th class="p-2">DESPACHO</th>
              <th class="p-2 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-stone-300">
            <tr>
              <td class="p-2 text-stone-400">15:42</td>
              <td class="p-2 text-amber-300 font-bold">#TRW-8939</td>
              <td class="p-2 text-white">Taller Don Bosco</td>
              <td class="p-2">Amortiguadores Ranger (x2)</td>
              <td class="p-2"><span class="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px]">Moto Entregada</span></td>
              <td class="p-2 text-right font-bold text-white">$ 88.000</td>
            </tr>
            <tr>
              <td class="p-2 text-stone-400">12:15</td>
              <td class="p-2 text-amber-300 font-bold">#TRW-8935</td>
              <td class="p-2 text-white">Gustavo P.</td>
              <td class="p-2">Correa distribución Fiesta</td>
              <td class="p-2"><span class="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px]">Esperando Moto</span></td>
              <td class="p-2 text-right font-bold text-white">$ 31.500</td>
            </tr>
            <tr>
              <td class="p-2 text-stone-400">18:30 (Ayer)</td>
              <td class="p-2 text-amber-300 font-bold">#TRW-8920</td>
              <td class="p-2 text-white">Esteban M.</td>
              <td class="p-2">Filtro de aire + Aceite Motul</td>
              <td class="p-2"><span class="px-2 py-0.5 rounded-full bg-stone-700 text-stone-300 text-[10px]">Retiro Mostrador</span></td>
              <td class="p-2 text-right font-bold text-white">$ 42.000</td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>

    <!-- ========================================== -->
    <!-- 3. FOOTER SOBRIO Y MINIMALISTA             -->
    <!-- ========================================== -->
    <footer class="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-stone-900 font-mono pt-4 z-20 gap-2">
      <div>Toolbox Patagonia · Red Oficial de Mostradores de Trelew</div>
      <div class="text-stone-800">San Martín 450 · (0280) 442-8812</div>
    </footer>

    <!-- MODAL DE CONFIRMACIÓN -->
    @if (modalDone()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div class="glass-shell p-7 rounded-[32px] max-w-md w-full text-center space-y-4 border border-emerald-400/40 text-white">
          <div class="w-14 h-14 rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto text-2xl font-black">✓</div>
          <h2 class="text-xl font-bold tracking-tight">¡Presupuesto enviado a Lucas R.!</h2>
          <p class="text-xs text-stone-300 font-mono leading-relaxed">
            El comprador recibió tu precio de <strong>&#36;{{ totalTxt() }} ARS</strong> en su radar en vivo. Cuando acepte el despacho, el sistema te avisará al instante para entregar la pieza a la moto o en mostrador.
          </p>
          <button type="button" (click)="cerrarModal()" class="w-full py-3.5 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs font-mono hover:bg-amber-300 transition">Entendido · Volver a la Cola</button>
        </div>
      </div>
    }

  </div>
  `,
})
export class PanelRepuesteroComponent {
  private readonly router = inject(Router);
  volver(): void { this.router.navigate(['/']); }
  readonly imgLogo = IMG_LOGO;
  readonly imgPassat = IMG_PASSAT;
  readonly imgBomba = IMG_BOMBA;
  readonly imgPastillas = IMG_PASTILLAS;
  readonly imgMuestra = IMG_MUESTRA_CLIENTE;

  // Navegación segmentada
  tab = signal<TabKey>('quotes');

  // Pausa del mostrador físico
  online = signal(true);

  // Cola de trabajo: solicitud activa
  solicitudActiva = signal(1);
  elegirSolicitud(i: number): void { this.solicitudActiva.set(i); }

  // Stock por ítem a 1 click
  stockWp = signal<StockMode>('imm');
  stockBrk = signal<StockMode>('imm');

  // Precios numéricos del repuestero
  precioWp = '34.000';
  precioBrk = '26.800';
  totalTxt = signal('60.800');

  claseStock(item: 'wp' | 'brk', mode: StockMode): string {
    const activo = (item === 'wp' ? this.stockWp() : this.stockBrk()) === mode;
    const base = 'tag-availability px-3 py-1 rounded-xl border text-[11px] flex items-center gap-1.5 ';
    if (!activo) return base + 'border-white/15 text-stone-400 hover:border-white/30';
    if (mode === 'imm') return base + 'active-in border-emerald-400/40';
    if (mode === 'dep') return base + 'active-dep border-amber-400/40';
    return base + 'active-out border-rose-400/40';
  }

  setStock(item: 'wp' | 'brk', mode: StockMode): void {
    if (item === 'wp') this.stockWp.set(mode); else this.stockBrk.set(mode);
  }

  private parsePrecio(v: string): number {
    const n = parseInt((v || '0').replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 0 : n;
  }

  recalcTotal(): void {
    this.totalTxt.set((this.parsePrecio(this.precioWp) + this.parsePrecio(this.precioBrk)).toLocaleString('es-AR'));
  }

  // Enviar presupuesto al comprador
  modalDone = signal(false);
  enviarAlComprador(): void { this.modalDone.set(true); }
  cerrarModal(): void { this.modalDone.set(false); }

  // Kanban de despacho
  advanceKanban(step: string): void {
    alert('Estado actualizado a: ' + step + '. Se notificó a la moto.');
  }

  toggleStoreStatus(): void { this.online.update(v => !v); }
}
