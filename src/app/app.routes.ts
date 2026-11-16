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
    path: 'buscar',
    loadComponent: () => import('./buscar/buscar.component').then(m => m.BuscarComponent),
    title: 'Toolbox Patagonia · Resultados de búsqueda',
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
    path: 'taller',
    loadComponent: () => import('./taller/panel-taller.component').then(m => m.PanelTallerComponent),
    title: 'Toolbox Patagonia · Panel de Taller',
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.component').then(m => m.RegistroComponent),
    title: 'Toolbox Patagonia · Crear Cuenta',
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
