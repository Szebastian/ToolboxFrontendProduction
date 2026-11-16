import { Component, computed } from '@angular/core';
import { rolSesion, RolSesion } from './sesion';
import { usuarioSesion } from '../application/services/demo-api.service';

// Píldora textual que dice en qué sesión/rol estás: aparece en el header de
// todos los paneles para que siempre quede claro quién está usando la pantalla.
@Component({
  selector: 'app-rol-badge',
  standalone: true,
  styles: [`
    .rol-pill{display:flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;border:1px solid;background:rgba(14,15,18,.85);font-family:'JetBrains Mono',monospace}
    .punto{width:8px;height:8px;border-radius:999px;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  `],
  template: `
    <div class="rol-pill" [style.border-color]="borde()" [title]="descripcion()">
      <span class="punto" [style.background]="color()"></span>
      <span class="text-[10px] font-bold tracking-widest" [style.color]="color()">SESIÓN: {{ etiqueta() }}</span>
    </div>
  `,
})
export class RolBadgeComponent {

  readonly rol = rolSesion;

  // Si hay un usuario real (creado desde /registro), el rol es comprador aunque
  // no se haya pasado por el selector de roles demo.
  readonly rolEfectivo = computed<RolSesion>(() => {
    const r = this.rol();
    if (r) return r;
    return usuarioSesion() ? 'comprador' : null;
  });

  etiqueta = computed<string>(() => {
    switch (this.rolEfectivo()) {
      case 'comprador':  return 'COMPRADOR';
      case 'repuestero': return 'REPUESTERO (VENDEDOR)';
      case 'repartidor': return 'REPARTIDOR';
      case 'admin':      return 'ADMINISTRADOR';
      case 'mecanico':   return 'MECÁNICO (TALLER)';
      default:           return 'SIN ROL';
    }
  });

  color = computed<string>(() => {
    switch (this.rolEfectivo()) {
      case 'comprador':  return '#67E8F9'; // cian
      case 'repuestero': return '#FBBF24'; // ámbar
      case 'repartidor': return '#38BDF8'; // celeste
      case 'admin':      return '#F472B6'; // rosa
      case 'mecanico':   return '#34D399'; // esmeralda
      default:           return '#A8A29E';
    }
  });

  borde = computed<string>(() => (this.color() ?? '') + '44');

  descripcion = computed<string>(() => {
    switch (this.rolEfectivo()) {
      case 'comprador':  return 'Estás operando como CLIENTE COMPRADOR: pedís repuestos, aceptás cotizaciones y pagás.';
      case 'repuestero': return 'Estás operando como VENDEDOR (repuestero): cotizás pedidos con foto de tu stock.';
      case 'repartidor': return 'Estás operando como REPARTIDOR: entregás pedidos y retiros en moto.';
      case 'admin':      return 'Estás operando como ADMINISTRADOR: gestión y métricas de todo el marketplace.';
      case 'mecanico':   return 'Estás operando como MECÁNICO de taller: armás las fichas técnicas y listas de repuestos de los autos en box.';
      default:           return 'No hay sesión de rol activa — elegí un rol en la pantalla de inicio.';
    }
  });
}
