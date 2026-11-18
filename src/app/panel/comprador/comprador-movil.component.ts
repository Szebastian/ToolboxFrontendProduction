import { Component, DestroyRef, ElementRef, HostListener, computed, effect, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../application/services/supabase.service';
import { usuarioSesion } from '../../../application/services/demo-api.service';
import { setRolSesion } from '../../sesion';

export interface CatalogItem {
  id: string;
  brand: string;
  store: string;
  dist: string;
  price: string;
  priceNum: number;
  delivery: string;
  deliverySub: string;
  isMadryn: boolean;
  shippingFee?: string;
  shippingFeeNum?: number;
  shippingEta?: string;
  desc: string;
  specs: string;
}

export interface CatalogPart {
  key: string;
  name: string;
  spec: string;
  img: string;
  items: CatalogItem[];
}

type Vista = 'pedidos' | 'garaje';
type GarageTab = 'estado' | 'servicios' | 'historial';
type CheckupKey = 'bateria' | 'anticongelante' | 'distribucion' | 'neumaticos';
type Tono = 'emerald' | 'cyan' | 'rose' | 'sky';

export interface GarageCheckup {
  key: CheckupKey;
  titulo: string;
  valor: string;
  detalle: string;
  estado: string;
  pct: number;
  tono: Tono;
}

export interface GarageService {
  id: string;
  nombre: string;
  detalle: string;
  ultimo: string;
  nota: string;
  alerta: boolean;
  icono: 'aceite' | 'aire' | 'correa' | 'frenos';
}

export interface GarageHistory {
  id: string;
  titulo: string;
  fecha: string;
  km: string;
  lugar: string;
  trabajos: { nombre: string; monto: string }[];
  repuestos: { nombre: string; monto: string; img: string }[];
  alerta?: boolean;
}

export interface GarageVehicle {
  id: string;
  corto: string;
  titulo: string;
  patente: string;
  vin: string;
  motor: string;
  transmision: string;
  frenos: string;
  km: number;
  etiquetaMotor: string;
  img?: string;
  estado: string;
  specs: { motor: string; potencia: string; combustible: string; traccion: string; caja: string };
  checkups: GarageCheckup[];
  servicios: GarageService[];
  historial: GarageHistory[];
}

type Sheet =
  | 'vehicle' | 'tasks' | 'item' | 'combo' | 'addPart' | 'perfil'
  | 'garageAdd' | 'garageKm' | 'garageService' | 'garageCheckup' | 'garageNotif';

// Panel móvil del comprador (< 768px): estética Steve Jobs, selección de combo
// en 3 piezas, una sola barra fija (pedido + navegación) y anillo de progreso.
@Component({
  selector: 'app-comprador-movil',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #121212;
      /* Halo cálido decorativo al 8–12%: no compite con el texto (contraste AA) */
      background-image:
        radial-gradient(ellipse 85% 45% at 88% 4%, rgba(229, 125, 104, 0.12) 0%, transparent 72%),
        radial-gradient(ellipse 70% 50% at 6% 14%, rgba(245, 211, 179, 0.08) 0%, transparent 75%),
        radial-gradient(ellipse 90% 45% at 50% 100%, rgba(196, 114, 72, 0.10) 0%, transparent 78%);
      background-attachment: fixed;
      color: #F5F5F7;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Plus Jakarta Sans", sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .jobs-monolith {
      background: rgba(18, 17, 16, 0.94);
      backdrop-filter: blur(36px) saturate(180%);
      -webkit-backdrop-filter: blur(36px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow:
        0 20px 40px -10px rgba(50, 20, 10, 0.45),
        0 10px 25px -5px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.08),
        inset 0 1px 1px rgba(255, 255, 255, 0.22);
      border-radius: 1.5rem;
    }
    .jobs-dock {
      background: #121110;
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow:
        0 25px 50px -10px rgba(50, 20, 10, 0.55),
        0 10px 25px -5px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    /* ── Escala tipográfica única: 11 / 13 / 15 / 20 / 28 ───────────────── */
    .t-micro { font-size: 11px; line-height: 1.4; }
    .t-body  { font-size: 13px; line-height: 1.5; }
    .t-title { font-size: 15px; line-height: 1.3; }
    .t-price { font-size: 20px; line-height: 1.1; font-variant-numeric: tabular-nums; }
    .t-total { font-size: 28px; line-height: 1.05; font-variant-numeric: tabular-nums; }
    .num { font-variant-numeric: tabular-nums; }

    .card-selected {
      border: 1.5px solid #F5C342 !important;
      background: #221E14 !important;
      box-shadow: 0 4px 20px -2px rgba(245, 195, 66, 0.22), inset 0 1px 0 rgba(245, 195, 66, 0.15) !important;
    }
    .card-unselected {
      border: 1px solid #2C2C2C !important;
      background: #181818 !important;
    }
    .ring-glow {
      filter: drop-shadow(0 0 6px rgba(245, 195, 66, 0.45));
    }

    /* Plegado animado sin medir alturas, y contenido inerte cuando está cerrado */
    .part-body {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .part-body.open { grid-template-rows: 1fr; }
    .part-body > div { overflow: hidden; min-height: 0; }

    .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }

    .dock-wrap {
      padding-bottom: max(0.6rem, env(safe-area-inset-bottom));
      /* Tapa el contenido que asoma por debajo del dock redondeado */
      background: linear-gradient(to top, #14110E 0%, #14110E 72%, rgba(20, 17, 14, 0.94) 88%, rgba(20, 17, 14, 0) 100%);
    }
    .sheet-panel {
      animation: sheet-in 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      padding-bottom: calc(1.25rem + env(safe-area-inset-bottom));
    }
    .backdrop-in { animation: fade-in 0.2s ease; }
    @keyframes sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

    button:focus-visible,
    [role="radio"]:focus-visible {
      outline: 2px solid #F5C342;
      outline-offset: 2px;
    }
    .offer-card { padding: 12px; }

    @media (max-width: 380px) {
      .offer-card { padding-left: 10px; padding-right: 10px; }
      .dock-total { font-size: 20px; }
      .part-name { font-size: 14px; }
    }

    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
  `],
  template: `
    <div class="selection:bg-amber-400 selection:text-stone-950 min-h-screen p-3 sm:p-5 relative overflow-x-hidden">

      <!-- TOP BAR ZEN -->
      <header class="flex items-center justify-between py-2 text-white max-w-md mx-auto mb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-2xl bg-stone-900 border border-amber-400/40 p-1.5 flex items-center justify-center shadow-md">
            <img src="/logo.svg" alt="Toolbox Patagonia" class="w-full h-full object-contain" (error)="onImgFallback($event)">
          </div>
          <div>
            <h1 class="t-body font-black tracking-tight text-white uppercase drop-shadow-sm">Toolbox <span class="text-amber-400">Patagonia</span></h1>
            <p class="t-micro text-stone-400 font-semibold">{{ vista() === 'garaje' ? 'Mi Garaje Digital' : 'Consola Comprador' }}</p>
          </div>
        </div>

        <!-- ACCESOS RÁPIDOS (TAP TARGET 44x44) -->
        <div class="flex items-center gap-2">
          <button type="button" (click)="onBell()" class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-stone-900/80 border border-white/20 text-stone-200 hover:text-white flex items-center justify-center relative active:scale-95 transition cursor-pointer" title="Notificaciones" aria-label="Notificaciones">
            <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-2 right-2 ring-2 ring-black" aria-hidden="true"></span>
          </button>
          <button type="button" (click)="openPerfilSheet()" class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-amber-400 text-stone-950 font-bold t-body flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer" title="Mi cuenta" aria-label="Mi cuenta">
            {{ iniciales }}
          </button>
        </div>
      </header>

      <main class="space-y-3 max-w-md mx-auto">

        @if (vista() === 'pedidos') {

        <!-- 1. VEHÍCULO RESUMIDO -->
        <button type="button" (click)="openVehicleSheet()" class="jobs-monolith w-full text-left p-3 pb-3.5 text-white cursor-pointer active:scale-[0.99] transition hover:border-amber-400/40 flex items-center justify-between gap-2.5 group shadow-md">
          <span class="flex items-center gap-3 min-w-0 flex-1">
            <span class="relative w-11 h-11 rounded-xl overflow-hidden border border-white/20 bg-black/60 shrink-0 shadow-inner">
              <img [src]="vehicleImg" alt="" class="w-full h-full object-cover">
            </span>
            <span class="leading-tight min-w-0 flex-1 space-y-0.5 block">
              <span class="flex items-center gap-x-2 gap-y-1 flex-wrap">
                <span class="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-black t-micro tracking-wider">
                  AB 412 TX
                </span>
                <span class="t-title font-extrabold text-white truncate">VW Passat 2.0 TDI</span>
              </span>
              <span class="t-micro text-stone-300 flex items-center gap-1.5 truncate">
                <span class="text-emerald-400 font-bold">✓ Verificado (Trelew)</span>
                <span class="text-stone-400">· {{ comboCount() }}/{{ partsCatalog.length }} piezas</span>
              </span>
            </span>
          </span>
          <span class="text-stone-400 group-hover:text-amber-300 t-micro font-bold flex items-center gap-1 shrink-0">
            <span>Ficha</span>
            <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </span>
        </button>

        <!-- 2. PROGRESO DEL PEDIDO / TRACKING DE ENTREGA -->
        <button type="button" (click)="openTasks()" class="jobs-monolith w-full text-left p-3.5 text-white cursor-pointer active:scale-[0.99] transition border border-white/10 hover:border-[#F5C342]/40 bg-[#141210] shadow-lg group flex items-center justify-between gap-3.5">
          @if (confirmado()) {
            <!-- PEDIDO CERRADO: gráfico de progreso de entrega -->
            <span class="space-y-2 min-w-0 flex-1 block">
              <span class="flex items-center gap-2 flex-wrap">
                <span class="t-title font-bold text-white tracking-tight">Seguimiento del pedido</span>
                <span class="px-2 py-0.5 rounded-full t-micro font-bold border shrink-0"
                      [ngClass]="entregaFase() === 'entregado' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-amber-400/10 text-amber-300 border-amber-400/40'">
                  {{ entregaFase() === 'entregado' ? 'Entregado ✓' : entregaFase() === 'enCamino' ? 'En camino' : 'Cadete asignado' }}
                </span>
              </span>

              <!-- TIMELINE: Pago acreditado → En camino → Entregado -->
              <span class="block" role="img" [attr.aria-label]="'Entrega: paso ' + entregaPaso() + ' de 3'">
                <span class="grid items-center gap-x-1" style="grid-template-columns: auto 1fr auto 1fr auto;" aria-hidden="true">
                  <span class="w-[18px] h-[18px] rounded-full border flex items-center justify-center" [ngClass]="entregaDot(1)">
                    <svg class="w-3 h-3 stroke-[3.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </span>
                  <span class="h-[3px] rounded-full" [ngClass]="entregaLinea(2)"></span>
                  <span class="w-[18px] h-[18px] rounded-full border flex items-center justify-center" [ngClass]="entregaDot(2)">
                    @if (entregaPaso() >= 2) {
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M1 5h13v11H1zM14 9h4l3 3v4h-7M4.5 19a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zm11 0a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2z"></path></svg>
                    } @else {
                      <span class="t-micro font-black">2</span>
                    }
                  </span>
                  <span class="h-[3px] rounded-full" [ngClass]="entregaLinea(3)"></span>
                  <span class="w-[18px] h-[18px] rounded-full border flex items-center justify-center" [ngClass]="entregaDot(3)">
                    @if (entregaFase() === 'entregado') {
                      <svg class="w-3 h-3 stroke-[3.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    } @else {
                      <span class="t-micro font-black">3</span>
                    }
                  </span>
                </span>
                <span class="grid gap-x-1 mt-1" style="grid-template-columns: auto 1fr auto 1fr auto;" aria-hidden="true">
                  <span class="t-micro font-bold text-[10px] leading-tight text-center" [ngClass]="entregaLabelColor(1)">Pago</span>
                  <span></span>
                  <span class="t-micro font-bold text-[10px] leading-tight text-center" [ngClass]="entregaLabelColor(2)">En camino</span>
                  <span></span>
                  <span class="t-micro font-bold text-[10px] leading-tight text-center" [ngClass]="entregaLabelColor(3)">Entregado</span>
                </span>
              </span>

              <span class="t-micro text-stone-400 flex items-center gap-1.5 min-w-0">
                <svg aria-hidden="true" class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span class="truncate">{{ entregaFase() === 'entregado' ? 'Entregado ' + entregadoEn() + ' · PIN validado' : entregaEstimada() + ' · ' + destinoTexto() }}</span>
              </span>
            </span>
            <svg aria-hidden="true" class="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all shrink-0 stroke-[2.2] self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
            </svg>
          } @else {
            <span class="space-y-1 min-w-0 flex-1 block">
              <span class="flex items-center gap-2">
                <span class="t-title font-bold text-white tracking-tight">Progreso del pedido</span>
              </span>
              <span class="t-body text-stone-400 block">
                {{ comboComplete() ? '3 de 3 piezas elegidas' : comboCount() + ' de 3 piezas elegidas' }}
              </span>
              <span class="t-body font-bold block text-[#F5C342]">{{ nextStepLabel() }}</span>
            </span>

            <span class="flex items-center gap-3 shrink-0">
              <span class="relative w-[60px] h-[60px] flex items-center justify-center shrink-0">
                <svg aria-hidden="true" class="w-[60px] h-[60px] -rotate-90 ring-glow" viewBox="0 0 56 56">
                  <defs>
                    <linearGradient id="ringAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#FFD768"></stop>
                      <stop offset="100%" stop-color="#F5C342"></stop>
                    </linearGradient>
                  </defs>
                  <circle cx="28" cy="28" r="22" fill="#0C0B0A"></circle>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#26231F" stroke-width="4.5"></circle>
                  <circle cx="28" cy="28" r="22" fill="none" [attr.stroke]="ringColor()" stroke-width="4.5" stroke-linecap="round"
                          stroke-dasharray="138.23" [attr.stroke-dashoffset]="ringOffset()" class="transition-all duration-500"></circle>
                </svg>
                <span class="absolute inset-0 flex items-center justify-center select-none">
                  <span class="flex items-baseline leading-none">
                    <span class="t-price font-bold text-white">{{ taskPercent() }}</span>
                    <span class="text-[10px] font-bold ml-[1px] text-[#F5C342]">%</span>
                  </span>
                </span>
              </span>
              <svg aria-hidden="true" class="w-4 h-4 text-[#C9C4BD] group-hover:text-[#F5C342] group-hover:translate-x-0.5 transition-all shrink-0 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          }
        </button>

        <!-- TÍTULO DE SECCIÓN + CONTROL DE EXPANSIÓN -->
        <div class="flex items-center justify-between px-1 pt-1 gap-2">
          <h2 class="t-title text-white font-bold truncate">Tus repuestos</h2>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="t-micro text-stone-400 font-semibold whitespace-nowrap">{{ totalOfertas() }} ofertas</span>
            <button type="button" (click)="toggleAll()"
                    [attr.aria-expanded]="todoAbierto()"
                    class="t-micro font-bold rounded-full pl-2.5 pr-1.5 min-h-[44px] flex items-center gap-1 border transition active:scale-95 cursor-pointer"
                    [ngClass]="todoAbierto() ? 'bg-amber-400/15 border-amber-400/50 text-amber-300' : 'bg-white/[0.07] border-white/15 text-stone-200 hover:bg-white/10'">
              <span>{{ todoAbierto() ? 'Contraer todas' : 'Expandir todas' }}</span>
              <svg aria-hidden="true" class="w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200"
                   [ngClass]="todoAbierto() ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- 3. LISTADO PLEGABLE POR REPUESTO -->
        <div class="space-y-3.5">
          @for (part of partsCatalog; track part.key) {
            <section class="jobs-monolith text-white shadow-xl border border-white/10 overflow-hidden">
              <h3 class="m-0">
                <button type="button" (click)="togglePart(part.key)"
                        [attr.aria-expanded]="isPartOpen(part.key)"
                        [attr.aria-controls]="'part-' + part.key"
                        class="w-full text-left p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors select-none"
                        [ngClass]="isPartOpen(part.key) ? 'border-b border-white/10' : ''">
                  <span class="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <span class="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-stone-900 shrink-0 shadow-md">
                      <img [src]="part.img" alt="" class="w-full h-full object-cover">
                    </span>
                    <span class="min-w-0 flex-1 block">
                      <span class="flex items-center gap-1.5 flex-wrap">
                        <span class="t-title part-name font-extrabold text-white tracking-tight leading-snug">{{ part.name }}</span>
                        <span class="t-micro font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 whitespace-nowrap">{{ part.items.length }} ofertas</span>
                      </span>
                      <span class="t-micro text-stone-400 mt-1 flex items-center gap-1 min-w-0">
                        @if (isPartOpen(part.key)) {
                          <span class="truncate">{{ part.spec }}</span>
                        } @else if (selectedOf(part); as sel) {
                          <span class="text-emerald-400 font-bold shrink-0" aria-hidden="true">✓</span>
                          <span class="text-stone-200 truncate min-w-0">{{ sel.brand }}</span>
                          <span class="text-stone-500 shrink-0" aria-hidden="true">·</span>
                          <span class="text-stone-200 font-semibold shrink-0">{{ sel.price }}</span>
                          <span class="text-stone-400 shrink-0">({{ ciudadCorta(sel) }})</span>
                        } @else {
                          <span class="text-amber-300/90 font-bold truncate">Sin pieza elegida · tocá “Ver”</span>
                        }
                      </span>
                    </span>
                  </span>

                  <span class="shrink-0">
                    <span class="flex items-center gap-1 pl-2.5 pr-2 min-h-[36px] rounded-full border transition-all"
                          [ngClass]="isPartOpen(part.key) ? 'bg-amber-400 border-amber-300 text-stone-950' : (selectedOf(part) ? 'bg-white/10 border-white/20 text-stone-100' : 'bg-amber-400/10 border-amber-400/50 text-amber-300')">
                      <span class="t-micro font-black uppercase tracking-tight">{{ isPartOpen(part.key) ? 'Cerrar' : 'Ver' }}</span>
                      <svg aria-hidden="true" class="w-3.5 h-3.5 transition-transform duration-200 stroke-[2.5]"
                           [ngClass]="isPartOpen(part.key) ? 'rotate-180' : ''"
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </span>
                  </span>
                </button>
              </h3>

              <!-- CONTENIDO: CASAS DE REPUESTOS (animado, inerte al estar cerrado) -->
              <div class="part-body" [class.open]="isPartOpen(part.key)" [attr.id]="'part-' + part.key"
                   [attr.inert]="isPartOpen(part.key) ? null : ''">
                <div>
                  <div class="p-3 sm:p-3.5 space-y-2 bg-black/20" role="radiogroup" [attr.aria-label]="'Ofertas de ' + part.name">
                    @for (item of sortedItems(part); track item.id) {
                      <div role="radio"
                           [attr.aria-checked]="isSelected(part.key, item.id)"
                           [attr.tabindex]="0"
                           [attr.aria-label]="item.brand + ', ' + item.price + ', ' + ciudad(item) + (isSelected(part.key, item.id) ? ', en tu pedido. Tocá para quitar' : ', tocá para agregar')"
                           (click)="selectComboItem(part.key, item.id)"
                           (keydown)="onRowKey($event, part.key, item.id)"
                           [ngClass]="isSelected(part.key, item.id) ? 'card-selected' : 'card-unselected hover:border-stone-600'"
                           class="offer-card rounded-2xl cursor-pointer active:scale-[0.99] transition flex flex-col gap-2.5 group min-h-[64px]">

                        <!-- FILA 1: nivel de precio, ciudad obligatoria y acceso a la ficha -->
                        <div class="flex items-start justify-between gap-2 -mt-1 -mr-1">
                          <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                            @if (!item.isMadryn) {
                              <span class="px-2 py-0.5 rounded-full t-micro font-bold shrink-0"
                                    [ngClass]="isCheapest(part, item) ? 'bg-[#F5C342]/15 text-[#F5C342] border border-[#F5C342]/30' : 'bg-white/10 text-stone-300 border border-white/15'">
                                {{ isCheapest(part, item) ? '★ Más barata' : 'Intermedia' }}
                              </span>
                            }
                            <span class="px-2 py-0.5 rounded-full t-micro font-bold flex items-center gap-1 min-w-0"
                                  [ngClass]="item.isMadryn ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/30' : 'bg-white/[0.06] text-stone-300 border border-white/10'">
                              @if (item.isMadryn) {
                                <svg aria-hidden="true" class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM13 17V6h3l4 5v6M3 6h10v11"></path></svg>
                                <span class="truncate">{{ ciudad(item) }} · 65 km</span>
                              } @else {
                                <svg aria-hidden="true" class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span class="truncate">{{ ciudad(item) }}</span>
                              }
                            </span>
                          </div>

                          <button type="button" (click)="$event.stopPropagation(); openItemSheet(item, part)"
                                  class="t-micro font-bold text-stone-300 hover:text-white flex items-center gap-0.5 shrink-0 px-2 min-h-[44px] -my-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
                                  title="Ver ficha técnica del repuesto" [attr.aria-label]="'Ver ficha técnica de ' + item.brand">
                            <span>Ficha técnica</span>
                            <svg aria-hidden="true" class="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
                          </button>
                        </div>

                        <!-- FILA 2: marca + precio (todo el ancho para el nombre) -->
                        <div class="flex items-start justify-between gap-2.5">
                          <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            @if (isSelected(part.key, item.id)) {
                              <div class="w-5 h-5 rounded-full bg-[#F5C342] text-[#12100E] flex items-center justify-center shrink-0 shadow-sm" aria-hidden="true">
                                <svg class="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                              </div>
                            } @else {
                              <div class="w-5 h-5 rounded-full border border-[#666666] bg-transparent shrink-0 group-hover:border-[#F5C342]/60 transition-colors" aria-hidden="true"></div>
                            }
                            <h4 class="t-title font-bold text-white tracking-tight leading-snug group-hover:text-[#F5C342] transition-colors min-w-0">{{ item.brand }}</h4>
                          </div>
                          <span class="t-price font-bold shrink-0 pt-0.5" [ngClass]="isSelected(part.key, item.id) ? 'text-[#F5C342]' : 'text-white'">{{ item.price }}</span>
                        </div>

                        <!-- FILA 3: condición anónima del comercio + logística -->
                        <div class="flex items-start justify-between gap-2 t-micro">
                          <span class="text-stone-300 flex items-center gap-1 min-w-0">
                            <svg aria-hidden="true" class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span class="truncate">Stock hoy · Garantía 6 meses</span>
                          </span>
                          @if (item.isMadryn) {
                            <span class="text-right shrink-0">
                              <span class="text-amber-300 font-bold block whitespace-nowrap">{{ item.shippingFee }} envío</span>
                              <span class="text-stone-400 block whitespace-nowrap">{{ item.shippingEta }}</span>
                            </span>
                          } @else {
                            <span class="text-stone-400 shrink-0 whitespace-nowrap">Mostrador hoy</span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </section>
          }
        </div>

        } @else {

        <!-- ═══ GARAJE ═══ -->
        @if (garageVehicle(); as v) {

        <!-- 0. SELECTOR MULTIVEHÍCULO -->
        <section class="jobs-monolith p-2.5 text-white">
          <div class="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
            <span class="t-micro font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5 min-w-0">
              <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0" aria-hidden="true"></span>
              <span class="truncate">Mis autos guardados ({{ garageVehicles().length }})</span>
            </span>
            <button type="button" (click)="openGarageAdd()"
                    class="min-h-[44px] px-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black t-micro flex items-center gap-1 shadow-md shadow-amber-400/20 active:scale-95 transition cursor-pointer shrink-0">
              <svg aria-hidden="true" class="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
              <span>Sumar auto</span>
            </button>
          </div>

          <div class="flex gap-2 pt-2.5 overflow-x-auto no-scrollbar" role="group" aria-label="Mis vehículos">
            @for (car of garageVehicles(); track car.id) {
              <button type="button" (click)="seleccionarVehiculo(car.id)"
                      [attr.id]="'car-' + car.id"
                      [attr.aria-pressed]="car.id === v.id"
                      class="min-h-[52px] pl-2 pr-3 py-2 rounded-2xl flex items-center gap-2.5 shrink-0 transition active:scale-95 cursor-pointer border-2"
                      [ngClass]="car.id === v.id ? 'bg-gradient-to-r from-amber-400/20 to-amber-500/10 border-amber-400 shadow-lg shadow-amber-400/10' : 'bg-white/5 border-white/10 text-stone-300 hover:border-white/20'">
                <span class="w-8 h-8 rounded-lg overflow-hidden bg-stone-900 border border-white/20 shrink-0 flex items-center justify-center">
                  @if (car.img) {
                    <img [src]="car.img" alt="" class="w-full h-full object-cover">
                  } @else {
                    <svg aria-hidden="true" class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v4c0 .6.4 1 1 1h2m14 0a2 2 0 100 4 2 2 0 000-4zm-14 0a2 2 0 100 4 2 2 0 000-4z"></path>
                    </svg>
                  }
                </span>
                <span class="text-left leading-tight">
                  <span class="t-micro font-extrabold text-white block whitespace-nowrap">{{ car.corto }}</span>
                  <span class="t-micro font-semibold" [ngClass]="car.id === v.id ? 'text-amber-300' : 'text-stone-400'">{{ car.patente }}</span>
                </span>
                @if (car.id === v.id) {
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden="true"></span>
                }
              </button>
            }

            <button type="button" (click)="openGarageAdd()"
                    class="min-h-[52px] px-3 py-2 rounded-2xl border border-dashed border-amber-400/40 text-amber-300 flex items-center gap-2 shrink-0 transition active:scale-95 cursor-pointer hover:border-amber-400 hover:bg-amber-400/10">
              <span class="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black" aria-hidden="true">+</span>
              <span class="text-left leading-tight">
                <span class="t-micro font-bold text-white block whitespace-nowrap">Nuevo auto</span>
                <span class="t-micro text-amber-300/80">Carga manual</span>
              </span>
            </button>
          </div>
        </section>

        <!-- 1. HERO DEL VEHÍCULO ACTIVO -->
        <section class="jobs-monolith overflow-hidden text-white">

          <div class="p-2.5 bg-black/40 border-b border-white/10">
            <div class="flex items-center rounded-2xl bg-black/60 p-1 border border-white/15" role="group" aria-label="Secciones del vehículo">
              <button type="button" (click)="garageTab.set('estado')" [attr.aria-pressed]="garageTab() === 'estado'"
                      class="flex-1 min-h-[44px] px-2 rounded-xl t-micro font-bold transition cursor-pointer"
                      [ngClass]="garageTab() === 'estado' ? 'bg-[#F5C342] text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'">
                Estado
              </button>
              <button type="button" (click)="garageTab.set('servicios')" [attr.aria-pressed]="garageTab() === 'servicios'"
                      class="flex-1 min-h-[44px] px-2 rounded-xl t-micro font-bold transition cursor-pointer flex items-center justify-center gap-1"
                      [ngClass]="garageTab() === 'servicios' ? 'bg-[#F5C342] text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'">
                <svg aria-hidden="true" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path stroke-linecap="round" d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path></svg>
                <span>Servicios</span>
              </button>
              <button type="button" (click)="garageTab.set('historial')" [attr.aria-pressed]="garageTab() === 'historial'"
                      class="flex-1 min-h-[44px] px-2 rounded-xl t-micro font-bold transition cursor-pointer flex items-center justify-center gap-1"
                      [ngClass]="garageTab() === 'historial' ? 'bg-[#F5C342] text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'">
                <svg aria-hidden="true" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Historial</span>
              </button>
            </div>
          </div>

          <div class="p-3.5 bg-gradient-to-b from-[#1C1A17] to-[#12110F]">
            <div class="flex items-start gap-3">
              <div class="min-w-0 flex-1 space-y-1.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="px-2.5 py-0.5 rounded-lg bg-amber-300 text-stone-950 font-black t-micro tracking-wider">{{ v.patente }}</span>
                  @if (v.estado === 'A verificar') {
                    <span class="t-micro text-amber-300 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30 whitespace-nowrap">! Cédula pendiente</span>
                  } @else {
                    <span class="t-micro text-emerald-300 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">✓ Calce garantizado</span>
                  }
                </div>
                <h2 class="t-price font-black tracking-tight leading-tight">{{ v.titulo }}</h2>
                <p class="t-micro text-stone-400">
                  @if (garageTab() === 'estado') { Pasaporte digital y compatibilidad }
                  @if (garageTab() === 'servicios') { Servicios y mantenimiento preventivo }
                  @if (garageTab() === 'historial') { Historial y cronología }
                </p>

                <div class="flex items-center gap-2 flex-wrap pt-0.5">
                  <button type="button" (click)="openGarageKm()"
                          class="min-h-[44px] pl-2 pr-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-1.5 active:scale-95 transition cursor-pointer">
                    <span class="t-micro text-stone-400">KM</span>
                    <span class="t-body font-extrabold text-white num">{{ kmFmt(v.km) }}</span>
                    <span class="t-micro text-amber-300 underline font-bold">Editar</span>
                  </button>
                  <span class="t-micro font-bold flex items-center gap-1"
                        [ngClass]="v.estado === 'A verificar' ? 'text-amber-300' : 'text-emerald-300'">
                    <span class="w-2 h-2 rounded-full" [ngClass]="v.estado === 'A verificar' ? 'bg-amber-400' : 'bg-emerald-400'" aria-hidden="true"></span>
                    {{ v.estado }}
                  </span>
                </div>
              </div>

              <div class="w-28 shrink-0 relative pt-1">
                @if (v.img) {
                  <img [src]="v.img" [alt]="v.titulo" class="w-full h-auto object-cover rounded-xl shadow-lg border border-white/10">
                } @else {
                  <div class="w-full aspect-[4/3] rounded-xl shadow-lg border border-white/10 bg-black/50 flex items-center justify-center">
                    <svg aria-hidden="true" class="w-9 h-9 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v4c0 .6.4 1 1 1h2m14 0a2 2 0 100 4 2 2 0 000-4zm-14 0a2 2 0 100 4 2 2 0 000-4z"></path>
                    </svg>
                  </div>
                }
                @if (v.etiquetaMotor !== '—') {
                  <span class="absolute bottom-1 right-1 bg-stone-950/90 t-micro text-amber-300 px-1.5 py-0.5 rounded border border-white/10 font-bold">{{ v.etiquetaMotor }}</span>
                }
              </div>
            </div>

            <div class="mt-3 grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
              <div class="px-1.5 py-2 bg-black/40 text-center min-w-0">
                <span class="t-micro uppercase tracking-wide text-stone-500 block">Motor</span>
                <strong class="t-micro font-bold text-white block truncate">{{ v.specs.motor }}</strong>
              </div>
              <div class="px-1.5 py-2 bg-black/40 text-center min-w-0">
                <span class="t-micro uppercase tracking-wide text-stone-500 block">Potencia</span>
                <strong class="t-micro font-bold text-amber-300 block truncate">{{ v.specs.potencia }}</strong>
              </div>
              <div class="px-1.5 py-2 bg-black/40 text-center min-w-0">
                <span class="t-micro uppercase tracking-wide text-stone-500 block">Combustible</span>
                <strong class="t-micro font-bold text-emerald-400 block truncate">{{ v.specs.combustible }}</strong>
              </div>
              <div class="px-1.5 py-2 bg-black/40 text-center min-w-0">
                <span class="t-micro uppercase tracking-wide text-stone-500 block">Tracción</span>
                <strong class="t-micro font-bold text-white block truncate">{{ v.specs.traccion }}</strong>
              </div>
              <div class="px-1.5 py-2 bg-black/40 text-center min-w-0">
                <span class="t-micro uppercase tracking-wide text-stone-500 block">Caja</span>
                <strong class="t-micro font-bold text-white block truncate">{{ v.specs.caja }}</strong>
              </div>
              <div class="px-1.5 py-2 bg-black/40 text-center min-w-0">
                <span class="t-micro uppercase tracking-wide text-stone-500 block">Frenos</span>
                <strong class="t-micro font-bold text-white block truncate">{{ v.frenos.split('(')[0].trim() }}</strong>
              </div>
            </div>
          </div>

          <!-- PESTAÑA: ESTADO -->
          @if (garageTab() === 'estado') {
            <div class="p-3.5 space-y-3 border-t border-white/10 bg-black/30">
              <div class="flex items-center justify-between gap-2">
                <span class="t-micro font-bold text-stone-300 uppercase tracking-wider">Pasaporte de compatibilidad</span>
                @if (v.estado === 'A verificar') {
                  <span class="t-micro text-amber-300 font-bold bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30 shrink-0">! Sin validar</span>
                } @else {
                  <span class="t-micro text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">✓ Cédula verde</span>
                }
              </div>

              <div class="space-y-1.5">
                <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                  <span class="t-micro text-stone-400 shrink-0">Chasis (VIN)</span>
                  <span class="t-micro text-amber-300 font-bold tracking-wider text-right break-all">{{ v.vin }}</span>
                </div>
                <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                  <span class="t-micro text-stone-400 shrink-0">Código de motor</span>
                  <span class="t-micro text-emerald-400 font-bold text-right">{{ v.motor }}</span>
                </div>
                <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                  <span class="t-micro text-stone-400 shrink-0">Transmisión</span>
                  <span class="t-micro text-white text-right">{{ v.transmision }}</span>
                </div>
                <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                  <span class="t-micro text-stone-400 shrink-0">Sistema de frenos</span>
                  <span class="t-micro text-white text-right">{{ v.frenos }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-1">
                <button type="button" (click)="openGarageKm()"
                        class="min-h-[44px] px-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer">
                  <svg aria-hidden="true" class="w-3.5 h-3.5 text-amber-400 shrink-0 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
                  <span class="t-micro">Actualizar KM</span>
                </button>
                <button type="button" (click)="irAPedidos()"
                        class="min-h-[44px] px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-md">
                  <span class="t-micro">Buscar repuestos</span>
                  <svg aria-hidden="true" class="w-3.5 h-3.5 shrink-0 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          }

          <!-- PESTAÑA: SERVICIOS -->
          @if (garageTab() === 'servicios') {
            <div class="p-3.5 space-y-3 border-t border-white/10 bg-black/30">
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <span class="t-micro text-stone-400 uppercase tracking-wider block">Servicios del vehículo</span>
                  <h3 class="t-body font-bold text-white truncate">{{ v.corto }} · Mantenimientos</h3>
                </div>
                <span class="t-micro text-amber-300 font-bold bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full shrink-0">{{ v.servicios.length }} registros</span>
              </div>

              @if (v.servicios.length) {
                <div class="space-y-2">
                  @for (s of v.servicios; track s.id) {
                    <div class="p-2.5 rounded-2xl border flex items-center justify-between gap-2.5"
                         [ngClass]="s.alerta ? 'bg-[#2D1A1F] border-rose-500/40' : 'bg-[#172230] border-white/10'">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <span class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                              [ngClass]="s.icono === 'correa' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : s.icono === 'aire' ? 'bg-sky-400/15 text-sky-300 border-sky-400/30' : s.icono === 'frenos' ? 'bg-purple-400/15 text-purple-300 border-purple-400/30' : 'bg-amber-400/15 text-amber-300 border-amber-400/30'">
                          @switch (s.icono) {
                            @case ('aceite') {
                              <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z"></path></svg>
                            }
                            @case ('aire') {
                              <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8h10a3 3 0 10-3-3M3 12h14a3 3 0 11-3 3M3 16h7"></path></svg>
                            }
                            @case ('correa') {
                              <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><circle cx="12" cy="12" r="3"></circle><path stroke-linecap="round" d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path></svg>
                            }
                            @default {
                              <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path stroke-linecap="round" d="M12 4v2M12 18v2M4 12h2M18 12h2"></path></svg>
                            }
                          }
                        </span>
                        <div class="min-w-0">
                          <h4 class="t-body font-bold text-white leading-snug">{{ s.nombre }}</h4>
                          <span class="t-micro text-stone-400 block truncate">Último: {{ s.ultimo }} · {{ s.detalle }}</span>
                        </div>
                      </div>
                      <div class="text-right shrink-0">
                        <span class="t-micro font-bold px-2 py-0.5 rounded-full border inline-block"
                              [ngClass]="s.alerta ? 'text-rose-300 bg-rose-500/20 border-rose-500/40' : 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'">
                          {{ s.alerta ? 'Revisar' : 'Registrado' }}
                        </span>
                        <span class="t-micro text-stone-400 block pt-1">{{ s.nota }}</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="t-body text-stone-400">Todavía no hay servicios registrados para este vehículo.</p>
              }

              <button type="button" (click)="openGarageService()"
                      class="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black t-body flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-[0.98] transition cursor-pointer">
                <svg aria-hidden="true" class="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
                <span>Registrar nuevo servicio</span>
              </button>
            </div>
          }

          <!-- PESTAÑA: HISTORIAL -->
          @if (garageTab() === 'historial') {
            <div class="p-3.5 space-y-3 border-t border-white/10 bg-black/30">
              <div class="flex items-center justify-between gap-2">
                <span class="t-micro font-bold text-stone-300 uppercase tracking-wider">Historial de mantenimientos</span>
                <button type="button" (click)="openGarageService()"
                        class="t-micro text-amber-300 font-bold underline px-1 min-h-[44px] cursor-pointer shrink-0">
                  + Registrar
                </button>
              </div>

              @if (v.historial.length) {
                <div class="space-y-2">
                  @for (h of v.historial; track h.id) {
                    <div class="rounded-2xl border overflow-hidden"
                         [ngClass]="h.alerta ? 'bg-[#361A22] border-[#6E2A38]' : 'bg-[#172635] border-white/10'">
                      <button type="button" (click)="toggleHistory(h.id)" [attr.aria-expanded]="historyOpen() === h.id"
                              class="w-full text-left p-3 min-h-[56px] flex items-center justify-between gap-3 cursor-pointer">
                        <span class="min-w-0 flex-1">
                          <span class="t-body font-bold text-white block leading-snug">{{ h.titulo }}</span>
                          <span class="t-micro block truncate" [ngClass]="h.alerta ? 'text-rose-300' : 'text-stone-400'">{{ h.fecha }} · {{ h.km }} · {{ h.lugar }}</span>
                        </span>
                        <svg aria-hidden="true" class="w-4 h-4 shrink-0 stroke-[2.5] transition-transform"
                             [ngClass]="historyOpen() === h.id ? 'rotate-90 text-amber-300' : h.alerta ? 'text-rose-300' : 'text-stone-400'"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>

                      @if (historyOpen() === h.id) {
                        <div class="px-3 pb-3 space-y-2">
                          <div class="pt-2 border-t border-white/10 space-y-1">
                            <div class="flex items-center justify-between t-micro font-bold text-stone-400 uppercase tracking-wider">
                              <span>Trabajos ({{ h.trabajos.length }})</span>
                              <span>Subtotal</span>
                            </div>
                            @for (t of h.trabajos; track t.nombre) {
                              <div class="flex items-center justify-between gap-2 t-body">
                                <span class="text-stone-300 truncate">{{ t.nombre }}</span>
                                <strong class="text-white shrink-0">{{ t.monto }}</strong>
                              </div>
                            }
                          </div>

                          @if (h.repuestos.length) {
                            <div class="pt-2 border-t border-white/10 space-y-1.5">
                              <span class="t-micro font-bold text-stone-400 uppercase tracking-wider block">Repuestos ({{ h.repuestos.length }})</span>
                              <div class="grid grid-cols-2 gap-1.5">
                                @for (r of h.repuestos; track r.nombre) {
                                  <div class="p-1.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 min-w-0">
                                    <img [src]="r.img" alt="" class="w-7 h-7 rounded object-cover shrink-0 border border-white/10">
                                    <div class="min-w-0">
                                      <span class="t-micro font-bold text-white block leading-snug">{{ r.nombre }}</span>
                                      <span class="t-micro text-amber-300">{{ r.monto }}</span>
                                    </div>
                                  </div>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              } @else {
                <p class="t-body text-stone-400">Sin intervenciones registradas. Sumá la primera con “+ Registrar”.</p>
              }
            </div>
          }
        </section>

        <!-- 2. CHEQUEOS PREVENTIVOS -->
        <section class="jobs-monolith p-3.5 text-white space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2 gap-2">
            <span class="t-micro font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true"></span>
              Chequeos preventivos
            </span>
            <span class="t-micro text-stone-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 shrink-0">Tocá para editar</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            @for (c of v.checkups; track c.key) {
              <button type="button" (click)="openGarageCheckup(c.key)"
                      class="p-3 rounded-2xl bg-gradient-to-b border text-left active:scale-95 transition cursor-pointer space-y-2"
                      [ngClass]="tonoTarjeta(c.tono)">
                <span class="flex items-center justify-between gap-1">
                  <span class="flex items-center gap-1.5 min-w-0">
                    <span class="shrink-0" [ngClass]="tonoTexto(c.tono)">
                      @switch (c.key) {
                        @case ('bateria') {
                          <svg aria-hidden="true" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"></path></svg>
                        }
                        @case ('anticongelante') {
                          <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"></path></svg>
                        }
                        @case ('distribucion') {
                          <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><circle cx="12" cy="12" r="3"></circle><path stroke-linecap="round" d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path></svg>
                        }
                        @default {
                          <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3.5"></circle><path stroke-linecap="round" d="M12 3v4M12 17v4M3 12h4M17 12h4"></path></svg>
                        }
                      }
                    </span>
                    <span class="t-micro font-bold uppercase tracking-tight text-stone-300 truncate">{{ c.titulo }}</span>
                  </span>
                  <span class="t-micro text-stone-500 shrink-0">Editar</span>
                </span>

                <span class="block">
                  <span class="t-title font-black text-white block leading-none">{{ c.valor }}</span>
                  <span class="t-micro text-stone-400 block truncate pt-1">{{ c.detalle }}</span>
                </span>

                <span class="flex items-center gap-1.5 t-micro font-bold" [ngClass]="tonoTexto(c.tono)">
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="tonoBarra(c.tono)" aria-hidden="true"></span>
                  <span class="truncate">{{ c.estado }}</span>
                </span>

                <span class="block w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <span class="block h-full rounded-full" [ngClass]="tonoBarra(c.tono)" [style.width.%]="c.pct"></span>
                </span>
              </button>
            }
          </div>
        </section>

        <!-- 3. COTIZACIONES ACTIVAS -->
        <button type="button" (click)="irAPedidos()"
                class="jobs-monolith w-full text-left p-3.5 text-white flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99] transition">
          <span class="flex items-center gap-3 min-w-0">
            <span class="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 font-black flex items-center justify-center shadow-md shrink-0">
              <svg aria-hidden="true" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </span>
            <span class="min-w-0">
              <span class="t-body font-bold text-white group-hover:text-amber-300 transition-colors block">Cotizaciones activas en Trelew</span>
              <span class="t-micro text-stone-400 block truncate">Pastillas, filtro y discos · 3 comercios respondiendo</span>
            </span>
          </span>
          <svg aria-hidden="true" class="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
        </button>

        }
        }

        <!-- ESPACIADOR: deja scrollear el contenido por debajo de la barra fija -->
        <div [ngClass]="vista() === 'garaje' ? 'h-28' : 'h-44'" aria-hidden="true"></div>

      </main>

      <!-- BARRA FIJA ÚNICA: pedido + navegación -->
      <div class="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 dock-wrap">
        <div class="jobs-dock rounded-3xl overflow-hidden text-white">

          @if (vista() === 'pedidos') {
          <div class="px-3.5 pt-2">
            <div class="flex items-center justify-between gap-2">
              <span class="t-micro font-bold uppercase tracking-wider text-amber-300 whitespace-nowrap">
                {{ comboComplete() ? '3 de 3 piezas' : comboCount() + ' de 3 piezas' }}
              </span>
              <span class="t-micro truncate text-right">
                @if (hasMadryn()) {
                  <span class="text-stone-400">incluye&nbsp;</span>
                  <span class="text-amber-300 font-bold">{{ shippingFmt() }} envío</span>
                } @else if (comboComplete()) {
                  <span class="text-stone-400">ahorrás&nbsp;</span>
                  <span class="text-emerald-300 font-bold">{{ money(ahorroReferencia) }}</span>
                } @else {
                  <span class="text-stone-400">sin flete · mostrador Trelew</span>
                }
              </span>
            </div>

            <div class="flex items-center gap-3 pt-0.5 pb-2">
              <span class="t-total dock-total font-black text-white tracking-tight leading-none shrink-0">{{ totalFmt() }}</span>

              <button type="button" (click)="openComboSheet()"
                      class="flex-1 min-h-[46px] px-3.5 rounded-xl font-black t-body active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
                      [ngClass]="comboComplete() ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-stone-950 shadow-[0_6px_18px_rgba(245,195,66,0.3)]' : 'bg-[#F5C342]/10 border border-[#F5C342] text-[#F5C342]'">
                <span class="whitespace-nowrap">{{ confirmado() ? 'Ver pedido' : comboComplete() ? 'Pedir combo' : 'Completar' }}</span>
                <svg aria-hidden="true" class="w-4 h-4 stroke-[2.5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          <div class="h-px bg-white/10" aria-hidden="true"></div>
          }

          <nav class="flex items-stretch justify-between px-1 py-0.5" aria-label="Navegación del comprador">

            <button type="button" (click)="irAGaraje()" [attr.aria-current]="vista() === 'garaje' ? 'page' : null"
                    class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 group min-h-[46px] cursor-pointer"
                    [ngClass]="vista() === 'garaje' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-white'"
                    aria-label="Garage">
              <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v4c0 .6.4 1 1 1h2m14 0a2 2 0 100 4 2 2 0 000-4zm-14 0a2 2 0 100 4 2 2 0 000-4z"></path>
              </svg>
              <span class="t-micro tracking-tight" [ngClass]="vista() === 'garaje' ? 'font-bold' : 'font-semibold'">Garage</span>
            </button>

            <button type="button" (click)="irAPedidos()" [attr.aria-current]="vista() === 'pedidos' ? 'page' : null"
                    class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 min-h-[46px] cursor-pointer"
                    [ngClass]="vista() === 'pedidos' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-white'"
                    aria-label="Pedidos activos">
              <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <span class="t-micro tracking-tight" [ngClass]="vista() === 'pedidos' ? 'font-bold' : 'font-semibold'">Pedidos</span>
            </button>

            <button type="button" (click)="openAddPartSheet()" class="flex-1 flex items-center justify-center min-h-[46px] cursor-pointer" title="Nueva consulta de repuesto" aria-label="Nueva consulta de repuesto">
              <span class="w-11 h-11 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-stone-950 flex items-center justify-center shadow-md active:scale-95 transition-transform">
                <svg aria-hidden="true" class="w-5 h-5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
                </svg>
              </span>
            </button>

            <button type="button" (click)="irAConsultas()" class="flex-1 flex flex-col items-center justify-center gap-0.5 text-stone-400 hover:text-white transition-all active:scale-90 group min-h-[46px] cursor-pointer" aria-label="Consultas">
              <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <span class="t-micro font-semibold tracking-tight">Consultas</span>
            </button>

            <button type="button" (click)="irAFacturacion()" class="flex-1 flex flex-col items-center justify-center gap-0.5 text-stone-400 hover:text-white transition-all active:scale-90 group min-h-[46px] cursor-pointer" aria-label="Facturas">
              <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path>
              </svg>
              <span class="t-micro font-semibold tracking-tight">Facturas</span>
            </button>

          </nav>
        </div>
      </div>

      <!-- BOTTOM SHEET -->
      @if (activeSheet()) {
        <div (click)="closeSheet()" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 backdrop-in" aria-hidden="true"></div>

        <div #sheetPanel
             role="dialog"
             aria-modal="true"
             aria-labelledby="sheet-title"
             class="fixed bottom-0 inset-x-0 z-50 mx-auto max-w-md bg-[#141210] border-t border-white/15 rounded-t-3xl p-5 space-y-4 sheet-panel shadow-2xl">
          <div class="w-12 h-1 bg-white/20 rounded-full mx-auto" aria-hidden="true"></div>

          <div class="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
            <h3 id="sheet-title" class="t-title font-extrabold text-white">
              @if (activeSheet() === 'vehicle') { Ficha del vehículo }
              @if (activeSheet() === 'tasks') { Seguimiento del pedido }
              @if (activeSheet() === 'item') { {{ selectedItem()?.brand }} }
              @if (activeSheet() === 'combo') { Tu pedido }
              @if (activeSheet() === 'addPart') { Nueva pieza para cotizar }
              @if (activeSheet() === 'perfil') { Mi cuenta }
              @if (activeSheet() === 'garageAdd') { Sumar vehículo al garaje }
              @if (activeSheet() === 'garageKm') { Actualizar kilometraje }
              @if (activeSheet() === 'garageService') { Registrar servicio }
              @if (activeSheet() === 'garageCheckup') { {{ checkupActivo()?.titulo }} }
              @if (activeSheet() === 'garageNotif') { Centro de alertas }
            </h3>
            <button #sheetClose type="button" (click)="closeSheet()" class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/10 text-stone-300 flex items-center justify-center hover:text-white cursor-pointer shrink-0" title="Cerrar" aria-label="Cerrar">
              <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="space-y-3 max-h-[70dvh] overflow-y-auto overscroll-contain">

            <!-- SHEET VEHÍCULO -->
            @if (activeSheet() === 'vehicle') {
              <div class="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2.5">
                <div class="flex justify-between gap-3"><span class="t-body text-stone-400">Dominio</span><span class="t-body text-amber-300 font-bold">AB 412 TX</span></div>
                <div class="flex justify-between gap-3"><span class="t-body text-stone-400">Marca</span><span class="t-body text-white">Volkswagen</span></div>
                <div class="flex justify-between gap-3"><span class="t-body text-stone-400">Modelo</span><span class="t-body text-white text-right">Passat B6 Sedán 2.0 TDI</span></div>
                <div class="flex justify-between gap-3"><span class="t-body text-stone-400">Chasis</span><span class="t-body text-amber-300 font-bold">WVWZZZ3CZ6P108422</span></div>
                <div class="flex justify-between gap-3"><span class="t-body text-stone-400">Motor</span><span class="t-body text-white">BKP 140 CV (16V)</span></div>
              </div>
              <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 t-body">
                ✓ Verificado contra cédula verde, seccional Trelew.
              </div>
              <button type="button" (click)="closeSheet()" class="w-full min-h-[44px] rounded-xl bg-white/10 text-white font-bold t-body cursor-pointer">
                Cerrar ficha
              </button>
            }

            <!-- SHEET TAREAS -->
            @if (activeSheet() === 'tasks') {

              <!-- CONFIRMADO → TRACKING DE ENTREGA -->
              @if (confirmado()) {
              <div class="space-y-3">
                <div class="p-3.5 rounded-2xl border flex items-center justify-between gap-3"
                     [ngClass]="entregaFase() === 'entregado' ? 'bg-gradient-to-r from-emerald-500/15 to-white/5 border-emerald-500/40' : 'bg-gradient-to-r from-amber-500/15 to-white/5 border-[#F5C342]/40'">
                  <div class="space-y-1 min-w-0">
                    <span class="t-micro font-bold uppercase tracking-wider" [ngClass]="entregaFase() === 'entregado' ? 'text-emerald-300' : 'text-amber-300'">Tracking de entrega</span>
                    <h4 class="t-title font-black text-white">{{ entregaFase() === 'entregado' ? '¡Entregado con éxito!' : entregaFase() === 'enCamino' ? 'En camino al destino' : 'Cadete asignado' }}</h4>
                    <p class="t-body text-stone-300">{{ destinoTexto() }} · {{ entregaFase() === 'entregado' ? 'recibido ' + entregadoEn() : entregaEstimada() }}</p>
                  </div>
                  <div class="w-12 h-12 rounded-full bg-black/80 border-2 flex items-center justify-center font-black t-body shrink-0 num"
                       [ngClass]="entregaFase() === 'entregado' ? 'border-emerald-500 text-emerald-300' : 'border-amber-400 text-amber-300'">
                    {{ entregaPaso() }}/3
                  </div>
                </div>

                <!-- HITOS DEL ENVÍO -->
                <ol class="space-y-0 pt-1">
                  <li class="relative flex items-start gap-3 pb-5">
                    <span class="absolute left-[13px] top-7 bottom-1 w-[2px] rounded-full" [ngClass]="entregaPaso() >= 2 ? 'bg-emerald-500/60' : 'bg-white/10'" aria-hidden="true"></span>
                    <span class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0" aria-hidden="true">
                      <svg class="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    </span>
                    <span class="min-w-0 flex-1 space-y-0.5">
                      <span class="flex items-center justify-between gap-2">
                        <span class="t-body font-bold text-white">Pago acreditado y stock reservado</span>
                        <span class="t-micro text-emerald-300 font-bold shrink-0 text-right">{{ entregaMomento(1) }}</span>
                      </span>
                      <span class="t-micro text-stone-400 leading-snug block">Las 3 casas confirmaron disponibilidad del repuesto.</span>
                    </span>
                  </li>

                  <li class="relative flex items-start gap-3 pb-5">
                    <span class="absolute left-[13px] top-7 bottom-1 w-[2px] rounded-full" [ngClass]="entregaFase() === 'entregado' ? 'bg-emerald-500/60' : 'bg-white/10'" aria-hidden="true"></span>
                    <span class="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" [ngClass]="entregaPaso() >= 2 ? (entregaFase() === 'entregado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-400/20 text-amber-300') : 'bg-white/10 text-stone-400'" aria-hidden="true">
                      @if (entregaPaso() >= 2) {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M1 5h13v11H1zM14 9h4l3 3v4h-7M4.5 19a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zm11 0a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2z"></path></svg>
                      } @else {
                        <span class="t-body font-black">2</span>
                      }
                    </span>
                    <span class="min-w-0 flex-1 space-y-0.5">
                      <span class="flex items-center justify-between gap-2">
                        <span class="t-body font-bold text-white">Cadete Ruta 3 retira y viaja</span>
                        <span class="t-micro font-bold shrink-0 text-right" [ngClass]="entregaPaso() >= 2 ? 'text-amber-300' : 'text-stone-500'">{{ entregaMomento(2) }}</span>
                      </span>
                      <span class="t-micro text-stone-400 leading-snug block">Sin vueltas: retira cerrado en el comercio y viaja directo a {{ destinoTexto() }}.</span>
                    </span>
                  </li>

                  <li class="flex items-start gap-3">
                    <span class="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" [ngClass]="entregaFase() === 'entregado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-stone-400'" aria-hidden="true">
                      @if (entregaFase() === 'entregado') {
                        <svg class="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      } @else {
                        <span class="t-body font-black">3</span>
                      }
                    </span>
                    <span class="min-w-0 flex-1 space-y-0.5">
                      <span class="flex items-center justify-between gap-2">
                        <span class="t-body font-bold text-white">Entrega con PIN</span>
                        <span class="t-micro font-bold shrink-0 text-right" [ngClass]="entregaFase() === 'entregado' ? 'text-emerald-300' : 'text-stone-500'">{{ entregaMomento(3) }}</span>
                      </span>
                      <span class="t-micro text-stone-400 leading-snug block">El cadete valida tus 4 dígitos contra la bolsa antes de entregártela.</span>
                    </span>
                  </li>
                </ol>

                <!-- RESUMEN DE LA ENTREGA -->
                <div class="p-3 rounded-2xl bg-black/60 border border-white/10 t-body space-y-1.5">
                  <div class="flex justify-between gap-2"><span class="text-stone-400">Total pagado</span><span class="text-emerald-300 font-bold shrink-0">{{ totalFmt() }}</span></div>
                  <div class="flex justify-between gap-2"><span class="text-stone-400">Destino</span><span class="text-white shrink-0 text-right truncate min-w-0">{{ destinoTexto() }}</span></div>
                  <div class="flex justify-between gap-2"><span class="text-stone-400">PIN de entrega</span><span class="text-amber-300 font-bold shrink-0 tracking-[0.25em] tabular-nums">{{ pin() }}</span></div>
                </div>

                <!-- DEMO: avance manual del cadete -->
                @if (entregaFase() !== 'entregado') {
                  <button type="button" (click)="avanzarEntrega()" class="w-full min-h-[44px] rounded-xl border border-dashed border-amber-400/40 text-amber-300/90 t-micro font-bold hover:text-amber-200 hover:border-amber-400/70 transition cursor-pointer">
                    {{ entregaFase() === 'asignando' ? 'Simular: el cadete salió con el paquete (demo)' : 'Simular: entrega completada con PIN (demo)' }}
                  </button>
                } @else {
                  <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center t-body font-bold text-emerald-300">✓ Entrega confirmada · ¡Gracias por tu compra!</div>
                }

                <button type="button" (click)="closeSheet()" class="w-full min-h-[48px] rounded-2xl bg-[#F5C342] text-[#12100E] font-black t-body active:scale-[0.98] transition shadow-lg shadow-[#F5C342]/20 flex items-center justify-center gap-2 cursor-pointer">
                  <span>Volver al pedido</span>
                  <svg aria-hidden="true" class="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>

              } @else {
              <div class="space-y-3">
                <div class="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-white/5 border border-[#F5C342]/40 flex items-center justify-between gap-3">
                  <div class="space-y-1">
                    <span class="t-micro font-bold text-amber-300 uppercase tracking-wider">Estado actual</span>
                    <h4 class="t-title font-black text-white">{{ confirmado() ? 'Envío asignado' : '3 de 4 tareas completadas' }}</h4>
                    <p class="t-body text-stone-300">{{ confirmado() ? 'Solo falta retirar o recibir el pedido.' : 'Falta confirmar tu selección de repuestos.' }}</p>
                  </div>
                  <div class="w-12 h-12 rounded-full bg-black/80 border-2 flex items-center justify-center font-black t-body shrink-0 num"
                       [ngClass]="confirmado() ? 'border-[#2ECC71] text-[#2ECC71]' : 'border-[#F5C342] text-amber-300'">
                    {{ taskPercent() }}%
                  </div>
                </div>

                <div class="space-y-2">
                  <p class="t-micro font-bold text-stone-400 uppercase tracking-wider">Pasos</p>

                  <div class="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3">
                    <div class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center t-body font-black shrink-0 mt-0.5" aria-hidden="true">✓</div>
                    <div class="min-w-0 flex-1 space-y-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="t-body font-bold text-white">1. Datos del auto y chasis</span>
                        <span class="t-micro px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">Listo</span>
                      </div>
                      <p class="t-micro text-stone-300 leading-snug">VW Passat 2.0 TDI (chasis WVWZZZ3C…). Calce garantizado con cédula verde de Trelew.</p>
                    </div>
                  </div>

                  <div class="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3">
                    <div class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center t-body font-black shrink-0 mt-0.5" aria-hidden="true">✓</div>
                    <div class="min-w-0 flex-1 space-y-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="t-body font-bold text-white">2. Cotizaciones de casas</span>
                        <span class="t-micro px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">{{ totalOfertas() }} recibidas</span>
                      </div>
                      <p class="t-micro text-stone-300 leading-snug">Precios en mostrador de Trelew y envíos express Ruta 3 desde Puerto Madryn.</p>
                    </div>
                  </div>

                  <div class="p-3 rounded-2xl bg-black/60 border flex items-start gap-3"
                       [ngClass]="comboComplete() ? 'border-emerald-500/40' : 'border-[#F5C342]/50 bg-amber-400/5'">
                    <div class="w-7 h-7 rounded-xl flex items-center justify-center t-body font-black shrink-0 mt-0.5"
                         [ngClass]="comboComplete() ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#F5C342]/20 text-[#F5C342]'"
                         aria-hidden="true">
                      {{ comboComplete() ? '✓' : '·' }}
                    </div>
                    <div class="min-w-0 flex-1 space-y-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="t-body font-bold text-white">3. Elegir las 3 piezas</span>
                        <span class="t-micro px-2 py-0.5 rounded-full font-bold border shrink-0"
                              [ngClass]="comboComplete() ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-400/20 text-[#F5C342] border-[#F5C342]/40'">
                          {{ comboComplete() ? 'Listo' : 'En curso' }}
                        </span>
                      </div>
                      <p class="t-micro text-stone-300 leading-snug">{{ comboCount() }} de 3 piezas elegidas. Usá “Pedir combo” para reservar el stock.</p>
                    </div>
                  </div>

                  <div class="p-3 rounded-2xl bg-black/60 border border-white/15 space-y-2.5">
                    <div class="flex items-start gap-3">
                      <div class="w-7 h-7 rounded-xl bg-white/10 text-stone-200 flex items-center justify-center t-body font-black shrink-0 mt-0.5" aria-hidden="true">4</div>
                      <div class="min-w-0 flex-1 space-y-1">
                        <div class="flex items-center justify-between gap-2">
                          <span class="t-body font-bold text-white">4. Avisos del pedido</span>
                          <span class="t-micro px-2 py-0.5 rounded-full bg-white/10 text-stone-300 font-bold border border-white/15 shrink-0">Activo</span>
                        </div>
                        <p class="t-micro text-stone-300 leading-snug">Te avisamos por WhatsApp cuando el repuesto esté listo para retirar o en viaje.</p>
                      </div>
                    </div>

                    <div class="space-y-1.5 pt-2 border-t border-white/10">
                      <label class="flex items-center justify-between gap-3 p-2 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer">
                        <span class="min-w-0">
                          <span class="t-body text-white font-bold block">Avisar por WhatsApp</span>
                          <span class="t-micro text-stone-400">+54 9 280 441-2345 (Trelew)</span>
                        </span>
                        <input type="checkbox" checked class="w-5 h-5 accent-[#F5C342] rounded shrink-0">
                      </label>

                      <label class="flex items-center justify-between gap-3 p-2 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer">
                        <span class="min-w-0">
                          <span class="t-body text-white font-bold block">Aviso de salida del cadete</span>
                          <span class="t-micro text-stone-400">Ubicación en vivo en el mapa</span>
                        </span>
                        <input type="checkbox" checked class="w-5 h-5 accent-[#F5C342] rounded shrink-0">
                      </label>
                    </div>
                  </div>
                </div>

                <button type="button" (click)="closeSheet()" class="w-full min-h-[48px] rounded-2xl bg-[#F5C342] text-[#12100E] font-black t-body active:scale-[0.98] transition shadow-lg shadow-[#F5C342]/20 flex items-center justify-center gap-2 cursor-pointer">
                  <span>Continuar con mi selección</span>
                  <svg aria-hidden="true" class="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
              }
            }

            <!-- SHEET DETALLE DE REPUESTO -->
            @if (activeSheet() === 'item' && selectedItem() && selectedParentPart()) {
              <div class="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3">
                <div class="w-14 h-14 rounded-xl overflow-hidden border border-white/20 bg-stone-900 shrink-0">
                  <img [src]="selectedParentPart()!.img" [alt]="selectedItem()!.brand" class="w-full h-full object-cover">
                </div>
                <div class="min-w-0">
                  <span class="px-2 py-0.5 rounded t-micro font-black"
                        [ngClass]="selectedItem()!.isMadryn ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30' : 'bg-white/10 text-stone-300 border border-white/10'">
                    {{ selectedItem()!.isMadryn ? 'Pto. Madryn · 65 km' : 'Trelew' }}
                  </span>
                  <h4 class="t-title text-white font-extrabold truncate mt-1">{{ selectedItem()!.brand }}</h4>
                  <p class="t-micro text-stone-400 truncate">{{ selectedParentPart()!.name }}</p>
                </div>
              </div>

              <div class="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                <div class="flex justify-between items-center pb-2 border-b border-white/10 gap-2">
                  <span class="t-body text-stone-200 font-bold flex items-center gap-1.5 min-w-0">
                    <svg aria-hidden="true" class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="truncate">Comercio verificado</span>
                  </span>
                  <span class="t-micro text-stone-400 shrink-0">Garantía 6 meses</span>
                </div>

                <div class="space-y-1.5 pt-1">
                  <div class="flex justify-between gap-2"><span class="t-body text-stone-400">Precio repuesto</span><span class="t-body text-white font-bold">{{ selectedItem()!.price }}</span></div>
                  @if (selectedItem()!.isMadryn) {
                    <div class="flex justify-between gap-2 py-1.5 border-b border-white/5">
                      <span class="t-body text-stone-400">Envío cadete Ruta 3 · {{ selectedItem()!.shippingEta }}</span>
                      <span class="t-body text-stone-200 font-bold shrink-0">{{ selectedItem()!.shippingFee }}</span>
                    </div>
                    <div class="flex justify-between items-baseline gap-2 pt-2">
                      <span class="t-body text-white font-bold">Total entregado en Trelew</span>
                      <span class="t-price text-amber-300 font-black shrink-0">{{ money(itemTotal(selectedItem()!)) }}</span>
                    </div>
                  } @else {
                    <div class="flex justify-between gap-2 py-1.5 border-b border-white/5">
                      <span class="t-body text-stone-400">Retiro</span>
                      <span class="t-body text-emerald-300 font-bold shrink-0">{{ selectedItem()!.deliverySub }}</span>
                    </div>
                    <div class="flex justify-between items-baseline gap-2 pt-2">
                      <span class="t-body text-white font-bold">Total en mostrador</span>
                      <span class="t-price text-amber-300 font-black shrink-0">{{ selectedItem()!.price }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <p class="t-body text-stone-300 leading-relaxed">{{ selectedItem()!.desc }}</p>
                <p class="t-micro text-stone-300 bg-black/50 p-2.5 rounded-xl border border-white/5">
                  <strong class="text-amber-300">Ficha técnica:</strong> {{ selectedItem()!.specs }}
                </p>
              </div>

              <div class="space-y-2 pt-1">
                <button type="button" (click)="reservar()" class="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-extrabold t-body active:scale-[0.98] transition shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer">
                  {{ selectedItem()!.isMadryn ? 'Reservar con cadete Ruta 3 ›' : 'Reservar en mostrador Trelew ›' }}
                </button>
                <button type="button" (click)="closeSheet()" class="w-full min-h-[44px] text-stone-400 hover:text-white t-body cursor-pointer">
                  Volver a la lista
                </button>
              </div>
            }

            <!-- WIZARD DE PEDIDO: Selección → Destino → Velocidad → Transferencia → Validación → Confirmado -->
            @if (activeSheet() === 'combo') {
              <div class="space-y-3">
                <!-- STEPPER: 6 pasos del flujo logístico -->
                <div class="flex items-center justify-between gap-3">
                  <span class="t-micro font-bold text-white uppercase tracking-tight truncate">{{ faseTitulo() }}</span>
                  <div class="flex items-center gap-1 shrink-0" aria-hidden="true">
                    @for (paso of [1, 2, 3, 4, 5, 6]; track paso) {
                      <span class="h-1.5 rounded-full transition-all duration-300"
                            [ngClass]="paso <= pasoWizard() ? 'w-4 bg-amber-400' : 'w-2 bg-white/15'"></span>
                    }
                  </div>
                </div>

                @if (envioFase() === 'resumen') {
                <div class="flex items-center justify-between t-micro pb-0.5 text-stone-400 gap-2">
                  <span>Vehículo: <strong class="text-white">VW Passat 2.0 TDI (AB 412 TX)</strong></span>
                  <span class="text-stone-200 font-bold shrink-0">{{ comboCount() ? '✓ ' + comboCount() + (comboCount() === 1 ? ' pieza' : ' piezas') : 'Sin piezas' }}</span>
                </div>
                @if (congelarSeg() > 0) {
                  <div class="flex items-center gap-2 t-micro text-amber-300 bg-amber-400/5 border border-amber-400/25 rounded-xl px-3 py-2">
                    <svg aria-hidden="true" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Precios congelados por <strong>{{ congelarTexto() }}</strong> min: las casas ya reservaron el stock.</span>
                  </div>
                }

                <div class="space-y-2.5">
                  @if (trelewItems().length) {
                    <div class="p-3 rounded-2xl bg-[#181818] border border-white/10 space-y-2">
                      <div class="flex items-center justify-between pb-1.5 border-b border-white/10 gap-2">
                        <span class="t-micro font-bold text-white uppercase tracking-tight truncate">Retiro en mostrador · Trelew</span>
                        <span class="t-micro text-emerald-300 shrink-0">Hoy hasta 19:30</span>
                      </div>

                      <div class="space-y-2 pt-0.5">
                        @for (row of trelewItems(); track row.item.id) {
                          <div class="p-3 rounded-xl bg-black/40 border border-white/5">
                            <span class="t-micro uppercase tracking-wider text-stone-400 block truncate">{{ row.part.name }}</span>
                            <div class="flex items-baseline justify-between gap-3 mt-1">
                              <h5 class="t-title font-bold text-white leading-tight min-w-0">{{ row.item.brand }}</h5>
                              <span class="t-title font-extrabold text-white shrink-0 tabular-nums leading-tight">{{ row.item.price }}</span>
                            </div>
                            <div class="flex items-center justify-between gap-2 mt-1.5">
                              <span class="t-micro text-stone-400 truncate">Comercio verificado</span>
                              <span class="t-micro text-stone-400 shrink-0">Mostrador hoy</span>
                            </div>
                          </div>
                        }
                      </div>

                      <div class="flex items-center justify-between pt-1.5 border-t border-white/5 t-body gap-2">
                        <span class="text-stone-400">Subtotal ({{ trelewItems().length }} {{ trelewItems().length === 1 ? 'pieza' : 'piezas' }})</span>
                        <span class="text-white font-bold shrink-0">{{ money(trelewSubtotal()) }}</span>
                      </div>
                    </div>
                  }

                  @if (madrynItems().length) {
                    <div class="p-3 rounded-2xl bg-[#181818] border border-white/10 space-y-2">
                      <div class="flex items-center justify-between pb-1.5 border-b border-white/10 gap-2">
                        <span class="t-micro font-bold text-white uppercase tracking-tight truncate">Cadete Ruta 3 · Pto. Madryn</span>
                        <span class="t-micro text-stone-300 shrink-0">~1h 15m</span>
                      </div>

                      <div class="space-y-2 pt-0.5">
                        @for (row of madrynItems(); track row.item.id) {
                          <div class="p-3 rounded-xl bg-black/40 border border-white/5">
                            <span class="t-micro uppercase tracking-wider text-stone-400 block truncate">{{ row.part.name }}</span>
                            <div class="flex items-baseline justify-between gap-3 mt-1">
                              <h5 class="t-title font-bold text-white leading-tight min-w-0">{{ row.item.brand }}</h5>
                              <span class="t-title font-extrabold text-white shrink-0 tabular-nums leading-tight">{{ row.item.price }}</span>
                            </div>
                            <div class="flex items-center gap-1.5 mt-1.5 t-micro text-stone-400">
                              <span class="truncate">Comercio verificado</span>
                              <span class="text-stone-600 shrink-0" aria-hidden="true">·</span>
                              <span class="shrink-0 text-stone-500">cadete Ruta 3</span>
                            </div>
                          </div>
                        }
                      </div>

                      <div class="flex items-center justify-between gap-2 pt-1.5 border-t border-white/5 t-body">
                        <span class="text-stone-400">Envío consolidado · un solo flete para las {{ madrynItems().length }}</span>
                        <span class="text-white font-bold shrink-0">{{ money(madrynFleteBase()) }}</span>
                      </div>
                    </div>
                  }
                  @if (comboCount() === 0) {
                    <div class="p-3 rounded-2xl bg-[#181818] border border-dashed border-amber-400/40 space-y-1">
                      <p class="t-body font-bold text-white">Todavía no hay piezas en el pedido</p>
                      <p class="t-micro text-stone-400 leading-snug">Cerrá este resumen y tocá una oferta para volver a sumarla. El total se actualiza al instante.</p>
                    </div>
                  }
                </div>

                <div class="p-3.5 rounded-2xl bg-[#181818] border border-white/10 space-y-2">
                  <div class="flex justify-between items-center t-body text-stone-300 gap-2">
                    <span>Subtotal repuestos ({{ comboCount() }})</span>
                    <span class="text-white font-bold shrink-0">{{ money(comboSubtotal()) }}</span>
                  </div>
                  <div class="flex justify-between items-center t-body text-stone-300 gap-2">
                    <span>Flete cadete Ruta 3 · {{ velocidad() === 'urgente' ? 'urgente 2x' : 'programado 1x' }}</span>
                    <span class="shrink-0" [ngClass]="comboShipping() > 0 ? 'text-stone-100 font-bold' : 'text-stone-400'">{{ shippingFmt() }}</span>
                  </div>
                  <div class="flex justify-between items-end border-t border-white/10 pt-2.5 gap-2">
                    <div>
                      <span class="t-micro uppercase tracking-wider text-stone-400 block">Total a transferir</span>
                      <span class="t-micro text-stone-500">Precios finales con IVA</span>
                    </div>
                    <span class="t-total font-black text-[#F5C342] shrink-0">{{ totalFmt() }}</span>
                  </div>
                </div>

                <!-- CTA: congelar precios y continuar al envío -->
                <div class="space-y-2 pt-1">
                  <div class="p-3 rounded-xl bg-amber-400/5 border border-amber-400/25 t-micro text-amber-200 flex items-start gap-2">
                    <svg aria-hidden="true" class="w-4 h-4 shrink-0 mt-0.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Al tocar <strong class="text-white">Continuar al envío</strong>, los precios quedan congelados 20 minutos y el stock se reserva al confirmar.</span>
                  </div>

                  <button type="button" (click)="irAlEnvio()"
                          [disabled]="comboCount() === 0"
                          [ngClass]="comboCount() === 0 ? 'bg-white/10 text-stone-400 cursor-not-allowed' : 'bg-[#F5C342] text-[#12100E] shadow-lg shadow-[#F5C342]/25 active:scale-[0.98] cursor-pointer'"
                          class="w-full min-h-[48px] rounded-2xl font-black t-body transition flex items-center justify-center gap-1.5">
                    <span class="whitespace-nowrap">{{ comboCount() === 0 ? 'Elegí al menos una pieza' : (congelarSeg() > 0 ? 'Precios congelados · ' + congelarTexto() : 'Continuar al envío') }}</span>
                    <svg aria-hidden="true" class="w-4 h-4 stroke-[2.5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
                  </button>

                  <button type="button" (click)="closeSheet()" class="w-full min-h-[44px] text-stone-400 hover:text-white t-body cursor-pointer">
                    Seguir ajustando piezas
                  </button>
                </div>
                }

                <!-- PASO 2: DESTINO DEL PAQUETE -->
                @else if (envioFase() === 'destino') {
                <div class="space-y-3">
                  <p class="t-body text-stone-300">¿A dónde va tu paquete?</p>

                  <div class="grid gap-2" role="radiogroup" aria-label="Destino de entrega">
                    <button type="button" (click)="elegirDestino('taller')" role="radio" [attr.aria-checked]="destino() === 'taller'"
                            class="min-h-[64px] p-3 rounded-2xl border flex items-center gap-3 text-left transition cursor-pointer"
                            [ngClass]="destino() === 'taller' ? 'border-amber-400 bg-amber-400/10' : 'border-white/15 bg-white/[0.04] hover:border-white/25'">
                      <span class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" [ngClass]="destino() === 'taller' ? 'bg-amber-400 text-stone-950' : 'bg-white/5 text-amber-300'">
                        <svg aria-hidden="true" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"></path></svg>
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="t-title font-extrabold text-white block">A un taller mecánico</span>
                        <span class="t-micro text-stone-400 block leading-snug">Siempre hay alguien recibiendo · ideal para agrupar entregas</span>
                      </span>
                      <svg aria-hidden="true" class="w-5 h-5 shrink-0" [ngClass]="destino() === 'taller' ? 'text-amber-400' : 'text-stone-700'" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    </button>

                    <button type="button" (click)="elegirDestino('ubicacion')" role="radio" [attr.aria-checked]="destino() === 'ubicacion'"
                            class="min-h-[64px] p-3 rounded-2xl border flex items-center gap-3 text-left transition cursor-pointer"
                            [ngClass]="destino() === 'ubicacion' ? 'border-amber-400 bg-amber-400/10' : 'border-white/15 bg-white/[0.04] hover:border-white/25'">
                      <span class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" [ngClass]="destino() === 'ubicacion' ? 'bg-amber-400 text-stone-950' : 'bg-white/5 text-cyan-300'">
                        <svg aria-hidden="true" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="t-title font-extrabold text-white block">A mi ubicación</span>
                        <span class="t-micro text-stone-400 block leading-snug">Tu domicilio o un punto marcado en el mapa</span>
                      </span>
                      <svg aria-hidden="true" class="w-5 h-5 shrink-0" [ngClass]="destino() === 'ubicacion' ? 'text-amber-400' : 'text-stone-700'" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                  </div>

                  @if (destino() === 'taller') {
                    <div class="space-y-2" role="radiogroup" aria-label="Elegí el taller">
                      @for (t of talleres; track t.id) {
                        <button type="button" (click)="elegirTaller(t.id)" role="radio" [attr.aria-checked]="tallerId() === t.id"
                                class="w-full min-h-[56px] p-3 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer"
                                [ngClass]="tallerId() === t.id ? 'border-amber-400/80 bg-black/50' : 'border-white/10 bg-black/20 hover:border-white/20'">
                          <span class="w-5 h-5 rounded-full border shrink-0 flex items-center justify-center" [ngClass]="tallerId() === t.id ? 'border-amber-400 bg-amber-400' : 'border-stone-600'">
                            @if (tallerId() === t.id) {
                              <svg aria-hidden="true" class="w-3.5 h-3.5 text-stone-950" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            }
                          </span>
                          <span class="min-w-0 flex-1">
                            <span class="t-body font-bold text-white flex items-center gap-2 flex-wrap">{{ t.nombre }}
                              @if (t.id === 'ramos') {
                                <span class="t-micro font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded px-1.5 py-0.5">Tu taller de confianza</span>
                              }
                            </span>
                            <span class="t-micro text-stone-400 block truncate">{{ t.detalle }}</span>
                          </span>
                        </button>
                      }
                    </div>
                  } @else {
                    <div class="space-y-2">
                      <label for="domicilio" class="t-micro font-bold text-stone-400 uppercase tracking-wider block">Dirección de entrega</label>
                      <input id="domicilio" type="text" [value]="ubicacion()" (input)="setUbicacion($event)"
                             placeholder="Ej.: Av. Fontana 450, Trelew" autocomplete="street-address"
                             class="w-full p-3 min-h-[48px] rounded-xl bg-black/70 border border-white/15 text-white t-body focus:border-amber-400 focus:outline-none placeholder-stone-600">
                      <div class="relative h-28 rounded-2xl border border-white/10 bg-black/60 overflow-hidden" aria-hidden="true">
                        <svg class="absolute inset-0 w-full h-full" viewBox="0 0 300 112" preserveAspectRatio="none">
                          <g stroke="#2b2b2b" stroke-width="1"><path d="M0 28H300M0 56H300M0 84H300M60 0V112M120 0V112M180 0V112M240 0V112"></path></g>
                          <path d="M0 84 300 20" stroke="#383838" stroke-width="5"></path>
                        </svg>
                        <svg class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-3/5 w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><circle cx="12" cy="11" r="3" fill="#12100E"></circle></svg>
                        <span class="absolute bottom-1.5 left-3 t-micro text-stone-500">Pin marcado en el mapa (demo)</span>
                      </div>
                    </div>
                  }

                  <div class="flex items-center gap-2 pt-1">
                    <button type="button" (click)="irAResumen()" class="min-h-[48px] px-4 rounded-xl border border-white/15 text-stone-200 font-bold t-body hover:bg-white/5 cursor-pointer shrink-0">‹ Volver</button>
                    <button type="button" (click)="irAVelocidad()" [disabled]="!destinoListo()"
                            class="flex-1 min-h-[48px] rounded-2xl font-black t-body px-4 flex items-center justify-center gap-1.5 transition"
                            [ngClass]="destinoListo() ? 'bg-[#F5C342] text-[#12100E] shadow-lg shadow-[#F5C342]/25 cursor-pointer' : 'bg-white/10 text-stone-500 cursor-not-allowed'">
                      <span class="whitespace-nowrap">Continuar</span>
                      <svg aria-hidden="true" class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                </div>
                }

                <!-- PASO 3: VELOCIDAD Y FLETE -->
                @else if (envioFase() === 'velocidad') {
                <div class="space-y-3">
                  <div class="flex items-center justify-between gap-2">
                    <p class="t-body text-stone-300 min-w-0">¿Cómo viaja tu pedido?</p>
                    @if (congelarSeg() > 0) {
                      <span class="t-micro text-amber-300 font-bold whitespace-nowrap">⏱ {{ congelarTexto() }}</span>
                    }
                  </div>

                  @if (madrynItems().length) {
                    <div class="grid gap-2" role="radiogroup" aria-label="Velocidad de entrega">
                      <!-- PROGRAMADO · 1x -->
                      <button type="button" role="radio" [attr.aria-checked]="velocidad() === 'programado'" (click)="elegirVelocidad('programado')"
                              class="p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3"
                              [ngClass]="velocidad() === 'programado' ? 'border-amber-400 bg-amber-400/10' : 'border-white/15 bg-white/[0.04] hover:border-white/25'">
                        <span class="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" [ngClass]="velocidad() === 'programado' ? 'bg-amber-400 text-stone-950' : 'bg-white/5 text-amber-300'">
                          <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </span>
                        <span class="min-w-0 flex-1">
                          <span class="flex items-center justify-between gap-2">
                            <span class="t-title font-extrabold text-white">Programado</span>
                            <span class="t-title font-black text-white shrink-0"><span class="text-amber-300">1x</span> {{ money(madrynFleteBase()) }}</span>
                          </span>
                          <span class="t-micro text-stone-300 block mt-1">Reparto consolidado · corte {{ ventanaReparto().corte }} hs</span>
                          <span class="t-body font-bold text-white block leading-snug">{{ ventanaReparto().dia }} {{ ventanaReparto().rango }}</span>
                          <span class="t-micro text-stone-400 block mt-1.5 leading-snug">@switch (madrynItems().length) { @case (1) { <span>Tu pieza viaja sola: pagás <strong class="text-stone-200">un solo envío</strong>.</span> } @default { <span>Las {{ madrynItems().length }} piezas viajan juntas: pagás <strong class="text-stone-200">un solo envío</strong>.</span> } }</span>
                        </span>
                      </button>

                      <!-- URGENTE · 2x -->
                      <button type="button" role="radio" [attr.aria-checked]="velocidad() === 'urgente'" (click)="elegirVelocidad('urgente')"
                              class="p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3"
                              [ngClass]="velocidad() === 'urgente' ? 'border-amber-400 bg-amber-400/10' : 'border-white/15 bg-white/[0.04] hover:border-white/25'">
                        <span class="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" [ngClass]="velocidad() === 'urgente' ? 'bg-amber-400 text-stone-950' : 'bg-white/5 text-amber-300'">
                          <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4.5 12.5H11L9.5 22 18 11.5h-6.5L13 2z"></path></svg>
                        </span>
                        <span class="min-w-0 flex-1">
                          <span class="flex items-center justify-between gap-2">
                            <span class="t-title font-extrabold text-white">Urgente</span>
                            <span class="t-title font-black text-white shrink-0"><span class="text-amber-300">2x</span> {{ money(madrynFleteBase() * 2) }}</span>
                          </span>
                          <span class="t-micro text-stone-300 block mt-1">Retiro inmediato · viaje directo</span>
                          <span class="t-body font-bold text-white block leading-snug">Hoy en ~45 minutos</span>
                          <span class="t-micro text-stone-400 block mt-1.5 leading-snug">Sin esperar consolidación: el precio del transporte se duplica para cubrir el viaje.</span>
                        </span>
                      </button>
                    </div>
                  } @else {
                    <div class="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-1.5">
                      <div class="w-11 h-11 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto" aria-hidden="true">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <p class="t-body font-bold text-white">Retiro en mostrador · Trelew</p>
                      <p class="t-micro text-stone-400 leading-snug">Tus {{ comboCount() }} {{ comboCount() === 1 ? 'pieza queda' : 'piezas quedan' }} separadas en el comercio. Pasás y las buscás, sin flete ni demora.</p>
                    </div>
                  }

                  <div class="flex items-center gap-2 pt-1">
                    <button type="button" (click)="volverADestino()" class="min-h-[48px] px-4 rounded-xl border border-white/15 text-stone-200 font-bold t-body hover:bg-white/5 cursor-pointer shrink-0">‹ Volver</button>
                    <button type="button" (click)="irATransferencia()"
                            class="flex-1 min-h-[48px] rounded-2xl font-black t-body px-4 flex items-center justify-center gap-1.5 bg-[#F5C342] text-[#12100E] shadow-lg shadow-[#F5C342]/25 cursor-pointer">
                      <span class="whitespace-nowrap">Continuar a la transferencia</span>
                      <svg aria-hidden="true" class="w-4 h-4 stroke-[2.5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                </div>
                }

                <!-- PASO 4: TRANSFERENCIA Y COMPROBANTE -->
                @else if (envioFase() === 'transferencia') {
                <div class="space-y-3">
                  <div class="p-3.5 rounded-2xl bg-[#181818] border border-white/10 space-y-1.5">
                    <div class="flex justify-between gap-2 t-body text-stone-300"><span>Repuestos ({{ comboCount() }})</span><span class="text-white font-bold shrink-0">{{ money(comboSubtotal()) }}</span></div>
                    <div class="flex justify-between gap-2 t-body text-stone-300"><span>Flete {{ velocidad() === 'urgente' ? '· urgente 2x' : '· programado 1x' }}</span><span class="shrink-0" [ngClass]="comboShipping() > 0 ? 'text-stone-100 font-bold' : 'text-stone-400'">{{ comboShipping() > 0 ? shippingFmt() : '$0' }}</span></div>
                    <div class="flex justify-between items-end border-t border-white/10 pt-2 gap-2">
                      <span class="t-micro uppercase tracking-wider text-stone-400">Total exacto</span>
                      <span class="t-total font-black text-[#F5C342] shrink-0">{{ totalFmt() }}</span>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <span class="t-micro font-bold text-stone-400 uppercase tracking-wider">Transferí al alias</span>

                    <div class="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/60 border border-white/10">
                      <span class="min-w-0">
                        <span class="block t-micro text-stone-400">Alias</span>
                        <span class="block t-body font-bold text-white truncate">{{ aliasCbu.alias }}</span>
                      </span>
                      <button type="button" (click)="copiarTransferencia('alias')" [attr.aria-label]="'Copiar alias'"
                              class="w-11 h-11 shrink-0 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-stone-200 hover:bg-white/10 hover:text-white transition cursor-pointer">
                        @if (copiado() === 'alias') {
                          <svg aria-hidden="true" class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        } @else {
                          <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path stroke-linecap="round" stroke-linejoin="round" d="M5 15V5a2 2 0 012-2h10"></path></svg>
                        }
                      </button>
                    </div>

                    <div class="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/60 border border-white/10">
                      <span class="min-w-0">
                        <span class="block t-micro text-stone-400">CBU</span>
                        <span class="block t-body font-bold text-white truncate num">{{ aliasCbu.cbu }}</span>
                      </span>
                      <button type="button" (click)="copiarTransferencia('cbu')" [attr.aria-label]="'Copiar CBU'"
                              class="w-11 h-11 shrink-0 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-stone-200 hover:bg-white/10 hover:text-white transition cursor-pointer">
                        @if (copiado() === 'cbu') {
                          <svg aria-hidden="true" class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        } @else {
                          <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path stroke-linecap="round" stroke-linejoin="round" d="M5 15V5a2 2 0 012-2h10"></path></svg>
                        }
                      </button>
                    </div>
                    <p class="t-micro text-stone-500 leading-snug">Transferí el total exacto. El stock se libera recién cuando el banco acredita el pago.</p>
                  </div>

                  <div class="space-y-2">
                    <span class="t-micro font-bold text-stone-400 uppercase tracking-wider">Comprobante</span>
                    <input #comprobanteInput id="comprobante-input" type="file" accept="image/*,application/pdf" (change)="onComprobante($event)" class="sr-only">
                    <div class="flex flex-wrap items-center gap-2">
                      <label for="comprobante-input" class="flex-1 min-w-0 flex items-center gap-2.5 p-3 min-h-[60px] rounded-2xl border border-dashed border-amber-400/40 bg-amber-400/5 cursor-pointer hover:bg-amber-400/10 transition">
                        <svg aria-hidden="true" class="w-6 h-6 text-amber-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3M12 4v12m0 0l-4-4m4 4l4-4"></path></svg>
                        <span class="min-w-0">
                          <span class="t-body font-bold text-amber-200 block">{{ comprobanteNombre() ? 'Comprobante adjunto' : 'Adjuntar comprobante' }}</span>
                          <span class="t-micro text-stone-400 block truncate">{{ comprobanteNombre() || 'Foto o PDF · JPG, PNG, PDF' }}</span>
                        </span>
                      </label>
                      @if (comprobantePreview()) {
                        <img [src]="comprobantePreview()" alt="Vista previa del comprobante" class="w-14 h-14 object-cover rounded-xl border border-white/15 shrink-0">
                      }
                      @if (comprobanteNombre()) {
                        <button type="button" (click)="quitarComprobante()" aria-label="Quitar comprobante"
                                class="w-11 h-11 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-400 hover:text-white transition cursor-pointer">
                          <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      }
                    </div>
                    <button type="button" (click)="simularComprobante()" class="t-micro font-bold text-amber-300/90 hover:text-amber-200 underline underline-offset-2 min-h-[44px] px-1 cursor-pointer">Simular comprobante (demo)</button>
                  </div>

                  <div class="flex items-center gap-2 pt-1">
                    <button type="button" (click)="irAVelocidad()" class="min-h-[48px] px-4 rounded-xl border border-white/15 text-stone-200 font-bold t-body hover:bg-white/5 cursor-pointer shrink-0">‹ Volver</button>
                    <button type="button" (click)="enviarComprobante()" [disabled]="!comprobanteNombre()"
                            class="flex-1 min-h-[48px] rounded-2xl font-black t-body px-4 flex items-center justify-center gap-1.5 transition"
                            [ngClass]="comprobanteNombre() ? 'bg-[#F5C342] text-[#12100E] shadow-lg shadow-[#F5C342]/25 active:scale-[0.98] cursor-pointer' : 'bg-white/10 text-stone-500 cursor-not-allowed'">
                      <span class="whitespace-nowrap">{{ comprobanteNombre() ? 'Enviar comprobante' : 'Adjuntá el comprobante' }}</span>
                      <svg aria-hidden="true" class="w-4 h-4 stroke-[2.5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                </div>
                }

                <!-- PASO 5: COMPROBANTE ENVIADO · VALIDANDO -->
                @else if (envioFase() === 'validando') {
                <div class="space-y-3 text-center pt-1">
                  <div class="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto" aria-hidden="true">
                    <svg class="w-7 h-7 text-amber-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.5 5.3A9 9 0 1112 3a9 9 0 018.5 12.3z"></path></svg>
                  </div>
                  <div>
                    <h4 class="t-title font-extrabold text-white">Comprobante enviado</h4>
                    <p class="t-body text-stone-300">Validando acreditación del pago…</p>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-left t-body space-y-1.5">
                    <div class="flex justify-between gap-2"><span class="text-stone-400">Total transferido</span><span class="text-white font-bold shrink-0">{{ totalFmt() }}</span></div>
                    <div class="flex justify-between gap-2"><span class="text-stone-400">Destino</span><span class="text-stone-200 text-right truncate min-w-0">{{ destino() === 'taller' ? tallerNombre() : ubicacion() }}</span></div>
                    <div class="flex justify-between gap-2"><span class="text-stone-400">Llega</span><span class="text-amber-300 font-bold shrink-0">{{ entregaEstimada() }}</span></div>
                  </div>

                  <p class="t-micro text-stone-500 leading-snug">El cadete no sale hasta que el pago figure acreditado. Apenas se apruebe, vas a ver la hora exacta y tu PIN de entrega.</p>

                  <button type="button" (click)="simularAprobacion()" class="w-full min-h-[44px] rounded-xl border border-dashed border-amber-400/40 text-amber-300/90 t-micro font-bold hover:text-amber-200 hover:border-amber-400/70 transition cursor-pointer">Simular aprobación del pago (demo admin)</button>
                </div>
                }

                <!-- PASO 6: PAGO ACREDITADO · ENTREGA CON PIN -->
                @else if (envioFase() === 'confirmado') {
                <div class="space-y-3 text-center pt-1">
                  <div class="w-14 h-14 rounded-full bg-[#2ECC71] text-stone-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-400/30" aria-hidden="true">
                    <svg class="w-7 h-7 stroke-[3.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <h4 class="t-title font-extrabold text-white">¡Pedido confirmado!</h4>
                    <p class="t-micro text-stone-400">Pago acreditado{{ confirmadaEn() ? ' el ' + confirmadaEn() : '' }} · stock reservado</p>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-left t-body space-y-1.5">
                    <div class="flex justify-between gap-2"><span class="text-stone-400">Entrega</span><span class="text-white font-bold shrink-0">{{ entregaEstimada() }}</span></div>
                    <div class="flex justify-between gap-2"><span class="text-stone-400">Destino</span><span class="text-stone-200 text-right truncate min-w-0">{{ destino() === 'taller' ? tallerNombre() : ubicacion() }}</span></div>
                    <div class="flex justify-between gap-2"><span class="text-stone-400">Total pagado</span><span class="text-emerald-300 font-bold shrink-0">{{ totalFmt() }}</span></div>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 space-y-1">
                    <span class="t-micro font-bold text-amber-300 uppercase tracking-wider block">PIN de entrega</span>
                    <button type="button" (click)="copiarTransferencia('pin')" aria-label="Copiar PIN" class="w-full py-1 cursor-pointer">
                      <span class="t-total font-black text-white tracking-[0.4em] tabular-nums block select-all leading-none pl-[0.4em]">{{ pin() }}</span>
                    </button>
                    <span class="t-micro text-stone-400 block">{{ copiado() === 'pin' ? '¡PIN copiado!' : 'Entregale este código al cadete junto con la bolsa' }}</span>
                  </div>

                  <button type="button" (click)="verSeguimiento()" class="w-full min-h-[48px] rounded-2xl bg-[#F5C342] text-[#12100E] font-black t-body shadow-lg shadow-[#F5C342]/25 flex items-center justify-center gap-1.5 cursor-pointer">
                    <span class="whitespace-nowrap">Ver seguimiento del pedido</span>
                    <svg aria-hidden="true" class="w-4 h-4 stroke-[2.5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
                }

              </div>
            }

            <!-- SHEET NUEVA PIEZA -->
            @if (activeSheet() === 'addPart') {
              <div class="space-y-3">
                <p class="t-body text-stone-300">
                  Escribí o elegí el repuesto: las casas de Trelew y Puerto Madryn reciben la consulta al instante.
                </p>
                <div class="space-y-1.5">
                  <label for="nueva-pieza" class="t-micro text-stone-400 block">Nombre o código del repuesto</label>
                  <input id="nueva-pieza" type="text" placeholder="Ej: amortiguadores delanteros" class="w-full p-3 min-h-[44px] rounded-xl bg-black/70 border border-white/15 text-white t-body focus:border-amber-400 focus:outline-none placeholder-stone-600">
                </div>
                <div class="flex items-center gap-1.5 flex-wrap pt-1">
                  <span class="t-micro text-stone-400">Sugerencias:</span>
                  <button type="button" class="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-white/5 border border-white/10 t-micro text-amber-300 cursor-pointer">Bomba de agua</button>
                  <button type="button" class="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-white/5 border border-white/10 t-micro text-amber-300 cursor-pointer">Amortiguadores</button>
                  <button type="button" class="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-white/5 border border-white/10 t-micro text-amber-300 cursor-pointer">Correa</button>
                </div>
                <div class="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-stone-300 t-micro">
                  Se envía a los 4 comercios activos en simultáneo.
                </div>
                <button type="button" (click)="closeSheet()" class="w-full min-h-[48px] rounded-xl bg-amber-400 text-stone-950 font-black t-body shadow-lg shadow-amber-400/25 active:scale-[0.98] transition cursor-pointer">
                  Emitir consulta
                </button>
              </div>
            }

            <!-- SHEET PERFIL / CUENTA -->
            @if (activeSheet() === 'perfil') {
              <div class="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2.5">
                <div class="flex justify-between gap-3"><span class="t-body text-stone-400 shrink-0">Usuario</span><span class="t-body text-white font-bold truncate">{{ usuario?.nombre || 'Sesión en este dispositivo' }}</span></div>
                <div class="flex justify-between gap-3"><span class="t-body text-stone-400 shrink-0">Email</span><span class="t-body text-white truncate">{{ usuario?.email || '—' }}</span></div>
                <div class="flex justify-between gap-3"><span class="t-body text-stone-400 shrink-0">Rol</span><span class="t-body text-stone-200 font-bold">Comprador</span></div>
              </div>

              <button type="button" (click)="cerrarSesion()" class="w-full min-h-[48px] rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 font-bold t-body active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer">
                <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Cerrar sesión
              </button>
              <button type="button" (click)="closeSheet()" class="w-full min-h-[44px] text-stone-400 hover:text-white t-body cursor-pointer">
                Volver
              </button>
            }

            <!-- SHEET SUMAR VEHÍCULO -->
            @if (activeSheet() === 'garageAdd') {
              <div class="space-y-3">
                <p class="t-body text-stone-300">
                  Sumá otro vehículo para cotizar con su ficha técnica exacta.
                </p>

                <div class="space-y-1.5">
                  <label for="g-patente" class="t-micro text-stone-400 block">Dominio / patente</label>
                  <input id="g-patente" #gPatente type="text" placeholder="AB 123 CD"
                         class="w-full min-h-[48px] px-3 rounded-xl bg-black/70 border border-white/15 text-white t-body font-black tracking-widest text-center uppercase focus:border-amber-400 focus:outline-none placeholder-stone-600">
                </div>

                <div class="space-y-1.5">
                  <label for="g-modelo" class="t-micro text-stone-400 block">Marca y modelo</label>
                  <input id="g-modelo" #gModelo type="text" placeholder="Ej: Ford Ranger 3.2"
                         class="w-full min-h-[48px] px-3 rounded-xl bg-black/70 border border-white/15 text-white t-body focus:border-amber-400 focus:outline-none placeholder-stone-600">
                </div>

                <div class="space-y-1.5">
                  <label for="g-km" class="t-micro text-stone-400 block">Kilometraje actual</label>
                  <input id="g-km" #gKm type="number" inputmode="numeric" placeholder="Ej: 94000"
                         class="w-full min-h-[48px] px-3 rounded-xl bg-black/70 border border-white/15 text-white t-body font-bold focus:border-amber-400 focus:outline-none placeholder-stone-600">
                </div>

                <div class="p-3 rounded-xl bg-white/[0.04] border border-white/10 t-micro text-stone-400">
                  La ficha técnica se completa al validar la cédula verde. Mientras tanto podés cargar servicios y chequeos a mano.
                </div>

                <button type="button" (click)="agregarVehiculo(gPatente.value, gModelo.value, gKm.value)"
                        class="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black t-body shadow-lg shadow-amber-400/20 active:scale-[0.98] transition cursor-pointer">
                  Guardar vehículo
                </button>
              </div>
            }

            <!-- SHEET ACTUALIZAR KM -->
            @if (activeSheet() === 'garageKm') {
              @if (garageVehicle(); as v) {
                <div class="space-y-3">
                  <p class="t-body text-stone-300">
                    Ingresá el kilometraje actual. Recalculamos los intervalos de aceite, filtros y correa.
                  </p>

                  <div class="p-3.5 rounded-2xl bg-black/60 border border-white/10">
                    <span class="t-micro text-stone-400 uppercase tracking-wider block">Odómetro actual</span>
                    <div class="flex items-baseline gap-2 pt-1">
                      <input #kmNuevo type="number" inputmode="numeric" [value]="v.km" aria-label="Kilometraje actual"
                             class="w-full bg-transparent t-total font-black text-white num focus:outline-none">
                      <span class="t-body text-stone-400 shrink-0">km</span>
                    </div>
                  </div>

                  <div class="p-3 rounded-xl bg-white/[0.04] border border-white/10 t-micro text-stone-400">
                    Mantener el kilometraje al día recalcula automáticamente los vencimientos del service.
                  </div>

                  <button type="button" (click)="guardarKm(kmNuevo.value)"
                          class="w-full min-h-[48px] rounded-xl bg-amber-400 text-stone-950 font-black t-body shadow-md active:scale-[0.98] transition cursor-pointer">
                    Guardar y sincronizar
                  </button>
                </div>
              }
            }

            <!-- SHEET REGISTRAR SERVICIO -->
            @if (activeSheet() === 'garageService') {
              @if (garageVehicle(); as v) {
                <div class="space-y-3">
                  <p class="t-body text-stone-300">
                    Cada carga queda asentada en el historial cronológico del vehículo.
                  </p>

                  <div class="space-y-1.5">
                    <label for="s-tipo" class="t-micro text-stone-400 block">Tipo de servicio</label>
                    <select id="s-tipo" #sTipo
                            class="w-full min-h-[48px] px-3 rounded-xl bg-black/70 border border-white/15 text-white t-body focus:border-amber-400 focus:outline-none">
                      <option value="aceite">Cambio de aceite y filtro</option>
                      <option value="aire">Filtro de aire y habitáculo</option>
                      <option value="distribucion">Correa de distribución y bomba</option>
                      <option value="frenos">Pastillas y discos de freno</option>
                      <option value="otro">Otro mantenimiento</option>
                    </select>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1.5">
                      <label for="s-km" class="t-micro text-stone-400 block">Km al servicio</label>
                      <input id="s-km" #sKm type="number" inputmode="numeric" [value]="v.km"
                             class="w-full min-h-[48px] px-3 rounded-xl bg-black/70 border border-white/15 text-white t-body font-bold focus:border-amber-400 focus:outline-none">
                    </div>
                    <div class="space-y-1.5">
                      <label for="s-fecha" class="t-micro text-stone-400 block">Fecha</label>
                      <input id="s-fecha" #sFecha type="date" [value]="hoy"
                             class="w-full min-h-[48px] px-3 rounded-xl bg-black/70 border border-white/15 text-white t-body focus:border-amber-400 focus:outline-none">
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label for="s-notas" class="t-micro text-stone-400 block">Descripción / observaciones</label>
                    <textarea id="s-notas" #sNotas rows="2" placeholder="Ej: Castrol 5W-40 sintético + filtro Wega"
                              class="w-full p-3 rounded-xl bg-black/70 border border-white/15 text-white t-body focus:border-amber-400 focus:outline-none placeholder-stone-600"></textarea>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1.5">
                      <label for="s-costo" class="t-micro text-stone-400 block">Costo (opcional)</label>
                      <input id="s-costo" #sCosto type="text" placeholder="$ 45.000"
                             class="w-full min-h-[48px] px-3 rounded-xl bg-black/70 border border-white/15 text-white t-body focus:border-amber-400 focus:outline-none placeholder-stone-600">
                    </div>
                    <div class="space-y-1.5">
                      <label for="s-taller" class="t-micro text-stone-400 block">Taller</label>
                      <input id="s-taller" #sTaller type="text" placeholder="Ej: Lubricentro Fontana"
                             class="w-full min-h-[48px] px-3 rounded-xl bg-black/70 border border-white/15 text-white t-body focus:border-amber-400 focus:outline-none placeholder-stone-600">
                    </div>
                  </div>

                  <button type="button" (click)="guardarServicio(sTipo.value, sKm.value, sFecha.value, sNotas.value, sCosto.value, sTaller.value)"
                          class="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black t-body shadow-lg shadow-amber-400/20 active:scale-[0.98] transition cursor-pointer">
                    Guardar servicio
                  </button>
                </div>
              }
            }

            <!-- SHEET CHEQUEO PREVENTIVO -->
            @if (activeSheet() === 'garageCheckup') {
              @if (checkupActivo(); as c) {
                <div class="space-y-3">
                  <div class="p-3 rounded-2xl bg-black/60 border border-white/10">
                    <span class="t-micro uppercase tracking-wider text-stone-400 block">{{ c.titulo }}</span>
                    <span class="t-micro text-stone-300">Valor actual: <strong class="text-white">{{ c.valor }}</strong> · {{ c.detalle }}</span>
                  </div>

                  <div class="space-y-1.5">
                    <label for="c-valor" class="t-micro text-stone-400 block">{{ etiquetaCheckup(c.key) }}</label>
                    <input id="c-valor" #cValor type="text" [value]="c.valor"
                           class="w-full min-h-[48px] px-3 rounded-xl bg-black/70 border border-white/20 text-white t-price font-black text-center focus:border-amber-400 focus:outline-none">
                  </div>

                  <div class="p-3 rounded-xl bg-white/[0.04] border border-white/10 t-micro text-stone-400">
                    {{ ayudaCheckup(c.key) }}
                  </div>

                  <button type="button" (click)="guardarCheckup(cValor.value)"
                          class="w-full min-h-[48px] rounded-xl bg-amber-400 text-stone-950 font-black t-body shadow-md active:scale-[0.98] transition cursor-pointer">
                    Guardar medición
                  </button>
                </div>
              }
            }

            <!-- SHEET ALERTAS DEL GARAJE -->
            @if (activeSheet() === 'garageNotif') {
              <div class="space-y-2.5">
                <button type="button" (click)="openGarageCheckup('distribucion')"
                        class="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-rose-950/40 to-stone-900 border border-rose-500/30 flex items-start gap-2.5 active:scale-[0.99] transition cursor-pointer">
                  <span class="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" aria-hidden="true"></span>
                  <span class="min-w-0 flex-1">
                    <span class="flex items-center justify-between gap-2">
                      <strong class="t-micro font-bold text-rose-300">Alerta de distribución</strong>
                      <span class="t-micro text-stone-500 shrink-0">Hoy</span>
                    </span>
                    <span class="t-micro text-stone-300 block pt-0.5">Cumple 5 años la correa del {{ garageVehicle()?.corto }}. Vence 03/27 o 120.000 km.</span>
                  </span>
                </button>

                <button type="button" (click)="irAPedidos(); closeSheet()"
                        class="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-stone-900 border border-amber-500/30 flex items-start gap-2.5 active:scale-[0.99] transition cursor-pointer">
                  <span class="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" aria-hidden="true"></span>
                  <span class="min-w-0 flex-1">
                    <span class="flex items-center justify-between gap-2">
                      <strong class="t-micro font-bold text-amber-300">3 cotizaciones nuevas</strong>
                      <span class="t-micro text-stone-500 shrink-0">Hace 15m</span>
                    </span>
                    <span class="t-micro text-stone-300 block pt-0.5">Casas de Trelew respondieron tu pedido de pastillas y filtros.</span>
                  </span>
                </button>

                <button type="button" (click)="openGarageCheckup('neumaticos')"
                        class="w-full text-left p-3 rounded-2xl bg-stone-900/90 border border-white/10 flex items-start gap-2.5 active:scale-[0.99] transition cursor-pointer">
                  <span class="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" aria-hidden="true"></span>
                  <span class="min-w-0 flex-1">
                    <span class="flex items-center justify-between gap-2">
                      <strong class="t-micro font-bold text-sky-300">Calibración de neumáticos</strong>
                      <span class="t-micro text-stone-500 shrink-0">Hace 7d</span>
                    </span>
                    <span class="t-micro text-stone-400 block pt-0.5">Revisá la presión recomendada antes de salir a la ruta.</span>
                  </span>
                </button>

                <button type="button" (click)="closeSheet()"
                        class="w-full min-h-[44px] rounded-xl bg-white/10 text-stone-300 font-bold t-micro hover:bg-white/15 transition cursor-pointer">
                  Cerrar alertas
                </button>
              </div>
            }

          </div>
        </div>
      }

    </div>
  `
})
export class CompradorMovilComponent {
  private readonly router = inject(Router);
  private readonly supa = inject(SupabaseService);

  /** Sesión real del usuario (null en sesiones demo por rol). */
  readonly usuario = usuarioSesion();

  private readonly sheetPanel = viewChild<ElementRef<HTMLElement>>('sheetPanel');
  private readonly sheetClose = viewChild<ElementRef<HTMLButtonElement>>('sheetClose');

  /** Elemento que tenía el foco antes de abrir el sheet (se restaura al cerrar). */
  private lastFocused: HTMLElement | null = null;

  constructor() {
    // Al abrir el sheet el foco entra en el botón de cerrar (queda dentro del diálogo).
    effect(() => {
      const btn = this.sheetClose()?.nativeElement;
      if (btn) btn.focus({ preventScroll: true });
    });

    // Bloquea el scroll del documento mientras el sheet está abierto.
    effect((onCleanup) => {
      if (!this.activeSheet()) return;
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      onCleanup(() => { document.body.style.overflow = previous; });
    });
  }

  /** Iniciales del avatar: nombre real si hay sesión, "MG" por defecto. */
  get iniciales(): string {
    const nombre = this.usuario?.nombre?.trim();
    if (!nombre) return 'MG';
    return nombre.split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
  }

  readonly vehicleImg = '/img/veh-passat.jpg';

  // ── Garaje ────────────────────────────────────────────────────────────────
  readonly vista = signal<Vista>('pedidos');
  readonly garageTab = signal<GarageTab>('estado');
  readonly garageActiveId = signal<string>('passat');
  readonly historyOpen = signal<string>('h1');
  readonly checkupKey = signal<CheckupKey | null>(null);

  readonly garageVehicles = signal<GarageVehicle[]>([
    {
      id: 'passat',
      corto: 'VW Passat',
      titulo: 'VW Passat 2.0 TDI',
      patente: 'AB 412 TX',
      vin: 'WVWZZZ3CZ6P108422',
      motor: 'BKP (2.0 16V TDI)',
      transmision: 'HDV (manual 6 marchas)',
      frenos: 'Lucas / TRW (312mm delanteros)',
      km: 125000,
      etiquetaMotor: 'BKP 140CV',
      img: '/img/veh-passat.jpg',
      estado: 'Óptimo',
      specs: { motor: '2.0 TDI', potencia: '140 CV', combustible: 'Diésel', traccion: 'Delantera', caja: 'Manual 6ta' },
      checkups: [
        { key: 'bateria', titulo: 'Batería 75Ah', valor: '12.6 V', detalle: '14/08/24', estado: 'Carga 98% · 18m vida', pct: 98, tono: 'emerald' },
        { key: 'anticongelante', titulo: 'Refrigerante', valor: '10/05/25', detalle: 'Vence 05/27', estado: 'Quedan 6 meses', pct: 75, tono: 'cyan' },
        { key: 'distribucion', titulo: 'Distribución', valor: '18/03/22', detalle: 'Vence 03/27', estado: '¡Alerta! 120.000 km', pct: 88, tono: 'rose' },
        { key: 'neumaticos', titulo: 'Neumáticos', valor: '32 PSI', detalle: '215/55 R16', estado: 'Calibrado hace 7d', pct: 100, tono: 'sky' }
      ],
      servicios: [
        { id: 'svc-aceite', nombre: 'Cambio de aceite & filtro', detalle: 'Castrol 5W-40 + Wega WOE-640', ultimo: '120.000 km', nota: 'Hace 5.000 km', alerta: false, icono: 'aceite' },
        { id: 'svc-aire', nombre: 'Filtro de aire & habitáculo', detalle: 'Mann Filter C35154', ultimo: '115.000 km', nota: 'Vence a los 130.000', alerta: false, icono: 'aire' },
        { id: 'svc-correa', nombre: 'Correa de distribución & bomba', detalle: 'Kit completo con tensor', ultimo: '60.000 km', nota: 'Toca a los 120.000', alerta: true, icono: 'correa' },
        { id: 'svc-frenos', nombre: 'Pastillas & discos delanteros', detalle: 'TRW 312mm', ultimo: '110.000 km', nota: 'Revisado en noviembre', alerta: false, icono: 'frenos' }
      ],
      historial: [
        {
          id: 'h1',
          titulo: 'Cambio de aceite & filtro',
          fecha: '15 Nov 2026',
          km: '120.000 km',
          lugar: 'Av. Fontana 450, Trelew',
          trabajos: [
            { nombre: 'Aceite Castrol 5W-40', monto: '$11.500' },
            { nombre: 'Revisión de frenos (TRW)', monto: '$28.500' }
          ],
          repuestos: [
            { nombre: 'Filtro Wega WOE-640', monto: '$9.200', img: '/img/rep-filtro.jpg' },
            { nombre: 'Pastillas Brembo Kit', monto: '$21.500', img: '/img/rep-pastillas.jpg' }
          ]
        },
        {
          id: 'h2',
          titulo: 'Pastillas y líquido de freno',
          fecha: '20 Ago 2026',
          km: '110.000 km',
          lugar: 'Frenos Fontana, Trelew',
          trabajos: [
            { nombre: 'Pastillas TRW 312mm', monto: '$46.000' },
            { nombre: 'Líquido de frenos DOT 4', monto: '$8.400' }
          ],
          repuestos: []
        },
        {
          id: 'h3',
          titulo: 'Inspección de inyectores',
          fecha: '20 Jun 2025',
          km: '85.000 km',
          lugar: 'Campaña de fábrica',
          trabajos: [{ nombre: 'Inspección sin cargo', monto: '$0' }],
          repuestos: [],
          alerta: true
        },
        {
          id: 'h4',
          titulo: 'Filtro de aire y habitáculo',
          fecha: '10 Ene 2025',
          km: '60.000 km',
          lugar: 'Lubricentro Fontana, Trelew',
          trabajos: [{ nombre: 'Filtros Mann de aire y habitáculo', monto: '$18.900' }],
          repuestos: []
        }
      ]
    },
    {
      id: 'hilux',
      corto: 'Toyota Hilux',
      titulo: 'Toyota Hilux 2.8 D-4D',
      patente: 'AD 890 JK',
      vin: '8AJBA3CD8K0193844',
      motor: '1GD-FTV (2.8 16V turbo)',
      transmision: 'Automática 6 velocidades',
      frenos: 'Advics ventilados (319mm)',
      km: 78500,
      etiquetaMotor: '1GD 177CV',
      estado: 'Óptimo',
      specs: { motor: '2.8 D-4D', potencia: '177 CV', combustible: 'Diésel', traccion: '4x4', caja: 'Automática 6ta' },
      checkups: [
        { key: 'bateria', titulo: 'Batería 80Ah', valor: '12.8 V', detalle: '02/02/25', estado: 'Carga 100% · 21m vida', pct: 100, tono: 'emerald' },
        { key: 'anticongelante', titulo: 'Refrigerante', valor: '18/09/25', detalle: 'Vence 09/27', estado: 'Quedan 10 meses', pct: 85, tono: 'cyan' },
        { key: 'distribucion', titulo: 'Distribución', valor: 'Cadena', detalle: 'Libre mant.', estado: 'Sin cambio programado', pct: 100, tono: 'emerald' },
        { key: 'neumaticos', titulo: 'Neumáticos', valor: '35 PSI', detalle: '265/65 R17', estado: 'Calibrado hace 3d', pct: 100, tono: 'sky' }
      ],
      servicios: [
        { id: 'hilux-aceite', nombre: 'Cambio de aceite & filtro', detalle: 'Toyota 5W-30 + filtro original', ultimo: '75.000 km', nota: 'Hace 3.500 km', alerta: false, icono: 'aceite' },
        { id: 'hilux-aire', nombre: 'Filtro de aire & habitáculo', detalle: 'Original Toyota', ultimo: '70.000 km', nota: 'Vence a los 80.000', alerta: false, icono: 'aire' },
        { id: 'hilux-frenos', nombre: 'Pastillas & discos', detalle: 'Advics 319mm', ultimo: '65.000 km', nota: 'Revisado en septiembre', alerta: false, icono: 'frenos' }
      ],
      historial: [
        {
          id: 'hilux-h1',
          titulo: 'Service integral 4x4',
          fecha: '12 Sep 2026',
          km: '75.000 km',
          lugar: 'Toyota Trelew',
          trabajos: [
            { nombre: 'Aceite y filtro de motor', monto: '$38.000' },
            { nombre: 'Engrase de crucetas y diferenciales', monto: '$22.000' }
          ],
          repuestos: []
        },
        {
          id: 'hilux-h2',
          titulo: 'Rotación y balanceo',
          fecha: '04 Jul 2026',
          km: '70.000 km',
          lugar: 'Neumáticos del Valle, Trelew',
          trabajos: [{ nombre: 'Rotación y balanceo de 4 ruedas', monto: '$16.000' }],
          repuestos: []
        }
      ]
    }
  ]);

  readonly garageVehicle = computed(() => {
    const list = this.garageVehicles();
    return list.find((v) => v.id === this.garageActiveId()) ?? list[0];
  });

  readonly checkupActivo = computed(() => {
    const key = this.checkupKey();
    if (!key) return null;
    return this.garageVehicle()?.checkups.find((c) => c.key === key) ?? null;
  });

  /** Fecha de hoy en formato ISO para los formularios del garaje. */
  readonly hoy = new Date().toISOString().slice(0, 10);


  readonly partsCatalog: CatalogPart[] = [
    {
      key: 'pastillas',
      name: 'Pastillas de Freno Delanteras',
      spec: 'Sistema Lucas/TRW · VW Passat 2.0 TDI',
      img: '/img/rep-pastillas.jpg',
      items: [
        {
          id: 'frasle_trelew',
          brand: 'Fras-le Cerif Estándar',
          store: 'M1 Repuestos • Trelew Centro',
          dist: 'A 6 min · Fontana esq. 25 de Mayo',
          price: '$21.500',
          priceNum: 21500,
          delivery: 'Mostrador hoy',
          deliverySub: 'Retiro en 10 min',
          isMadryn: false,
          desc: 'Opción económica de fricción orgánica certificada. Ideal para uso urbano diario sin chirridos.',
          specs: 'Espesor: 19.5mm · Con sensor de desgaste integrado · Homologado INTI.'
        },
        {
          id: 'ferodo_trelew',
          brand: 'Ferodo Italy Eco-Friction',
          store: 'Rep. Patagónicos • Trelew',
          dist: 'A 12 min · Av. Yrigoyen 1420',
          price: '$24.800',
          priceNum: 24800,
          delivery: 'Mostrador hoy',
          deliverySub: 'Stock físico en estante',
          isMadryn: false,
          desc: 'Compuesto semimetálico de origen italiano. Excelente mordiente en frío y bajo desprendimiento de hollín.',
          specs: 'Homologación ECE R90 · Ranura disipadora de calor · Larga duración.'
        },
        {
          id: 'oem_madryn',
          brand: 'Bosch Premium Germany',
          store: 'Golfo Nuevo • Pto. Madryn',
          dist: 'Puerto Madryn · A 65 km por Ruta 3',
          price: '$27.500',
          priceNum: 27500,
          delivery: 'Cadete Ruta 3',
          deliverySub: 'Llega en 1h 15m (+$2.800)',
          isMadryn: true,
          shippingFee: '+$2.800',
          shippingFeeNum: 2800,
          shippingEta: '~1h 15m',
          desc: 'Repuesto de equipo original idéntico al montado en fábrica en Alemania. Sin stock en Trelew, entrega rápida directa desde Madryn.',
          specs: 'Part Number: 1K0 698 151 E · Incluye chapa antivibración y bulones nuevos.'
        }
      ]
    },
    {
      key: 'filtro',
      name: 'Filtro de Aceite Blindado',
      spec: 'Motor BKP 2.0 TDI 16V (140 CV)',
      img: '/img/rep-filtro.jpg',
      items: [
        {
          id: 'filtro_wega',
          brand: 'Wega WOE-640',
          store: 'Lub. Fontana • Trelew Centro',
          dist: 'A 8 min · Calle Fontana 340',
          price: '$9.200',
          priceNum: 9200,
          delivery: 'Mostrador hoy',
          deliverySub: 'Stock listo para retiro',
          isMadryn: false,
          desc: 'Cartucho filtrante celulósico ecológico con junta de estanqueidad NBR incluida.',
          specs: 'Altura: 141mm · Diámetro ext: 71mm · Flujo 35 L/min.'
        },
        {
          id: 'filtro_mann',
          brand: 'Mann Filter HU 719/7 x',
          store: 'Dist. Madryn • Parque Industrial',
          dist: 'Puerto Madryn · Depósito Parque Industrial',
          price: '$13.800',
          priceNum: 13800,
          delivery: 'Cadete Ruta 3',
          deliverySub: 'Llega hoy 17:30 hs (+$2.500)',
          isMadryn: true,
          shippingFee: '+$2.500',
          shippingFeeNum: 2500,
          shippingEta: '~1h 15m',
          desc: 'Máxima retención de carbonilla y estabilidad en presiones elevadas para motores diésel bomba inyector.',
          specs: 'OEM VW Alemania · Papel multicapa Micrograde · Resistencia 5.0 bar.'
        }
      ]
    },
    {
      key: 'discos',
      name: 'Discos de Freno 312mm (Par)',
      spec: 'Ventilados 5x112 · Passat B6 Sedán',
      img: '/img/muestra-pastillas.jpg',
      items: [
        {
          id: 'discos_fremax',
          brand: 'Fremax Carbon+ Ventilados',
          store: 'Frenos Fontana • Trelew',
          dist: 'A 10 min · Av. Lewis Jones 520',
          price: '$58.000',
          priceNum: 58000,
          delivery: 'Mostrador hoy',
          deliverySub: 'Retiro inmediato',
          isMadryn: false,
          desc: 'Pintura protectora anticorrosión negra en campana. Excelente balance para frenada progresiva.',
          specs: 'Diámetro: 312mm · Espesor: 25mm (mínimo 22mm) · Acero al carbono.'
        },
        {
          id: 'discos_zimmermann',
          brand: 'Zimmermann Coat Z',
          store: 'Golfo Nuevo • Pto. Madryn',
          dist: 'Puerto Madryn · Stock exclusivo',
          price: '$79.500',
          priceNum: 79500,
          delivery: 'Cadete Ruta 3',
          deliverySub: 'Flete puerta a puerta (+$3.200)',
          isMadryn: true,
          shippingFee: '+$3.200',
          shippingFeeNum: 3200,
          shippingEta: '~1h 15m',
          desc: 'Fundición alemana con aleación de carbono de alto punto de ebullición térmico. Sin alabeo.',
          specs: 'Tratamiento anticorrosión Coat-Z · Certificado TÜV Alemania.'
        }
      ]
    }
  ];

  /** Ahorro de referencia del combo económico local (mostrador Trelew). */
  readonly ahorroReferencia = 32100;

  readonly activeSheet = signal<Sheet | null>(null);
  readonly selectedItem = signal<CatalogItem | null>(null);
  readonly selectedParentPart = signal<CatalogPart | null>(null);

  /** Repuesto elegido por cada sección del combo (por defecto, el más económico). */
  /** `null` = el comprador desmarcó esa pieza: no suma al pedido. */
  readonly combo = signal<Record<string, string | null>>({
    pastillas: 'frasle_trelew',
    filtro: 'filtro_wega',
    discos: 'discos_fremax',
  });

  /** Fase del wizard de pedido: resumen → envío → pago → validación → confirmado. */
  readonly envioFase = signal<'resumen' | 'destino' | 'velocidad' | 'transferencia' | 'validando' | 'confirmado'>('resumen');
  /** Confirmado = fase final del wizard: lleva el anillo al 100%. */
  readonly confirmado = computed(() => this.envioFase() === 'confirmado');

  /** Fase de entrega del pedido confirmado: cadete asignado → en camino → entregado. */
  readonly entregaFase = signal<'asignando' | 'enCamino' | 'entregado'>('asignando');
  /** Paso actual de la entrega: pagado (1 ✓) → en camino (2) → entregado (3). */
  readonly entregaPaso = computed(() => ({ asignando: 2, enCamino: 2, entregado: 3 }[this.entregaFase()]));
  readonly enCaminoEn = signal('');
  readonly entregadoEn = signal('');
  /** Clases del punto (nodo) en la línea de entrega. */
  entregaDot(paso: number): string {
    const actual = this.entregaPaso();
    if (paso < actual || this.entregaFase() === 'entregado') return 'border-emerald-400 bg-emerald-400 text-stone-950';
    if (paso === actual) return 'border-amber-300 bg-amber-400 text-stone-950 ring-4 ring-amber-400/20';
    return 'border-white/15 bg-white/[0.06] text-stone-500';
  }

  /** Clases de la línea que une el nodo actual con el anterior. */
  entregaLinea(paso: number): string {
    return this.entregaPaso() >= paso ? 'bg-emerald-500/70' : 'bg-white/10';
  }

  /** Color del rótulo de cada paso según su estado. */
  entregaLabelColor(paso: number): string {
    const actual = this.entregaPaso();
    if (paso < actual || this.entregaFase() === 'entregado') return 'text-emerald-300';
    if (paso === actual) return 'text-amber-300';
    return 'text-stone-500';
  }

  /** Tiempo sellado de cada hito de entrega. */
  entregaMomento(paso: number): string {
    if (paso === 1) return this.confirmadaEn() ? 'Acreditado el ' + this.confirmadaEn() : 'Acreditado';
    if (paso === 2) return this.enCaminoEn() || (this.entregaFase() === 'asignando' ? 'Asignado · recoge el paquete' : 'En camino');
    return this.entregadoEn() || 'Pendiente';
  }

  readonly destinoTexto = computed(() =>
    this.destino() === 'taller' ? this.tallerNombre() : this.ubicacion().trim() || 'Mi ubicación'
  );

  // ── Wizard de envío (Pasos 2–6 del flujo logístico) ─────────────────────────
  /** Destinos grandes: taller de confianza o mi ubicación. */
  readonly destino = signal<'taller' | 'ubicacion'>('taller');
  readonly tallerId = signal('ramos');
  readonly ubicacion = signal('Av. Fontana 450 · Trelew');
  /** Velocidad: programado (1x consolidado) u urgente (2x viaje directo). */
  readonly velocidad = signal<'programado' | 'urgente'>('programado');
  /** Comprobante adjunto (demo: solo nombre + preview). */
  readonly comprobanteNombre = signal<string | null>(null);
  readonly comprobantePreview = signal<string | null>(null);
  readonly comprobanteEsImagen = signal(false);
  readonly copiado = signal<'' | 'alias' | 'cbu' | 'pin'>('');
  /** Cuenta regresiva de los precios congelados al iniciar el flujo (20 min). */
  readonly congelarSeg = signal(0);
  readonly pin = signal('');
  readonly confirmadaEn = signal('');

  /** Talleres de destino (demo): el primero es el "taller de confianza". */
  readonly talleres = [
    { id: 'ramos', nombre: 'Taller Ramos', detalle: 'Av. Fontana 450 · Trelew', marca: 'Tu taller de confianza' },
    { id: 'chelo', nombre: 'Taller del Chelo', detalle: '25 de Mayo 1.230 · Trelew', marca: 'Verificado' },
    { id: 'liano', nombre: 'Taller Parque Norte', detalle: 'Av. Italia 2.340 · Trelew', marca: 'Horario comercial' },
  ];

  private congelaTimer: ReturnType<typeof setInterval> | null = null;
  private readonly destroyRef = inject(DestroyRef);
  private readonly cleanupCongela = this.destroyRef.onDestroy(() => this.clearCongelaTimer());

  /** Secciones plegadas por defecto: la lista de casas no invade la pantalla. */
  readonly partsOpen = signal<Set<string>>(new Set());

  // ── Derivados del combo ────────────────────────────────────────────────────
  /** Solo las piezas efectivamente elegidas: al desmarcar una, sale del pedido y del total. */
  private readonly chosenItems = computed(() =>
    this.partsCatalog.flatMap((part) => {
      const id = this.combo()[part.key];
      const item = id ? part.items.find((i) => i.id === id) : undefined;
      return item ? [{ part, item }] : [];
    })
  );

  readonly trelewItems = computed(() => this.chosenItems().filter((r) => !r.item.isMadryn));
  readonly madrynItems = computed(() => this.chosenItems().filter((r) => r.item.isMadryn));

  readonly comboCount = computed(() => this.chosenItems().length);
  readonly comboSubtotal = computed(() => this.chosenItems().reduce((acc, r) => acc + r.item.priceNum, 0));
  /** Un solo envío por origen (consolidado): el flete es el mayor de las piezas desde Madryn. */
  readonly madrynFleteBase = computed(() =>
    this.madrynItems().reduce((mx, r) => Math.max(mx, r.item.shippingFeeNum ?? 0), 0)
  );
  /** Urgente duplica el flete: viaje directo, sin consolidar con otros paquetes. */
  readonly fleteFactor = computed(() => (this.velocidad() === 'urgente' ? 2 : 1));
  readonly comboShipping = computed(() => this.madrynFleteBase() * this.fleteFactor());
  /** Próxima ventana de reparto consolidado según la hora actual. */
  readonly ventanaReparto = computed(() => {
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    if (h < 11.5) return { dia: 'Hoy', corte: '11:30', rango: 'de 12:00 a 13:30 hs' };
    if (h < 17) return { dia: 'Hoy', corte: '17:00', rango: 'de 17:00 a 18:30 hs' };
    return { dia: 'Mañana', corte: '11:30', rango: 'de 12:00 a 13:30 hs' };
  });
  /** ETA visible: urgente ~45 min; programado según ventana. */
  readonly entregaEstimada = computed(() =>
    this.velocidad() === 'urgente'
      ? 'Hoy en ~45 min'
      : this.ventanaReparto().dia + ' ' + this.ventanaReparto().rango
  );
  readonly comboTotal = computed(() => this.comboSubtotal() + this.comboShipping());
  readonly comboComplete = computed(() => this.comboCount() === this.partsCatalog.length);
  readonly comboProgress = computed(() =>
    Math.round((this.comboCount() / Math.max(1, this.partsCatalog.length)) * 100)
  );

  readonly totalOfertas = computed(() => this.partsCatalog.reduce((acc, p) => acc + p.items.length, 0));
  readonly hasMadryn = computed(() => this.comboShipping() > 0);

  readonly totalFmt = computed(() => this.money(this.comboTotal()));
  readonly subtotalFmt = computed(() => this.money(this.comboSubtotal()));
  readonly shippingFmt = computed(() =>
    this.comboShipping() > 0 ? '+$' + this.comboShipping().toLocaleString('es-AR') : '$0'
  );
  readonly congelarTexto = computed(() => {
    const s = Math.max(0, this.congelarSeg());
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  });
  /** Paso del wizard (1–6) para el stepper y los títulos. */
  readonly pasoWizard = computed(() =>
    ({ resumen: 1, destino: 2, velocidad: 3, transferencia: 4, validando: 5, confirmado: 6 }[this.envioFase()])
  );
  readonly faseTitulo = computed(() => {
    switch (this.envioFase()) {
      case 'resumen': return 'Paso 1 de 6 · Selección';
      case 'destino': return 'Paso 2 de 6 · Destino';
      case 'velocidad': return 'Paso 3 de 6 · Velocidad';
      case 'transferencia': return 'Paso 4 de 6 · Transferencia';
      case 'validando': return 'Paso 5 de 6 · Validando pago';
      case 'confirmado': return 'Paso 6 de 6 · Confirmado';
    }
  });
  /** Taller elegido (nombre para resúmenes). */
  readonly tallerNombre = computed(() => this.talleres.find((t) => t.id === this.tallerId())?.nombre ?? 'Taller elegido');
  readonly trelewSubtotal = computed(() =>
    this.trelewItems().reduce((acc, r) => acc + r.item.priceNum, 0)
  );

  /** Anillo: selección (0–75%), comprobante enviado (90%) y 100% al confirmar. */
  readonly taskPercent = computed(() => {
    const fase = this.envioFase();
    if (fase === 'confirmado') return 100;
    if (fase === 'validando') return 90;
    return Math.round((this.comboProgress() / 100) * 75);
  });
  readonly ringOffset = computed(() => 138.23 * (1 - this.taskPercent() / 100));
  readonly ringColor = computed(() =>
    this.confirmado() ? '#2ECC71' : 'url(#ringAmberGrad)'
  );
  readonly nextStepLabel = computed(() => {
    const fase = this.envioFase();
    if (fase === 'confirmado') return 'Pedido confirmado · stock reservado';
    if (fase === 'validando') return 'Comprobante enviado · validando pago';
    if (!this.comboComplete()) {
      const faltan = this.partsCatalog.length - this.comboCount();
      return 'Falta elegir ' + faltan + (faltan === 1 ? ' pieza' : ' piezas');
    }
    return 'Falta confirmar el pedido';
  });

  // ── Helpers de catálogo ───────────────────────────────────────────────────
  sortedItems(part: CatalogPart): CatalogItem[] {
    return [...part.items].sort((a, b) => a.priceNum - b.priceNum);
  }

  isCheapest(part: CatalogPart, item: CatalogItem): boolean {
    return item.priceNum === this.sortedItems(part)[0].priceNum;
  }

  /** Ciudad de la oferta: siempre visible, nunca compite con el nombre del comercio. */
  ciudad(item: CatalogItem): string {
    return item.isMadryn ? 'Pto. Madryn' : 'Trelew';
  }

  /** Versión corta para las filas colapsadas, donde el ancho es escaso. */
  ciudadCorta(item: CatalogItem): string {
    return item.isMadryn ? 'Madryn' : 'Trelew';
  }

  selectedOf(part: CatalogPart): CatalogItem | undefined {
    const id = this.combo()[part.key];
    return id ? part.items.find((i) => i.id === id) : undefined;
  }

  isSelected(partKey: string, itemId: string): boolean {
    return this.combo()[partKey] === itemId;
  }

  money(value: number): string {
    return '$' + value.toLocaleString('es-AR');
  }

  itemTotal(item: CatalogItem): number {
    return item.priceNum + (item.isMadryn ? (item.shippingFeeNum ?? 0) : 0);
  }

  // ── Plegado ───────────────────────────────────────────────────────────────
  isPartOpen(key: string): boolean {
    return this.partsOpen().has(key);
  }

  togglePart(key: string): void {
    const next = new Set(this.partsOpen());
    if (next.has(key)) next.delete(key); else next.add(key);
    this.partsOpen.set(next);
  }

  todoAbierto(): boolean {
    return this.partsCatalog.every((p) => this.partsOpen().has(p.key));
  }

  toggleAll(): void {
    this.partsOpen.set(this.todoAbierto() ? new Set() : new Set(this.partsCatalog.map((p) => p.key)));
  }

  // ── Selección del combo ───────────────────────────────────────────────────
  /** Un tap elige la oferta; otro tap sobre la misma la desmarca y resta la pieza del pedido. */
  selectComboItem(partKey: string, itemId: string): void {
    // Al editar piezas, el wizard vuelve al inicio (los precios congelados quedan sin efecto).
    this.envioFase.set('resumen');
    this.entregaFase.set('asignando');
    this.enCaminoEn.set('');
    this.entregadoEn.set('');
    const next = { ...this.combo() };
    if (this.isSelected(partKey, itemId)) {
      delete next[partKey];
    } else {
      next[partKey] = itemId;
    }
    this.combo.set(next);
  }

  /** Enter/Espacio seleccionan la oferta cuando el foco está en la fila (no en el botón de ficha). */
  onRowKey(event: Event, partKey: string, itemId: string): void {
    if (event.target !== event.currentTarget) return;
    const key = (event as KeyboardEvent).key;
    if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
      event.preventDefault();
      this.selectComboItem(partKey, itemId);
    }
  }

  // ── Garaje: helpers y acciones ────────────────────────────────────────────
  kmFmt(km: number): string {
    return km.toLocaleString('es-AR');
  }

  tonoTexto(t: Tono): string {
    return { emerald: 'text-emerald-400', cyan: 'text-cyan-400', rose: 'text-rose-300', sky: 'text-sky-400' }[t];
  }

  tonoBarra(t: Tono): string {
    return { emerald: 'bg-emerald-400', cyan: 'bg-cyan-400', rose: 'bg-rose-500', sky: 'bg-sky-400' }[t];
  }

  tonoTarjeta(t: Tono): string {
    return t === 'rose'
      ? 'from-[#2A181C] to-[#171114] border-rose-500/40'
      : 'from-[#18202A] to-[#12161D] border-white/10';
  }

  etiquetaCheckup(key: CheckupKey): string {
    const etiquetas: Record<CheckupKey, string> = {
      bateria: 'Voltaje registrado (V)',
      anticongelante: 'Fecha del último cambio',
      distribucion: 'Control de distribución',
      neumaticos: 'Presión medida (PSI)',
    };
    return etiquetas[key];
  }

  ayudaCheckup(key: CheckupKey): string {
    const ayudas: Record<CheckupKey, string> = {
      bateria: '12,6 V a 12,8 V indican carga completa. Menos de 12,2 V requiere recarga o recambio.',
      anticongelante: 'El refrigerante orgánico dura entre 2 y 3 años antes de perder sus propiedades.',
      distribucion: 'Revisá tensión y estado del tensor. Intervalo: 120.000 km o 5 años.',
      neumaticos: 'En frío: 32 PSI adelante y atrás; 35 PSI con carga completa. Revisá cada 15 días.',
    };
    return ayudas[key];
  }

  seleccionarVehiculo(id: string): void {
    this.garageActiveId.set(id);
    this.garageTab.set('estado');
    const v = this.garageVehicles().find((x) => x.id === id);
    this.historyOpen.set(v?.historial[0]?.id ?? '');
    this.enfocarAuto(id);
  }

  /** Centra en el carrusel el auto recién elegido sin mover la página. */
  private enfocarAuto(id: string): void {
    requestAnimationFrame(() => {
      document.getElementById('car-' + id)?.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
  }

  toggleHistory(id: string): void {
    this.historyOpen.set(this.historyOpen() === id ? '' : id);
  }

  /** Aplica un cambio al vehículo activo sin mutar el resto del garaje. */
  private actualizarVehiculo(fn: (v: GarageVehicle) => GarageVehicle): void {
    const id = this.garageActiveId();
    this.garageVehicles.update((list) => list.map((v) => (v.id === id ? fn(v) : v)));
  }

  guardarKm(raw: string | number): void {
    const km = Number(raw);
    if (!km || km <= 0) return;
    this.actualizarVehiculo((v) => ({ ...v, km }));
    this.closeSheet();
  }

  guardarCheckup(raw: string): void {
    const key = this.checkupKey();
    const valor = raw.trim();
    if (!key || !valor) return;
    this.actualizarVehiculo((v) => ({
      ...v,
      checkups: v.checkups.map((c) => (c.key === key ? { ...c, valor, estado: 'Actualizado hoy' } : c)),
    }));
    this.closeSheet();
  }

  agregarVehiculo(patenteRaw: string, modeloRaw: string, kmRaw: string): void {
    const patente = patenteRaw.trim().toUpperCase();
    const modelo = modeloRaw.trim();
    if (!patente) {
      document.getElementById('g-patente')?.focus();
      return;
    }
    if (!modelo) {
      document.getElementById('g-modelo')?.focus();
      return;
    }

    const id = 'v' + Date.now();
    const nuevo: GarageVehicle = {
      id,
      corto: modelo.split(/\s+/).slice(0, 2).join(' '),
      titulo: modelo,
      patente,
      vin: 'Pendiente de validación',
      motor: 'A confirmar',
      transmision: 'A confirmar',
      frenos: 'A confirmar',
      km: Number(kmRaw) || 0,
      etiquetaMotor: '—',
      estado: 'A verificar',
      specs: { motor: '—', potencia: '—', combustible: '—', traccion: '—', caja: '—' },
      checkups: [
        { key: 'bateria', titulo: 'Batería', valor: '—', detalle: 'Sin registro', estado: 'Agregá la primera medición', pct: 0, tono: 'emerald' },
        { key: 'anticongelante', titulo: 'Refrigerante', valor: '—', detalle: 'Sin registro', estado: 'Agregá la primera medición', pct: 0, tono: 'cyan' },
        { key: 'distribucion', titulo: 'Distribución', valor: '—', detalle: 'Sin registro', estado: 'Agregá la primera medición', pct: 0, tono: 'rose' },
        { key: 'neumaticos', titulo: 'Neumáticos', valor: '—', detalle: 'Sin registro', estado: 'Agregá la primera medición', pct: 0, tono: 'sky' }
      ],
      servicios: [],
      historial: []
    };

    this.garageVehicles.update((list) => [...list, nuevo]);
    this.garageActiveId.set(id);
    this.garageTab.set('estado');
    this.historyOpen.set('');
    this.closeSheet();
    this.enfocarAuto(id);
  }

  guardarServicio(tipo: string, kmRaw: string, fecha: string, notas: string, costo: string, taller: string): void {
    const km = Number(kmRaw) || this.garageVehicle().km;
    const nombre = this.nombreServicio(tipo);
    const icono = this.iconoServicio(tipo);
    const id = 's' + Date.now();

    this.actualizarVehiculo((v) => ({
      ...v,
      km: Math.max(v.km, km),
      servicios: v.servicios.map((s) =>
        s.icono === icono ? { ...s, ultimo: this.kmFmt(km) + ' km', nota: 'Registrado hoy', alerta: false } : s
      ),
      historial: [
        {
          id,
          titulo: nombre,
          fecha: this.fechaCorta(fecha),
          km: this.kmFmt(km) + ' km',
          lugar: taller.trim() || 'Taller sin especificar',
          trabajos: [{ nombre: notas.trim() || nombre, monto: costo.trim() || '—' }],
          repuestos: []
        },
        ...v.historial
      ]
    }));

    this.historyOpen.set(id);
    this.garageTab.set('historial');
    this.closeSheet();
  }

  private nombreServicio(tipo: string): string {
    const nombres: Record<string, string> = {
      aceite: 'Cambio de aceite & filtro',
      aire: 'Filtro de aire & habitáculo',
      distribucion: 'Correa de distribución & bomba',
      frenos: 'Pastillas & discos de freno',
      otro: 'Mantenimiento general'
    };
    return nombres[tipo] ?? 'Mantenimiento general';
  }

  private iconoServicio(tipo: string): GarageService['icono'] {
    return tipo === 'distribucion' ? 'correa' : (tipo as GarageService['icono']);
  }

  private fechaCorta(iso: string): string {
    const [y, m, d] = (iso || this.hoy).split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mes = meses[Number(m) - 1] ?? '';
    return `${Number(d)} ${mes} ${y}`;
  }

  // ── Sheets ────────────────────────────────────────────────────────────────
  /** Abre un sheet guardando el foco previo para restaurarlo al cerrar. */
  private open(sheet: Sheet): void {
    this.lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.activeSheet.set(sheet);
  }

  openVehicleSheet(): void { this.open('vehicle'); }
  openTasks(): void { this.open('tasks'); }
  openComboSheet(): void { this.open('combo'); }
  openAddPartSheet(): void { this.open('addPart'); }
  openPerfilSheet(): void { this.open('perfil'); }
  openGarageAdd(): void { this.open('garageAdd'); }
  openGarageKm(): void { this.open('garageKm'); }
  openGarageService(): void { this.open('garageService'); }
  openGarageNotif(): void { this.open('garageNotif'); }

  openGarageCheckup(key: CheckupKey): void {
    this.checkupKey.set(key);
    this.open('garageCheckup');
  }

  /** La campana muestra el seguimiento del pedido o las alertas del garaje según la vista. */
  onBell(): void {
    if (this.vista() === 'garaje') this.openGarageNotif();
    else this.openTasks();
  }

  openItemSheet(item: CatalogItem, parent: CatalogPart): void {
    this.selectedItem.set(item);
    this.selectedParentPart.set(parent);
    this.open('item');
  }

  closeSheet(): void {
    if (!this.activeSheet()) return;
    this.activeSheet.set(null);
    this.checkupKey.set(null);
    const target = this.lastFocused;
    this.lastFocused = null;
    if (target && document.contains(target)) target.focus({ preventScroll: true });
  }

  /** Ficha técnica → “Reservar…”: abre el wizard de envío desde el inicio. */
  reservar(): void {
    this.envioFase.set('resumen');
    this.entregaFase.set('asignando');
    this.enCaminoEn.set('');
    this.entregadoEn.set('');
    this.open('combo');
  }

  private clearCongelaTimer(): void {
    if (this.congelaTimer) {
      clearInterval(this.congelaTimer);
      this.congelaTimer = null;
    }
  }

  /** Paso 1 → 2: congela los precios 20 minutos y arranca la cuenta regresiva. */
  irAlEnvio(): void {
    if (this.comboCount() === 0) return;
    this.congelarSeg.set(20 * 60);
    this.clearCongelaTimer();
    this.congelaTimer = setInterval(() => {
      const next = this.congelarSeg() - 1;
      this.congelarSeg.set(next > 0 ? next : 0);
      if (next <= 0) this.clearCongelaTimer();
    }, 1000);
    this.envioFase.set('destino');
  }

  irAResumen(): void { this.envioFase.set('resumen'); }
  irAVelocidad(): void { this.envioFase.set('velocidad'); }
  irATransferencia(): void { this.envioFase.set('transferencia'); }
  volverADestino(): void { this.envioFase.set('destino'); }

  /** Destino válido: taller siempre; domicilio requiere dirección con al menos 4 caracteres. */
  destinoListo(): boolean {
    return this.destino() === 'taller' || this.ubicacion().trim().length >= 4;
  }

  elegirDestino(tipo: 'taller' | 'ubicacion'): void { this.destino.set(tipo); }
  elegirTaller(id: string): void { this.tallerId.set(id); this.destino.set('taller'); }
  setUbicacion(event: Event): void { this.ubicacion.set((event.target as HTMLInputElement).value); }
  elegirVelocidad(v: 'programado' | 'urgente'): void { this.velocidad.set(v); }

  /** Datos de transferencia (demo): alias y CBU copiables en un toque. */
  readonly aliasCbu = { alias: 'toolbox.patagonia', cbu: '0110595730000048958795' };

  async copiarTransferencia(campo: 'alias' | 'cbu' | 'pin'): Promise<void> {
    const valor = campo === 'alias' ? this.aliasCbu.alias : campo === 'cbu' ? this.aliasCbu.cbu : this.pin();
    if (!valor) return;
    try {
      await navigator.clipboard?.writeText(valor);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = valor;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* portapapeles sin soporte */ }
      ta.remove();
    }
    this.copiado.set(campo);
    window.setTimeout(() => { if (this.copiado() === campo) this.copiado.set(''); }, 1600);
  }

  onComprobante(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (this.comprobantePreview()) URL.revokeObjectURL(this.comprobantePreview()!);
    const esImagen = file.type.startsWith('image/');
    this.comprobanteEsImagen.set(esImagen);
    this.comprobantePreview.set(esImagen ? URL.createObjectURL(file) : null);
    this.comprobanteNombre.set(file.name);
    input.value = '';
  }

  /** Demo: genera un comprobante simulado para no bloquear el recorrido. */
  simularComprobante(): void {
    if (this.comprobantePreview()) URL.revokeObjectURL(this.comprobantePreview()!);
    this.comprobantePreview.set(null);
    this.comprobanteEsImagen.set(false);
    this.comprobanteNombre.set('comprobante-demo.pdf');
  }

  quitarComprobante(): void {
    if (this.comprobantePreview()) URL.revokeObjectURL(this.comprobantePreview()!);
    this.comprobantePreview.set(null);
    this.comprobanteNombre.set(null);
  }

  /** Paso 4 → 5: el comprobante entra a validación (anillo 90%). */
  enviarComprobante(): void {
    if (!this.comprobanteNombre()) return;
    this.clearCongelaTimer();
    this.envioFase.set('validando');
  }

  /** Demo admin: aprueba el pago y dispara la entrega (anillo 100%). */
  simularAprobacion(): void {
    this.pin.set(String(Math.floor(1000 + Math.random() * 9000)));
    const now = new Date();
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    this.confirmadaEn.set(`${now.getDate()} ${meses[now.getMonth()]} · ${hh}:${mm} hs`);
    this.entregaFase.set('asignando');
    this.enCaminoEn.set('');
    this.entregadoEn.set('');
    this.envioFase.set('confirmado');
  }

  /** Confirmado → seguimiento del pedido. */
  verSeguimiento(): void { this.open('tasks'); }

  /** Demo: avanza el cadete asignando → en camino → entregado (con sello horario). */
  avanzarEntrega(): void {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    if (this.entregaFase() === 'asignando') {
      this.entregaFase.set('enCamino');
      this.enCaminoEn.set(`Hoy · ${hh}:${mm} hs`);
    } else if (this.entregaFase() === 'enCamino') {
      this.entregaFase.set('entregado');
      this.entregadoEn.set(`Hoy · ${hh}:${mm} hs`);
    }
  }

  // ── Teclado ───────────────────────────────────────────────────────────────
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSheet();
  }

  /** Trap de foco: Tab y Shift+Tab circulan dentro del sheet abierto. */
  @HostListener('document:keydown.tab', ['$event'])
  onTab(raw: Event): void {
    if (!this.activeSheet()) return;
    const event = raw as KeyboardEvent;
    const panel = this.sheetPanel()?.nativeElement;
    if (!panel) return;

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && (active === first || !panel.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }

  // ── Navegación ────────────────────────────────────────────────────────────
  irAGaraje(): void {
    this.vista.set('garaje');
    window.scrollTo({ top: 0 });
  }

  irAPedidos(): void {
    this.vista.set('pedidos');
    window.scrollTo({ top: 0 });
  }

  irAConsultas(): void {
    this.router.navigate(['/']);
  }

  irAFacturacion(): void {
    this.router.navigate(['/']);
  }

  /** Cierra sesión: limpia el rol, la sesión real de Supabase y vuelve al inicio. */
  async cerrarSesion(): Promise<void> {
    setRolSesion(null);
    try { await this.supa.cerrarSesion(); } catch { /* la sesión local ya quedó invalidada */ }
    this.closeSheet();
    this.router.navigate(['/']);
  }

  onImgFallback(event: Event): void {
    const target = event.target as HTMLElement;
    target.style.display = 'none';
  }
}
