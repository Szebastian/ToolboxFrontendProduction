import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Shell mínimo: solo el outlet de rutas.
// La pantalla de inicio vive en ./home/home.component.ts (ruta '/')
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
