import { Component, inject, signal } from '@angular/core';
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
            <h1 class="text-xs font-black tracking-tight text-white uppercase">Toolbox <span class="text-amber-400">Patagonia</span></h1>
            <p class="text-[10px] text-stone-400 font-mono">Consola Comprador</p>
          </div>
        </div>

        <!-- ACCESOS RÁPIDOS MÍNIMOS -->
        <div class="flex items-center gap-2">
          <button class="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-stone-300 hover:text-white flex items-center justify-center relative active:scale-95 transition" title="Notificaciones">
            <svg class="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span class="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5 ring-2 ring-black"></span>
          </button>
          <button (click)="openPerfilSheet()" class="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer" title="Mi cuenta">
            {{ iniciales }}
          </button>
        </div>
      </header>

      <!-- CONTENIDO PRINCIPAL: STEVE JOBS - MÁXIMA SÍNTESIS -->
      <main class="space-y-3 max-w-md mx-auto">

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
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>

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
        </div>

        <!-- 4. LISTADO AGRUPADO POR NOMBRE DE REPUESTO -->
        <div class="space-y-3.5">
          @for (part of partsCatalog; track part.key) {
            <section class="jobs-monolith text-white shadow-xl border border-white/10 overflow-hidden">
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
                  </div>
                  <svg class="w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300"
                       [class.rotate-180]="isPartOpen(part.key)"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
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
            </section>
          }

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
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- CONTENIDO DINÁMICO DEL SHEET -->
          <div class="space-y-3 text-xs font-mono max-h-[70vh] overflow-y-auto">

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
              <button (click)="closeSheet()" class="w-full py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs mt-2">
                Cerrar Ficha
              </button>
            }

            <!-- SHEET REPUESTO DETALLE -->
            @if (activeSheet() === 'item' && selectedItem()) {
              <div class="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3">
                <div class="w-14 h-14 rounded-xl overflow-hidden border border-white/20 bg-stone-900 shrink-0">
                  <img [src]="selectedParentPart()?.img" [alt]="selectedItem()?.brand" class="w-full h-full object-cover">
                </div>
                <div class="min-w-0">
                  <span class="px-2 py-0.5 rounded text-[8px] font-mono" [ngClass]="selectedItem()?.tierBadge">{{ selectedItem()?.tier }}</span>
                  <h4 class="text-white font-extrabold text-sm truncate mt-0.5">{{ selectedItem()?.brand }}</h4>
                  <p class="text-[10px] text-stone-400 font-mono truncate">{{ selectedParentPart()?.name }}</p>
                </div>
              </div>

              <div class="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
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
                    </div>
                  }
                </div>
              </div>

              <!-- ESPECIFICACIONES TÉCNICAS -->
              <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <p class="text-stone-300 text-[11px] leading-relaxed">{{ selectedItem()?.desc }}</p>
                <p class="text-[10px] font-mono text-stone-300 bg-black/50 p-2 rounded-xl border border-white/5">
                  <strong class="text-amber-300">Ficha Técnica:</strong> {{ selectedItem()?.specs }}
                </p>
              </div>

              <!-- ACCIONES TÁCTILES RÁPIDAS -->
              <div class="space-y-2 pt-1">
                <button (click)="reservar(selectedItem()!)" class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-extrabold text-xs active:scale-[0.98] transition shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2">
                  {{ selectedItem()?.isMadryn ? 'Reservar y Solicitar Cadete Ruta 3' : 'Confirmar Reserva en Mostrador Trelew' }}
                </button>
                <button (click)="closeSheet()" class="w-full py-2 text-stone-400 hover:text-white text-[11px] font-mono">
                  Volver a la lista de repuestos
                </button>
              </div>
            }

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
              </button>
            }

          </div>
        </div>
      }

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

  // Imágenes con URLs directas de alta definición
  readonly vehicleImg = 'https://lh3.googleusercontent.com/aida/ALJJyrC5NOXvpDuZhbv0uwxtTtr7brY-npcGFl9DAUB1CnFuhMVVfdZ7DCC4ynHKkvCqYMOn2HDPWn4Nmwtp7b48TvCZa2OCiQydgG0Kfzw1kCNPf9q-CfxCSrM-iYLMmyU-KmuoldBWkyCg7tRwC7o7WbYMFsSKJT6QZpqBa3Aesw5W4y8QOA9O9b-_Vh-oc7wfKcUoi3j3D82CRvBeddvkxzbzMgwpYxpKKeoJ-uXeJQvK_z859ETd';

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
  }

  openItemSheet(item: CatalogItem, parent: CatalogPart): void {
    this.selectedItem.set(item);
    this.selectedParentPart.set(parent);
    this.activeSheet.set('item');
  }

  openKitSheet(kitType: 'economico' | 'premium'): void {
    this.selectedKitType.set(kitType);
    this.activeSheet.set('kit');
  }

  closeSheet(): void {
    this.activeSheet.set(null);
  }

  reservar(item: CatalogItem): void {
    alert(`¡Reserva confirmada de ${item.brand} en ${item.store} por ${item.price}!`);
    this.closeSheet();
  }

  comprarKit(): void {
    alert('¡Orden de compra de las 3 piezas iniciada ($88.700)!');
    this.closeSheet();
  }

  irABuscar(): void {
    this.router.navigate(['/']);
  }

  irAPedidos(): void {
    this.openKitSheet('economico');
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
