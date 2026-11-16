import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { setRolSesion } from '../sesion';
import { DemoApiService, CedulaExtraidaBackend, setUsuarioSesion } from '../../application/services/demo-api.service';
import { VehiculoActivoService } from '../../application/services/vehiculo-activo.service';

// ── Registro Typeform de nuevo usuario ──
// Paso 1: Cuenta & Clave · Paso 2: Foto Cédula Verde (chasis VIN) · Paso 3: Cuenta creada & Auto en Garage
// Mock por ahora: la cédula se simula y el alta real queda para el cableado con el backend.

interface CedulaExtraida {
  patente: string;
  marca: string;
  modelo: string;          // PASSAT 2.0 TDI HIGHLINE
  modeloDetalle: string;   // Generación B6 (Año 2006)
  tipoCarroceria: string;  // SEDÁN 4 PUERTAS
  tipoDetalle: string;     // Berlina Tricuerpo
  chasis: string;          // VIN 17 dígitos
  motorCodigo: string;     // BKP-104928
  motorDetalle: string;    // (2.0 TDI Turbodiésel Bomba-Inyector)
  motorSpecs: string;      // 16 Válvulas · 140 CV
  motorNota: string;
  compat: string[];
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
  host: { '(document:keydown.enter)': 'alEnter()' },
})
export class RegistroComponent {

  private readonly router = inject(Router);
  private readonly api = inject(DemoApiService);
  private readonly activoSvc = inject(VehiculoActivoService);

  // ── Flujo Typeform ──
  paso = signal<1 | 2 | 3>(1);

  // ── Paso 1: datos de cuenta ──
  nombre = signal('');
  apellido = signal('');
  email = signal('');
  whatsapp = signal('');
  pass = signal('');
  passConfirm = signal('');
  verPass1 = signal(false);
  verPass2 = signal(false);
  errores = signal<string[]>([]);

  coinciden = computed(() => this.passConfirm().length > 0 && this.pass() === this.passConfirm());
  distinto = computed(() => this.passConfirm().length > 0 && this.pass() !== this.passConfirm());
  nombreCompleto = computed(() => (this.nombre() + ' ' + this.apellido()).trim() || 'Tu Nombre');

  // ── Paso 2: cédula verde — datos por defecto (usados por la cédula de prueba) ──
  cedulaEscaneada = signal(false);
  escaneando = signal(false);           // true mientras el backend procesa la foto
  advertencias = signal<string[]>([]);  // p.ej. VIN con formato sospechoso
  cedula = signal<CedulaExtraida>({
    patente: 'AB 412 TX',
    marca: 'VOLKSWAGEN',
    modelo: 'PASSAT 2.0 TDI HIGHLINE',
    modeloDetalle: 'Generación B6 (Año 2006)',
    tipoCarroceria: 'SEDÁN 4 PUERTAS',
    tipoDetalle: 'Berlina Tricuerpo',
    chasis: 'WVWZZZ3CZ6P108422',
    motorCodigo: 'BKP-104928',
    motorDetalle: '(2.0 TDI Turbodiésel Bomba-Inyector)',
    motorSpecs: '16 Válvulas · 140 CV',
    motorNota: 'Código de fábrica BKP para despiece exacto de bomba de agua y kit de distribución.',
    compat: ['Frenos: Discos 312mm', 'Caja: Manual 6ta', 'Inyección: Siemens PPD'],
  });

  // ── Barra de progreso ──
  progreso = computed(() => {
    switch (this.paso()) {
      case 1:
        return {
          titulo: 'Paso 1 de 3: Creá tu Usuario y Contraseña',
          hint: 'Ingresá tu correo, contraseña segura y tu WhatsApp para recibir las ofertas de repuestos.',
          pct: 33,
          botones: [true, false, false] as boolean[],
          btnSiguiente: 'Continuar: Sacar Foto a Cédula',
          textoVolver: 'Primer Paso',
        };
      case 2:
        return {
          titulo: 'Paso 2 de 3: Foto a la Cédula Verde',
          hint: 'Extraemos el Número de Chasis y motorización para habilitar búsquedas exactas.',
          pct: 66,
          botones: [false, true, false] as boolean[],
          btnSiguiente: 'Confirmar Chasis y Finalizar',
          textoVolver: 'Volver al Paso 1 (Usuario)',
        };
      default:
        return {
          titulo: 'Paso 3 de 3: ¡Cuenta Creada & Auto en Garage!',
          hint: 'Datos validados. Ya podés cotizar repuestos compatibles en Trelew.',
          pct: 100,
          botones: [false, false, true] as boolean[],
          btnSiguiente: 'Ir a Buscar Repuestos',
          textoVolver: 'Volver al Paso 2 (Cédula)',
        };
    }
  });

  volverAlInicio(): void { this.router.navigate(['/']); }

  // ── Navegación ──
  irAPaso(n: 1 | 2 | 3): void {
    this.paso.set(n);
  }

  avanzar(): void {
    if (this.paso() === 1 && !this.validarPaso1()) return;
    if (this.paso() === 2 && !this.cedulaEscaneada()) {
      this.errores.set(['Necesitamos la foto de la Cédula Verde (o la de prueba) para extraer el chasis.']);
      return;
    }
    this.errores.set([]);
    const siguiente = (this.paso() + 1) as 2 | 3;
    this.paso.set(siguiente);
  }

  retroceder(): void {
    if (this.paso() === 1) return;
    this.errores.set([]);
    this.paso.set((this.paso() - 1) as 1 | 2);
  }

  alEnter(): void {
    if (this.paso() === 3) this.irABuscar();
    else this.avanzar();
  }

