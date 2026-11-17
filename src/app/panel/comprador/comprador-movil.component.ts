import { Component, computed, inject, signal } from '@angular/core';
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

type Sheet = 'vehicle' | 'tasks' | 'item' | 'combo' | 'success' | 'addPart' | 'perfil';

// Panel móvil del comprador (< 768px): estética Steve Jobs, selección de combo
// en 3 piezas, barra sticky de total, anillo de progreso y dock inferior táctil.
@Component({
  selector: 'app-comprador-movil',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #E2A774;
      background-image:
        radial-gradient(ellipse 110% 70% at 90% 15%, #E57D68 0%, #D96552 40%, transparent 80%),
        radial-gradient(ellipse 90% 80% at 15% 15%, #F5D3B3 0%, #E8B98C 50%, transparent 85%),
        radial-gradient(ellipse 100% 75% at 50% 95%, #C98850 0%, #B8733B 60%, transparent 90%),
        linear-gradient(145deg, #F3D2B2 0%, #E6AC7E 35%, #DC7862 70%, #C47248 100%);
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
      background: rgba(18, 17, 16, 0.96);
      backdrop-filter: blur(32px) saturate(200%);
      -webkit-backdrop-filter: blur(32px) saturate(200%);
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow:
        0 25px 50px -10px rgba(50, 20, 10, 0.55),
        0 10px 25px -5px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 1px rgba(255, 255, 255, 0.3);
    }
    .sheet-drawer {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    }
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
  `],
  template: `
    <div class="selection:bg-amber-400 selection:text-stone-950 min-h-screen p-3 sm:p-5 relative">

      <!-- TOP BAR ZEN -->
      <header class="flex items-center justify-between py-2 text-white max-w-md mx-auto mb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-2xl bg-stone-900 border border-amber-400/40 p-1.5 flex items-center justify-center shadow-md">
            <img src="/logo.svg" alt="Toolbox Patagonia" class="w-full h-full object-contain" (error)="onImgFallback($event)">
          </div>
          <div>
            <h1 class="text-xs font-black tracking-tight text-white uppercase drop-shadow-sm">Toolbox <span class="text-amber-400">Patagonia</span></h1>
            <p class="text-[10px] text-stone-800 font-mono font-semibold">Consola Comprador</p>
          </div>
        </div>

        <!-- ACCESOS RÁPIDOS (TAP TARGET 44x44) -->
        <div class="flex items-center gap-2">
          <button (click)="openTasks()" class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-stone-900/80 border border-white/20 text-stone-200 hover:text-white flex items-center justify-center relative active:scale-95 transition cursor-pointer" title="Notificaciones" aria-label="Notificaciones">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-2 right-2 ring-2 ring-black"></span>
          </button>
          <button (click)="openPerfilSheet()" class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer" title="Mi cuenta" aria-label="Perfil de usuario">
            {{ iniciales }}
          </button>
        </div>
      </header>

      <main class="space-y-3 max-w-md mx-auto">

        <!-- 1. VEHÍCULO RESUMIDO -->
        <div (click)="openVehicleSheet()" class="jobs-monolith p-3 text-white cursor-pointer active:scale-[0.99] transition hover:border-amber-400/40 flex items-center justify-between gap-2.5 group shadow-md">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="relative w-11 h-11 rounded-xl overflow-hidden border border-white/20 bg-black/60 shrink-0 shadow-inner">
              <img [src]="vehicleImg" alt="VW Passat 2.0 TDI" class="w-full h-full object-cover">
              <span class="absolute bottom-0 inset-x-0 bg-black/85 text-[7px] text-center font-mono text-amber-300 font-bold uppercase tracking-tight py-0.5">Passat</span>
            </div>
            <div class="leading-tight min-w-0 flex-1 space-y-0.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-mono font-black text-[11px] tracking-wider">
                  AB 412 TX
                </span>
                <span class="text-sm font-extrabold text-white truncate">VW Passat 2.0 TDI</span>
              </div>
              <p class="text-[11px] text-stone-300 font-mono flex items-center gap-1.5 truncate">
                <span class="text-emerald-400 font-bold">✓ Cédula Verde Trelew</span>
                <span class="text-stone-400">· {{ partsCatalog.length }} piezas</span>
              </p>
            </div>
          </div>
          <div class="text-stone-400 group-hover:text-amber-300 text-xs font-mono font-bold flex items-center gap-1 shrink-0">
            <span>Ficha</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </div>

        <!-- 2. ANILLO DE PROGRESO DEL PEDIDO -->
        <div (click)="openTasks()" class="jobs-monolith p-3.5 sm:py-4 sm:px-4 text-white cursor-pointer active:scale-[0.99] transition border border-white/10 hover:border-[#F5C342]/40 bg-[#141210] shadow-lg group flex items-center justify-between gap-3.5">
          <div class="space-y-1 min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-[14px] font-bold text-white tracking-tight">Progreso del Pedido</span>
              <span class="w-2 h-2 rounded-full shrink-0" [ngClass]="taskPercent() === 100 ? 'bg-[#2ECC71]' : 'bg-emerald-400'"></span>
            </div>
            <p class="text-[12px] text-[#9E9E9E] font-mono leading-none">
              {{ comboComplete() ? '3 de 4 pasos completados' : comboCount() + ' de 3 piezas elegidas' }}
            </p>
            <p class="text-[12px] font-bold text-[#F5C342] font-mono leading-tight pt-0.5">
              {{ nextStepLabel() }}
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <div class="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg class="w-14 h-14 -rotate-90 ring-glow" viewBox="0 0 56 56">
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
              <div class="absolute inset-0 flex items-center justify-center font-mono leading-none select-none">
                <span class="text-[14px] font-bold text-white tabular-nums tracking-tight">{{ taskPercent() }}</span><span class="text-[10px] font-bold ml-0.5" [ngClass]="taskPercent() === 100 ? 'text-[#2ECC71]' : 'text-[#F5C342]'">%</span>
              </div>
            </div>
            <svg class="w-4 h-4 text-[#C9C4BD] group-hover:text-[#F5C342] group-hover:translate-x-0.5 transition-all shrink-0 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>

        <!-- TÍTULO DE SECCIÓN + CONTADOR DE OFERTAS -->
        <div class="flex items-center justify-between px-1 pt-1 text-xs font-mono">
          <span class="text-stone-900 font-bold flex items-center gap-2.5 drop-shadow-sm">
            <svg class="w-4 h-4 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Elegí tus Repuestos (3 Piezas)
          </span>
          <span class="text-emerald-900 font-bold text-[10px] sm:text-[11px] flex items-center gap-1 bg-white/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-emerald-600/30 shadow-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> {{ totalOfertas() }} ofertas listas
          </span>
        </div>
        <div class="flex items-center justify-end px-1 -mt-2 text-[10px] font-mono">
          <button (click)="toggleAll()" class="font-bold text-stone-800/85 underline decoration-stone-700/40 hover:text-stone-950 transition cursor-pointer">
            {{ todoAbierto() ? 'Contraer todo' : 'Mostrar todas las ofertas' }}
          </button>
        </div>

        <!-- 3. LISTADO PLEGABLE POR REPUESTO -->
        <div class="space-y-3.5">
          @for (part of partsCatalog; track part.key) {
            <section class="jobs-monolith text-white shadow-xl border border-white/10 overflow-hidden transition-all duration-200">
              <!-- ENCABEZADO DESPLEGABLE (TOUCH TARGET >= 48px) -->
              <div (click)="togglePart(part.key)"
                   [attr.aria-expanded]="isPartOpen(part.key)"
                   class="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors select-none"
                   [ngClass]="isPartOpen(part.key) ? 'border-b border-white/10' : ''">
                <div class="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div class="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-stone-900 shrink-0 shadow-md">
                    <img [src]="part.img" [alt]="part.name" class="w-full h-full object-cover">
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <h3 class="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate">{{ part.name }}</h3>
                      <span class="text-[9px] font-mono font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">{{ part.items.length }} ofertas</span>
                    </div>
                    <p class="text-[10px] text-stone-400 font-mono truncate mt-0.5">
                      @if (isPartOpen(part.key)) {
                        {{ part.spec }}
                      } @else {
                        <span class="text-emerald-400 font-medium">✓ {{ selectedOf(part).brand }} ({{ selectedOf(part).price }})</span>
                      }
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-[11px] sm:text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-bold border border-emerald-400/20">
                    Desde {{ minPrice(part) }}
                  </span>
                  <div class="flex items-center gap-1 px-2 py-1 rounded-xl transition-all duration-200"
                       [ngClass]="isPartOpen(part.key) ? 'bg-amber-400/20 border border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.2)]' : 'bg-white/10 border border-white/15 text-stone-200'">
                    <span class="text-[9px] font-mono font-black uppercase tracking-tight">{{ isPartOpen(part.key) ? 'CERRAR' : 'VER' }}</span>
                    <svg class="w-3.5 h-3.5 transition-transform duration-200 stroke-[3]"
                         [ngClass]="isPartOpen(part.key) ? 'rotate-180 text-amber-400' : 'text-stone-300'"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- CONTENIDO: CASAS DE REPUESTOS -->
              @if (isPartOpen(part.key)) {
                <div class="p-3 sm:p-3.5 space-y-2 font-mono text-xs bg-black/20">
                  @for (item of sortedItems(part); track item.id) {
                    <div (click)="selectComboItem(part.key, item.id)"
                         [ngClass]="isSelected(part.key, item.id) ? 'card-selected' : 'card-unselected hover:border-stone-600'"
                         class="p-3 rounded-2xl cursor-pointer active:scale-[0.99] transition flex items-center justify-between gap-3 group min-h-[64px]">

                      <div class="flex items-center gap-3 min-w-0 flex-1">
                        <!-- SELECTOR RADIO 20x20 -->
                        @if (isSelected(part.key, item.id)) {
                          <div class="w-5 h-5 rounded-full bg-[#F5C342] text-[#12100E] flex items-center justify-center shrink-0 shadow-sm">
                            <svg class="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                        } @else {
                          <div class="w-5 h-5 rounded-full border border-[#666666] bg-transparent shrink-0 group-hover:border-[#F5C342]/60 transition-colors"></div>
                        }

                        <div class="space-y-1 min-w-0 flex-1">
                          <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1"
                                  [ngClass]="item.isMadryn ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : (isCheapest(part, item) ? 'bg-[#F5C342]/15 text-[#F5C342] border border-[#F5C342]/30' : 'bg-white/10 text-stone-300 border border-white/15')">
                              {{ item.isMadryn ? 'MADRYN • 65 km' : (isCheapest(part, item) ? '★ MÁS BARATA' : 'INTERMEDIA') }}
                            </span>
                            @if (isSelected(part.key, item.id)) {
                              <span class="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-[#F5C342]/20 text-[#F5C342] border border-[#F5C342]/40">EN COMBO</span>
                            }
                          </div>

                          <h4 class="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug group-hover:text-[#F5C342] transition-colors">{{ item.brand }}</h4>

                          <div class="flex items-center gap-1.5 text-[11px] text-stone-400">
                            @if (item.isMadryn) {
                              <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            } @else {
                              <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h18l-2 9H5L3 3zm0 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z"></path></svg>
                            }
                            <span class="truncate">{{ item.store }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        <div class="text-right">
                          <span class="text-[16px] font-bold font-mono leading-none block" [ngClass]="isSelected(part.key, item.id) ? 'text-[#F5C342]' : 'text-white'">{{ item.price }}</span>
                          @if (item.isMadryn) {
                            <div class="flex flex-col items-end text-[10px] mt-1">
                              <span class="text-stone-400 font-mono">Cadete Ruta 3</span>
                              <span class="text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mt-0.5">{{ item.shippingFee }} • {{ item.shippingEta }}</span>
                            </div>
                          } @else {
                            <span class="block text-[11px] text-stone-400 font-normal mt-1">Mostrador hoy</span>
                          }
                        </div>

                        <!-- BOTÓN INFO (no selecciona) -->
                        <button (click)="$event.stopPropagation(); openItemSheet(item, part)"
                                class="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/15 transition-colors shrink-0 cursor-pointer"
                                title="Ver ficha y ubicación" [attr.aria-label]="'Ver ficha de ' + item.brand">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </section>
          }
        </div>

        <!-- ESPACIADOR: deja scrollear el contenido por debajo de las barras fijas -->
        <div class="h-64" aria-hidden="true"></div>

      </main>

      <!-- BARRA FLOTANTE: COMBO TOTAL -->
      <aside class="fixed bottom-[84px] left-3 right-3 z-40 max-w-md mx-auto">
        <div class="jobs-dock p-3.5 sm:p-4 text-white border border-amber-400/40 bg-gradient-to-r from-[#171410] via-[#1a1612] to-[#12100e] shadow-[0_20px_50px_rgba(0,0,0,0.95)] rounded-2xl relative overflow-hidden space-y-2">

          <div class="absolute top-0 inset-x-0 h-1 bg-[#2A2A2A]">
            <div class="h-full transition-all duration-500 shadow-[0_0_8px_rgba(46,204,113,0.8)]"
                 [style.width.%]="comboProgress()"
                 [style.backgroundColor]="comboComplete() ? '#2ECC71' : '#F5C342'"></div>
          </div>

          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              @if (comboComplete()) {
                COMBO LISTO ({{ comboCount() }}/{{ partsCatalog.length }} PIEZAS)
              } @else {
                ELEGIDO ({{ comboCount() }}/{{ partsCatalog.length }})
              }
            </span>
            <span class="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {{ hasMadryn() ? 'Entrega Mixta' : 'Ahorrás $32.100' }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 pt-0.5">
            <div class="space-y-0.5">
              <div class="flex items-baseline gap-1.5">
                <span class="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">{{ totalFmt() }}</span>
              </div>
              <span class="block text-[11px] font-mono text-stone-300">
                {{ hasMadryn() ? 'mostrador + cadete (' + shippingFmt() + ')' : 'mostrador hoy en Trelew' }}
              </span>
            </div>

            <button (click)="openComboSheet()"
                    class="px-5 py-3 rounded-xl font-black text-xs sm:text-sm active:scale-[0.97] transition flex items-center gap-2 shrink-0 min-h-[46px] cursor-pointer"
                    [ngClass]="comboComplete() ? 'bg-[#F5C342] text-[#12100E] shadow-lg shadow-[#F5C342]/25' : 'bg-[#F5C342]/10 border border-[#F5C342] text-[#F5C342]'">
              <span>{{ comboComplete() ? 'Pedir Combo' : 'Completar Combo' }}</span>
              <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- BOTTOM SHEET -->
      @if (activeSheet()) {
        <div (click)="closeSheet()" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity"></div>

        <div class="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-[#141210] border-t border-white/15 rounded-t-3xl p-5 space-y-4 sheet-drawer shadow-2xl">
          <div class="w-12 h-1 bg-white/20 rounded-full mx-auto"></div>

          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-sm font-extrabold text-white">
              @if (activeSheet() === 'vehicle') { Ficha del Vehículo (Registro DNRPA) }
              @if (activeSheet() === 'tasks') { Tareas y Seguimiento de tu Pedido }
              @if (activeSheet() === 'item') { {{ selectedItem()?.brand }} }
              @if (activeSheet() === 'combo') { Confirmación y Logística del Combo }
              @if (activeSheet() === 'success') { ¡Orden Reservada con Éxito! }
              @if (activeSheet() === 'addPart') { Nueva Pieza para Cotizar }
              @if (activeSheet() === 'perfil') { Mi Cuenta }
            </h3>
            <button (click)="closeSheet()" class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/10 text-stone-300 flex items-center justify-center hover:text-white cursor-pointer" title="Cerrar" aria-label="Cerrar detalle">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="space-y-3 text-xs font-mono max-h-[70vh] overflow-y-auto">

            <!-- SHEET VEHÍCULO -->
            @if (activeSheet() === 'vehicle') {
              <div class="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                <div class="flex justify-between"><span class="text-stone-400">DOMINIO:</span><span class="text-amber-300 font-bold">AB 412 TX</span></div>
                <div class="flex justify-between"><span class="text-stone-400">MARCA:</span><span class="text-white">VOLKSWAGEN</span></div>
                <div class="flex justify-between"><span class="text-stone-400">MODELO:</span><span class="text-white">PASSAT B6 SEDÁN 2.0 TDI</span></div>
                <div class="flex justify-between"><span class="text-stone-400">CHASIS:</span><span class="text-amber-300 font-bold">WVWZZZ3CZ6P108422</span></div>
                <div class="flex justify-between"><span class="text-stone-400">MOTOR:</span><span class="text-white">BKP 140 CV (16V)</span></div>
              </div>
              <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                ✓ Verificado contra Cédula Verde Seccional Trelew.
              </div>
              <button (click)="closeSheet()" class="w-full py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs mt-2 cursor-pointer">
                Cerrar Ficha
              </button>
            }

            <!-- SHEET TAREAS -->
            @if (activeSheet() === 'tasks') {
              <div class="space-y-3.5 text-stone-200">
                <div class="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-emerald-500/10 border border-[#F5C342]/40 flex items-center justify-between gap-3">
                  <div class="space-y-0.5">
                    <span class="text-[10px] font-bold text-amber-300 uppercase tracking-wider">ESTADO ACTUAL</span>
                    <h4 class="text-sm sm:text-base font-black text-white">{{ taskPercent() === 100 ? '¡Pedido confirmado!' : '3 de 4 tareas completadas' }}</h4>
                    <p class="text-[11px] text-stone-300">{{ taskPercent() === 100 ? 'Solo falta retirar o recibir el pedido.' : 'Falta confirmar tu selección de repuestos.' }}</p>
                  </div>
                  <div class="w-12 h-12 rounded-full bg-black/80 border-2 border-[#F5C342] flex items-center justify-center text-amber-300 font-black text-sm shrink-0">
                    {{ taskPercent() }}%
                  </div>
                </div>

                <div class="space-y-2">
                  <p class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">PASOS OBLIGATORIOS Y OPCIONALES:</p>

                  <div class="p-3 rounded-2xl bg-black/60 border border-emerald-500/40 flex items-start gap-3">
                    <div class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</div>
                    <div class="min-w-0 flex-1 space-y-0.5">
                      <div class="flex items-center justify-between">
                        <span class="text-xs sm:text-sm font-bold text-white">1. Datos del Auto y Chasis</span>
                        <span class="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">LISTO</span>
                      </div>
                      <p class="text-[11px] text-stone-300 leading-snug">VW Passat 2.0 TDI (Chasis WVWZZZ3C...). Calce 100% garantizado con Cédula Verde Trelew.</p>
                    </div>
                  </div>

                  <div class="p-3 rounded-2xl bg-black/60 border border-emerald-500/40 flex items-start gap-3">
                    <div class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black shrink-0 mt-0.5">✓</div>
                    <div class="min-w-0 flex-1 space-y-0.5">
                      <div class="flex items-center justify-between">
                        <span class="text-xs sm:text-sm font-bold text-white">2. Cotizaciones de Casas</span>
                        <span class="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">{{ totalOfertas() }} RECIBIDAS</span>
                      </div>
                      <p class="text-[11px] text-stone-300 leading-snug">Precios en mostrador de Trelew y envíos express Ruta 3 desde Puerto Madryn.</p>
                    </div>
                  </div>

                  <div class="p-3 rounded-2xl bg-black/60 border flex items-start gap-3"
                       [ngClass]="comboComplete() ? 'border-emerald-500/40' : 'border-[#F5C342]/50 bg-amber-400/5'">
                    <div class="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-black shrink-0 mt-0.5"
                         [ngClass]="comboComplete() ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#F5C342]/20 text-[#F5C342]'">
                      {{ comboComplete() ? '✓' : '⏳' }}
                    </div>
                    <div class="min-w-0 flex-1 space-y-0.5">
                      <div class="flex items-center justify-between">
                        <span class="text-xs sm:text-sm font-bold text-white">3. Seleccionar las 3 Piezas</span>
                        <span class="text-[9px] px-2 py-0.5 rounded-full font-bold border"
                              [ngClass]="comboComplete() ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-400/20 text-[#F5C342] border-[#F5C342]/40'">
                          {{ comboComplete() ? 'LISTO' : 'EN CURSO' }}
                        </span>
                      </div>
                      <p class="text-[11px] text-stone-300 leading-snug">{{ comboCount() }} de 3 piezas elegidas. Tocá 'Pedir Combo' para reservar stock.</p>
                    </div>
                  </div>

                  <div class="p-3 rounded-2xl bg-black/60 border border-white/15 space-y-2.5">
                    <div class="flex items-start gap-3">
                      <div class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black shrink-0 mt-0.5">🔔</div>
                      <div class="min-w-0 flex-1 space-y-0.5">
                        <div class="flex items-center justify-between">
                          <span class="text-xs sm:text-sm font-bold text-white">4. Seguimiento con Notificaciones</span>
                          <span class="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">ACTIVO</span>
                        </div>
                        <p class="text-[11px] text-stone-300 leading-snug">Te avisamos paso a paso por WhatsApp cuando el repuesto esté listo para retirar o en viaje.</p>
                      </div>
                    </div>

                    <div class="space-y-1.5 pt-1 border-t border-white/10">
                      <label class="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer">
                        <div class="flex items-center gap-2">
                          <span class="text-emerald-400 text-sm">💬</span>
                          <div class="text-[11px]">
                            <span class="text-white font-bold block">Avisar por WhatsApp</span>
                            <span class="text-stone-400 text-[10px]">+54 9 280 441-2345 (Trelew)</span>
                          </div>
                        </div>
                        <input type="checkbox" checked class="w-5 h-5 accent-[#F5C342] rounded">
                      </label>

                      <label class="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer">
                        <div class="flex items-center gap-2">
                          <span class="text-amber-400 text-sm">🛵</span>
                          <div class="text-[11px]">
                            <span class="text-white font-bold block">Aviso cuando el cadete salga por Ruta 3</span>
                            <span class="text-stone-400 text-[10px]">Ubicación en vivo en el mapa</span>
                          </div>
                        </div>
                        <input type="checkbox" checked class="w-5 h-5 accent-[#F5C342] rounded">
                      </label>
                    </div>
                  </div>
                </div>

                <button (click)="closeSheet()" class="w-full py-3.5 rounded-2xl bg-[#F5C342] text-[#12100E] font-black text-xs sm:text-sm active:scale-[0.98] transition shadow-lg shadow-[#F5C342]/20 flex items-center justify-center gap-2 cursor-pointer">
                  <span>Continuar con mi Selección</span>
                  <svg class="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            }

            <!-- SHEET DETALLE DE REPUESTO -->
            @if (activeSheet() === 'item' && selectedItem() && selectedParentPart()) {
              <div class="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3">
                <div class="w-14 h-14 rounded-xl overflow-hidden border border-white/20 bg-stone-900 shrink-0">
                  <img [src]="selectedParentPart()!.img" [alt]="selectedItem()!.brand" class="w-full h-full object-cover">
                </div>
                <div class="min-w-0">
                  <span class="px-2 py-0.5 rounded text-[8px] font-mono"
                        [ngClass]="selectedItem()!.isMadryn ? 'bg-emerald-400 text-stone-950 font-black' : 'bg-amber-400 text-stone-950 font-black'">
                    {{ selectedItem()!.isMadryn ? 'MADRYN (65 km)' : 'COTIZACIÓN' }}
                  </span>
                  <h4 class="text-white font-extrabold text-sm truncate mt-0.5">{{ selectedItem()!.brand }}</h4>
                  <p class="text-[10px] text-stone-400 font-mono truncate">{{ selectedParentPart()!.name }}</p>
                </div>
              </div>

              <div class="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                <div class="flex justify-between items-center pb-2 border-b border-white/10 gap-2">
                  <span class="text-stone-300 font-bold flex items-center gap-1.5 text-xs min-w-0">
                    @if (selectedItem()!.isMadryn) {
                      <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path stroke-linecap="round" stroke-linejoin="round" d="M15 6a2 2 0 100-4 2 2 0 000 4zm-3 5h4l2 3h3m-8-3l-3 4-2-1-2 3.5"></path></svg>
                    } @else {
                      <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h18l-2 9H5L3 3zm0 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z"></path></svg>
                    }
                    <span class="truncate">{{ selectedItem()!.store }}</span>
                  </span>
                  <span class="text-stone-400 font-mono text-[10px] shrink-0">{{ selectedItem()!.dist }}</span>
                </div>

                <div class="space-y-1.5 pt-1">
                  <div class="flex justify-between"><span class="text-stone-400">Precio Repuesto:</span><span class="text-white font-bold">{{ selectedItem()!.price }}</span></div>
                  @if (selectedItem()!.isMadryn) {
                    <div class="flex justify-between py-1.5 border-b border-white/5">
                      <span class="text-stone-400 flex items-center gap-1">Cadete Moto Ruta 3 (Madryn ➔ Trelew):</span>
                      <span class="text-emerald-400 font-bold">{{ selectedItem()!.shippingFee }}</span>
                    </div>
                    <div class="flex justify-between pt-2">
                      <span class="text-white font-bold text-xs">Total final entregado en Trelew:</span>
                      <span class="text-amber-300 font-black text-sm">{{ money(itemTotal(selectedItem()!)) }}</span>
                    </div>
                  } @else {
                    <div class="flex justify-between py-1.5 border-b border-white/5">
                      <span class="text-stone-400 flex items-center gap-1">Tiempo de retiro:</span>
                      <span class="text-emerald-400 font-bold">{{ selectedItem()!.deliverySub }}</span>
                    </div>
                    <div class="flex justify-between pt-2">
                      <span class="text-white font-bold text-xs">Total a pagar en mostrador:</span>
                      <span class="text-amber-300 font-black text-sm">{{ selectedItem()!.price }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <p class="text-stone-300 text-[11px] leading-relaxed">{{ selectedItem()!.desc }}</p>
                <p class="text-[10px] font-mono text-stone-300 bg-black/50 p-2 rounded-xl border border-white/5">
                  <strong class="text-amber-300">Ficha Técnica:</strong> {{ selectedItem()!.specs }}
                </p>
              </div>

              <div class="space-y-2 pt-1">
                <button (click)="reservar(selectedItem()!)" class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-extrabold text-xs active:scale-[0.98] transition shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer">
                  {{ selectedItem()!.isMadryn ? 'Reservar y Solicitar Cadete Ruta 3' : 'Confirmar Reserva en Mostrador Trelew' }}
                </button>
                <button (click)="closeSheet()" class="w-full py-2 text-stone-400 hover:text-white text-[11px] font-mono cursor-pointer">
                  Volver a la lista de repuestos
                </button>
              </div>
            }

            <!-- SHEET COMBO / LOGÍSTICA -->
            @if (activeSheet() === 'combo') {
              <div class="space-y-3">
                <div class="flex items-center justify-between text-[11px] pb-1 text-stone-400 gap-2">
                  <span>Vehículo: <strong class="text-white">VW Passat 2.0 TDI (AB 412 TX)</strong></span>
                  <span class="text-emerald-400 font-bold shrink-0">✓ {{ comboCount() }} piezas cotizadas</span>
                </div>

                <div class="space-y-2.5">
                  @if (trelewItems().length) {
                    <div class="p-3 rounded-2xl bg-[#181818] border border-white/10 space-y-2">
                      <div class="flex items-center justify-between pb-1.5 border-b border-white/10 gap-2">
                        <div class="flex items-center gap-1.5 min-w-0">
                          <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                          <span class="text-xs font-bold text-white uppercase tracking-tight font-mono truncate">Grupo 1 — Retiro en Mostrador (Trelew)</span>
                        </div>
                        <span class="text-[10px] text-emerald-300 font-mono font-medium shrink-0">Hoy hasta 19:30 hs</span>
                      </div>

                      <div class="space-y-1.5 pt-0.5">
                        @for (row of trelewItems(); track row.item.id) {
                          <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                            <div class="min-w-0">
                              <span class="text-[10px] font-mono text-stone-400 block">{{ row.part.name }}</span>
                              <h5 class="text-xs font-bold text-white truncate">{{ row.item.brand }}</h5>
                              <div class="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
                                <span class="text-stone-300 truncate">{{ row.item.store }}</span>
                              </div>
                            </div>
                            <div class="text-right shrink-0">
                              <span class="text-xs font-extrabold text-white font-mono block">{{ row.item.price }}</span>
                              <span class="text-[9px] text-emerald-400 font-mono">Listo para retiro</span>
                            </div>
                          </div>
                        }
                      </div>

                      <div class="flex items-center justify-between pt-1.5 border-t border-white/5 text-[11px] font-mono gap-2">
                        <span class="text-stone-400">Subtotal Mostrador Trelew ({{ trelewItems().length }} piezas):</span>
                        <span class="text-white font-bold shrink-0">{{ money(trelewSubtotal()) }}</span>
                      </div>
                    </div>
                  }

                  @if (madrynItems().length) {
                    <div class="p-3 rounded-2xl bg-[#181818] border border-emerald-500/30 space-y-2">
                      <div class="flex items-center justify-between pb-1.5 border-b border-white/10 gap-2">
                        <div class="flex items-center gap-1.5 min-w-0">
                          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                          <span class="text-xs font-bold text-emerald-300 uppercase tracking-tight font-mono truncate">Grupo 2 — Envío Cadete Ruta 3 (Pto. Madryn)</span>
                        </div>
                        <span class="text-[10px] text-stone-300 font-mono shrink-0">~1h 15m express</span>
                      </div>

                      <div class="space-y-1.5 pt-0.5">
                        @for (row of madrynItems(); track row.item.id) {
                          <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                            <div class="min-w-0">
                              <span class="text-[10px] font-mono text-emerald-400/90 block">{{ row.part.name }}</span>
                              <h5 class="text-xs font-bold text-white truncate">{{ row.item.brand }}</h5>
                              <div class="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
                                <span class="text-stone-300 truncate">{{ row.item.store }} (Madryn)</span>
                              </div>
                            </div>
                            <div class="text-right shrink-0">
                              <span class="text-xs font-extrabold text-white font-mono block">{{ row.item.price }}</span>
                              <span class="text-[9px] text-emerald-400 font-mono">{{ row.item.shippingFee }} flete</span>
                            </div>
                          </div>
                        }
                      </div>

                      <div class="p-2.5 rounded-xl bg-black/60 border border-emerald-500/20 text-[11px] font-mono flex items-start gap-2">
                        <svg class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <div class="min-w-0 flex-1">
                          <div class="flex justify-between items-center gap-2">
                            <span class="text-stone-400 text-[10px]">DIRECCIÓN DE ENTREGA EN TRELEW:</span>
                            <button class="text-amber-400 text-[10px] underline font-bold hover:text-amber-300 cursor-pointer">Cambiar</button>
                          </div>
                          <p class="text-white font-bold truncate mt-0.5">Av. Fontana 450 (Taller Mecánico), Trelew</p>
                          <p class="text-[9px] text-stone-400">Cadete asignado con tracking GPS en vivo.</p>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <div class="p-3.5 rounded-2xl bg-[#181818] border border-white/10 space-y-2">
                  <div class="flex justify-between items-center text-xs text-stone-300 gap-2">
                    <span>Subtotal Repuestos ({{ comboCount() }} piezas):</span>
                    <span class="text-white font-bold font-mono text-sm shrink-0">{{ money(comboSubtotal()) }}</span>
                  </div>
                  <div class="flex justify-between items-center text-xs text-stone-300 gap-2">
                    <span>Flete Cadete Ruta 3 (Madryn ➔ Trelew):</span>
                    <span class="font-mono shrink-0" [ngClass]="comboShipping() > 0 ? 'text-emerald-400 font-bold' : 'text-stone-400'">{{ shippingFmt() }}</span>
                  </div>
                  <div class="flex justify-between items-center border-t border-white/10 pt-2.5 gap-2">
                    <div>
                      <span class="text-xs uppercase tracking-wider text-stone-400 block">Total Final a Pagar:</span>
                      <span class="text-[9px] text-stone-500">Precios finales garantizados con IVA</span>
                    </div>
                    <span class="text-xl font-black text-[#F5C342] font-mono tracking-tight shrink-0">{{ totalFmt() }}</span>
                  </div>
                </div>

                <div class="space-y-2 pt-1">
                  <div class="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[10px] text-stone-300 space-y-1">
                    <div class="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                      <span>Pago al retirar en mostrador / contra entrega al cadete</span>
                    </div>
                    <p class="text-stone-400 leading-tight">Aceptan Efectivo, Débito, Tarjeta o Transferencia bancaria directa con comprobante.</p>
                  </div>

                  <button (click)="confirmarPedido()" class="w-full py-3.5 rounded-2xl bg-[#F5C342] text-[#12100E] font-black text-sm active:scale-[0.98] transition shadow-lg shadow-[#F5C342]/25 flex items-center justify-center gap-2 cursor-pointer">
                    <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    <span>Confirmar y Reservar Stock ({{ totalFmt() }})</span>
                  </button>

                  <button (click)="closeSheet()" class="w-full py-2 text-stone-400 hover:text-white text-[11px] font-mono cursor-pointer">
                    Seguir ajustando piezas del combo
                  </button>
                </div>
              </div>
            }

            <!-- SHEET ÉXITO -->
            @if (activeSheet() === 'success') {
              <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <div class="w-12 h-12 rounded-full bg-emerald-400 text-stone-950 flex items-center justify-center mx-auto shadow-lg">
                  <svg class="w-6 h-6 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h4 class="text-sm font-extrabold text-white">Stock bloqueado en los comercios</h4>
                <p class="text-xs text-stone-300">
                  Se emitieron las órdenes de retiro y el cadete Ruta 3 fue notificado para el despacho express.
                </p>
                <div class="p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-amber-300 font-bold">
                  Total a abonar: {{ totalFmt() }}
                </div>
                <button (click)="closeSheet()" class="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition mt-2 cursor-pointer">
                  Ver Pedidos Activos
                </button>
              </div>
            }

            <!-- SHEET NUEVA PIEZA -->
            @if (activeSheet() === 'addPart') {
              <div class="space-y-3">
                <p class="text-[11px] text-stone-300">
                  Escribí o seleccioná el repuesto para que las casas de Trelew y Puerto Madryn reciban la consulta en tiempo real:
                </p>
                <div class="space-y-1.5">
                  <label class="text-[10px] text-stone-400 font-mono">NOMBRE O CÓDIGO DEL REPUESTO:</label>
                  <input type="text" placeholder="Ej: Amortiguadores Delanteros, Bomba de Agua..." class="w-full p-2.5 rounded-xl bg-black/70 border border-white/15 text-white text-xs font-mono focus:border-amber-400 focus:outline-none placeholder-stone-600">
                </div>
                <div class="flex items-center gap-1.5 flex-wrap pt-1">
                  <span class="text-[9px] text-stone-500 font-mono">Sugerencias rápidas:</span>
                  <button class="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] text-amber-300 cursor-pointer">Bomba de Agua</button>
                  <button class="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] text-amber-300 cursor-pointer">Amortiguadores</button>
                  <button class="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] text-amber-300 cursor-pointer">Correa Distribución</button>
                </div>
                <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono flex items-center gap-1.5">
                  <span>⚡ Se enviará a los 4 comercios activos en simultáneo.</span>
                </div>
                <button (click)="closeSheet()" class="w-full py-3 rounded-xl bg-amber-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-400/25 active:scale-[0.98] transition cursor-pointer">
                  Emitir Consulta a Comercios
                </button>
              </div>
            }

            <!-- SHEET PERFIL / CUENTA -->
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
              <button (click)="closeSheet()" class="w-full py-2 text-stone-400 hover:text-white text-[11px] font-mono cursor-pointer">
                Volver
              </button>
            }

          </div>
        </div>
      }

      <!-- MENÚ INFERIOR (DOCK) -->
      <nav class="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto">
        <div class="jobs-dock px-3 py-2 rounded-3xl flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)]">

          <button (click)="openVehicleSheet()" class="flex-1 py-1 flex flex-col items-center gap-1 text-stone-400 hover:text-white transition-all active:scale-90 group min-h-[44px] justify-center cursor-pointer" aria-label="Garage">
            <svg class="w-5 h-5 text-stone-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v4c0 .6.4 1 1 1h2m14 0a2 2 0 100 4 2 2 0 000-4zm-14 0a2 2 0 100 4 2 2 0 000-4z"></path>
            </svg>
            <span class="text-[10px] font-semibold tracking-tight">Garage</span>
          </button>

          <button (click)="irAPedidos()" class="flex-1 py-1 flex flex-col items-center gap-1 text-amber-400 font-bold transition-all active:scale-90 relative min-h-[44px] justify-center cursor-pointer" aria-label="Pedidos activos">
            <div class="relative">
              <svg class="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <span class="w-4 h-4 rounded-full bg-amber-400 text-stone-950 text-[9px] font-mono font-black flex items-center justify-center absolute -top-1.5 -right-2.5 ring-2 ring-[#121110] shadow-sm">{{ comboCount() }}</span>
            </div>
            <span class="text-[10px] font-bold text-amber-400 tracking-tight">Pedidos</span>
          </button>

          <div class="flex-1 flex justify-center -mt-5">
            <button (click)="openAddPartSheet()" class="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-stone-950 flex items-center justify-center shadow-[0_8px_24px_rgba(245,158,11,0.45)] border-2 border-stone-950 active:scale-95 transition-transform cursor-pointer" title="Nueva Consulta de Repuesto" aria-label="Nueva Consulta">
              <svg class="w-6 h-6 text-stone-950 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>

          <button (click)="irAConsultas()" class="flex-1 py-1 flex flex-col items-center gap-1 text-stone-400 hover:text-white transition-all active:scale-90 group min-h-[44px] justify-center cursor-pointer" aria-label="Consultas">
            <svg class="w-5 h-5 text-stone-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="text-[10px] font-semibold tracking-tight">Consultas</span>
          </button>

          <button (click)="irAFacturacion()" class="flex-1 py-1 flex flex-col items-center gap-1 text-stone-400 hover:text-white transition-all active:scale-90 group min-h-[44px] justify-center cursor-pointer" aria-label="Facturas">
            <svg class="w-5 h-5 text-stone-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path>
            </svg>
            <span class="text-[10px] font-semibold tracking-tight">Facturas</span>
          </button>

        </div>
      </nav>

    </div>
  `
})
export class CompradorMovilComponent {
  private readonly router = inject(Router);
  private readonly supa = inject(SupabaseService);

  /** Sesión real del usuario (null en sesiones demo por rol). */
  readonly usuario = usuarioSesion();

  /** Iniciales del avatar: nombre real si hay sesión, "MG" por defecto. */
  get iniciales(): string {
    const nombre = this.usuario?.nombre?.trim();
    if (!nombre) return 'MG';
    return nombre.split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
  }

  readonly vehicleImg = '/img/veh-passat.jpg';

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
  readonly combo = signal<Record<string, string>>({
    pastillas: 'frasle_trelew',
    filtro: 'filtro_wega',
    discos: 'discos_fremax',
  });

  /** Confirmación del pedido: lleva el anillo al 100%. */
  readonly confirmado = signal(false);

  /** Secciones plegadas por defecto: la lista de casas no invade la pantalla. */
  readonly partsOpen = signal<Set<string>>(new Set());

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

  /** Anillo: 4 tareas (0–75%) y 100% al confirmar. */
  readonly taskPercent = computed(() =>
    this.confirmado() ? 100 : Math.round((this.comboProgress() / 100) * 75)
  );
  readonly ringOffset = computed(() => 138.23 * (1 - this.taskPercent() / 100));
  readonly ringColor = computed(() =>
    this.taskPercent() === 100 ? '#2ECC71' : 'url(#ringAmberGrad)'
  );
  readonly nextStepLabel = computed(() =>
    this.comboComplete() ? 'Siguiente: Confirmar pedido' : 'Siguiente: Elegir repuestos (' + this.comboCount() + '/' + this.partsCatalog.length + ')'
  );

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

  fee(item: CatalogItem): number {
    return item.isMadryn ? (item.shippingFeeNum ?? 0) : 0;
  }

  itemTotal(item: CatalogItem): number {
    return item.priceNum + this.fee(item);
  }

  money(value: number): string {
    return '$' + value.toLocaleString('es-AR');
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
  selectComboItem(partKey: string, itemId: string): void {
    this.confirmado.set(false);
    this.combo.set({ ...this.combo(), [partKey]: itemId });
  }

  // ── Sheets ────────────────────────────────────────────────────────────────
  openVehicleSheet(): void {
    this.activeSheet.set('vehicle');
  }

  openTasks(): void {
    this.activeSheet.set('tasks');
  }

  openItemSheet(item: CatalogItem, parent: CatalogPart): void {
    this.selectedItem.set(item);
    this.selectedParentPart.set(parent);
    this.activeSheet.set('item');
  }

  openComboSheet(): void {
    this.activeSheet.set('combo');
  }

  openAddPartSheet(): void {
    this.activeSheet.set('addPart');
  }

  openPerfilSheet(): void {
    this.activeSheet.set('perfil');
  }

  closeSheet(): void {
    this.activeSheet.set(null);
  }

  reservar(item: CatalogItem): void {
    alert(`¡Reserva confirmada de ${item.brand} en ${item.store} por ${item.price}!`);
    this.closeSheet();
  }

  confirmarPedido(): void {
    this.confirmado.set(true);
    this.activeSheet.set('success');
  }

  // ── Navegación ────────────────────────────────────────────────────────────
  irABuscar(): void {
    this.router.navigate(['/']);
  }

  irAPedidos(): void {
    this.openComboSheet();
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
