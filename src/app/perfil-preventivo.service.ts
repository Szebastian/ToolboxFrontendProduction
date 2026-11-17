import { Injectable, computed, inject, signal } from '@angular/core';
import { DemoApiService, usuarioSesion } from '../application/services/demo-api.service';

/**
 * Perfil preventivo del comprador.
 *
 * El anillo porcentual se mide en 4 bloques de 25%:
 *   1. Datos básicos + Cédula Verde ........ 25%  (ya viene del registro)
 *   2. Kilometraje actual (o rango) ......... 25%
 *   3. Último service / cambio de aceite .... 25%
 *   4. Uso habitual del vehículo ............. 25%
 *
 * Cada dato sirve para algo concreto: el kilometraje define el desgaste,
 * el último service la cuenta regresiva del próximo service y el uso (ciudad /
 * mixto / ruta) el desgaste de filtros, embrague y cubiertas en la Patagonia.
 *
 * Persistido en localStorage por comprador hasta que el backend tenga tabla propia.
 */
export type UsoVehiculo = 'Ciudad' | 'Mixto' | 'Ruta';
export type ServicePeriodo = 'menos3' | 'entre3y6' | 'mas6' | 'no-recuerdo';

export interface PerfilPreventivo {
  km: number | null;
  uso: UsoVehiculo | null;
  ultimoServiceKm: number | null;
  ultimoServicePeriodo: ServicePeriodo | null;
}

export interface PerfilDraft {
  km: number | string;
  uso: string;
  service: number | string;
  periodo: string;
}

const VACIO: PerfilPreventivo = { km: null, uso: null, ultimoServiceKm: null, ultimoServicePeriodo: null };

/** Rangos rápidos de kilometraje (valor representativo de cada rango). */
export const RANGOS_KM = [
  { etiqueta: '0 - 50k', km: 25000 },
  { etiqueta: '50 - 100k', km: 75000 },
  { etiqueta: '100 - 150k', km: 125000 },
  { etiqueta: '150k +', km: 200000 },
];

/** Opciones de último service por antigüedad. */
export const PERIODOS_SERVICE: { valor: ServicePeriodo; etiqueta: string }[] = [
  { valor: 'menos3', etiqueta: 'Menos de 3 meses' },
  { valor: 'entre3y6', etiqueta: 'Entre 3 y 6 meses' },
  { valor: 'mas6', etiqueta: 'Más de 6 meses' },
  { valor: 'no-recuerdo', etiqueta: 'No me acuerdo' },
];

/** Opciones de uso habitual. */
export const USOS: { valor: UsoVehiculo; etiqueta: string }[] = [
  { valor: 'Ciudad', etiqueta: 'Ciudad' },
  { valor: 'Mixto', etiqueta: 'Uso mixto' },
  { valor: 'Ruta', etiqueta: 'Ruta frecuente' },
];

@Injectable({ providedIn: 'root' })
export class PerfilPreventivoService {
  private readonly api = inject(DemoApiService);

  /** Bloque 1: la cédula verde ya está cargada (registro) o el garaje tiene vehículo real. */
  baseCedula = signal(false);

  /** Perfil guardado. */
  perfil = signal<PerfilPreventivo>(VACIO);

  /** Modal de cuestionario abierto. */
  abierto = signal(false);

  /** Borrador en vivo (lo que el usuario está completando ahora). */
  draft = signal<PerfilDraft>({ km: '', uso: '', service: '', periodo: '' });

  constructor() {
    // Un usuario registrado en /registro ya completó los datos básicos + cédula.
    if (usuarioSesion()) this.baseCedula.set(true);
    this.cargar();
  }

  // ── Persistencia ───────────────────────────────────────────────────────────

  private clave(): string {
    return 'tb_perfil_preventivo_' + (this.api.idComprador || 'demo');
  }

  private cargar(): void {
    try {
      const crudo = localStorage.getItem(this.clave());
      if (!crudo) return;
      const p = JSON.parse(crudo);
      if (p && typeof p === 'object') {
        this.perfil.set({
          km: p.km ?? null,
          uso: p.uso ?? null,
          ultimoServiceKm: p.ultimoServiceKm ?? null,
          ultimoServicePeriodo: p.ultimoServicePeriodo ?? null,
        });
      }
    } catch { /* almacenamiento no disponible */ }
  }

