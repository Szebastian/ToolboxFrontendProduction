import { signal } from '@angular/core';

// Estado global de sesión por rol. Se comparte entre home y paneles y
// se persiste en sessionStorage para sobrevivir la navegación entre rutas.
export type RolSesion = 'comprador' | 'repuestero' | 'repartidor' | 'admin' | null;

const CLAVE = 'toolbox-rol';

const guardado = sessionStorage.getItem(CLAVE) as RolSesion | null;

export const rolSesion = signal<RolSesion>(guardado);

export function setRolSesion(rol: RolSesion): void {
  rolSesion.set(rol);
  if (rol) sessionStorage.setItem(CLAVE, rol);
  else sessionStorage.removeItem(CLAVE);
}
