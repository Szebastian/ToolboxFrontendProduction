import { Component, inject, signal } from '@angular/core';
import { ImagenVehiculoAngularService } from '../../services/imagen-vehiculo.angular.service.js';
import { VehiculoGarajeService } from '../../services/vehiculo-garaje.angular.service.js';

@Component({
  selector: 'app-vehiculo-imagen',
  standalone: true,
  template: `
  @if (esDemo()) {
    <div style="border-radius:14px;overflow:hidden;background:linear-gradient(135deg,#dbeafe,#e0e7ff);padding:28px 12px;text-align:center">
      <svg width="180" height="72" viewBox="0 0 180 72" fill="none" aria-hidden="true"><path d="M12 48 L38 26 L72 20 L108 22 L142 30 L168 48 Z" stroke="#1e40af" stroke-width="3" fill="white"/><circle cx="48" cy="50" r="10" stroke="#1e40af" stroke-width="3" fill="white"/><circle cx="132" cy="50" r="10" stroke="#1e40af" stroke-width="3" fill="white"/><path d="M58 50 H122" stroke="#1e40af" stroke-width="3"/></svg>
      <p style="margin:8px 0 0;font-weight:700;color:#1e40af">VOLKSWAGEN PASSAT 2006</p>
      <p style="margin:0;font-size:13px;color:#475569">Demo visual — registrá tu auto para foto real</p>
    </div>
  } @else if (imagenUrl()) {
    <img [src]="imagenUrl()" [alt]="alt()" width="800" style="max-width:100%;border-radius:12px" (error)="onError()" />
    @if (error()) {
      <p style="color:#b91c1c">No se pudo cargar la imagen. Revisá key/dominio.</p>
    }
    <details style="font-size:12px">
      <summary>Debug imagen</summary>
      <code>{{ maskedUrl() }}</code>
    </details>
  } @else {
    <p>Registrá tu auto para ver su imagen.</p>
  }
  `,
})
export class VehiculoImagenComponent {
  private readonly imgSvc = inject(ImagenVehiculoAngularService);
  private readonly garaje = inject(VehiculoGarajeService);
  imagenUrl = this.imgSvc.imagenUrl;
  esDemo = this.imgSvc.esDemo;
  error = signal(false);
  maskedUrl = () => this.imagenUrl().replace(/(key=)[^&]+/, '$1•••');
  onError(): void { this.error.set(true); }
  alt = () => {
    const v = this.garaje.vehiculo();
    return v ? `${v.marca} ${v.modelo} ${v.anio}` : 'Vehículo';
  };
}
