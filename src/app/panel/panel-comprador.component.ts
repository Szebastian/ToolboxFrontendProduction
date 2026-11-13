import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CompradorEstadoService } from './comprador/comprador-estado.service';
import { CompradorDestinoComponent } from './comprador/comprador-destino.component';
import { CompradorPasarelaComponent } from './comprador/comprador-pasarela.component';
import { CompradorRutaComponent } from './comprador/comprador-ruta.component';
import { CompradorPanelComponent } from './comprador/comprador-panel.component';
import { COMPRADOR_STYLES } from './comprador/comprador-styles';

// Panel del comprador: shell que compone las etapas.
// El estado compartido vive en CompradorEstadoService (provider local del panel).
@Component({
  selector: 'app-panel-comprador',
  standalone: true,
  imports: [CompradorDestinoComponent, CompradorPasarelaComponent, CompradorRutaComponent, CompradorPanelComponent],
  providers: [CompradorEstadoService],
  styles: [
    `:host{display:block;background:radial-gradient(120% 90% at 50% -10%, #D49B7A 0%, #D9A07E 20%, #CF8E6C 45%, #8B4527 80%, #120B08 100%);color:#F3F4F6;min-height:1024px;font-family:'Plus Jakarta Sans',sans-serif}`,
    ...COMPRADOR_STYLES,
  ],
  template: `

  <button (click)="volver()" style="position:fixed;bottom:14px;left:14px;z-index:40;margin:0;background:rgba(14,15,18,.65);color:#D6D3D1;border:1px solid rgba(255,255,255,.14);padding:7px 14px;border-radius:999px;font-weight:600;font-size:12px;font-family:'JetBrains Mono',monospace;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);cursor:pointer;transition:all .2s ease">← Volver</button>

  <app-comprador-panel />
  <app-comprador-destino />
  <app-comprador-pasarela />
  <app-comprador-ruta />
  `,
})
export class PanelCompradorComponent {
  private readonly router = inject(Router);
  volver(): void { this.router.navigate(['/']); }
}
