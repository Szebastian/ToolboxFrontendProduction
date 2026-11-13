import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompradorEstadoService } from './comprador-estado.service';
import { COMPRADOR_STYLES } from './comprador-styles';

// Panel principal del comprador (consola, garage, pedidos)
@Component({
  selector: 'app-comprador-panel',
  standalone: true,
  imports: [FormsModule],
  styles: COMPRADOR_STYLES,
  template: `
  <div class="min-h-[1024px] flex flex-col justify-between selection:bg-cyan-500 selection:text-black antialiased">

    <!-- TOP BAR CON NOTIFICACIONES ASÍNCRÓNICAS Y VIN ACTIVO -->
    <header class="w-full max-w-7xl mx-auto px-6 pt-5 pb-3 flex items-center justify-between z-30">

      <!-- Logo Oficial -->
      <a href="#" class="flex items-center gap-3.5 group">
        <div class="w-10 h-10 rounded-2xl bg-[#0E0F12] p-1 border border-white/10 shadow-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
          <img src="/logo.svg" alt="Toolbox Patagonia Logo" class="w-full h-full object-contain rounded-xl mix-blend-screen contrast-125 brightness-110">
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-extrabold text-base tracking-tight text-[#171412]">Toolbox</span><span class="font-semibold text-xs tracking-wider uppercase text-amber-950 font-mono">Patagonia</span>
          </div>
          <p class="text-[10px] font-mono text-stone-900 tracking-wider">Panel de Comprador &amp; Mi Garage</p>
        </div>
      </a>

      <!-- Alertas Asincrónicas ("Fire & Forget") + Perfil -->
      <div class="flex items-center gap-3">

        <!-- Píldora de VIN Activo en Garage (dinámica según el vehículo del garage) -->
        <div class="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#0E0F12]/95 backdrop-blur border border-white/10 text-xs shadow-md max-w-[300px]">
          <span class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4] animate-pulse shrink-0"></span>
          <span class="text-stone-400 font-mono text-[11px] shrink-0">Chasis activo:</span>
          <span class="font-mono text-white text-[11px] font-bold truncate min-w-0" [title]="estado.autoActivo().nombreLargo + ' · VIN ' + estado.autoActivo().vin">{{ estado.autoActivo().nombre }} ({{ estado.autoActivo().vin }})</span>
          <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-extrabold shrink-0">AUTO-LOCK</span>
        </div>

        <!-- Badge Flotante de Notificaciones Asincrónicas de Vendedores -->
        <button (click)="estado.switchTab('solicitudes')" class="relative flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#0E0F12]/95 border border-white/10 text-stone-300 hover:text-white transition shadow-md group cursor-pointer" title="3 ofertas recibidas en segundo plano">
          <svg class="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span class="text-[11px] font-mono font-bold text-white hidden sm:inline">3 Ofertas</span>
          <span class="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5 animate-ping"></span>
        </button>

        <!-- Avatar Comprador -->
        <div class="flex items-center gap-2.5 pl-2">
          <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 flex items-center justify-center text-[#171412] font-mono font-extrabold text-xs shadow-md">
            LR
          </div>
          <div class="hidden sm:block text-left">
            <span class="block text-xs font-bold text-[#171412] leading-none">Lucas Rodríguez</span>
            <span class="text-[10px] font-mono text-stone-900 font-medium">Taller Don Bosco · Trelew</span>
          </div>
        </div>

      </div>

    </header>

    <!-- BANNER DESTACADO DE RESPUESTAS DE COMERCIOS (LUEGO DE LOS 3 PASOS: BUSCAR · REPUESTO · BUSCAR STOCK) -->
    @if (estado.bannerVisible()) {
    <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-3 z-30">
      <div class="toast-in relative p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#171412] via-[#141210] to-[#120F0D] border-2 border-amber-400/80 shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(245,158,11,0.25)] flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div class="flex items-center gap-4">
          <!-- Ícono Radar con Pulso -->
          <div class="relative w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M5 2 3 4m16 0-2-2M4 6H2m18 0h2"/></svg>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute top-1 right-1 shadow-[0_0_8px_#34D399]"></span>
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-extrabold border border-emerald-500/30">
                ✓ 1. BUSCAR · 2. REPUESTO · 3. BUSCAR STOCK
              </span>
              <span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">
                RESPUESTAS DE COMERCIOS EN TRELEW
              </span>
            </div>
            <h2 class="text-base sm:text-lg font-extrabold text-white tracking-tight mt-1">
              Llegaron las respuestas de los comercios para tu Volkswagen Passat
            </h2>
            <p class="text-xs text-stone-300 font-mono mt-0.5">
              Los comercios revisaron su stock físico: 3 locales confirmaron disponibilidad inmediata y cotización en mano.
            </p>
          </div>
        </div>

        <!-- CTA de Aprobación Inmediata -->
        <div class="flex items-center gap-2.5 shrink-0">
          <button (click)="estado.switchTab('solicitudes'); estado.cerrarBanner()" class="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs font-mono shadow-xl shadow-amber-500/20 active:scale-95 transition flex items-center gap-2 cursor-pointer">
            <span>Ver Respuestas de los Comercios</span>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>

        <!-- Cierre manual del toast -->
        <button (click)="estado.cerrarBanner()" title="Descartar" class="absolute top-2.5 right-3 w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white flex items-center justify-center transition text-xs cursor-pointer" style="font-family:'JetBrains Mono',monospace">✕</button>

      </div>
    </div>
    }

    <!-- DASHBOARD PRINCIPAL CON GRID ASIMÉTRICO -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 z-20">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        <!-- 1. SIDEBAR DE NAVEGACIÓN TÉCNICA (3 COLS · STICKY EN PANTALLAS GRANDES) -->
        <aside class="lg:col-span-3 dark-console p-4 sm:p-5 lg:p-6 rounded-[32px] space-y-4 lg:space-y-5 lg:sticky lg:top-5 self-start">

          <div class="px-2 py-1">
            <span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Consola Comprador</span>
            <h3 class="text-sm lg:text-base font-bold text-white mt-0.5 tracking-tight">Gestión de Chasis &amp; Licitaciones</h3>
            <p class="text-[11px] lg:text-xs text-stone-400 font-sans mt-1 leading-relaxed">Control de vehículos guardados, pedidos y ofertas recibidas.</p>
          </div>

          <!-- Separador técnico -->
          <div class="lg:block hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          <nav class="space-y-2 lg:space-y-2.5 font-mono text-xs lg:text-[13px]">

            <!-- Tab 1: Presupuestos & Respuestas (Activo por defecto: foco absoluto) -->
            <button (click)="estado.switchTab('solicitudes')" [class.active]="estado.tab()==='solicitudes'" class="nav-link w-full flex items-center justify-between gap-3 px-3.5 py-3 lg:px-4 lg:py-3.5 rounded-2xl text-stone-300 transition text-left group cursor-pointer">
              <div class="flex items-center gap-3 min-w-0">
                <svg class="w-4 h-4 shrink-0 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
                <span class="font-bold whitespace-nowrap">Presupuestos &amp; Stock</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-cyan-400 text-stone-950 text-[10px] font-black shrink-0 whitespace-nowrap">3 nuevas</span>
            </button>

            <!-- Tab 2: Mi Garage (Pestaña separada) -->
            <button (click)="estado.switchTab('garage')" [class.active]="estado.tab()==='garage'" class="nav-link w-full flex items-center justify-between gap-3 px-3.5 py-3 lg:px-4 lg:py-3.5 rounded-2xl text-stone-300 hover:text-white hover:bg-white/5 transition text-left group cursor-pointer">
              <div class="flex items-center gap-3 min-w-0">
                <svg class="w-4 h-4 shrink-0 text-stone-400 group-hover:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                <span class="whitespace-nowrap">Mi Garage</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-white/10 text-stone-300 text-[10px] font-bold shrink-0 whitespace-nowrap">{{ 2 + estado.autos().length }} autos</span>
            </button>

            <!-- Tab 3: Mis Pedidos y Compras -->
            <button (click)="estado.switchTab('pedidos')" [class.active]="estado.tab()==='pedidos'" class="nav-link w-full flex items-center justify-between gap-3 px-3.5 py-3 lg:px-4 lg:py-3.5 rounded-2xl text-stone-300 hover:text-white hover:bg-white/5 transition text-left group">
              <div class="flex items-center gap-3 min-w-0">
                <svg class="w-4 h-4 shrink-0 text-stone-400 group-hover:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                <span class="whitespace-nowrap">Mis Pedidos &amp; Facturas</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-400 text-[10px] font-bold shrink-0 whitespace-nowrap">1 en curso</span>
            </button>

            <!-- Tab 4: Preguntas a Vendedores -->
            <button (click)="estado.switchTab('preguntas')" [class.active]="estado.tab()==='preguntas'" class="nav-link w-full flex items-center justify-between gap-3 px-3.5 py-3 lg:px-4 lg:py-3.5 rounded-2xl text-stone-300 hover:text-white hover:bg-white/5 transition text-left group">
              <div class="flex items-center gap-3 min-w-0">
                <svg class="w-4 h-4 shrink-0 text-stone-400 group-hover:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span class="whitespace-nowrap">Consultas de Calce</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-white/10 text-stone-300 text-[10px] shrink-0 whitespace-nowrap">3 hilos</span>
            </button>

            <!-- Tab 5: Mi Cuenta y Facturación -->
            <button (click)="estado.switchTab('cuenta')" [class.active]="estado.tab()==='cuenta'" class="nav-link w-full flex items-center justify-between gap-3 px-3.5 py-3 lg:px-4 lg:py-3.5 rounded-2xl text-stone-300 hover:text-white hover:bg-white/5 transition text-left group">
              <div class="flex items-center gap-3 min-w-0">
                <svg class="w-4 h-4 shrink-0 text-stone-400 group-hover:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
                <span class="whitespace-nowrap">Datos &amp; Facturación</span>
              </div>
              <span class="text-stone-400 text-xs shrink-0">→</span>
            </button>

          </nav>

          <!-- Separador técnico -->
          <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          <!-- Píldora de Pasarela Externa -->
          <div class="p-3.5 lg:p-4 rounded-2xl bg-[#181A1F] border border-cyan-500/20 text-xs font-mono">
            <div class="flex items-center gap-2 text-cyan-300 font-bold mb-1">
              <svg class="w-4 h-4 shrink-0 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13a8 8 0 0 0-13.7-4.7L4 7"/><path d="M4 21v-6"/><path d="M20 13a8 8 0 0 0-13.7-4.7L4 7"/><circle cx="12" cy="13" r="3"/></svg>
              <span>Pasarela Segura Trelew</span>
            </div>
            <p class="text-[11px] lg:text-[11.5px] text-stone-400 font-sans leading-relaxed">
              Al elegir una oferta, el pago y despacho en moto se completan en la pasarela oficial protegida de 7 pasos.
            </p>
          </div>

        </aside>

        <!-- 2. MAIN ARENA: SECCIONES DINÁMICAS DEL DASHBOARD (9 COLS) -->
        <section class="lg:col-span-9 space-y-6">

          <!-- ================================================================= -->
          <!-- SECCIÓN 1: "MI GARAGE" (MÓDULO ESTRELLA CON CARDS + VIN + SILUETA) -->
          <!-- ================================================================= -->
          <div id="section-garage" class="space-y-6" [class.hidden]="estado.tab() !== 'garage'">

            <!-- Encabezado de Mi Garage con Botón Flotante de Añadir -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E0F12]/90 text-cyan-300 text-xs font-mono mb-1.5 border border-cyan-500/20 shadow">
                  <svg class="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13a8 8 0 0 0-13.7-4.7L4 7"/><path d="M4 21v-6"/><path d="M20 13a8 8 0 0 0-13.7-4.7L4 7"/><circle cx="12" cy="13" r="3"/></svg>
                  <span>Mi Garage de Precisión · {{ estado.autos().length + 2 }} Chasis Verificados</span>
                </div>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-[#171412] tracking-tight">
                  Vehículos vinculados a repuestos exactos
                </h2>
                <p class="text-xs sm:text-sm text-stone-900 font-medium">
                  Al seleccionar un auto, toda la plataforma filtra catálogos por código OEM y descarta piezas incompatibles.
                </p>
              </div>

              <!-- Botón Agregar Vehículo (Abre Modal) -->
              <button (click)="estado.altaOpen.set(true)" class="px-5 py-3 rounded-2xl bg-[#0E0F12] hover:bg-black text-cyan-300 font-mono text-xs font-bold shadow-xl border border-cyan-400/40 flex items-center justify-center gap-2 shrink-0 transition active:scale-95 group">
                <svg class="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                <span>Agregar Vehículo por VIN / Patente</span>
              </button>
            </div>

            <!-- GRID DE TARJETAS DE AUTOS (CARDS DETALLADAS) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

              <!-- AUTO 1: PASSAT 2.0 TDI (ACTIVO) -->
              <div class="card-technical card-best p-5 sm:p-6 rounded-[32px] relative overflow-hidden flex flex-col justify-between space-y-4 shadow-2xl">

                <!-- Badge de Vehículo Activo -->
                <div class="flex items-center justify-between">
                  <span class="px-3 py-1 rounded-full bg-cyan-400 text-stone-950 text-[10px] font-mono font-extrabold shadow flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-stone-950 animate-ping"></span>
                    VEHÍCULO ACTIVO EN BÚSQUEDAS
                  </span>

                  <div class="flex items-center gap-2">
                    <button class="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition" title="Editar chasis">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button class="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-red-400 transition" title="Eliminar del garage">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>

                <!-- Foto e Información Central -->
                <div class="space-y-3">
                  <div class="h-40 rounded-2xl bg-gradient-to-b from-stone-900/60 to-black/90 border border-white/10 p-2 flex items-center justify-center overflow-hidden relative group">
                    <img src="/img/muestra-taller.jpg" alt="VW Passat 2.0 TDI" class="w-full h-full object-cover rounded-xl filter contrast-115 drop-shadow-2xl group-hover:scale-105 transition duration-500">
                    <div class="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg bg-black/85 backdrop-blur text-[10px] font-mono text-stone-300 border border-white/10">
                      Sedán 4 Puertas · Plata Réflex
                    </div>
                    <div class="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-400/30">
                      OEM VW Match
                    </div>
                  </div>

                  <div>
                    <div class="flex items-baseline justify-between">
                      <h3 class="text-xl font-extrabold text-white tracking-tight">Volkswagen Passat</h3>
                      <span class="text-xs font-mono font-bold text-cyan-300 bg-cyan-400/10 px-2.5 py-0.5 rounded border border-cyan-400/20">2006</span>
                    </div>
                    <p class="text-xs text-stone-300 font-mono mt-0.5">2.0 TDI 140 CV · Motor BKP / BMP (Inyector Bomba)</p>
                  </div>

                  <!-- Píldoras Técnicas: Patente y VIN -->
                  <div class="space-y-1.5 text-xs font-mono">
                    <div class="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5">
                      <span class="text-stone-400">Patente Argentina:</span>
                      <span class="plate-badge px-2.5 py-0.5 rounded text-[11px] font-bold">FXW 892</span>
                    </div>
                    <div class="flex items-center justify-between p-2 rounded-xl vin-badge">
                      <span class="text-stone-400">VIN Chasis (17d):</span>
                      <span class="text-emerald-400 font-bold tracking-widest text-[11px]">WVWZZZ3CZ6P108422</span>
                    </div>
                  </div>
                </div>

                <!-- Acciones Rápidas del Auto -->
                <div class="pt-3 border-t border-cyan-500/30 space-y-2">
                  <button (click)="estado.buscarPara('VW Passat 2.0 TDI', 'WVWZZZ3CZ6P108422', '2006 · BKP')" class="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg transition active:scale-95">
                    <svg class="w-3.5 h-3.5 text-stone-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <span>Buscar Repuestos para este Auto (1-Clic)</span>
                  </button>

                  <div class="flex items-center justify-between text-[11px] font-mono px-1">
                    <button (click)="estado.historial('Passat')" class="text-stone-400 hover:text-white underline transition">
                      Ver estado.historial: 3 compras previas
                    </button>
                    <span class="text-emerald-400 font-semibold flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 100% Calce OK
                    </span>
                  </div>
                </div>

              </div>

              <!-- AUTO 2: TOYOTA HILUX 4X4 (SILUETA VECTORIAL REFINADA) -->
              <div class="card-technical p-5 sm:p-6 rounded-[32px] relative overflow-hidden flex flex-col justify-between space-y-4 shadow-2xl">

                <!-- Header de Auto Secundario -->
                <div class="flex items-center justify-between">
                  <span class="px-3 py-1 rounded-full bg-white/10 text-stone-300 text-[10px] font-mono font-medium border border-white/10">
                    GUARDADO EN GARAGE
                  </span>

                  <div class="flex items-center gap-2">
                    <button class="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition" title="Editar chasis">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button class="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-red-400 transition" title="Eliminar del garage">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>

                <!-- Silueta Vectorizada e Información Técnica -->
                <div class="space-y-3">
                  <div class="h-40 rounded-2xl bg-gradient-to-b from-stone-900/60 to-black/90 border border-white/10 p-4 flex flex-col items-center justify-center relative group">
                    <svg class="w-32 h-16 text-stone-400 group-hover:text-cyan-400 transition-colors duration-300 drop-shadow-lg" viewBox="0 0 120 50" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 32h15m20 0h40m20 0h15M10 32l6-14h24l16 8h36l12 6h6v6H10v-6z"></path>
                      <circle cx="28" cy="32" r="7" stroke-width="2.5"></circle>
                      <circle cx="92" cy="32" r="7" stroke-width="2.5"></circle>
                      <path stroke-linecap="round" d="M42 18h20v8H38l4-8z"></path>
                      <path stroke-linecap="round" d="M66 18h16l4 8H66v-8z"></path>
                    </svg>
                    <span class="text-[10px] font-mono text-stone-400 mt-2">Silueta Vectorial SRX 4x4</span>
                    <div class="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg bg-black/85 backdrop-blur text-[10px] font-mono text-stone-300 border border-white/10">
                      Doble Cabina SRX · Blanco Perlado
                    </div>
                  </div>

                  <div>
                    <div class="flex items-baseline justify-between">
                      <h3 class="text-xl font-extrabold text-white tracking-tight">Toyota Hilux 4x4</h3>
                      <span class="text-xs font-mono font-bold text-stone-300 bg-white/10 px-2.5 py-0.5 rounded">2018</span>
                    </div>
                    <p class="text-xs text-stone-300 font-mono mt-0.5">2.8 D-4D 1GD-FTV · 177 CV (Common Rail Turbo)</p>
                  </div>

                  <!-- Píldoras Técnicas: Patente y VIN -->
                  <div class="space-y-1.5 text-xs font-mono">
                    <div class="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5">
                      <span class="text-stone-400">Patente Mercosur:</span>
                      <span class="plate-badge px-2.5 py-0.5 rounded text-[11px] font-bold">AD 340 JK</span>
                    </div>
                    <div class="flex items-center justify-between p-2 rounded-xl vin-badge">
                      <span class="text-stone-400">VIN Chasis (17d):</span>
                      <span class="text-amber-300 font-bold tracking-widest text-[11px]">8AJBA3CD4J1245081</span>
                    </div>
                  </div>
                </div>

                <!-- Acciones Rápidas del Auto -->
                <div class="pt-3 border-t border-white/10 space-y-2">
                  <button (click)="estado.activarVehiculo('Toyota Hilux 4x4', '8AJBA3CD4J1245081', '2018 · 2.8 D-4D')" class="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition active:scale-95 border border-white/10">
                    <span>Activar como Vehículo de Búsqueda</span>
                    <svg class="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </button>

                  <div class="flex items-center justify-between text-[11px] font-mono px-1">
                    <button (click)="estado.historial('Hilux')" class="text-stone-400 hover:text-white underline transition">
                      Ver estado.historial: 1 compra previa
                    </button>
                    <span class="text-stone-400">Filtro gasoil Mann</span>
                  </div>
                </div>

              </div>

              <!-- AUTOS AGREGADOS DINÁMICAMENTE -->
              @for (a of estado.autos(); track a.vin) {
                <div class="card-technical p-5 sm:p-6 rounded-[32px] relative overflow-hidden flex flex-col justify-between space-y-4 shadow-2xl">
                  <div class="flex items-center justify-between">
                    <span class="px-3 py-1 rounded-full bg-white/10 text-stone-300 text-[10px] font-mono font-medium border border-white/10">NUEVO EN GARAGE</span>
                    <span class="text-[10px] font-mono text-emerald-400">✓ Verificado</span>
                  </div>
                  <div>
                    <h3 class="text-xl font-extrabold text-white tracking-tight">{{ a.nombre }}</h3>
                    <p class="text-xs text-stone-300 font-mono mt-0.5">{{ a.version }}</p>
                  </div>
                  <div class="space-y-1.5 text-xs font-mono">
                    <div class="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5">
                      <span class="text-stone-400">Patente / VIN:</span>
                      <span class="plate-badge px-2.5 py-0.5 rounded text-[11px] font-bold">{{ a.patente }}</span>
                    </div>
                    <div class="flex items-center justify-between p-2 rounded-xl vin-badge">
                      <span class="text-stone-400">VIN Chasis (17d):</span>
                      <span class="text-emerald-400 font-bold tracking-widest text-[11px]">{{ a.vin }}</span>
                    </div>
                  </div>
                  <button (click)="estado.activarVehiculo(a.nombre, a.vin, a.version)" class="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs font-mono shadow-lg transition active:scale-95">
                    Activar como Vehículo de Búsqueda
                  </button>
                </div>
              }

            </div>

          </div>

          <!-- ================================================================= -->
          <!-- SECCIÓN 2: SOLICITUDES DE COTIZACIÓN ASINCRÓNICAS (FIRE & FORGET) -->
          <!-- ================================================================= -->
          <div id="section-solicitudes" class="space-y-6" [class.hidden]="estado.tab() !== 'solicitudes' && estado.tab() !== 'cuenta'">

            <div class="dark-console p-6 rounded-[32px] space-y-5">

              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div class="flex items-start sm:items-center gap-4">
                  <div class="relative w-16 h-16 rounded-2xl bg-black/80 border border-cyan-500/40 p-1 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
                    <img src="/img/muestra-pastillas.jpg" alt="Muestra de taller" class="w-full h-full object-cover rounded-xl">
                    <span class="absolute bottom-1 right-1 px-1 rounded bg-black/90 text-[8px] font-mono text-cyan-300 border border-cyan-400/40">3 FOTOS</span>
                  </div>

                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-base sm:text-lg font-bold text-white tracking-tight">Pastillas de Freno Delanteras (Pinza Lucas/TRW)</h3>
                      <span class="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-extrabold border border-cyan-400/40 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        3 OFERTAS RECIBIDAS
                      </span>
                    </div>
                    <p class="text-xs font-mono text-stone-400 mt-0.5">
                      Vehículo: <strong class="text-stone-200">VW Passat 2.0 TDI (2006)</strong> · Patente: <span class="text-stone-200">FXW 892</span> · VIN: <span class="text-emerald-400">WVWZZZ3CZ6P...</span>
                    </p>
                  </div>
                </div>

                <!-- Botón Herramienta Split Screen (Zoom Lado a Lado) -->
                <button (click)="estado.splitOpen.set(true)" class="px-4 py-2.5 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition shadow-lg shrink-0 cursor-pointer">
                  <svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/></svg>
                  <span>Comparar Foto Rota vs. Catálogo (Split Screen)</span>
                </button>
              </div>

              <!-- GRILLA DE COTIZACIONES RECIBIDAS (UN COMERCIO PUEDE ENVIAR 2+ OPCIONES DEL MISMO PRODUCTO) -->
              <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-stone-400 px-1 gap-2">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span class="text-white font-bold">Respuestas de comercios en Trelew:</span>
                    <span class="text-[11px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      Un comercio puede enviar 2 opciones (OEM / Alternativa)
                    </span>
                  </div>
                  <span class="text-stone-400 text-[11px]">Elegí una opción para avanzar al pago y cadete en moto</span>
                </div>

                <!-- CONTENEDOR AGRUPADO POR COMERCIO -->
                <div class="space-y-4">

                  <!-- COMERCIO 1: REPUESTOS CENTRO TRELEW (ENVÍA 3 OPCIONES DEL MISMO PRODUCTO PEDIDO) -->
                  <div class="p-5 rounded-3xl bg-black/50 border-2 border-cyan-400/60 shadow-[0_10px_30px_rgba(6,182,212,0.15)] relative">

                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 font-mono font-black text-sm flex items-center justify-center border border-amber-400/30">M1</div>
                        <div>
                          <div class="flex items-center gap-2">
                            <h4 class="text-sm font-bold text-white">Repuestos Centro Trelew</h4>
                            <span class="px-2.5 py-0.5 rounded-full bg-cyan-400 text-stone-950 text-[10px] font-mono font-black shadow">3 ARTÍCULOS COTIZADOS</span>
                          </div>
                          <p class="text-[11px] font-mono text-stone-400 mt-0.5">San Martín 450, Centro · A 6 min de tu taller · ★ 4.9</p>
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          ✓ Stock Físico en Estante Confirmado (3 Variantes)
                        </span>
                      </div>
                    </div>

                    <!-- ACORDEÓN DE OPCIONES DEL VENDEDOR: MINI-COMPARATIVA INTERNA (SE DESPLIEGA SUAVEMENTE) -->
                    <button type="button" (click)="estado.abrirOpcionesM1()" class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] transition cursor-pointer">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <span class="px-2 py-0.5 rounded bg-cyan-400 text-stone-950 text-[9px] font-mono font-black shrink-0">3 OPCIONES</span>
                        <span class="text-xs font-mono font-bold text-white truncate">Mini-comparativa interna del mismo local</span>
                        @if (estado.elegidaM1()) {
                          <span class="px-1.5 py-0.2 rounded bg-emerald-400 text-stone-950 text-[9px] font-black shrink-0">✓ {{ estado.elegidaM1Label() }}</span>
                        }
                      </div>
                      <div class="flex items-center gap-2.5 shrink-0">
                        <span class="text-[10px] font-mono text-stone-400 hidden sm:inline">Desde $21.500</span>
                        <svg class="w-4 h-4 text-stone-400 transition-transform duration-300" [class]="estado.opcionesM1Abiertas() ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </button>

                    <!-- CONTENIDO DEL ACORDEÓN -->
                    <div class="overflow-hidden transition-all duration-500 ease-out" [style]="estado.opcionesM1Abiertas() ? 'max-height:900px;opacity:1;margin-top:0.75rem' : 'max-height:0px;opacity:0;margin-top:0rem'">

                      <div class="rounded-2xl border border-white/10 bg-black/40 divide-y divide-white/10 overflow-hidden">

                        <!-- Opción 1: Económica / Alternativa (Fras-le) -->
                        <div (click)="estado.elegirOpcion('Fras-le Cerif Estándar', '21.500')" class="flex items-center gap-3 p-3 cursor-pointer transition hover:bg-white/[0.04]" [class]="estado.esElegida('Fras-le Cerif Estándar') ? 'bg-emerald-500/10' : ''">
                          <div class="w-16 h-14 rounded-xl bg-black/80 border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src="/img/rep-pastillas.svg" alt="Stock real Fras-le" class="w-full h-full object-contain filter contrast-125">
                          </div>
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2">
                              <span class="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-mono font-black border border-amber-400/30">ECONÓMICA · ALTERNATIVA</span>
                              <span class="text-[9px] font-mono text-emerald-400 whitespace-nowrap">✓ Stock inmediato</span>
                            </div>
                            <h6 class="text-xs font-bold text-white mt-0.5">Fras-le Cerif Estándar</h6>
                            <p class="text-[10px] font-mono text-stone-400 truncate">Línea semimetálica reforzada · Mismo anclaje y ranura exacta · Foto de estante real</p>
                          </div>
                          <div class="text-right shrink-0">
                            <span class="text-lg font-mono font-black" [class]="estado.esElegida('Fras-le Cerif Estándar') ? 'text-emerald-300' : 'text-amber-300'">$21.500</span>
                            <span class="block text-[9px] font-mono text-stone-500">Ahorrás $7.400</span>
                          </div>
                          <!-- Tilde de selección -->
                          <span class="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 transition" [class]="estado.esElegida('Fras-le Cerif Estándar') ? 'bg-emerald-400 border-emerald-400 text-stone-950' : 'border-white/25 text-transparent'">✓</span>
                        </div>

                        <!-- Opción 2: Calidad Intermedia / Nacional (Ferodo) -->
                        <div (click)="estado.elegirOpcion('Ferodo Italy Eco-Friction', '24.800')" class="flex items-center gap-3 p-3 cursor-pointer transition hover:bg-white/[0.04]" [class]="estado.esElegida('Ferodo Italy Eco-Friction') ? 'bg-emerald-500/10' : ''">
                          <div class="w-16 h-14 rounded-xl bg-black/80 border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src="/img/rep-pastillas.svg" alt="Stock real Ferodo" class="w-full h-full object-contain filter contrast-125">
                          </div>
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2">
                              <span class="px-1.5 py-0.2 rounded bg-white/10 text-stone-200 text-[9px] font-mono font-bold">INTERMEDIA · NACIONAL</span>
                              <span class="text-[9px] font-mono text-emerald-400 whitespace-nowrap">✓ Stock inmediato</span>
                              <span class="text-[9px] font-mono text-amber-300 whitespace-nowrap">⏱ {{ estado.tiempoRestante(estado.venceFerodo) }}</span>
                            </div>
                            <h6 class="text-xs font-bold text-white mt-0.5">Ferodo Italy Eco-Friction</h6>
                            <p class="text-[10px] font-mono text-stone-400 truncate">Frenado progresivo y parejo · Certificación ECE R90 europea · Foto de estante real</p>
                          </div>
                          <div class="text-right shrink-0">
                            <span class="text-lg font-mono font-bold" [class]="estado.esElegida('Ferodo Italy Eco-Friction') ? 'text-emerald-300' : 'text-white'">$24.800</span>
                            <span class="block text-[9px] font-mono text-stone-500">Ahorrás $4.100</span>
                          </div>
                          <!-- Tilde de selección -->
                          <span class="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 transition" [class]="estado.esElegida('Ferodo Italy Eco-Friction') ? 'bg-emerald-400 border-emerald-400 text-stone-950' : 'border-white/25 text-transparent'">✓</span>
                        </div>

                        <!-- Opción 3: Primera Marca / Original OEM (Bosch) -->
                        <div (click)="estado.elegirOpcion('Bosch OEM Germany', '28.900')" class="flex items-center gap-3 p-3 cursor-pointer transition hover:bg-white/[0.04]" [class]="estado.esElegida('Bosch OEM Germany') ? 'bg-emerald-500/10' : ''">
                          <div class="w-16 h-14 rounded-xl bg-black/80 border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src="/img/rep-pastillas.svg" alt="Stock real Bosch" class="w-full h-full object-contain filter contrast-125">
                          </div>
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2">
                              <span class="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[9px] font-mono font-black border border-cyan-400/30">1ª MARCA · ORIGINAL (OEM)</span>
                              <span class="text-[9px] font-mono text-emerald-400 whitespace-nowrap">✓ Stock inmediato</span>
                              <span class="text-[9px] font-mono text-cyan-300 whitespace-nowrap flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>NUEVA</span>
                            </div>
                            <h6 class="text-xs font-bold text-white mt-0.5">Bosch OEM Germany</h6>
                            <p class="text-[10px] font-mono text-stone-400 truncate">Compuesto cerámico · Silencioso · Calce oficial VW Pinza Lucas/TRW · Foto de estante real</p>
                          </div>
                          <div class="text-right shrink-0">
                            <span class="text-lg font-mono font-black" [class]="estado.esElegida('Bosch OEM Germany') ? 'text-emerald-300' : 'text-cyan-300'">$28.900</span>
                            <span class="block text-[9px] font-mono text-stone-500">Original fábrica</span>
                          </div>
                          <!-- Tilde de selección -->
                          <span class="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 transition" [class]="estado.esElegida('Bosch OEM Germany') ? 'bg-emerald-400 border-emerald-400 text-stone-950' : 'border-white/25 text-transparent'">✓</span>
                        </div>

                      </div>

                      <!-- BARRA DE CONFIRMACIÓN: habilitada recién al tildar una marca -->
                      <div class="mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span class="text-[10px] font-mono" [class]="estado.elegidaM1() ? 'text-emerald-400' : 'text-stone-400'">
                          @if (estado.elegidaM1()) { ✓ {{ estado.elegidaM1() }} tildada — lista para la pasarela } @else { Elegí una marca con el tilde para habilitar el pago por transferencia (Lemon) }
                        </span>
                        <button (click)="estado.confirmarCompraM1()" [disabled]="!estado.elegidaM1()" class="px-5 py-2.5 rounded-xl font-mono font-black text-[11px] shadow-lg transition active:scale-95 flex items-center gap-1.5" [class]="estado.elegidaM1() ? 'bg-cyan-400 hover:bg-cyan-300 text-stone-950 cursor-pointer' : 'bg-white/5 text-stone-500 border border-white/10 cursor-not-allowed'">
                          <span>{{ estado.elegidaM1() ? 'Confirmar y pasar al pago ($' + estado.precioM1Elegida() + ')' : 'Confirmar marca' }}</span>
                          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                      </div>

                    </div>

                  </div>

                  <!-- SELECTOR DE VISTA COMPACTA CUANDO HAY MÁS DE 4 COMERCIOS -->
                  <div class="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-extrabold text-[10px]">
                        6 COMERCIOS RESPONDIERON
                      </span>
                      <span class="text-stone-300 hidden sm:inline">Modo Alta Densidad (Ahorro de espacio)</span>
                    </div>
                  </div>

                  <!-- LISTA DE COTIZACIONES: TABLA COMPACTA SIEMPRE VISIBLE -->
                  <div id="viewQuotingCompact" class="overflow-hidden rounded-2xl border border-white/10 bg-black/60 font-mono text-xs">
                    <div class="divide-y divide-white/10">
                      @for (c of estado.comerciosOrdenados(); track c.id) {
                        <div (click)="estado.elegirRespuesta(c.nombre, c.precio)" class="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer select-none" [class]="estado.esElegidaFila(c.nombre) ? 'bg-emerald-500/10 ring-1 ring-inset ring-emerald-400/60' : (estado.hayElegida() ? 'opacity-40' : '')">
                          <div class="flex items-center gap-3 min-w-0">
                            <span class="w-7 h-7 rounded-lg font-bold text-[11px] flex items-center justify-center shrink-0" [class]="estado.esElegida(c.nombre) ? 'bg-emerald-400 text-stone-950' : 'bg-white/10 text-stone-300'">{{ c.id }}</span>
                            <div class="min-w-0">
                              <div class="flex items-center gap-2">
                                <span class="font-bold text-white truncate text-xs">{{ c.nombre }}</span>
                                @if (c.opciones) {
                                  <span class="px-1.5 py-0.2 rounded bg-cyan-400 text-stone-950 text-[9px] font-black shrink-0">{{ c.opciones }}</span>
                                }
                                @if (estado.esElegida(c.nombre)) {
                                  @if (c.estado === 'expira') {
                                    <span class="px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 border border-amber-400/40 text-[9px] font-bold shrink-0 whitespace-nowrap">⏱ VENCE EN {{ estado.tiempoRestante(c.vence) }}</span>
                                  } @else if (c.estado === 'nueva') {
                                    <span class="px-1.5 py-0.2 rounded bg-cyan-400/15 text-cyan-300 border border-cyan-400/40 text-[9px] font-bold shrink-0 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>NUEVA</span>
                                  }
                                  <span class="px-1.5 py-0.2 rounded bg-emerald-400 text-stone-950 text-[9px] font-black shrink-0">✓ ELEGIDA</span>
                                } @else if (c.estado === 'expira') {
                                  <span class="px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 border border-amber-400/40 text-[9px] font-bold shrink-0 whitespace-nowrap">⏱ VENCE EN {{ estado.tiempoRestante(c.vence) }}</span>
                                } @else if (c.estado === 'nueva') {
                                  <span class="px-1.5 py-0.2 rounded bg-cyan-400/15 text-cyan-300 border border-cyan-400/40 text-[9px] font-bold shrink-0 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>NUEVA</span>
                                }
                              </div>
                              <span class="text-[11px] text-stone-400 block truncate">{{ c.detalle }}</span>
                            </div>
                          </div>
                          <div class="flex items-center gap-3 shrink-0">
                            <div class="text-right">
                              <span class="text-sm" [class]="estado.esElegida(c.nombre) ? 'font-black text-emerald-300' : 'font-bold text-stone-200'">{{ c.precio }}</span>
                              <span class="block text-[9px] text-stone-500">{{ c.eta }}</span>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

          <!-- ================================================================= -->
          <!-- SECCIÓN 3: MIS PEDIDOS Y FACTURACIÓN                             -->
          <!-- ================================================================= -->
          <div id="section-pedidos" class="dark-console p-6 rounded-[32px] space-y-4" [class.hidden]="estado.tab() !== 'pedidos'">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Historial de Compras</span>
                <h3 class="text-lg font-bold text-white">Mis Pedidos y Facturas</h3>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-400/30">
                ● 1 despacho en curso
              </span>
            </div>

            <!-- Tabla Técnica de Pedidos -->
            <div class="overflow-x-auto">
              <table class="w-full text-left font-mono text-xs">
                <thead>
                  <tr class="text-stone-400 border-b border-white/10 text-[11px]">
                    <th class="py-2.5 px-3">ID &amp; Fecha</th>
                    <th class="py-2.5 px-3">Repuesto &amp; Código OEM</th>
                    <th class="py-2.5 px-3">Vehículo Destino</th>
                    <th class="py-2.5 px-3">Mostrador Vendedor</th>
                    <th class="py-2.5 px-3">Estado</th>
                    <th class="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">

                  <tr class="hover:bg-white/[0.03] transition">
                    <td class="py-3.5 px-3">
                      <span class="font-bold text-white block">#TBX-9842</span>
                      <span class="text-[10px] text-stone-400 font-sans">Hoy 15:42 hs</span>
                    </td>
                    <td class="py-3.5 px-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-black/70 border border-white/10 p-1 flex items-center justify-center shrink-0">
                          <img src="/img/rep-pastillas.svg" alt="Pastillas" class="w-full h-full object-contain filter contrast-110">
                        </div>
                        <div>
                          <span class="font-bold text-white font-sans block text-xs">Pastillas Freno Delanteras Bosch</span>
                          <span class="text-cyan-300 font-mono text-[10px] font-bold">OEM: 3C0698151C</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-3">
                      <span class="font-bold text-stone-200 block">VW Passat (2006)</span>
                      <span class="text-[10px] text-stone-400">Patente: FXW 892</span>
                    </td>
                    <td class="py-3.5 px-3">
                      <span class="text-stone-200 font-sans font-semibold block">Mostrador Trelew #01</span>
                      <span class="text-[10px] text-stone-400">$26.800 pagado</span>
                    </td>
                    <td class="py-3.5 px-3">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Despachado en Moto
                      </span>
                    </td>
                    <td class="py-3.5 px-3 text-right">
                      <button class="inline-block px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-[11px] shadow transition">
                        Ver Seguimiento →
                      </button>
                    </td>
                  </tr>

                  <tr class="hover:bg-white/[0.03] transition">
                    <td class="py-3.5 px-3">
                      <span class="font-bold text-stone-300 block">#TBX-7104</span>
                      <span class="text-[10px] text-stone-500 font-sans">22 Oct 2026</span>
                    </td>
                    <td class="py-3.5 px-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-black/70 border border-white/10 p-1 flex items-center justify-center shrink-0">
                          <img src="/img/rep-filtro.jpg" alt="Filtro" class="w-full h-full object-contain filter contrast-110">
                        </div>
                        <div>
                          <span class="font-bold text-stone-300 font-sans block text-xs">Filtro de Gasoil Mann-Filter</span>
                          <span class="text-stone-400 font-mono text-[10px]">OEM: PU936/1X</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-3">
                      <span class="font-bold text-stone-300 block">Toyota Hilux (2018)</span>
                      <span class="text-[10px] text-stone-500">Patente: AD 340 JK</span>
                    </td>
                    <td class="py-3.5 px-3">
                      <span class="text-stone-300 font-sans block">Repuestos Mitre Trelew</span>
                      <span class="text-[10px] text-stone-500">$18.200 pagado</span>
                    </td>
                    <td class="py-3.5 px-3">
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-stone-300 text-[10px]">
                        ✓ Entregado en Taller
                      </span>
                    </td>
                    <td class="py-3.5 px-3 text-right">
                      <button class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 text-[11px] font-mono transition">
                        Factura PDF
                      </button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          <!-- ================================================================= -->
          <!-- SECCIÓN 4: PREGUNTAS Y SOPORTE TÉCNICO DE COMPATIBILIDAD          -->
          <!-- ================================================================= -->
          <div id="section-preguntas" class="dark-console p-6 rounded-[32px] space-y-4" [class.hidden]="estado.tab() !== 'preguntas'">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Soporte de Compatibilidad</span>
                <h3 class="text-lg font-bold text-white">Consultas Técnicas por Chasis</h3>
              </div>
              <span class="text-xs font-mono text-emerald-400">● 1 respuesta nueva</span>
            </div>

            <div class="p-4 rounded-2xl bg-[#181A1F] border border-emerald-500/30 space-y-2.5 font-mono text-xs">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 text-[10px] font-bold">
                    Respondió el vendedor
                  </span>
                  <span class="text-white font-bold font-sans">Consulta sobre Espesor de Disco Delantero 312mm vs 288mm</span>
                </div>
                <span class="text-[10px] text-stone-400">Hoy 14:10 hs</span>
              </div>

              <div class="p-2 rounded-xl bg-white/[0.04] border border-white/5 text-[11px] text-stone-300 flex items-center justify-between">
                <span>🚗 Vinculado a: <strong>VW Passat 2.0 TDI (Chasis: WVWZZZ3CZ6P...)</strong></span>
                <span class="text-cyan-300 font-bold">Código PR: 1ZA</span>
              </div>

              <div class="space-y-2 pt-1 font-sans text-xs">
                <p class="text-stone-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                  <strong class="text-stone-200">Lucas:</strong> "Hola, ¿estas pastillas sirven para la pinza con sensor de 1 clavija? Es un Passat 2006 motor BKP importado."
                </p>
                <p class="text-emerald-300 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20">
                  <strong class="text-emerald-400">Mostrador Trelew #01:</strong> "Hola Lucas! Sí, verificamos con tu número de chasis en el despiece oficial. Lleva exactamente el código 3C0698151C con sensor incorporado. Tenemos stock físico para mandar moto ya."
                </p>
              </div>
            </div>

          </div>

          @if (estado.tab()==='cuenta') {
            <div id="section-cuenta" class="dark-console p-6 rounded-[32px]">
              <div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Mi Cuenta</span>
                <h3 class="text-lg font-bold text-white">Datos &amp; Facturación — Lucas Rodríguez</h3>
                <p class="text-xs text-stone-400 mt-2 font-mono">lucas@donbosco.com.ar · CUIT 20-12345678-3 · Alternativa 9 esq. Belgrano, Trelew</p>
              </div>
            </div>
          }

        </section>

      </div>
    </main>

    <!-- MODAL / VISTA COMPARATIVA DIVIDIDA (SPLIT SCREEN ZOOM SIMULTÁNEO) -->
    @if (estado.splitOpen()) {
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div class="w-full max-w-5xl dark-console p-6 sm:p-8 rounded-[36px] border border-cyan-400/40 shadow-2xl relative space-y-5">

        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div class="flex items-center gap-2.5">
            <svg class="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>
            <div>
              <h3 class="text-lg font-bold text-white font-mono">Control de Igualdad Óptica (Split Screen)</h3>
              <p class="text-xs text-stone-400">Inspección lado a lado: pieza desmontada de taller vs. catálogo oficial Bosch</p>
            </div>
          </div>
          <button (click)="estado.splitOpen.set(false)" class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Comparador 50/50 Lado a Lado -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- LADO A: TU PIEZA ROTA (SUBIDA POR USUARIO) -->
          <div class="p-4 rounded-3xl bg-[#181A1F] border border-white/10 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono text-cyan-300 font-bold uppercase">1. Tu Pieza Rota (Muestra Taller)</span>
              <span class="px-2 py-0.5 rounded bg-white/10 text-stone-300 text-[10px] font-mono">Toma Frontal</span>
            </div>

            <div class="h-64 rounded-2xl bg-black/80 border border-white/10 p-2 flex items-center justify-center overflow-hidden relative">
              <img src="/img/muestra-pastillas.jpg" alt="Pieza rota de referencia" class="w-full h-full object-cover rounded-xl filter contrast-110">
              <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/90 text-[10px] font-mono text-cyan-300 border border-white/10">
                Sensor de desgaste con cable 15cm
              </div>
            </div>

            <div class="p-2.5 rounded-xl bg-white/[0.03] text-[11px] font-mono text-stone-300 space-y-1">
              <div class="flex justify-between"><span>Pestaña de anclaje:</span><span class="text-white">Tipo Lucas/TRW</span></div>
              <div class="flex justify-between"><span>Espesor base:</span><span class="text-white">20.3 mm</span></div>
            </div>
          </div>

          <!-- LADO B: FOTO OFICIAL DEL VENDEDOR (BOSCH) -->
          <div class="p-4 rounded-3xl bg-[#181A1F] border-2 border-emerald-500/40 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono text-emerald-300 font-bold uppercase">2. Catálogo Mostrador #01 (Bosch)</span>
              <span class="px-2 py-0.5 rounded bg-emerald-400 text-stone-950 text-[10px] font-mono font-extrabold">✓ 99.8% IDÉNTICA</span>
            </div>

            <div class="h-64 rounded-2xl bg-black/80 border border-white/10 p-2 flex items-center justify-center overflow-hidden relative">
              <img src="/img/rep-pastillas.svg" alt="Pastillas Bosch Catálogo" class="w-full h-full object-contain filter contrast-110">
              <div class="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/90 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                OEM: 3C0698151C Verificado
              </div>
            </div>

            <div class="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] font-mono text-stone-300 space-y-1">
              <div class="flex justify-between"><span>Compatibilidad VW:</span><span class="text-emerald-400 font-bold">100% Calce Directo</span></div>
              <div class="flex justify-between"><span>Riesgo de Devolución:</span><span class="text-emerald-400 font-bold">0% (Garantizado)</span></div>
            </div>
          </div>

        </div>

        <!-- Barra de Acción del Split Screen -->
        <div class="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span class="text-xs font-mono text-stone-400">Verificación fotográfica previa a la compra · Cero margen de error</span>
          <button class="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-mono font-bold text-xs shadow-lg transition active:scale-95 inline-flex items-center gap-2">
            <span>Confirmar e Iniciar Pasarela de Pago ($26.800)</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>

      </div>
    </div>
    }

    <!-- MODAL / FORMULARIO FLOTANTE: "AGREGAR VEHÍCULO" -->
    @if (estado.altaOpen()) {
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div class="w-full max-w-lg dark-console p-6 sm:p-8 rounded-[36px] border border-cyan-400/40 shadow-2xl relative">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h3 class="text-lg font-bold text-white font-mono">Alta de Vehículo en Mi Garage</h3>
          </div>
          <button (click)="estado.altaOpen.set(false)" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition cursor-pointer">
            ✕
          </button>
        </div>

        <p class="text-xs text-stone-300 mb-5 leading-relaxed font-sans">
          Ingresá los datos del chasis. El decodificador oficial de Toolbox Patagonia detectará automáticamente la versión de motor, discos y filtros compatibles.
        </p>

        <form (ngSubmit)="estado.guardarVehiculo()" class="space-y-4 font-mono text-xs">
          <div>
            <label class="block text-stone-300 font-bold mb-1.5 uppercase text-[11px]">
              Ingresá Patente o VIN (17 Dígitos) *
            </label>
            <div class="relative">
              <input name="vinPatente" [(ngModel)]="estado.nuevoVin" type="text" placeholder="Ej: WVWZZZ3CZ6P108422 o FXW 892" class="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/20 text-white font-bold tracking-widest focus:outline-none focus:border-cyan-400 transition uppercase" required>
              <button type="button" (click)="estado.decodificar()" class="absolute right-2 top-2 px-3 py-1.5 rounded-xl bg-cyan-400 text-stone-950 font-bold text-[11px] shadow hover:bg-cyan-300 transition">
                Decodificar ⚡
              </button>
            </div>
          </div>

          <div [class.animate-pulse]="estado.decodificando()" class="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 text-[11px]">
            <div class="flex justify-between text-stone-300">
              <span class="text-stone-400">Marca / Modelo:</span>
              <span class="font-bold text-white">{{ estado.vinDecodificado().marca }}</span>
            </div>
            <div class="flex justify-between text-stone-300">
              <span class="text-stone-400">Año de Fabricación:</span>
              <span class="text-white font-bold">{{ estado.vinDecodificado().anio }}</span>
            </div>
            <div class="flex justify-between text-stone-300">
              <span class="text-stone-400">Motorización:</span>
              <span class="text-emerald-400 font-bold">{{ estado.vinDecodificado().motor }}</span>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end gap-3">
            <button type="button" (click)="estado.altaOpen.set(false)" class="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 font-semibold">
              Cancelar
            </button>
            <button type="submit" class="px-6 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold shadow-xl transition active:scale-95">
              Guardar en Mi Garage ✓
            </button>
          </div>
        </form>
      </div>
    </div>
    }

    <!-- FOOTER TÉCNICO -->
    <footer class="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-800 font-mono z-20 border-t border-black/5 mt-4">
      <div class="flex items-center gap-2">
        <span class="font-bold text-[#171412]">Toolbox Patagonia</span>
        <span>·</span>
        <span>Panel de Comprador &amp; Licitaciones Asincrónicas</span>
      </div>
      <div class="flex items-center gap-4 mt-2 sm:mt-0 text-[11px]">
        <span>VIN Lock Activo</span>
        <span>·</span>
        <span>4 Mostradores Conectados</span>
        <span>·</span>
        <span>Trelew • Rawson • Madryn</span>
      </div>
    </footer>

  </div>`,
})
export class CompradorPanelComponent {
  protected readonly estado = inject(CompradorEstadoService);
}
