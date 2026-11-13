import { Component, computed, signal, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SearchQueryService } from '../../application/services/search-query.service';
import { CatalogoRepuestosService } from '../../application/services/catalogo-repuestos.angular.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-flujo',
  standalone: true,
  template: `
  <header class="w-full max-w-6xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between z-30">
    <a href="#" class="flex items-center gap-3.5"><div class="w-10 h-10 rounded-2xl bg-[#171412] p-1 border border-white/10 shadow-lg flex items-center justify-center overflow-hidden"><img src="/toolboxLogo.webp" alt="Logo" class="w-full h-full object-contain rounded-xl" /></div><div><div class="flex items-center gap-1.5"><span class="font-extrabold text-base tracking-tight text-[#171412]">Toolbox</span><span class="font-semibold text-xs tracking-wider uppercase text-amber-950/70 font-mono">Patagonia</span></div><p class="text-[10px] font-mono text-stone-800">Trelew · Rawson · Madryn</p></div></a>
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#171412]/85 backdrop-blur border border-white/10 text-xs shadow-md"><span class="w-2 h-2 rounded-full bg-emerald-400"></span><span class="font-mono text-stone-300 text-[11px] font-bold">Passat 2.0 TDI</span><span class="text-stone-400 text-[11px] font-mono hidden sm:inline">2006</span></div>
      <button (click)="volver()" title="Volver al inicio" style="width:36px;height:36px;border-radius:999px;background:linear-gradient(135deg,#D97706,#FBBF24);display:flex;align-items:center;justify-content:center;color:#171412;font-family:monospace;font-weight:900;font-size:12px;border:none;cursor:pointer">LR</button>

    </div>
  </header>
  <div class="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-1 z-30">
    <div class="p-1.5 rounded-2xl flex items-center justify-between gap-1 overflow-x-auto" style="background:rgba(23,20,18,.82);backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.12)">
      <button (click)="ir(1)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono shrink-0" [style.color]="paso()===1 ? '#FCD34D' : '#D6D3D1'" [style.background]="paso()===1 ? 'rgba(255,255,255,.12)' : 'transparent'" [style.border]="paso()===1 ? '1px solid rgba(245,158,11,.45)' : 'none'"><span [style.background]="paso()===1 ? '#FBBF24' : 'rgba(255,255,255,.1)'" [style.color]="paso()===1 ? '#171412' : '#D6D3D1'" style="width:14px;height:14px;border-radius:999px;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:9px">1</span><span>1. Foto</span></button><span style="width:1px;height:14px;background:rgba(255,255,255,.1)"></span>
      <button (click)="ir(2)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono shrink-0" [style.color]="paso()===2 ? '#FCD34D' : '#D6D3D1'" [style.background]="paso()===2 ? 'rgba(255,255,255,.12)' : 'transparent'" [style.border]="paso()===2 ? '1px solid rgba(245,158,11,.45)' : 'none'"><span [style.background]="paso()===2 ? '#FBBF24' : 'rgba(255,255,255,.1)'" [style.color]="paso()===2 ? '#171412' : '#D6D3D1'" style="width:14px;height:14px;border-radius:999px;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:9px">2</span><span>2. Precios</span></button><span style="width:1px;height:14px;background:rgba(255,255,255,.1)"></span>
      <button (click)="ir(3)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono shrink-0" [style.color]="paso()===3 ? '#FCD34D' : '#D6D3D1'" [style.background]="paso()===3 ? 'rgba(255,255,255,.12)' : 'transparent'" [style.border]="paso()===3 ? '1px solid rgba(245,158,11,.45)' : 'none'"><span [style.background]="paso()===3 ? '#FBBF24' : 'rgba(255,255,255,.1)'" [style.color]="paso()===3 ? '#171412' : '#D6D3D1'" style="width:14px;height:14px;border-radius:999px;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:9px">3</span><span>3. Destino</span></button><span style="width:1px;height:14px;background:rgba(255,255,255,.1)"></span>
      <button (click)="ir(4)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono shrink-0" [style.color]="paso()===4 ? '#FCD34D' : '#D6D3D1'" [style.background]="paso()===4 ? 'rgba(255,255,255,.12)' : 'transparent'" [style.border]="paso()===4 ? '1px solid rgba(245,158,11,.45)' : 'none'"><span [style.background]="paso()===4 ? '#FBBF24' : 'rgba(255,255,255,.1)'" [style.color]="paso()===4 ? '#171412' : '#D6D3D1'" style="width:14px;height:14px;border-radius:999px;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:9px">4</span><span>4. Pago</span></button><span style="width:1px;height:14px;background:rgba(255,255,255,.1)"></span>
      <button (click)="ir(5)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono shrink-0" [style.color]="paso()===5 ? '#FCD34D' : '#D6D3D1'" [style.background]="paso()===5 ? 'rgba(255,255,255,.12)' : 'transparent'" [style.border]="paso()===5 ? '1px solid rgba(245,158,11,.45)' : 'none'"><span [style.background]="paso()===5 ? '#FBBF24' : 'rgba(255,255,255,.1)'" [style.color]="paso()===5 ? '#171412' : '#D6D3D1'" style="width:14px;height:14px;border-radius:999px;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:9px">5</span><span>5. Moto</span></button>
    </div>
  </div>
  @if (paso()===1) {
    <main class="max-w-4xl w-full mx-auto px-6 py-8">
      <div class="text-center mb-6"><div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171412]/80 text-amber-300 text-xs font-mono mb-3 border border-amber-500/20">Paso 3 de 7 · Verificación Cero-Error</div><h1 class="text-3xl sm:text-5xl font-extrabold" style="color:#171412">Verificá que sea idéntica a tu repuesto</h1></div>
      <div class="glass-apple rounded-[36px] p-6 sm:p-8 shadow-2xl space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="inspection-card p-5 rounded-3xl bg-black/60 border border-white/10">
            <span class="text-xs font-mono text-stone-300 uppercase tracking-wider font-bold">1. Catálogo OEM VW (3 tomas)</span>
            <div class="w-full h-48 rounded-2xl bg-black/60 border border-white/10 p-3 flex items-center justify-center my-3 relative"><img [src]="piezaImagen()" class="w-full h-full object-contain" /><span class="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-stone-300 border border-white/10">Toma 1</span></div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
              <button (click)="piezaImagen.set('/img/rep-pastillas.svg')" style="height:56px;border-radius:12px;background:#fff;padding:6px;border:2px solid #F59E0B"><img src="/img/rep-pastillas.svg" style="width:100%;height:100%;object-fit:contain" /></button>
              <button (click)="piezaImagen.set('/img/muestra-pastillas.jpg')" style="height:56px;border-radius:12px;background:#fff;padding:6px;opacity:.85"><img src="/img/muestra-pastillas.jpg" style="width:100%;height:100%;object-fit:cover" /></button>
              <button (click)="piezaImagen.set('/img/rep-pastillas.svg')" style="height:56px;border-radius:12px;background:#fff;padding:6px;opacity:.85"><img src="/img/rep-pastillas.svg" style="width:100%;height:100%;object-fit:cover" /></button>
            </div>
            <p class="text-[11px] font-mono text-stone-400 text-center">Pieza oficial en Trelew</p>
          </div>
          <div class="inspection-card p-5 rounded-3xl bg-black/60 border-2 border-emerald-500/50 relative">
            <span class="text-xs font-mono text-emerald-300 uppercase tracking-wider font-bold">2. Tus Fotos de Muestra (3 tomas)</span>
            <div class="w-full h-48 rounded-2xl bg-black/80 border border-emerald-500/40 p-1.5 flex items-center justify-center my-3 relative overflow-hidden">
              @if (fotoCliente()) { <img [src]="fotoCliente()!" class="w-full h-full object-cover rounded-xl" /> } @else { <div style="color:#6E6E73;font-size:12px">Sin foto — subí 2 a 4 de tu pieza</div> }
              <label class="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/85 text-emerald-300 text-[10px] font-mono border border-emerald-500/40 cursor-pointer">Subir 2-4 fotos<input type="file" accept="image/*" multiple class="sr-only" (change)="alSubirFoto($event)" /></label>
            </div>
            @if (fotos().length) { <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">@for (f of fotos(); track $index) { <button (click)="q.fotoCliente.set(f)" style="padding:0;border:none;background:none"><img [src]="f" style="width:100%;height:56px;object-fit:cover;border-radius:10px" /></button> }</div> }
            <div style="space-y:6px;font-size:12px;background:rgba(52,211,153,.08);padding:12px;border-radius:12px;border:1px solid rgba(52,211,153,.2);font-family:monospace">
              <div style="display:flex;justify-content:space-between"><span style="color:#6E6E73">Calce Físico (3 ángulos):</span><span style="color:#30D158;font-weight:800">100% Coincidente</span></div>
              <div style="display:flex;justify-content:space-between"><span style="color:#6E6E73">Ubicación:</span><span style="color:#E7E5E4">Delantero Izq / Der</span></div>
              <div style="display:flex;justify-content:space-between"><span style="color:#6E6E73">Riesgo Devolución:</span><span style="color:#30D158;font-weight:700">0%</span></div>
            </div>
            <p style="font-size:11px;color:#6E6E73">{{ fotos().length }} foto(s) cargada(s)</p>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <span style="font-size:12px;color:#6E6E73">✓ Pieza verificada para VW Passat 2.0 TDI (2006).</span>
          <div style="display:flex;gap:10px">
            <button (click)="volver()" style="padding:12px 20px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#D6D3D1;font-weight:700">← Volver</button>
            <button (click)="ir(2)" style="padding:12px 24px;border-radius:12px;background:#fff;color:#000;font-weight:700">Ver precios en Trelew →</button>
          </div>
        </div>
      </div>
    </main>
  }
  @if (paso()===2) {
    <main style="max-width:1000px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:24px"><div style="display:inline-flex;padding:6px 14px;border-radius:999px;background:rgba(23,20,18,.8);color:#FBBF24;font-family:monospace;font-size:12px;border:1px solid rgba(245,158,11,.2)"><span style="width:8px;height:8px;border-radius:999px;background:#FBBF24;animation:pulse 1s infinite"></span>{{ consultando() ? 'Paso 5 de 7 · Consulta de Stock y Precio en Vivo' : 'Paso 5 de 7 · Precios en Tiempo Real' }}</div><h1 style="color:#171412;font-size:32px;margin:12px 0 6px">{{ consultando() ? 'Consultando stock y precio en tiempo real' : 'Presupuestos recibidos en mano' }}</h1><p style="color:#44403C">{{ consultando() ? 'Los 4 mostradores están revisando estanterías físicas para tu Passat 2.0 TDI.' : 'Mostradores ya cargaron precios ciegos para tu Passat 2006. Elegí la mejor opción.' }}</p></div>
      @if (consultando()) {
        <div class="glass-apple" style="padding:24px;border-radius:24px;max-width:700px;margin:0 auto">
          <div style="display:flex;justify-content:space-between;font-family:monospace;font-size:12px;color:#D6D3D1;margin-bottom:8px"><span>Consultando Mostrador #01 (Zona Centro)...</span><span style="color:#FCD34D">~15s</span></div>
          <div style="width:100%;height:10px;border-radius:999px;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.1);overflow:hidden"><div style="height:100%;background:linear-gradient(90deg,#F59E0B,#FCD34D,#34D399);width:60%;animation:pulse 1.5s infinite"></div></div>
          <div style="margin-top:16px;display:grid;gap:8px">
            <div style="display:flex;justify-content:space-between;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px"><span style="color:#fff;font-size:13px;font-weight:700">Mostrador #01 · Zona Centro</span><span style="color:#FCD34D;font-size:11px;font-family:monospace">Verificando estante…</span></div>
            <div style="display:flex;justify-content:space-between;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px"><span style="color:#fff;font-size:13px;font-weight:700">Mostrador #02 · Zona Norte</span><span style="color:#9CA3AF;font-size:11px;font-family:monospace">En cola de consulta</span></div>
            <div style="display:flex;justify-content:space-between;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px"><span style="color:#fff;font-size:13px;font-weight:700">Mostrador #03 · Zona Centro Sur</span><span style="color:#9CA3AF;font-size:11px;font-family:monospace">En cola de consulta</span></div>
          </div>
          <p style="text-align:center;color:#9CA3AF;font-size:12px;margin-top:12px">No salgas de la pantalla. Los repuesteros están revisando stock físico.</p>
        </div>
      } @else {
      <div class="glass-apple" style="padding:24px;border-radius:24px">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/60 border border-white/10 mb-6">
          <div class="flex items-center gap-3.5"><div class="w-12 h-12 p-1 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center"><img [src]="piezaImagen()" class="w-full h-full object-contain" /></div><div><h3 class="text-sm font-bold text-white leading-tight">Pastillas de Freno Delanteras (OEM Bosch)</h3><p class="text-xs font-mono text-stone-400">Ref: 3C0698151C · Compatible Passat 2.0 TDI (2006)</p></div></div>
          <div class="px-3 py-1 rounded-full text-xs font-mono font-bold border" style="background:rgba(52,211,153,.2);color:#30D158;border-color:rgba(52,211,153,.3)">✓ Foto 99% Idéntica</div>
        </div>
        <div class="space-y-3 mb-6">
          <div class="price-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" style="background:linear-gradient(180deg,rgba(5,46,22,.45),rgba(18,15,13,.85));border:2px solid rgba(52,211,153,.6)">
            <div class="flex items-start sm:items-center gap-3.5"><div class="w-10 h-10 rounded-2xl bg-emerald-400 text-stone-950 font-mono font-extrabold flex items-center justify-center text-sm">M1</div><div><div class="flex items-center gap-2"><h4 class="text-sm font-bold text-white">Mostrador Trelew #01</h4><span class="px-2 py-0.5 bg-emerald-400 text-stone-950 text-[10px] font-mono font-extrabold rounded-full">MÁS CONVENIENTE</span></div><p class="text-xs font-mono text-stone-300 mt-1">Zona Centro · Cadete en moto listo a 6 min</p></div></div>
            <div class="flex items-center justify-between sm:justify-end gap-5"><div class="text-right"><span class="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 tracking-tight">$26.800</span><span class="block text-[11px] font-mono text-stone-400">Precio final con IVA</span></div><button class="px-5 py-2.5 rounded-xl bg-emerald-400 text-stone-950 font-bold text-xs">Elegir ✓</button></div>
          </div>
          <div class="price-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" style="background:rgba(18,15,13,.72);border:1px solid rgba(255,255,255,.08)">
            <div class="flex items-start sm:items-center gap-3.5"><div class="w-10 h-10 rounded-2xl bg-white/10 text-stone-200 font-mono font-bold flex items-center justify-center text-sm">M2</div><div><h4 class="text-sm font-bold text-white">Mostrador Trelew #02</h4><p class="text-xs font-mono text-stone-400 mt-1">Zona Acceso Norte · Envío moto en 12 min</p></div></div>
            <div class="flex items-center justify-between sm:justify-end gap-5"><div class="text-right"><span class="text-xl sm:text-2xl font-mono font-bold text-stone-200 tracking-tight">$26.800</span><span class="block text-[11px] font-mono text-stone-500">Precio final con IVA</span></div><button class="px-4 py-2.5 rounded-xl bg-white/10 text-stone-200 font-bold text-xs">Elegir</button></div>
          </div>
          <div class="price-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" style="background:rgba(18,15,13,.72);border:1px solid rgba(255,255,255,.08)">
            <div class="flex items-start sm:items-center gap-3.5"><div class="w-10 h-10 rounded-2xl bg-white/10 text-stone-200 font-mono font-bold flex items-center justify-center text-sm">M3</div><div><h4 class="text-sm font-bold text-white">Mostrador Trelew #03</h4><p class="text-xs font-mono text-stone-400 mt-1">Zona Centro Sur · Envío moto en 9 min</p></div></div>
            <div class="flex items-center justify-between sm:justify-end gap-5"><div class="text-right"><span class="text-xl sm:text-2xl font-mono font-bold text-stone-200 tracking-tight">$26.800</span><span class="block text-[11px] font-mono text-stone-500">Precio final con IVA</span></div><button class="px-4 py-2.5 rounded-xl bg-white/10 text-stone-200 font-bold text-xs">Elegir</button></div>
          </div>
        </div>
        <div class="pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-xs font-mono text-stone-300"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span><span>Ahorrás hasta <strong>$4.400</strong> con la mejor opción</span></div>
          <div class="flex items-center gap-3 w-full md:w-auto"><button (click)="ir(1)" class="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-stone-300 font-mono text-xs font-semibold">← Volver a Radar</button><button (click)="ir(3)" class="flex-1 md:flex-none px-7 py-3 rounded-2xl bg-amber-400 text-[#171412] font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2">Confirmar Mostrador y Pasar al Paso 6 (Pago) <span>→</span></button></div>
        </div>
      </div>
      }
    </main>
  }
  @if (paso()===3) {
    <main style="max-width:900px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:20px"><div style="display:inline-flex;padding:6px 14px;border-radius:999px;background:rgba(23,20,18,.8);color:#FBBF24;font-family:monospace;font-size:12px;border:1px solid rgba(245,158,11,.2)">Despacho Inmediato · Cadete Asignado</div><h1 style="color:#171412;font-size:32px;margin:12px 0 6px;font-weight:800">¿A dónde despachamos la moto?</h1><p style="color:#44403C">Repuesto: {{ tienda() }} ({{ total() }})</p></div>
      <div class="glass-apple" style="padding:24px;border-radius:20px;background:rgba(23,20,18,.82)">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">
          <button (click)="elegirDestino('taller')" style="text-align:left;background:rgba(18,15,13,.72);border:2px solid rgba(52,211,153,.6);border-radius:16px;padding:16px;cursor:pointer"><strong style="color:#fff;font-size:14px">Taller Mecánico Don Bosco</strong><p style="color:#9CA3AF;font-size:12px;font-family:monospace;margin:4px 0">Pellegrini 1240 · Don Bosco, Trelew</p><p style="color:#30D158;font-family:monospace;font-weight:800">$2.200 envío</p></button>
          <button (click)="elegirDestino('domicilio')" style="text-align:left;background:rgba(18,15,13,.72);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px;cursor:pointer"><strong style="color:#fff;font-size:14px">Mi Domicilio</strong><p style="color:#9CA3AF;font-size:12px;font-family:monospace;margin:4px 0">Belgrano 450 · Centro Trelew</p><p style="color:#9CA3AF;font-family:monospace">$1.800 envío</p></button>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:16px"><span style="color:#D6D3D1;font-size:13px">Destino: <strong style="color:#fff">{{ destinoLabel() }}</strong> · Total: <strong style="color:#FCD34D">{{ total() }}</strong></span><span style="display:flex;gap:10px"><button (click)="ir(2)" style="padding:14px 20px;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#D6D3D1;font-weight:700">← Volver</button><button (click)="ir(4)" style="padding:14px 28px;border-radius:14px;background:#F59E0B;color:#000;font-weight:800">Ir al Paso 6 (Transferir) →</button></span></div>
      </div>
    </main>
  }
  @if (paso()===4) {
    <main style="max-width:900px;margin:0 auto;padding:24px">
      <h1 style="color:#fff;text-align:center">Transferencia y Despacho</h1>
      <div class="glass-apple" style="padding:24px;border-radius:20px;margin-top:16px">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px"><div><p style="color:#9CA3AF;font-size:12px">Pedido</p><p style="color:#fff;font-weight:700;margin:0">Pastillas Passat 2006</p></div><div style="text-align:right"><p style="color:#9CA3AF;font-size:12px">Total</p><p style="color:#fff;font-weight:900;font-size:24px;margin:0">{{ total() }}</p></div></div>
        <div style="display:grid;grid-template-columns:140px 1fr;gap:12px;margin-top:16px;align-items:center"><img src="https://api.qrserver.com/v1/create-qr-code/?data=REPUESTOS.TRELEW.MP&size=140x140" alt="QR" style="width:140px;height:140px;border-radius:16px;background:#fff" /><div><p style="color:#fff;font-family:monospace">Alias: REPUESTOS.TRELEW.MP</p><p style="color:#9CA3AF;font-size:12px">Titular: Repuestos Trelew SAS</p></div></div>
        <button (click)="confirmar()" style="width:100%;margin-top:16px;padding:16px;border-radius:14px;background:#fff;color:#000;font-weight:900">Ya transferí, ver moto en vivo</button>
      </div>
    </main>
  }
  @if (paso()===5) {
    <main style="max-width:1000px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:20px"><h1 style="color:#fff;font-size:32px;margin:0">Tu repuesto está en camino.</h1><p style="color:#9CA3AF">Validado {{ total() }} — Fontana entregó al cadete.</p></div>
      <div style="display:grid;grid-template-columns:1fr 360px;gap:16px">
        <div style="position:relative;height:460px;border-radius:20px;overflow:hidden">
          <div id="liveMap" style="height:100%;width:100%"></div>
          <div style="position:absolute;top:12px;left:12px;background:#000;border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:10px 14px;color:#fff"><div style="font-size:10px;color:#9CA3AF">ETA</div><div style="font-weight:900">{{ posiciones[paso5Step()].min === 0 ? '¡En puerta!' : posiciones[paso5Step()].min + ' min' }} · {{ posiciones[paso5Step()].km }}</div></div>
          <button (click)="moverMoto()" style="position:absolute;bottom:12px;right:12px;background:#fff;color:#000;border:none;padding:8px 12px;border-radius:999px;font-weight:700">Actualizar GPS</button>
        </div>
        <div>
          <div class="glass-apple" style="padding:16px;border-radius:16px"><div style="display:flex;gap:12px;align-items:center"><span style="width:56px;height:56px;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:28px">🏍️</span><div><strong style="color:#fff">Marcos V.</strong><p style="color:#9CA3AF;font-size:12px;margin:0">Honda CG 150 · A142KY · ★4.96</p></div></div></div>
          <div class="glass-apple" style="padding:16px;border-radius:16px;margin-top:12px"><p style="color:#9CA3AF;font-size:11px">CÓDIGO RECEPCIÓN</p><p style="color:#30D158;font-family:monospace;font-weight:900;font-size:22px;margin:4px 0">TRW - 482</p><button (click)="finalizar()" style="width:100%;padding:12px;border-radius:12px;background:#fff;color:#000;font-weight:800">Compartir y finalizar</button></div>
        </div>
      </div>
    </main>
  }
  `,
})
export class FlujoComponent {
  private readonly router = inject(Router);
  paso = signal(1);
  volver(): void { this.router.navigate(['/']); }
  private readonly q = inject(SearchQueryService);
  private readonly catalogo = inject(CatalogoRepuestosService);
  fotoCliente = computed(() => this.q.fotosCliente()[0] ?? this.q.fotoCliente());
  fotos = this.q.fotosCliente;
  alSubirFoto(e: Event): void {
    const files = Array.from((e.target as HTMLInputElement).files ?? []).slice(0, 4);
    files.forEach(f => { const r = new FileReader(); r.onload = () => { this.q.fotoCliente.set(r.result as string); this.q.fotosCliente.update(arr => [...arr, r.result as string].slice(0, 4)); }; r.readAsDataURL(f); });
  }
  piezaNombre = computed(() => this.catalogo.resultados()[0]?.nombre ?? this.q.query() ?? 'Pastillas de freno');
  piezaImagen = signal('/img/rep-pastillas.svg');
  piezaDetalle = computed(() => { const p = this.catalogo.resultados()[0]; return p ? `${p.marca} • OEM ${p.numeroOem}` : 'OEM'; });
  preciosListos = signal(1);
  consultando = signal(true); segundos = signal(7);
  tienda = signal('Repuestera Fontana (Raybestos)');
  total = signal('$29.000');
  destino = signal('taller');
  rutaInfo = signal('2.4 km · ~18 min');
  destinoLabel = signal('Pellegrini 1240 (Taller Don Bosco)');
  elegirDestino(t: string): void {
    this.destino.set(t);
    if (t === 'taller') { this.total.set('$29.000'); this.rutaInfo.set('2.4 km · ~18 min'); this.destinoLabel.set('Pellegrini 1240 (Taller Don Bosco)'); }
    else { this.total.set('$28.600'); this.rutaInfo.set('1.6 km · ~12 min'); this.destinoLabel.set('Belgrano 450 (Domicilio)'); }
  }
  constructor() {
    setTimeout(() => this.preciosListos.set(2), 1500);
    setTimeout(() => this.preciosListos.set(3), 3000);
    setTimeout(() => this.preciosListos.set(4), 5000);
    setTimeout(() => this.consultando.set(false), 6000);
    effect(() => { if (this.paso() === 5) setTimeout(() => this.initLiveMap(), 100); });
    effect(() => { if (this.paso() === 2) { this.consultando.set(true); this.segundos.set(7); setTimeout(() => this.consultando.set(false), 6000); } });
  }
  ir(s: number): void { this.paso.set(s); }
  tieneComprobante = signal(false);
  nombreComprobante = signal('');
  alSubir(e: Event): void { const i = e.target as HTMLInputElement; if (i.files?.[0]) { this.nombreComprobante.set(i.files[0].name); this.tieneComprobante.set(true); } }
  confirmar(): void { this.ir(5); }
  paso5Step = signal(0);
  posiciones = [
    { lat: -43.2485, lng: -65.3110, min: 14, km: '1.8' },
    { lat: -43.2485, lng: -65.3000, min: 10, km: '1.2' },
    { lat: -43.2420, lng: -65.3000, min: 6, km: '0.7' },
    { lat: -43.2370, lng: -65.2920, min: 2, km: '0.2' },
    { lat: -43.2352, lng: -65.2880, min: 0, km: 'Llegó' },
  ];
  private map: L.Map | null = null;
  private motoMarker: L.Marker | null = null;
  private initLiveMap(): void {
    try {
      const el = document.getElementById('liveMap');
      if (!el || this.map) { this.map?.invalidateSize(); return; }
      const origen: L.LatLngExpression = [-43.2485, -65.3110];
      const destino: L.LatLngExpression = [-43.2352, -65.2880];
      const ruta: L.LatLngExpression[] = [[-43.2485, -65.3110],[-43.2485, -65.3040],[-43.2485, -65.3000],[-43.2420, -65.3000],[-43.2370, -65.2920],[-43.2352, -65.2880]];
      this.map = L.map('liveMap', { zoomControl: false }).setView([-43.242, -65.2995], 14);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM', maxZoom: 19 }).addTo(this.map);
      L.polyline(ruta, { color: '#0A84FF', weight: 9, opacity: 0.3 }).addTo(this.map);
      L.polyline(ruta, { color: '#FFFFFF', weight: 3, opacity: 0.8, dashArray: '4 6' }).addTo(this.map);
      L.polyline(ruta, { color: '#30D158', weight: 5, opacity: 1 }).addTo(this.map);
      const pinHome = L.divIcon({ className: '', html: '<div style="background:#111827;color:#fff;border:2px solid #9CA3AF;border-radius:999px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:18px">⌂</div>' });
      const pinDest = L.divIcon({ className: '', html: '<div style="background:#30D158;color:#000;border:2px solid #fff;border-radius:999px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800">◎</div>' });
      L.marker(origen, { icon: pinHome }).addTo(this.map).bindTooltip('Origen: Fontana 340', { permanent: true });
      L.marker(destino, { icon: pinDest }).addTo(this.map).bindTooltip('Destino: Taller Don Bosco, Pellegrini 1240', { permanent: true });
      const icon = L.divIcon({ className: '', html: '<div style="background:#fff;color:#000;border:2px solid #30D158;border-radius:14px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:22px">🏍️</div>' });
      this.motoMarker = L.marker(ruta[0], { icon }).addTo(this.map).bindTooltip('Marcos V. · Honda CG 150', { permanent: true });
      this.map.fitBounds(L.latLngBounds(ruta), { padding: [24, 24] });
      setTimeout(() => this.map?.invalidateSize(), 400);
    } catch {}
  }
  moverMoto(): void { this.paso5Step.update(s => (s + 1) % this.posiciones.length); const p = this.posiciones[this.paso5Step()]; this.motoMarker?.setLatLng([p.lat, p.lng]); this.map?.panTo([p.lat, p.lng]); }
  finalizar(): void { this.paso.set(1); this.router.navigate(['/']); }
}
