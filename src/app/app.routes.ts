import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    title: 'Toolbox Patagonia · Inicio',
  },
  {
    path: 'cotizacion',
    loadComponent: () => import('./flujo/flujo.component').then(m => m.FlujoComponent),
    title: 'Toolbox Patagonia · Cotización',
  },
  {
    path: 'mostrador',
    loadComponent: () => import('./panel/panel-repuestero.component').then(m => m.PanelRepuesteroComponent),
    title: 'Toolbox Patagonia · Panel Repuestero',
  },
  {
    path: 'cliente',
    loadComponent: () => import('./panel/panel-comprador.component').then(m => m.PanelCompradorComponent),
    title: 'Toolbox Patagonia · Panel Cliente',
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/panel-admin.component').then(m => m.PanelAdminComponent),
    title: 'Toolbox Patagonia · Panel Administración',
  },
  {
    path: 'repartidor',
    loadComponent: () => import('./repartidor/panel-repartidor.component').then(m => m.PanelRepartidorComponent),
    title: 'Toolbox Patagonia · Panel Repartidor',
  },
  { path: '**', redirectTo: '' },
];
