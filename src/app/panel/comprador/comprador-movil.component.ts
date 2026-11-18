<<<<<<< Updated upstream
import { Component, inject, signal } from '@angular/core';
=======
﻿import { Component, ElementRef, HostListener, computed, effect, inject, signal, viewChild } from '@angular/core';
>>>>>>> Stashed changes
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../application/services/supabase.service';
import { usuarioSesion } from '../../../application/services/demo-api.service';
import { setRolSesion } from '../../sesion';

export interface CatalogItem {
  id: string;
  tier: string;
  tierIcon: 'star' | 'shield';
  tierBadge: string;
  brand: string;
  store: string;
  dist: string;
  price: string;
  priceNum: number;
  delivery: string;
  deliverySub: string;
  isMadryn: boolean;
  desc: string;
  specs: string;
}

export interface CatalogPart {
  key: string;
  name: string;
  spec: string;
  img: string;
  offersCount: string;
  items: CatalogItem[];
}

<<<<<<< Updated upstream
=======
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
  | 'vehicle' | 'tasks' | 'item' | 'combo' | 'success' | 'addPart' | 'perfil'
  | 'garageAdd' | 'garageKm' | 'garageService' | 'garageCheckup' | 'garageNotif';

// Panel móvil del comprador (< 768px): estética Steve Jobs, selección de combo
// en 3 piezas, una sola barra fija (pedido + navegación) y anillo de progreso.
>>>>>>> Stashed changes
@Component({
  selector: 'app-comprador-movil',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #080706;
      background-image:
        radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 10% 25%, rgba(200, 142, 98, 0.08) 0%, transparent 40%),
        linear-gradient(180deg, #0A0908 0%, #030303 100%);
      background-attachment: fixed;
      color: #F5F5F7;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Plus Jakarta Sans", sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .jobs-monolith {
      background: rgba(18, 17, 16, 0.90);
      backdrop-filter: blur(36px) saturate(180%);
      -webkit-backdrop-filter: blur(36px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow:
        0 20px 40px -10px rgba(0, 0, 0, 0.8),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 1px rgba(255, 255, 255, 0.22);
      border-radius: 1.5rem;
    }
    .jobs-dock {
<<<<<<< Updated upstream
      background: rgba(18, 17, 16, 0.95);
      backdrop-filter: blur(32px) saturate(200%);
      -webkit-backdrop-filter: blur(32px) saturate(200%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow:
        0 25px 50px -10px rgba(0, 0, 0, 0.85),
        0 0 0 1px rgba(255, 255, 255, 0.08),
        inset 0 1px 1px rgba(255, 255, 255, 0.3);
    }
    .sheet-drawer {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    }
=======
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

    .dock-wrap { padding-bottom: max(0.6rem, env(safe-area-inset-bottom)); }
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
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
>>>>>>> Stashed changes
  `],
  template: `
    <div class="selection:bg-amber-400 selection:text-stone-950 min-h-screen pb-32 p-3 sm:p-5 relative">

      <!-- TOP BAR ZEN: MÍNIMO Y ELEGANTE -->
      <header class="flex items-center justify-between py-2 text-white max-w-md mx-auto mb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-2xl bg-stone-900 border border-amber-400/40 p-1.5 flex items-center justify-center shadow-md">
            <img src="/logo.svg" alt="Toolbox Patagonia" class="w-full h-full object-contain" (error)="onImgFallback($event)">
          </div>
          <div>
<<<<<<< Updated upstream
            <h1 class="text-xs font-black tracking-tight text-white uppercase">Toolbox <span class="text-amber-400">Patagonia</span></h1>
            <p class="text-[10px] text-stone-400 font-mono">Consola Comprador</p>
=======
            <h1 class="t-body font-black tracking-tight text-white uppercase drop-shadow-sm">Toolbox <span class="text-amber-400">Patagonia</span></h1>
            <p class="t-micro text-stone-800 font-semibold">{{ vista() === 'garaje' ? 'Mi Garaje Digital' : 'Consola Comprador' }}</p>
>>>>>>> Stashed changes
          </div>
        </div>

        <!-- ACCESOS RÁPIDOS MÍNIMOS -->
        <div class="flex items-center gap-2">
<<<<<<< Updated upstream
          <button class="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-stone-300 hover:text-white flex items-center justify-center relative active:scale-95 transition" title="Notificaciones">
            <svg class="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span class="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5 ring-2 ring-black"></span>
          </button>
          <button (click)="openPerfilSheet()" class="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer" title="Mi cuenta">
=======
          <button type="button" (click)="onBell()" class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-stone-900/80 border border-white/20 text-stone-200 hover:text-white flex items-center justify-center relative active:scale-95 transition cursor-pointer" title="Notificaciones" aria-label="Notificaciones">
            <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-2 right-2 ring-2 ring-black" aria-hidden="true"></span>
          </button>
          <button type="button" (click)="openPerfilSheet()" class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-amber-400 text-stone-950 font-bold t-body flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer" title="Mi cuenta" aria-label="Mi cuenta">
>>>>>>> Stashed changes
            {{ iniciales }}
          </button>
        </div>
      </header>

      <!-- CONTENIDO PRINCIPAL: STEVE JOBS - MÁXIMA SÍNTESIS -->
      <main class="space-y-3 max-w-md mx-auto">

<<<<<<< Updated upstream
        <!-- 1. VEHÍCULO CON FOTO REAL Y REGISTRO DNRPA -->
        <div (click)="openVehicleSheet()" class="jobs-monolith p-2.5 sm:p-3 text-white cursor-pointer active:scale-[0.99] transition hover:border-amber-400/40 flex items-center justify-between group shadow-lg">
          <div class="flex items-center gap-3 min-w-0">
            <div class="relative w-12 h-11 rounded-xl overflow-hidden border border-white/20 bg-black/60 shrink-0 shadow-inner">
              <img [src]="vehicleImg" alt="VW Passat 2.0 TDI" class="w-full h-full object-cover">
              <span class="absolute bottom-0 inset-x-0 bg-black/75 text-[7px] text-center font-mono text-amber-300 font-bold uppercase tracking-tight">Passat</span>
            </div>
            <div class="leading-tight min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-mono font-black text-[10px] tracking-wider shadow-sm">
                  AB 412 TX
                </span>
                <span class="text-xs font-bold text-white truncate">VW Passat 2.0 TDI</span>
              </div>
              <p class="text-[10px] text-stone-400 font-mono flex items-center gap-1 mt-1 truncate">
                <span class="text-emerald-400 font-semibold flex items-center gap-0.5">
                  <svg class="w-3 h-3 text-emerald-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  DNRPA Trelew
                </span>
                <span>· 3 repuestos cotizados</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1 text-[11px] font-mono text-stone-400 group-hover:text-amber-300 shrink-0 pl-2">
            <span class="text-[10px] font-medium hidden sm:inline">Ver Ficha</span>
            <svg class="w-4 h-4 text-stone-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
=======
        @if (vista() === 'pedidos') {

        <!-- 1. VEHÍCULO RESUMIDO -->
        <button type="button" (click)="openVehicleSheet()" class="jobs-monolith w-full text-left p-3 text-white cursor-pointer active:scale-[0.99] transition hover:border-amber-400/40 flex items-center justify-between gap-2.5 group shadow-md">
          <span class="flex items-center gap-3 min-w-0 flex-1">
            <span class="relative w-11 h-11 rounded-xl overflow-hidden border border-white/20 bg-black/60 shrink-0 shadow-inner">
              <img [src]="vehicleImg" alt="" class="w-full h-full object-cover">
            </span>
            <span class="leading-tight min-w-0 flex-1 space-y-1 block">
              <span class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-black t-micro tracking-wider">
                  AB 412 TX
                </span>
                <span class="t-title font-extrabold text-white truncate">VW Passat 2.0 TDI</span>
              </span>
              <span class="t-micro text-stone-300 flex items-center gap-1.5 truncate">
                <span class="text-emerald-400 font-bold">✓ Cédula verde Trelew</span>
                <span class="text-stone-400">· {{ partsCatalog.length }} piezas</span>
              </span>
            </span>
          </span>
          <span class="text-stone-400 group-hover:text-amber-300 t-micro font-bold flex items-center gap-1 shrink-0">
            <span>Ficha</span>
            <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </span>
        </button>

        <!-- 2. PROGRESO DEL PEDIDO (informativo, no es un CTA de compra) -->
        <button type="button" (click)="openTasks()" class="jobs-monolith w-full text-left p-3.5 text-white cursor-pointer active:scale-[0.99] transition border border-white/10 hover:border-[#F5C342]/40 bg-[#141210] shadow-lg group flex items-center justify-between gap-3.5">
          <span class="space-y-1 min-w-0 flex-1 block">
            <span class="flex items-center gap-2">
              <span class="t-title font-bold text-white tracking-tight">Progreso del pedido</span>
            </span>
            <span class="t-body text-stone-400 block">
              {{ confirmado() ? 'Pedido confirmado' : comboComplete() ? '3 de 3 piezas elegidas' : comboCount() + ' de 3 piezas elegidas' }}
            </span>
            <span class="t-body font-bold block" [ngClass]="confirmado() ? 'text-[#2ECC71]' : 'text-[#F5C342]'">
              {{ nextStepLabel() }}
            </span>
          </span>

          <span class="flex items-center gap-3 shrink-0">
            <span class="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg aria-hidden="true" class="w-14 h-14 -rotate-90 ring-glow" viewBox="0 0 56 56">
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
              <span class="absolute inset-0 flex items-center justify-center leading-none select-none">
                <span class="t-price font-bold text-white">{{ taskPercent() }}</span><span class="t-micro font-bold ml-0.5" [ngClass]="confirmado() ? 'text-[#2ECC71]' : 'text-[#F5C342]'">%</span>
              </span>
            </span>
            <svg aria-hidden="true" class="w-4 h-4 text-[#C9C4BD] group-hover:text-[#F5C342] group-hover:translate-x-0.5 transition-all shrink-0 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
>>>>>>> Stashed changes
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
            </svg>
          </span>
        </button>

<<<<<<< Updated upstream
        <!-- TÍTULO DE SECCIÓN CON INDICADOR DE CIUDADES -->
        <div class="flex items-center justify-between px-1 pt-1 text-xs font-mono">
          <span class="text-stone-300 font-semibold flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Presupuestos Recibidos
          </span>
          <span class="text-emerald-400 font-bold text-[10px] sm:text-[11px] flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Trelew y Pto. Madryn (65 km)
          </span>
        </div>

        <!-- CONTROL DE PLEGADO: una sola acción para ver u ocultar todas las ofertas -->
        <div class="flex items-center justify-end px-1 -mt-1 text-[10px] font-mono">
          <button (click)="toggleAll()" class="text-stone-400 hover:text-amber-300 transition cursor-pointer">
            {{ todoAbierto() ? 'Contraer todo' : 'Mostrar todas las ofertas' }}
          </button>
=======
        <!-- TÍTULO DE SECCIÓN + ACCIÓN -->
        <div class="flex items-center justify-between px-1 pt-1 gap-2">
          <h2 class="t-title text-stone-900 font-bold drop-shadow-sm">Elegí tus repuestos</h2>
          <div class="flex items-center gap-1.5">
            <span class="t-micro text-stone-900 font-bold flex items-center gap-1 bg-white/60 backdrop-blur-md px-2 py-1 rounded-full border border-stone-900/20 shadow-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-stone-800" aria-hidden="true"></span>
              {{ totalOfertas() }} ofertas
            </span>
            <button type="button" (click)="toggleAll()"
                    class="t-body font-bold text-stone-900 underline decoration-stone-900/40 hover:decoration-stone-900 transition cursor-pointer px-1 min-h-[44px]">
              {{ todoAbierto() ? 'Cerrar todas' : 'Mostrar todas' }}
            </button>
          </div>
>>>>>>> Stashed changes
        </div>

        <!-- 4. LISTADO AGRUPADO POR NOMBRE DE REPUESTO -->
        <div class="space-y-3.5">
          @for (part of partsCatalog; track part.key) {
            <section class="jobs-monolith text-white shadow-xl border border-white/10 overflow-hidden">
<<<<<<< Updated upstream
              <!-- Encabezado del repuesto: tocá para contraer/expandir las ofertas -->
              <button (click)="togglePart(part.key)"
                      [attr.aria-expanded]="isPartOpen(part.key)"
                      class="w-full flex items-center justify-between gap-2 p-3 sm:p-3.5 text-left active:bg-white/[0.04] transition cursor-pointer">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-stone-900 shrink-0 shadow-md">
                    <img [src]="part.img" [alt]="part.name" class="w-full h-full object-cover">
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate">{{ part.name }}</h3>
                    <p class="text-[10px] text-stone-400 font-mono truncate">{{ part.spec }} · <span class="text-amber-300 font-bold">{{ part.items.length }} casas</span></p>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0 pl-2">
                  <div class="text-right">
                    <span class="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/20">
                      Desde {{ part.items[0].price }}
                    </span>
                    <span class="block text-[9px] font-mono text-stone-500 mt-1">
                      {{ isPartOpen(part.key) ? 'Ocultar ofertas' : 'Ver ' + part.items.length + ' ofertas' }}
                    </span>
=======
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
                        <span class="t-title font-extrabold text-white tracking-tight leading-snug">{{ part.name }}</span>
                        <span class="t-micro font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 whitespace-nowrap">{{ part.items.length }} ofertas</span>
                      </span>
                      <span class="t-micro text-stone-400 mt-1 flex items-center gap-1 min-w-0">
                        @if (isPartOpen(part.key)) {
                          <span class="truncate">{{ part.spec }}</span>
                        } @else {
                          <span class="text-emerald-400 font-bold shrink-0" aria-hidden="true">✓</span>
                          <span class="text-stone-200 truncate min-w-0">{{ selectedOf(part).brand }}</span>
                          <span class="text-stone-500 shrink-0" aria-hidden="true">·</span>
                          <span class="text-stone-200 font-semibold shrink-0">{{ selectedOf(part).price }}</span>
                        }
                      </span>
                    </span>
                  </span>

                  <span class="flex flex-col items-end gap-1 shrink-0">
                    <span class="t-micro font-bold text-stone-300 whitespace-nowrap">
                      Desde {{ minPrice(part) }}
                    </span>
                    <span class="flex items-center gap-1 px-2 py-1 rounded-xl transition-all"
                          [ngClass]="isPartOpen(part.key) ? 'bg-amber-400/20 border border-amber-400/50 text-amber-300' : 'bg-white/10 border border-white/15 text-stone-200'">
                      <span class="t-micro font-black uppercase tracking-tight">{{ isPartOpen(part.key) ? 'Cerrar' : 'Ver' }}</span>
                      <svg aria-hidden="true" class="w-3.5 h-3.5 transition-transform duration-200 stroke-[3]"
                           [ngClass]="isPartOpen(part.key) ? 'rotate-180 text-amber-400' : 'text-stone-300'"
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
                           [attr.aria-label]="item.brand + ', ' + item.price + ', ' + item.store"
                           (click)="selectComboItem(part.key, item.id)"
                           (keydown)="onRowKey($event, part.key, item.id)"
                           [ngClass]="isSelected(part.key, item.id) ? 'card-selected' : 'card-unselected hover:border-stone-600'"
                           class="p-3 rounded-2xl cursor-pointer active:scale-[0.99] transition flex items-center justify-between gap-3 group min-h-[64px]">

                        <div class="flex items-center gap-3 min-w-0 flex-1">
                          <!-- SELECTOR RADIO 20x20 -->
                          @if (isSelected(part.key, item.id)) {
                            <div class="w-5 h-5 rounded-full bg-[#F5C342] text-[#12100E] flex items-center justify-center shrink-0 shadow-sm" aria-hidden="true">
                              <svg class="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                          } @else {
                            <div class="w-5 h-5 rounded-full border border-[#666666] bg-transparent shrink-0 group-hover:border-[#F5C342]/60 transition-colors" aria-hidden="true"></div>
                          }

                          <div class="space-y-1 min-w-0 flex-1">
                            <div class="flex items-center gap-1.5 flex-wrap">
                              <span class="px-2 py-0.5 rounded-full t-micro font-bold flex items-center gap-1"
                                    [ngClass]="item.isMadryn ? 'bg-white/10 text-stone-300 border border-white/15' : (isCheapest(part, item) ? 'bg-[#F5C342]/15 text-[#F5C342] border border-[#F5C342]/30' : 'bg-white/10 text-stone-300 border border-white/15')">
                                {{ item.isMadryn ? 'Madryn · 65 km' : (isCheapest(part, item) ? '★ Más barata' : 'Intermedia') }}
                              </span>
                            </div>

                            <h4 class="t-title font-bold text-white tracking-tight leading-snug group-hover:text-[#F5C342] transition-colors">{{ item.brand }}</h4>

                            <div class="flex items-center gap-1.5 t-micro text-stone-400">
                              @if (item.isMadryn) {
                                <svg aria-hidden="true" class="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                              } @else {
                                <svg aria-hidden="true" class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h18l-2 9H5L3 3zm0 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z"></path></svg>
                              }
                              <span class="truncate">{{ item.store }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                          <div class="text-right">
                            <span class="t-price font-bold block" [ngClass]="isSelected(part.key, item.id) ? 'text-[#F5C342]' : 'text-white'">{{ item.price }}</span>
                            @if (item.isMadryn) {
                              <div class="flex flex-col items-end t-micro mt-1">
                                <span class="text-stone-400">Cadete Ruta 3</span>
                                <span class="text-stone-200 font-semibold bg-white/5 px-1.5 py-0.5 rounded border border-white/10 mt-0.5">{{ item.shippingFee }} · {{ item.shippingEta }}</span>
                              </div>
                            } @else {
                              <span class="block t-micro text-stone-400 mt-1">Mostrador hoy</span>
                            }
                          </div>

                          <!-- BOTÓN INFO (no selecciona) -->
                          <button type="button" (click)="$event.stopPropagation(); openItemSheet(item, part)"
                                  class="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/15 transition-colors shrink-0 cursor-pointer"
                                  title="Ver ficha y ubicación" [attr.aria-label]="'Ver ficha de ' + item.brand">
                            <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    }
>>>>>>> Stashed changes
                  </div>
                  <svg class="w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300"
                       [class.rotate-180]="isPartOpen(part.key)"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
<<<<<<< Updated upstream
              </button>

              <!-- Casas de repuestos ordenadas de menor a mayor precio -->
              @if (isPartOpen(part.key)) {
              <div class="space-y-1.5 font-mono text-xs px-3 pb-3 sm:px-3.5 sm:pb-3.5">
                @for (item of part.items; track item.id) {
                  <div (click)="openItemSheet(item, part)"
                       class="p-2.5 rounded-2xl border cursor-pointer active:scale-[0.99] transition flex items-center justify-between gap-2.5 group"
                       [ngClass]="item.isMadryn 
                         ? 'border-emerald-400/40 hover:border-emerald-300 bg-gradient-to-r from-[#0d1612] to-[#121110] shadow-[0_4px_16px_rgba(16,185,129,0.12)]' 
                         : 'border-white/10 hover:border-amber-400/40 bg-black/50'">
                    
                    <div class="space-y-1 min-w-0 flex-1">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        @if (item.isMadryn) {
                          <span class="px-1.5 py-0.5 rounded bg-emerald-400 text-stone-950 font-black text-[8px] flex items-center gap-1 shadow-sm">
                            <svg class="w-3.5 h-3.5 text-emerald-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 6a2 2 0 100-4 2 2 0 000 4zm-3 5h4l2 3h3m-8-3l-3 4-2-1-2 3.5"/></svg>
                            MADRYN (65 km)
                          </span>
                        }
                        <span class="px-1.5 py-0.5 rounded text-[8px] flex items-center" [ngClass]="item.tierBadge">
                          @if (item.tierIcon === 'star') {
                            <svg class="w-2.5 h-2.5 text-stone-950 inline mr-0.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                          } @else {
                            <svg class="w-2.5 h-2.5 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                          }
                          {{ item.tier }}
                        </span>
                        <span class="text-white font-bold text-xs truncate group-hover:text-amber-300 transition-colors">{{ item.brand }}</span>
                      </div>

                      <div class="flex items-center gap-1.5 text-[10px] text-stone-400 truncate">
                        @if (item.isMadryn) {
                          <svg class="w-3 h-3 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          <span class="text-emerald-300/90 font-medium truncate">{{ item.store }}</span>
                        } @else {
                          <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h18l-2 9H5L3 3zm0 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z"/></svg>
                          <span class="text-stone-300 truncate">{{ item.store }}</span>
                        }
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <div class="text-right">
                        <span class="text-xs sm:text-sm font-black" [ngClass]="item.isMadryn ? 'text-amber-300' : 'text-white'">{{ item.price }}</span>
                        <span class="block text-[8px] text-emerald-400 flex items-center justify-end gap-0.5" [class.font-bold]="item.isMadryn">
                          @if (item.isMadryn) {
                            <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 6a2 2 0 100-4 2 2 0 000 4zm-3 5h4l2 3h3m-8-3l-3 4-2-1-2 3.5"/></svg>
                          } @else {
                            <svg class="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"></path></svg>
                          }
                          {{ item.delivery }}
                        </span>
                      </div>
                      <svg class="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </div>

                  </div>
                }
              </div>
              }
=======
              </div>
>>>>>>> Stashed changes
            </section>
          }

<<<<<<< Updated upstream
          <!-- RESUMEN STEVE JOBS: KIT COMPLETO AL MEJOR PRECIO -->
          <section class="jobs-monolith p-3 sm:p-3.5 text-white space-y-2.5 shadow-xl border border-amber-400/30 bg-gradient-to-b from-[#181512] to-[#100e0c]">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <h4 class="text-xs font-black uppercase text-amber-400 tracking-wider">Combo Total 3 Piezas (Trelew)</h4>
              </div>
              <span class="text-xs font-black text-white font-mono bg-amber-400/20 px-2 py-0.5 rounded-lg border border-amber-400/40">$88.700</span>
            </div>
            <p class="text-[10px] text-stone-400 font-mono leading-relaxed">
              Comprando las 3 opciones más económicas locales retirás todo hoy en mostrador (Fontana, Yrigoyen y Lewis Jones) ahorrando <strong class="text-emerald-400">$32.100</strong> respecto al equipo importado.
            </p>
            <button (click)="openKitSheet('economico')" class="w-full py-2.5 rounded-xl bg-amber-400 text-stone-950 font-black text-xs active:scale-[0.98] transition shadow-md shadow-amber-400/25 flex items-center justify-center gap-1.5">
              <span>Ver desglose de las 3 órdenes juntas</span>
              <svg class="w-3.5 h-3.5 text-stone-950" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </section>

        </div>

      </main>

      <!-- ======================================================== -->
      <!-- MODAL / BOTTOM SHEET TÁCTIL (DRAWER DINÁMICO) -->
      <!-- ======================================================== -->
      @if (activeSheet()) {
        <div (click)="closeSheet()" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity"></div>
        
        <div class="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-[#141210] border-t border-white/15 rounded-t-3xl p-5 space-y-4 sheet-drawer shadow-2xl animate-in slide-in-from-bottom duration-300">
          
          <!-- Tirador iOS del Drawer -->
          <div class="w-12 h-1 bg-white/20 rounded-full mx-auto"></div>

          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-sm font-extrabold text-white">
              @if (activeSheet() === 'vehicle') { Ficha del Vehículo (Registro DNRPA) }
              @if (activeSheet() === 'item') { {{ selectedItem()?.brand }} }
              @if (activeSheet() === 'perfil') { Mi Cuenta }
              @if (activeSheet() === 'kit') {
                {{ selectedKitType() === 'economico' ? 'Kit Completo Económico (Trelew)' : 'Kit Premium Original OEM (Alemania)' }}
              }
            </h3>
            <button (click)="closeSheet()" class="w-7 h-7 rounded-full bg-white/10 text-stone-300 flex items-center justify-center hover:text-white" title="Cerrar">
              <svg class="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
=======
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
        <div [ngClass]="vista() === 'garaje' ? 'h-24' : 'h-40'" aria-hidden="true"></div>

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
              <span class="t-micro text-stone-300 truncate text-right">
                {{ hasMadryn() ? 'entrega mixta ' + shippingFmt() : 'ahorrás ' + money(ahorroReferencia) }}
              </span>
            </div>

            <div class="flex items-center gap-3 pt-0.5 pb-2">
              <span class="t-total font-black text-white tracking-tight leading-none shrink-0">{{ totalFmt() }}</span>

              <button type="button" (click)="openComboSheet()"
                      class="flex-1 min-h-[46px] px-4 rounded-xl font-black t-body active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
                      [ngClass]="comboComplete() ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-stone-950 shadow-[0_6px_18px_rgba(245,195,66,0.3)]' : 'bg-[#F5C342]/10 border border-[#F5C342] text-[#F5C342]'">
                <span>{{ confirmado() ? 'Ver pedido' : comboComplete() ? 'Pedir combo' : 'Completar' }}</span>
                <svg aria-hidden="true" class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
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
              @if (activeSheet() === 'combo') { Confirmación y logística }
              @if (activeSheet() === 'success') { Orden reservada }
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
>>>>>>> Stashed changes
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

<<<<<<< Updated upstream
          <!-- CONTENIDO DINÁMICO DEL SHEET -->
          <div class="space-y-3 text-xs font-mono max-h-[70vh] overflow-y-auto">
=======
          <div class="space-y-3 max-h-[70dvh] overflow-y-auto overscroll-contain">
>>>>>>> Stashed changes

            <!-- SHEET PERFIL / CUENTA: datos de la sesión y cierre -->
            @if (activeSheet() === 'perfil') {
              <div class="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                <div class="flex justify-between gap-3"><span class="text-stone-400 shrink-0">USUARIO:</span><span class="text-white font-bold truncate">{{ usuario?.nombre || 'Sesión en este dispositivo' }}</span></div>
                <div class="flex justify-between gap-3"><span class="text-stone-400 shrink-0">EMAIL:</span><span class="text-white truncate">{{ usuario?.email || '—' }}</span></div>
                <div class="flex justify-between gap-3"><span class="text-stone-400 shrink-0">ROL:</span><span class="text-amber-300 font-bold">Comprador</span></div>
              </div>

              <button (click)="cerrarSesion()" class="w-full py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 font-bold text-xs active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer">
                <svg class="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Cerrar sesión
              </button>
              <button (click)="closeSheet()" class="w-full py-2 text-stone-400 hover:text-white text-[11px] font-mono">
                Volver
              </button>
            }

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
<<<<<<< Updated upstream
              <button (click)="closeSheet()" class="w-full py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs mt-2">
                Cerrar Ficha
              </button>
            }

            <!-- SHEET REPUESTO DETALLE -->
            @if (activeSheet() === 'item' && selectedItem()) {
=======
              <button type="button" (click)="closeSheet()" class="w-full min-h-[44px] rounded-xl bg-white/10 text-white font-bold t-body cursor-pointer">
                Cerrar ficha
              </button>
            }

            <!-- SHEET TAREAS -->
            @if (activeSheet() === 'tasks') {
              <div class="space-y-3">
                <div class="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-white/5 border border-[#F5C342]/40 flex items-center justify-between gap-3">
                  <div class="space-y-1">
                    <span class="t-micro font-bold text-amber-300 uppercase tracking-wider">Estado actual</span>
                    <h4 class="t-title font-black text-white">{{ confirmado() ? 'Pedido confirmado' : '3 de 4 tareas completadas' }}</h4>
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

            <!-- SHEET DETALLE DE REPUESTO -->
            @if (activeSheet() === 'item' && selectedItem() && selectedParentPart()) {
>>>>>>> Stashed changes
              <div class="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3">
                <div class="w-14 h-14 rounded-xl overflow-hidden border border-white/20 bg-stone-900 shrink-0">
                  <img [src]="selectedParentPart()?.img" [alt]="selectedItem()?.brand" class="w-full h-full object-cover">
                </div>
                <div class="min-w-0">
<<<<<<< Updated upstream
                  <span class="px-2 py-0.5 rounded text-[8px] font-mono" [ngClass]="selectedItem()?.tierBadge">{{ selectedItem()?.tier }}</span>
                  <h4 class="text-white font-extrabold text-sm truncate mt-0.5">{{ selectedItem()?.brand }}</h4>
                  <p class="text-[10px] text-stone-400 font-mono truncate">{{ selectedParentPart()?.name }}</p>
=======
                  <span class="px-2 py-0.5 rounded t-micro font-black"
                        [ngClass]="selectedItem()!.isMadryn ? 'bg-white/15 text-white' : 'bg-amber-400 text-stone-950'">
                    {{ selectedItem()!.isMadryn ? 'Madryn · 65 km' : 'Cotización' }}
                  </span>
                  <h4 class="t-title text-white font-extrabold truncate mt-1">{{ selectedItem()!.brand }}</h4>
                  <p class="t-micro text-stone-400 truncate">{{ selectedParentPart()!.name }}</p>
>>>>>>> Stashed changes
                </div>
              </div>

              <div class="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
<<<<<<< Updated upstream
                <div class="flex justify-between items-center pb-2 border-b border-white/10">
                  <span class="text-stone-300 font-bold flex items-center gap-1.5 text-xs">
                    @if (selectedItem()?.isMadryn) {
                      <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 6a2 2 0 100-4 2 2 0 000 4zm-3 5h4l2 3h3m-8-3l-3 4-2-1-2 3.5"/></svg>
                    } @else {
                      <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h18l-2 9H5L3 3zm0 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z"/></svg>
                    }
                    {{ selectedItem()?.store }}
                  </span>
                  <span class="text-stone-400 font-mono text-[10px]">{{ selectedItem()?.dist }}</span>
                </div>

                <div class="space-y-1.5 pt-1">
                  <div class="flex justify-between"><span class="text-stone-400">Precio Repuesto:</span><span class="text-white font-bold">{{ selectedItem()?.price }}</span></div>
                  @if (selectedItem()?.isMadryn) {
                    <div class="flex justify-between py-1.5 border-b border-white/5">
                      <span class="text-stone-400 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 6a2 2 0 100-4 2 2 0 000 4zm-3 5h4l2 3h3m-8-3l-3 4-2-1-2 3.5"/></svg> Cadete Moto Ruta 3 (Madryn ➔ Trelew):
                      </span>
                      <span class="text-emerald-400 font-bold">+$2.800</span>
                    </div>
                    <div class="flex justify-between pt-2">
                      <span class="text-white font-bold text-xs">Total final entregado en Trelew:</span>
                      <span class="text-amber-300 font-black text-sm">\${{ (selectedItem()!.priceNum + 2800).toLocaleString('es-AR') }}</span>
                    </div>
                  } @else {
                    <div class="flex justify-between py-1.5 border-b border-white/5">
                      <span class="text-stone-400 flex items-center gap-1">
                        <svg class="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"></path></svg> Tiempo de retiro:
                      </span>
                      <span class="text-emerald-400 font-bold">{{ selectedItem()?.deliverySub }}</span>
                    </div>
                    <div class="flex justify-between pt-2">
                      <span class="text-white font-bold text-xs">Total a pagar en mostrador:</span>
                      <span class="text-amber-300 font-black text-sm">{{ selectedItem()?.price }}</span>
=======
                <div class="flex justify-between items-center pb-2 border-b border-white/10 gap-2">
                  <span class="t-body text-stone-200 font-bold flex items-center gap-1.5 min-w-0">
                    <svg aria-hidden="true" class="w-4 h-4 shrink-0" [ngClass]="selectedItem()!.isMadryn ? 'text-stone-300' : 'text-amber-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      @if (selectedItem()!.isMadryn) {
                        <circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path stroke-linecap="round" stroke-linejoin="round" d="M15 6a2 2 0 100-4 2 2 0 000 4zm-3 5h4l2 3h3m-8-3l-3 4-2-1-2 3.5"></path>
                      } @else {
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h18l-2 9H5L3 3zm0 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z"></path>
                      }
                    </svg>
                    <span class="truncate">{{ selectedItem()!.store }}</span>
                  </span>
                  <span class="t-micro text-stone-400 shrink-0">{{ selectedItem()!.dist }}</span>
                </div>

                <div class="space-y-1.5 pt-1">
                  <div class="flex justify-between gap-2"><span class="t-body text-stone-400">Precio repuesto</span><span class="t-body text-white font-bold">{{ selectedItem()!.price }}</span></div>
                  @if (selectedItem()!.isMadryn) {
                    <div class="flex justify-between gap-2 py-1.5 border-b border-white/5">
                      <span class="t-body text-stone-400">Cadete Ruta 3 (Madryn → Trelew)</span>
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
>>>>>>> Stashed changes
                    </div>
                  }
                </div>
              </div>

<<<<<<< Updated upstream
              <!-- ESPECIFICACIONES TÉCNICAS -->
              <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <p class="text-stone-300 text-[11px] leading-relaxed">{{ selectedItem()?.desc }}</p>
                <p class="text-[10px] font-mono text-stone-300 bg-black/50 p-2 rounded-xl border border-white/5">
                  <strong class="text-amber-300">Ficha Técnica:</strong> {{ selectedItem()?.specs }}
=======
              <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <p class="t-body text-stone-300 leading-relaxed">{{ selectedItem()!.desc }}</p>
                <p class="t-micro text-stone-300 bg-black/50 p-2.5 rounded-xl border border-white/5">
                  <strong class="text-amber-300">Ficha técnica:</strong> {{ selectedItem()!.specs }}
>>>>>>> Stashed changes
                </p>
              </div>

              <!-- ACCIONES TÁCTILES RÁPIDAS -->
              <div class="space-y-2 pt-1">
<<<<<<< Updated upstream
                <button (click)="reservar(selectedItem()!)" class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-extrabold text-xs active:scale-[0.98] transition shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2">
                  {{ selectedItem()?.isMadryn ? 'Reservar y Solicitar Cadete Ruta 3' : 'Confirmar Reserva en Mostrador Trelew' }}
                </button>
                <button (click)="closeSheet()" class="w-full py-2 text-stone-400 hover:text-white text-[11px] font-mono">
                  Volver a la lista de repuestos
=======
                <button type="button" (click)="reservar(selectedItem()!)" class="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-extrabold t-body active:scale-[0.98] transition shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer">
                  {{ selectedItem()!.isMadryn ? 'Reservar con cadete Ruta 3' : 'Reservar en mostrador Trelew' }}
                </button>
                <button type="button" (click)="closeSheet()" class="w-full min-h-[44px] text-stone-400 hover:text-white t-body cursor-pointer">
                  Volver a la lista
>>>>>>> Stashed changes
                </button>
              </div>
            }

<<<<<<< Updated upstream
            <!-- SHEET KIT COMPLETO -->
            @if (activeSheet() === 'kit') {
              <div class="p-3.5 rounded-2xl bg-black/60 border border-amber-400/40 space-y-2.5">
                <div class="flex justify-between items-center pb-2 border-b border-white/10">
                  <span class="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-400 text-stone-950 font-bold">3 PIEZAS EN TRELEW</span>
                  <span class="text-emerald-400 font-mono text-[10px] font-bold">Retiro hoy en mostrador</span>
                </div>
                
                <div class="space-y-2 pt-1 text-[11px]">
                  <div class="flex justify-between">
                    <span class="text-stone-300">1. Pastillas Fras-le (M1 Repuestos):</span>
                    <span class="text-white font-bold">$21.500</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-stone-300">2. Filtro Wega (Lubricentro Fontana):</span>
                    <span class="text-white font-bold">$9.200</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-stone-300">3. Discos Fremax 312mm (Frenos Fontana):</span>
                    <span class="text-white font-bold">$58.000</span>
                  </div>
                  <div class="flex justify-between border-t border-white/10 pt-2 text-xs">
                    <span class="text-white font-bold">Total a Pagar:</span>
                    <span class="text-amber-300 font-black text-sm">$88.700</span>
                  </div>
                </div>
              </div>

              <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-stone-300 text-[11px]">
                Los 3 comercios están en el radio céntrico de Trelew. Podés retirar vos mismo o solicitar un solo cadete de la plataforma para buscar las 3 órdenes.
              </div>

              <button (click)="comprarKit()" class="w-full py-3 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-400/30 active:scale-[0.98] transition">
                Comprar Kit Completo Económico ($88.700)
=======
            <!-- SHEET COMBO / LOGÍSTICA -->
            @if (activeSheet() === 'combo') {
              <div class="space-y-3">
                <div class="flex items-center justify-between t-micro pb-1 text-stone-400 gap-2">
                  <span>Vehículo: <strong class="text-white">VW Passat 2.0 TDI (AB 412 TX)</strong></span>
                  <span class="text-stone-200 font-bold shrink-0">✓ {{ comboCount() }} piezas</span>
                </div>

                <div class="space-y-2.5">
                  @if (trelewItems().length) {
                    <div class="p-3 rounded-2xl bg-[#181818] border border-white/10 space-y-2">
                      <div class="flex items-center justify-between pb-1.5 border-b border-white/10 gap-2">
                        <span class="t-micro font-bold text-white uppercase tracking-tight truncate">Retiro en mostrador · Trelew</span>
                        <span class="t-micro text-emerald-300 shrink-0">Hoy hasta 19:30</span>
                      </div>

                      <div class="space-y-1.5 pt-0.5">
                        @for (row of trelewItems(); track row.item.id) {
                          <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                            <div class="min-w-0">
                              <span class="t-micro text-stone-400 block">{{ row.part.name }}</span>
                              <h5 class="t-body font-bold text-white truncate">{{ row.item.brand }}</h5>
                              <span class="t-micro text-stone-300 block truncate">{{ row.item.store }}</span>
                            </div>
                            <span class="t-body font-extrabold text-white shrink-0">{{ row.item.price }}</span>
                          </div>
                        }
                      </div>

                      <div class="flex items-center justify-between pt-1.5 border-t border-white/5 t-body gap-2">
                        <span class="text-stone-400">Subtotal ({{ trelewItems().length }} piezas)</span>
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

                      <div class="space-y-1.5 pt-0.5">
                        @for (row of madrynItems(); track row.item.id) {
                          <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                            <div class="min-w-0">
                              <span class="t-micro text-stone-400 block">{{ row.part.name }}</span>
                              <h5 class="t-body font-bold text-white truncate">{{ row.item.brand }}</h5>
                              <span class="t-micro text-stone-300 block truncate">{{ row.item.store }}</span>
                            </div>
                            <span class="text-right shrink-0">
                              <span class="t-body font-extrabold text-white block">{{ row.item.price }}</span>
                              <span class="t-micro text-stone-300 block">{{ row.item.shippingFee }} flete</span>
                            </span>
                          </div>
                        }
                      </div>

                      <div class="p-2.5 rounded-xl bg-black/60 border border-white/10 t-body flex items-start gap-2">
                        <svg aria-hidden="true" class="w-4 h-4 text-stone-300 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <div class="min-w-0 flex-1">
                          <div class="flex justify-between items-center gap-2">
                            <span class="t-micro text-stone-400">Entrega en Trelew</span>
                            <button type="button" class="text-amber-400 t-micro underline font-bold hover:text-amber-300 cursor-pointer px-1 py-2 -my-2">Cambiar</button>
                          </div>
                          <p class="text-white font-bold mt-0.5">Av. Fontana 450 (taller mecánico)</p>
                          <p class="t-micro text-stone-400">Cadete con seguimiento GPS en vivo.</p>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <div class="p-3.5 rounded-2xl bg-[#181818] border border-white/10 space-y-2">
                  <div class="flex justify-between items-center t-body text-stone-300 gap-2">
                    <span>Subtotal repuestos ({{ comboCount() }})</span>
                    <span class="text-white font-bold shrink-0">{{ money(comboSubtotal()) }}</span>
                  </div>
                  <div class="flex justify-between items-center t-body text-stone-300 gap-2">
                    <span>Flete cadete Ruta 3</span>
                    <span class="shrink-0" [ngClass]="comboShipping() > 0 ? 'text-stone-100 font-bold' : 'text-stone-400'">{{ shippingFmt() }}</span>
                  </div>
                  <div class="flex justify-between items-end border-t border-white/10 pt-2.5 gap-2">
                    <div>
                      <span class="t-micro uppercase tracking-wider text-stone-400 block">Total final</span>
                      <span class="t-micro text-stone-500">Precios finales con IVA</span>
                    </div>
                    <span class="t-total font-black text-[#F5C342] shrink-0">{{ totalFmt() }}</span>
                  </div>
                </div>

                <div class="space-y-2 pt-1">
                  <div class="p-3 rounded-xl bg-white/[0.04] border border-white/10 t-micro text-stone-300 space-y-1">
                    <div class="flex items-center gap-1.5 text-emerald-300 font-bold">
                      <svg aria-hidden="true" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                      <span>Pagás al retirar o contra entrega</span>
                    </div>
                    <p class="text-stone-400 leading-snug">Efectivo, débito, tarjeta o transferencia con comprobante.</p>
                  </div>

                  <button type="button" (click)="confirmarPedido()" class="w-full min-h-[48px] rounded-2xl bg-[#F5C342] text-[#12100E] font-black t-body active:scale-[0.98] transition shadow-lg shadow-[#F5C342]/25 flex items-center justify-center gap-2 cursor-pointer">
                    <svg aria-hidden="true" class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    <span>Confirmar y reservar stock</span>
                  </button>

                  <button type="button" (click)="closeSheet()" class="w-full min-h-[44px] text-stone-400 hover:text-white t-body cursor-pointer">
                    Seguir ajustando piezas
                  </button>
                </div>
              </div>
            }

            <!-- SHEET ÉXITO -->
            @if (activeSheet() === 'success') {
              <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <div class="w-12 h-12 rounded-full bg-emerald-400 text-stone-950 flex items-center justify-center mx-auto shadow-lg" aria-hidden="true">
                  <svg class="w-6 h-6 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h4 class="t-title font-extrabold text-white">Stock bloqueado en los comercios</h4>
                <p class="t-body text-stone-300">
                  Se emitieron las órdenes de retiro y el cadete Ruta 3 fue notificado para el despacho express.
                </p>
                <div class="p-2.5 rounded-xl bg-black/50 border border-white/10 t-body text-amber-300 font-bold">
                  Total a abonar: {{ totalFmt() }}
                </div>
                <button type="button" (click)="closeSheet()" class="w-full min-h-[44px] rounded-xl bg-white/10 text-white font-bold t-body hover:bg-white/20 transition mt-2 cursor-pointer">
                  Ver pedidos activos
                </button>
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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
      <!-- ======================================================== -->
      <!-- MENÚ INFERIOR ESTILO STEVE JOBS (iOS FLOATING DOCK) -->
      <!-- ======================================================== -->
      <nav class="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto">
        <div class="jobs-dock px-3 py-2 rounded-3xl flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
          
          <!-- PESTAÑA 1: GARAGE -->
          <button (click)="openVehicleSheet()" class="flex-1 py-1 flex flex-col items-center gap-1 text-stone-400 hover:text-white transition-all active:scale-90 group cursor-pointer">
            <svg class="w-5 h-5 text-stone-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v4c0 .6.4 1 1 1h2m14 0a2 2 0 100 4 2 2 0 000-4zm-14 0a2 2 0 100 4 2 2 0 000-4z"></path>
            </svg>
            <span class="text-[10px] font-semibold tracking-tight">Garage</span>
            <span class="text-[8px] font-mono text-stone-500">3 autos</span>
          </button>

          <!-- PESTAÑA 2: PEDIDOS (ACTIVO - GLOW ÁMBAR) -->
          <button (click)="irAPedidos()" class="flex-1 py-1 flex flex-col items-center gap-1 text-amber-400 font-bold transition-all active:scale-90 relative cursor-pointer">
            <div class="relative">
              <svg class="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <span class="w-2 h-2 rounded-full bg-amber-400 absolute -top-1 -right-1 ring-2 ring-[#121110] animate-pulse"></span>
            </div>
            <span class="text-[10px] font-bold text-amber-400 tracking-tight">Pedidos</span>
            <span class="text-[8px] font-mono text-amber-300 font-semibold">3 piezas</span>
          </button>

          <!-- BOTÓN ESTRELLA STEVE JOBS (CENTRO DESTACADO) -->
          <div class="flex-1 flex justify-center -mt-5">
            <button (click)="irABuscar()" class="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-stone-950 flex items-center justify-center shadow-[0_8px_24px_rgba(245,158,11,0.45)] border-2 border-stone-950 active:scale-95 transition-transform cursor-pointer" title="Buscar Repuesto">
              <svg class="w-6 h-6 text-stone-950 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>

          <!-- PESTAÑA 3: CONSULTAS / CHAT -->
          <button (click)="irAConsultas()" class="flex-1 py-1 flex flex-col items-center gap-1 text-stone-400 hover:text-white transition-all active:scale-90 group cursor-pointer">
            <svg class="w-5 h-5 text-stone-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="text-[10px] font-semibold tracking-tight">Consultas</span>
            <span class="text-[8px] font-mono text-stone-500">3 hilos</span>
          </button>

          <!-- PESTAÑA 4: FACTURAS / PAGOS -->
          <button (click)="irAFacturacion()" class="flex-1 py-1 flex flex-col items-center gap-1 text-stone-400 hover:text-white transition-all active:scale-90 group cursor-pointer">
            <svg class="w-5 h-5 text-stone-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path>
            </svg>
            <span class="text-[10px] font-semibold tracking-tight">Facturas</span>
            <span class="text-[8px] font-mono text-stone-500">Historial</span>
          </button>

        </div>
      </nav>

=======
>>>>>>> Stashed changes
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

  // Imágenes con URLs directas de alta definición
  readonly vehicleImg = 'https://lh3.googleusercontent.com/aida/ALJJyrC5NOXvpDuZhbv0uwxtTtr7brY-npcGFl9DAUB1CnFuhMVVfdZ7DCC4ynHKkvCqYMOn2HDPWn4Nmwtp7b48TvCZa2OCiQydgG0Kfzw1kCNPf9q-CfxCSrM-iYLMmyU-KmuoldBWkyCg7tRwC7o7WbYMFsSKJT6QZpqBa3Aesw5W4y8QOA9O9b-_Vh-oc7wfKcUoi3j3D82CRvBeddvkxzbzMgwpYxpKKeoJ-uXeJQvK_z859ETd';

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
      spec: 'Pinza Lucas/TRW · Passat B6 2.0 TDI',
      img: 'https://lh3.googleusercontent.com/aida/ALJJyrC3I43ZuB-GtzDVGM7Or5e5r7_r1L2TPOwJb4fNhaUT1CgIcFy273Wg_5EC7GcciwY2ryf0hFSImh1H9xP29jVWDnamcX9crq7lgzMMrfqWjWYEqGU1z7tPabw9t9N8agdaKxaCFBOL6YG_uqKZmu6YuD1n-SvWJ_vnlxt_NonJoo9MOkcOexyqr7NhFvr-Q0sE0IX5t8z_mTITSon7NAZy3k6mSBJn6ayhPprJGT-Eq0I1XqY',
      offersCount: '3 ofertas listas',
      items: [
        {
          id: 'frasle_trelew',
          tier: 'MÁS BARATA',
          tierIcon: 'star',
          tierBadge: 'bg-amber-400 text-stone-950 font-black',
          brand: 'Fras-le Cerif Estándar',
          store: 'M1 Repuestos Centro (Trelew)',
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
          tier: 'CALIDAD/PRECIO',
          tierIcon: 'shield',
          tierBadge: 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-bold',
          brand: 'Ferodo Italy Eco-Friction',
          store: 'Repuestos Patagónicos (Trelew)',
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
          tier: 'OEM ORIGINAL',
          tierIcon: 'shield',
          tierBadge: 'bg-emerald-400 text-stone-950 font-black',
          brand: 'Bosch Premium Germany',
          store: 'Autopartes Golfo Nuevo (Pto. Madryn)',
          dist: 'Puerto Madryn · A 65 km por Ruta 3',
          price: '$27.500',
          priceNum: 27500,
          delivery: '+ Cadete Ruta 3',
          deliverySub: 'Llega en 1h 15m (+$2.800)',
          isMadryn: true,
          desc: 'Repuesto de equipo original idéntico al montado en fábrica en Alemania. Sin stock en Trelew, entrega rápida directa desde Madryn.',
          specs: 'Part Number: 1K0 698 151 E · Incluye chapa antivibración y bulones nuevos.'
        }
      ]
    },
    {
      key: 'filtro',
      name: 'Filtro de Aceite Blindado',
      spec: 'Motor BKP 2.0 TDI 16V (140 CV)',
      img: 'https://lh3.googleusercontent.com/aida/ALJJyrCMoq_rFJKF_2-dtkr0C0aTK5p2gtTH9Tom8r9Tk6vxVPFqstoauk06-hGAIbwjUy0uwN91_Whkxpb9dd90D10ej9eUy-8N09eCzjE-CuWiOtiwfjgbI6YnnqtTQZ_Gsn0fG4q_oYIZQrfZ5zTcEmOL6wO1V7bdaU3QJ27HHqm_kIInxywnPOUEnX8eBBpiBQvBeRYBQVIclQWe2X28RPYh4-k168UTaFzdhA4rg-oZHoREnTgT',
      offersCount: '2 ofertas listas',
      items: [
        {
          id: 'filtro_wega',
          tier: 'MÁS BARATA',
          tierIcon: 'star',
          tierBadge: 'bg-amber-400 text-stone-950 font-black',
          brand: 'Wega Ecológico WOE-640',
          store: 'Lubricentro Fontana (Trelew)',
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
          tier: 'OEM ORIGINAL',
          tierIcon: 'shield',
          tierBadge: 'bg-emerald-400 text-stone-950 font-black',
          brand: 'Mann Filter HU 719/7 x',
          store: 'Distribuidora Madryn (Pto. Madryn)',
          dist: 'Puerto Madryn · Depósito Parque Industrial',
          price: '$13.800',
          priceNum: 13800,
          delivery: '+ Cadete Ruta 3',
          deliverySub: 'Llega hoy 17:30 hs (+$2.500)',
          isMadryn: true,
          desc: 'Máxima retención de carbonilla y estabilidad en presiones elevadas para motores diésel bomba inyector.',
          specs: 'OEM VW Alemania · Papel multicapa Micrograde · Resistencia 5.0 bar.'
        }
      ]
    },
    {
      key: 'discos',
      name: 'Discos de Freno 312mm (Par)',
      spec: 'Ventilados 5x112 · Passat B6 Sedán',
      img: 'https://lh3.googleusercontent.com/aida/ALJJyrC4e1Mh4NCjoq0XcR2p_Cx9Bd0VpNa_l6wBbEoS_nmuwiURqwbP17sEc2dY5W0gSDy0TmwxLe07_9KztKy2c2DE61SMY--B6vI0wGuTpJAuq6ECsXvw3RsgIVZOGiiyYc_h8ke-6Ghmy0P3R-OBJWu3rmVt1gjM40vHfAojDQa125ujahIhTBgw5OO0XLVVbIJy7AsviODGlPGLQQIcoZgZyYDp2qih57_rRr9bkH1eDwhk43A',
      offersCount: '2 ofertas listas',
      items: [
        {
          id: 'discos_fremax',
          tier: 'MÁS BARATA',
          tierIcon: 'star',
          tierBadge: 'bg-amber-400 text-stone-950 font-black',
          brand: 'Fremax Carbon+ Ventilados',
          store: 'Frenos Fontana (Trelew)',
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
          tier: 'ALTO RENDIMIENTO OEM',
          tierIcon: 'shield',
          tierBadge: 'bg-emerald-400 text-stone-950 font-black',
          brand: 'Zimmermann Coat Z (Alemania)',
          store: 'Autopartes Golfo Nuevo (Pto. Madryn)',
          dist: 'Puerto Madryn · Stock exclusivo',
          price: '$79.500',
          priceNum: 79500,
          delivery: '+ Cadete Ruta 3',
          deliverySub: 'Flete puerta a puerta (+$3.200)',
          isMadryn: true,
          desc: 'Fundición alemana con aleación de carbono de alto punto de ebullición térmico. Sin alabeo.',
          specs: 'Tratamiento anticorrosión Coat-Z · Certificado TÜV Alemania.'
        }
      ]
    }
  ];

  // Estado reactivo con Signals
  readonly activeSheet = signal<'vehicle' | 'item' | 'kit' | 'perfil' | null>(null);
  readonly selectedItem = signal<CatalogItem | null>(null);
  readonly selectedParentPart = signal<CatalogPart | null>(null);
  readonly selectedKitType = signal<'economico' | 'premium'>('economico');

  // Secciones de presupuestos plegadas por defecto: la lista de casas
  // no invade la pantalla hasta que el comprador la pide.
  readonly partsOpen = signal<Set<string>>(new Set());

<<<<<<< Updated upstream
=======
  // ── Derivados del combo ────────────────────────────────────────────────────
  readonly comboItems = computed(() =>
    this.partsCatalog.map((part) => {
      const id = this.combo()[part.key];
      const item = part.items.find((i) => i.id === id) ?? this.sortedItems(part)[0];
      return { part, item };
    })
  );

  readonly trelewItems = computed(() => this.comboItems().filter((r) => !r.item.isMadryn));
  readonly madrynItems = computed(() => this.comboItems().filter((r) => r.item.isMadryn));

  readonly comboCount = computed(() => this.comboItems().filter((r) => !!r.item).length);
  readonly comboSubtotal = computed(() => this.comboItems().reduce((acc, r) => acc + r.item.priceNum, 0));
  readonly comboShipping = computed(() =>
    this.comboItems().reduce((acc, r) => acc + (r.item.isMadryn ? (r.item.shippingFeeNum ?? 0) : 0), 0)
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
  readonly trelewSubtotal = computed(() =>
    this.trelewItems().reduce((acc, r) => acc + r.item.priceNum, 0)
  );

  /** Anillo: 4 tareas (0–75%) y 100% solo al confirmar el pedido. */
  readonly taskPercent = computed(() =>
    this.confirmado() ? 100 : Math.round((this.comboProgress() / 100) * 75)
  );
  readonly ringOffset = computed(() => 138.23 * (1 - this.taskPercent() / 100));
  readonly ringColor = computed(() =>
    this.confirmado() ? '#2ECC71' : 'url(#ringAmberGrad)'
  );
  readonly nextStepLabel = computed(() => {
    if (this.confirmado()) return 'Pedido confirmado · stock reservado';
    if (!this.comboComplete()) return 'Falta elegir ' + (this.partsCatalog.length - this.comboCount()) + ' pieza(s)';
    return 'Falta confirmar el pedido';
  });

  // ── Helpers de catálogo ───────────────────────────────────────────────────
  sortedItems(part: CatalogPart): CatalogItem[] {
    return [...part.items].sort((a, b) => a.priceNum - b.priceNum);
  }

  minPrice(part: CatalogPart): string {
    return this.sortedItems(part)[0].price;
  }

  isCheapest(part: CatalogPart, item: CatalogItem): boolean {
    return item.priceNum === this.sortedItems(part)[0].priceNum;
  }

  selectedOf(part: CatalogPart): CatalogItem {
    const id = this.combo()[part.key];
    return part.items.find((i) => i.id === id) ?? this.sortedItems(part)[0];
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
>>>>>>> Stashed changes
  isPartOpen(key: string): boolean {
    return this.partsOpen().has(key);
  }

  togglePart(key: string): void {
    const next = new Set(this.partsOpen());
    if (next.has(key)) next.delete(key); else next.add(key);
    this.partsOpen.set(next);
  }

  /** ¿Están todas las secciones desplegadas? */
  todoAbierto(): boolean {
    return this.partsCatalog.every((p) => this.partsOpen().has(p.key));
  }

  toggleAll(): void {
    this.partsOpen.set(this.todoAbierto() ? new Set() : new Set(this.partsCatalog.map((p) => p.key)));
  }

<<<<<<< Updated upstream
  openVehicleSheet(): void {
    this.activeSheet.set('vehicle');
  }

  openPerfilSheet(): void {
    this.activeSheet.set('perfil');
  }

  /** Cierra sesión: limpia el rol, la sesión real de Supabase y vuelve al inicio. */
  async cerrarSesion(): Promise<void> {
    setRolSesion(null);
    try { await this.supa.cerrarSesion(); } catch { /* la sesión local ya quedó invalidada */ }
    this.closeSheet();
    this.router.navigate(['/']);
=======
  // ── Selección del combo ───────────────────────────────────────────────────
  selectComboItem(partKey: string, itemId: string): void {
    if (this.isSelected(partKey, itemId)) return;
    this.confirmado.set(false);
    this.combo.set({ ...this.combo(), [partKey]: itemId });
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
>>>>>>> Stashed changes
  }

  openItemSheet(item: CatalogItem, parent: CatalogPart): void {
    this.selectedItem.set(item);
    this.selectedParentPart.set(parent);
<<<<<<< Updated upstream
    this.activeSheet.set('item');
  }

  openKitSheet(kitType: 'economico' | 'premium'): void {
    this.selectedKitType.set(kitType);
    this.activeSheet.set('kit');
=======
    this.open('item');
>>>>>>> Stashed changes
  }

  closeSheet(): void {
    if (!this.activeSheet()) return;
    this.activeSheet.set(null);
    this.checkupKey.set(null);
    const target = this.lastFocused;
    this.lastFocused = null;
    if (target && document.contains(target)) target.focus({ preventScroll: true });
  }

  reservar(item: CatalogItem): void {
    this.confirmarPedido();
    this.selectedItem.set(item);
  }

  comprarKit(): void {
    alert('¡Orden de compra de las 3 piezas iniciada ($88.700)!');
    this.closeSheet();
  }

<<<<<<< Updated upstream
  irABuscar(): void {
    this.router.navigate(['/']);
  }

  irAPedidos(): void {
    this.openKitSheet('economico');
=======
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
>>>>>>> Stashed changes
  }

  irAConsultas(): void {
    this.router.navigate(['/']);
  }

  irAFacturacion(): void {
    this.router.navigate(['/']);
  }

  onImgFallback(event: Event): void {
    const target = event.target as HTMLElement;
    target.style.display = 'none';
  }
}