  // ── Paso 1 ──
  validarPaso1(): boolean {
    const errs: string[] = [];
    if (!this.nombre().trim()) errs.push('Ingresá tu nombre.');
    if (!this.apellido().trim()) errs.push('Ingresá tu apellido.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim())) errs.push('Ingresá un correo electrónico válido.');
    if (this.pass().length < 6) errs.push('Por seguridad la contraseña debe tener al menos 6 caracteres.');
    if (!this.passConfirm()) errs.push('Repetí tu contraseña para confirmarla.');
    else if (this.pass() !== this.passConfirm()) errs.push('Las contraseñas no coinciden.');
    this.errores.set(errs);
    return errs.length === 0;
  }

  // ── Paso 2: escaneo de cédula (visión real vía backend FastAPI + OpenRouter) ──
  onFotoCedula(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    this.escanearCedula(archivo);
    input.value = '';
  }

  /** Manda la foto real al backend (POST /cedulas/extraer) y pinta los datos extraídos. */
  escanearCedula(archivo: File): void {
    this.errores.set([]);
    this.advertencias.set([]);
    this.escaneando.set(true);
    this.api.extraerCedula(archivo).subscribe({
      next: (extraida) => {
        this.cedula.set(this.mapearCedula(extraida));
        this.advertencias.set(extraida.warnings ?? []);
        this.cedulaEscaneada.set(true);
        this.escaneando.set(false);
      },
      error: (err) => {
        this.escaneando.set(false);
        const detalle = err?.error?.detail || err?.message || 'Error de conexión con el backend (¿está corriendo en :10000?).';
        this.errores.set([`No se pudo procesar la cédula: ${detalle}`]);
      },
    });
  }

  /** Normaliza la respuesta del backend a la ficha de la tarjeta DNRPA. */
  private mapearCedula(e: CedulaExtraidaBackend): CedulaExtraida {
    return {
      patente: e.dominio || 'NO DETECTADO',
      marca: e.marca || 'NO DETECTADO',
      modelo: e.modelo || 'NO DETECTADO',
      modeloDetalle: e.modelo_detalle || 'Generación/año no legible en la foto',
      tipoCarroceria: e.tipo_carroceria || 'NO DETECTADO',
      tipoDetalle: 'Según cédula DNRPA',
      chasis: e.chasis || 'NO DETECTADO',
      motorCodigo: e.motor_codigo || 'NO DETECTADO',
      motorDetalle: '',
      motorSpecs: e.motor_specs || '—',
      motorNota: 'Datos leídos por visión artificial desde tu foto. Verificá antes de cotizar.',
      compat: e.compat?.length ? e.compat : ['Sin compatibilidades deducibles — verificá manualmente'],
    };
  }

  /** Cédula de prueba: baja la imagen de ejemplo (public/img/cedula-prueba.png) y la procesa por el circuito real. */
  async cargarCedulaPrueba(): Promise<void> {
    this.errores.set([]);
    this.advertencias.set([]);
    this.escaneando.set(true);
    try {
      const resp = await fetch('img/cedula-prueba.png');
      const blob = await resp.blob();
      this.escanearCedula(new File([blob], 'cedula-prueba.png', { type: blob.type || 'image/png' }));
    } catch {
      this.escaneando.set(false);
      this.errores.set(['No se pudo cargar la imagen de la cédula de prueba.']);
    }
  }

  resetearCedula(): void {
    this.cedulaEscaneada.set(false);
    this.escaneando.set(false);
    this.advertencias.set([]);
  }

  // ── Paso 3 ──
  creando = signal(false);

  /** Solo manda el vehículo si la cédula leyó los 3 datos mínimos (nada de "NO DETECTADO"). */
  private vehiculoDeCedula(): Record<string, string | null> | undefined {
    const c = this.cedula();
    const ok = [c.patente, c.marca, c.modelo].every(v => v && v !== 'NO DETECTADO');
    if (!ok) return undefined;
    return {
      dominio: c.patente,
      marca: c.marca,
      modelo: c.modelo,
      modelo_detalle: c.modeloDetalle,
      tipo_carroceria: c.tipoCarroceria,
      chasis: c.chasis === 'NO DETECTADO' ? null : c.chasis,
      motor_codigo: c.motorCodigo === 'NO DETECTADO' ? null : c.motorCodigo,
    };
  }

  /** Crea la cuenta real (backend → Supabase), guarda la sesión del usuario y navega. */
  crearCuentaYEntrar(destino: string): void {
    if (this.creando()) return;
    this.creando.set(true);
    this.errores.set([]);
    this.api.crearCuenta({
      email: this.email().trim(),
      password: this.pass(),
      nombre: this.nombre().trim(),
      apellido: this.apellido().trim(),
      whatsapp: this.whatsapp().trim() || undefined,
      vehiculo: this.vehiculoDeCedula(),
    }).subscribe({
      next: (usuario) => {
        setUsuarioSesion({ id: usuario.id, email: usuario.email, nombre: usuario.nombre });
        setRolSesion('comprador');
        // El auto activo pasa a ser el vehículo real del usuario nuevo
        this.activoSvc.sincronizarConGaraje(usuario.id);
        this.creando.set(false);
        this.router.navigate([destino]);
      },
      error: (err) => {
        this.creando.set(false);
        const detalle = err?.error?.detail || 'No se pudo crear la cuenta (¿el backend está corriendo en :10000?).';
        this.errores.set([typeof detalle === 'string' ? detalle : 'No se pudo crear la cuenta. Revisá los datos e intentá de nuevo.']);
      },
    });
  }

  irABuscar(): void {
    this.crearCuentaYEntrar('/');
  }

  irAPanel(): void {
    this.crearCuentaYEntrar('/cliente');
  }
}
