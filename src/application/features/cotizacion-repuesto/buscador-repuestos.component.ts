import { Component, signal, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VehiculoGarajeService } from '../../services/vehiculo-garaje.angular.service.js';
import { CatalogoRepuestosService } from '../../services/catalogo-repuestos.angular.service.js';
import { SearchQueryService } from '../../services/search-query.service.js';

@Component({
  selector: 'app-buscador-repuestos',
  standalone: true,
  imports: [FormsModule],
  template: `
  <div class="glass-apple rounded-2xl p-6 sm:p-9 text-left relative overflow-hidden transition-all duration-300 shadow-2xl">
    <form onsubmit="return false;" class="space-y-7">
      <div class="space-y-2">
        <div class="relative flex items-center">
          <span class="absolute left-5 text-outline pointer-events-none material-symbols-outlined text-2xl">search</span>
          <input [(ngModel)]="descripcionInformal" name="q" type="text" autocomplete="off" placeholder="Escribí aquí: pastillas de freno, embrague, amortiguadores..." class="w-full pl-14 pr-12 py-4 sm:py-5 rounded-xl text-white placeholder:text-outline text-lg sm:text-xl font-normal tracking-tight focus:outline-none transition-all shadow-inner" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)" />
          <button (click)="descripcionInformal=''" type="button" class="absolute right-4 text-outline hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors" title="Limpiar texto"><span class="material-symbols-outlined text-xl">close</span></button>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between text-xs px-1 font-medium">
          <span class="flex items-center gap-1.5 text-white"><span class="material-symbols-outlined text-sm" style="color:#30D158">visibility</span> Identificación visual por autoparte:</span>
          <span style="color:#6E6E73">Seleccioná la imagen para autocompletar</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button type="button" (click)="elegir('Pastillas de freno delanteras')" [class.active-part]="tagActivo==='Pastillas de freno delanteras'" class="glass-card-interactive p-3 rounded-xl flex flex-col items-center text-center cursor-pointer group">
            <div class="w-full aspect-square rounded-lg overflow-hidden bg-black/60 mb-2.5 relative border border-white/5"><img src="https://acdn-us.mitiendanube.com/stores/006/147/126/products/d_734956-mla31592285847_072019-b-6d78beed6b891adc5517526288187361-1024-1024.webp" alt="Pastillas de freno" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
            <span class="text-xs font-semibold text-white">Pastillas de freno</span><span class="text-[10px] text-outline">Frenado &amp; discos</span>
          </button>
          <button type="button" (click)="elegir('Kit de distribución y correas')" [class.active-part]="tagActivo==='Kit de distribución y correas'" class="glass-card-interactive p-3 rounded-xl flex flex-col items-center text-center cursor-pointer group">
            <div class="w-full aspect-square rounded-lg overflow-hidden bg-black/60 mb-2.5 relative border border-white/5"><img src="https://acdn-us.mitiendanube.com/stores/006/147/126/products/d_776954-mla69336607410_052023-b-af793cf48acfa2b43d17528542359106-1024-1024.webp" alt="Correas" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
            <span class="text-xs font-medium text-white">Correas / Distrib.</span><span class="text-[10px] text-outline">Tensores &amp; poleas</span>
          </button>
          <button type="button" (click)="elegir('Amortiguadores delanteros')" [class.active-part]="tagActivo==='Amortiguadores delanteros'" class="glass-card-interactive p-3 rounded-xl flex flex-col items-center text-center cursor-pointer group">
            <div class="w-full aspect-square rounded-lg overflow-hidden bg-black/60 mb-2.5 relative border border-white/5"><img src="https://acdn-us.mitiendanube.com/stores/006/147/126/products/d_q_np_646479-mla93189724255_092025-f-93f93620e25952df5c17767024350289-1024-1024.webp" alt="Amortiguadores" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
            <span class="text-xs font-medium text-white">Amortiguadores</span><span class="text-[10px] text-outline">Suspensión</span>
          </button>
          <button type="button" (click)="elegir('Bomba de agua')" [class.active-part]="tagActivo==='Bomba de agua'" class="glass-card-interactive p-3 rounded-xl flex flex-col items-center text-center cursor-pointer group">
            <div class="w-full aspect-square rounded-lg overflow-hidden bg-black/60 mb-2.5 relative border border-white/5"><img src="https://acdn-us.mitiendanube.com/stores/006/147/126/products/d_946317-mla50741740104_072022-b-7f5c9bc5b2ab9abe3f17527454274914-1024-1024.webp" alt="Bomba de agua" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
            <span class="text-xs font-medium text-white">Bomba de agua</span><span class="text-[10px] text-outline">Refrigeración</span>
          </button>
          <button type="button" (click)="elegir('Juego de bujías e ignición')" [class.active-part]="tagActivo==='Juego de bujías e ignición'" class="glass-card-interactive p-3 rounded-xl flex flex-col items-center text-center cursor-pointer group">
            <div class="w-full aspect-square rounded-lg overflow-hidden bg-black/60 mb-2.5 relative border border-white/5"><img src="https://acdn-us.mitiendanube.com/stores/006/147/126/products/d_622041-mla70282861987_072023-b-942adbeeccabb27c1217527388380607-1024-1024.webp" alt="Bujías" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
            <span class="text-xs font-medium text-white">Bujías</span><span class="text-[10px] text-outline">Ignición / Chispa</span>
          </button>
          <button type="button" (click)="elegir('Filtro de aceite y habitáculo')" [class.active-part]="tagActivo==='Filtro de aceite y habitáculo'" class="glass-card-interactive p-3 rounded-xl flex flex-col items-center text-center cursor-pointer group">
            <div class="w-full aspect-square rounded-lg overflow-hidden bg-black/60 mb-2.5 relative border border-white/5"><img src="https://acdn-us.mitiendanube.com/stores/006/147/126/products/d_816127-mla75109655147_032024-b-7ce953d40c0ac6589f17528443068948-1024-1024.webp" alt="Filtros" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
            <span class="text-xs font-medium text-white">Filtros</span><span class="text-[10px] text-outline">Aceite y aire</span>
          </button>
        </div>
      </div>

      <div class="pt-1">
        <span class="block text-xs font-medium text-outline uppercase tracking-wider mb-2 px-1">Modalidad logística en Trelew</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-black/60 rounded-xl border border-white/10">
          <label class="flex items-center gap-3 p-3.5 rounded-lg cursor-pointer select-none" [style.border]="modalidad==='URGENTE_HOY' ? '1px solid rgba(255,255,255,.25)' : '1px solid transparent'" [style.background]="modalidad==='URGENTE_HOY' ? 'rgba(255,255,255,.1)' : 'transparent'">
            <input type="radio" name="deliverySpeed" value="URGENTE_HOY" [(ngModel)]="modalidad" class="sr-only">
            <div class="w-9 h-9 rounded-full flex items-center justify-center" style="background:rgba(48,209,88,.2);color:#30D158"><span class="material-symbols-outlined text-lg">bolt</span></div>
            <div class="flex-1"><div class="flex items-center justify-between"><span class="font-semibold text-sm text-white">Urgente hoy</span><span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="color:#30D158;background:rgba(48,209,88,.15)">1 a 3 horas</span></div><p class="text-xs text-outline mt-0.5">Cadetería express en moto en Trelew</p></div>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-lg cursor-pointer select-none" [style.border]="modalidad==='ECONOMICO_24HS' ? '1px solid rgba(255,255,255,.25)' : '1px solid transparent'" [style.background]="modalidad==='ECONOMICO_24HS' ? 'rgba(255,255,255,.1)' : 'transparent'">
            <input type="radio" name="deliverySpeed" value="ECONOMICO_24HS" [(ngModel)]="modalidad" class="sr-only">
            <div class="w-9 h-9 rounded-full flex items-center justify-center" style="background:rgba(255,255,255,.05);color:#6E6E73"><span class="material-symbols-outlined text-lg">schedule</span></div>
            <div class="flex-1"><div class="flex items-center justify-between"><span class="font-medium text-sm text-white">Económico 24hs</span><span class="text-[10px] text-outline">Mañana</span></div><p class="text-xs text-outline mt-0.5">Consolidado con flete local</p></div>
          </label>
        </div>
      </div>

      <div class="pt-1">
        <button (click)="cotizar()" [disabled]="!puedeCotizar()" type="button" class="w-full py-4 px-6 rounded-xl bg-white hover:bg-[#E5E5EA] text-black font-semibold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-xl cursor-pointer disabled:opacity-40">
          <span>Cotizar ahora</span><span class="material-symbols-outlined text-lg font-bold">arrow_forward</span>
        </button>
        <p class="text-center text-xs text-outline mt-3">Sin registro. La compatibilidad por chasis y la patente se vinculan al confirmar el envío.</p>
      </div>
    </form>

    @if (cargando()) { <p class="text-xs text-outline mt-4">Buscando en repuesteras de Trelew…</p> }
    @if (candidatos().length) {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
        @for (p of candidatos(); track p.id) {
          <article class="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all flex gap-3">
            @if (p.imagen) { <img [src]="p.imagen" [alt]="p.nombre" style="width:72px;height:72px;object-fit:contain;border-radius:10px;background:#fff;padding:6px;flex-shrink:0" /> }
            <div style="min-width:0">
              <strong class="text-sm text-white">{{ p.nombre }}</strong>
              <p class="text-xs text-outline mt-1">{{ p.descripcionTecnica }} • {{ p.marca }} • OEM {{ p.numeroOem }}</p>
              <p class="text-xs text-outline mt-1">{{ p.stockLocal ? '✓ Stock local' : '○ A confirmar' }} • {{ p.precioRango }}</p>
            </div>
          </article>
        }
      </div>
    }
    @if (resultado()) {
      <article class="fade-slide-up mt-6 p-5 rounded-xl bg-white/[0.05] border border-white/20">
        <h3 class="font-bold text-white m-0">{{ resultado()!.titulo }}</h3>
        <p class="text-xs text-outline mt-1">{{ resultado()!.vehiculoConfirmado }}</p>
        <p class="text-xs mt-2">{{ resultado()!.tiempoEstimadoEntrega }} • {{ resultado()!.mensajeAviso }}</p>
      </article>
    }

    <div class="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-5 text-center sm:text-left">
      <div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white shrink-0"><span class="material-symbols-outlined text-lg">local_shipping</span></div><div><p class="text-xs font-semibold text-white">Puerta a puerta</p><p class="text-[11px] text-outline">Moto o flete local inmediato</p></div></div>
      <div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white shrink-0"><span class="material-symbols-outlined text-lg">verified</span></div><div><p class="text-xs font-semibold text-white">Compatible por VIN</p><p class="text-[11px] text-outline">Precisión exacta por chasis</p></div></div>
      <div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white shrink-0"><span class="material-symbols-outlined text-lg">lock</span></div><div><p class="text-xs font-semibold text-white">Sin intermediarios</p><p class="text-[11px] text-outline">Precio final directo de repuestera</p></div></div>
    </div>
  </div>
  `,
})
export class BuscadorRepuestosComponent {
  private readonly garaje = inject(VehiculoGarajeService);
  private readonly q = inject(SearchQueryService);
  descripcionInformal = 'Pastillas de freno delanteras';
  tagActivo = 'Pastillas de freno delanteras';
  constructor() {
    effect(() => { const v = this.q.query(); if (v) { this.descripcionInformal = v; this.tagActivo = this.q.activeTag(); this.catalogo.buscar(v); } });
  }
  modalidad: 'URGENTE_HOY' | 'ECONOMICO_24HS' = 'URGENTE_HOY';
  tieneVehiculo = this.garaje.tieneVehiculo;
  vehiculoConfirmado = this.garaje.vehiculoConfirmado;
  resultado = signal<{ titulo: string; vehiculoConfirmado: string; tiempoEstimadoEntrega: string; envioIncluido: boolean; compatibilidadVinVerificada: boolean; mensajeAviso: string } | null>(null);
  textoWhatsapp = signal('');
  private readonly catalogo = inject(CatalogoRepuestosService);
  candidatos = this.catalogo.resultados;
  cargando = this.catalogo.cargando;
  puedeCotizar = computed(() => !!this.descripcionInformal.trim());
  elegir(t: string): void { this.descripcionInformal = t; this.tagActivo = t; this.q.set(t, t); }
  async cotizar(): Promise<void> {
    const v = this.garaje.vehiculo();
    if (!this.descripcionInformal.trim()) return;
    const tecnico = this.descripcionInformal.trim();
    if (!v) {
      await this.catalogo.buscar(tecnico);
      this.resultado.set({ titulo: tecnico, vehiculoConfirmado: 'Sin vehículo aún — completa tu registro para compatibilidad por VIN.', tiempoEstimadoEntrega: this.modalidad === 'URGENTE_HOY' ? '45 - 60 min' : '24 hs', envioIncluido: true, compatibilidadVinVerificada: false, mensajeAviso: 'Cotización preliminar. Registrá tu auto para confirmar compatibilidad.' });
      this.textoWhatsapp.set(`Hola! Cotización ${tecnico.toUpperCase()} para VOLKSWAGEN PASSAT 2006 (pendiente confirmación VIN). ¿Stock y precio?`);
      this.q.requestFlow();
      return;
    }
    await this.catalogo.buscar(tecnico, { marca: v.marca, modelo: v.modelo, anio: v.anio, motorCodigo: v.motorCodigo });
    this.textoWhatsapp.set(`Hola! Cotización ${this.modalidad === 'URGENTE_HOY' ? 'urgente' : ''} de ${tecnico.toUpperCase()} para ${v.marca} ${v.modelo} ${v.anio}, Motor ${v.motorCodigo}. VIN terminación ${v.vin.slice(-8)}. ¿Stock y precio de mostrador?`);
    this.resultado.set({ titulo: tecnico, vehiculoConfirmado: this.vehiculoConfirmado(), tiempoEstimadoEntrega: this.modalidad === 'URGENTE_HOY' ? '45 - 60 min' : '24 hs', envioIncluido: true, compatibilidadVinVerificada: true, mensajeAviso: 'Verificado con número de chasis.' });
    this.q.requestFlow();
  }
}