  private persistir(): void {
    try {
      localStorage.setItem(this.clave(), JSON.stringify(this.perfil()));
    } catch { /* almacenamiento no disponible */ }
  }

  // ── Bloques (25% cada uno) ─────────────────────────────────────────────────

  private numerico(v: unknown): boolean {
    return v !== '' && v !== null && v !== undefined && !isNaN(Number(v)) && Number(v) >= 0;
  }

  /** Estado de los 4 bloques del perfil guardado. */
  bloques = computed(() => {
    const p = this.perfil();
    return {
      cedula: this.baseCedula(),
      km: this.numerico(p.km),
      service: this.numerico(p.ultimoServiceKm) || !!p.ultimoServicePeriodo,
      uso: !!p.uso,
    };
  });

  /** Estado de los 4 bloques con el borrador en vivo (para animar el anillo). */
  bloquesDraft = computed(() => {
    const d = this.draft();
    return {
      cedula: this.baseCedula(),
      km: this.numerico(d.km),
      service: this.numerico(d.service) || !!d.periodo,
      uso: !!d.uso,
    };
  });

  private contar(b: Record<string, boolean>): number {
    return Object.values(b).filter(Boolean).length;
  }

  /** % del perfil guardado (0 / 25 / 50 / 75 / 100). */
  completitud = computed(() => this.contar(this.bloques()) * 25);

  /** % en vivo del borrador. */
  completitudDraft = computed(() => this.contar(this.bloquesDraft()) * 25);

  /** Cuántos datos faltan (de los 4 bloques). */
  faltantes = computed(() => 4 - this.contar(this.bloques()));

  /** Cuántos datos faltan del borrador. */
  faltantesDraft = computed(() => 4 - this.contar(this.bloquesDraft()));

  /** Los 3 datos que el usuario completa (la cédula ya está). */
  listo = computed(() => this.faltantes() === 0);

  /** Copy para la invitación: qué falta exactamente. */
  etiquetaFaltante = computed(() => {
    const b = this.bloques();
    const faltan: string[] = [];
    if (!b.km) faltan.push('kilometraje');
    if (!b.service) faltan.push('último service');
    if (!b.uso) faltan.push('uso del auto');
    return faltan;
  });

  // ── Acciones ───────────────────────────────────────────────────────────────

  /** Marca que la cédula verde ya está cargada (garaje con vehículo real). */
  setBaseCedula(v: boolean): void {
    if (this.baseCedula() !== v) this.baseCedula.set(v);
  }

  abrir(): void {
    const p = this.perfil();
    this.draft.set({
      km: p.km != null ? String(p.km) : '',
      uso: p.uso ?? '',
      service: p.ultimoServiceKm != null ? String(p.ultimoServiceKm) : '',
      periodo: p.ultimoServicePeriodo ?? '',
    });
    this.abierto.set(true);
  }

  cerrar(): void { this.abierto.set(false); }

  setKm(v: number | string): void { this.draft.update(d => ({ ...d, km: v })); }
  setUso(v: string): void { this.draft.update(d => ({ ...d, uso: v })); }
  setService(v: number | string): void { this.draft.update(d => ({ ...d, service: v })); }
  setPeriodo(v: string): void { this.draft.update(d => ({ ...d, periodo: v })); }

  /** ¿El borrador está completo (los 3 datos del usuario)? */
  draftValido = computed(() => this.contar(this.bloquesDraft()) === 4);

  /** Guarda el perfil (persiste en localStorage). */
  guardar(): void {
    if (!this.draftValido()) return;
    const d = this.draft();
    this.perfil.set({
      km: d.km === '' ? null : Number(d.km),
      uso: (d.uso || null) as UsoVehiculo | null,
      ultimoServiceKm: d.service === '' ? null : Number(d.service),
      ultimoServicePeriodo: (d.periodo || null) as ServicePeriodo | null,
    });
    this.persistir();
    this.abierto.set(false);
  }
}
