import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Usuarios demo REALES: cada acceso rápido del home actúa como un usuario
// registrado en Supabase Auth (sus perfiles viven en public.profiles y sus
// IDs son los que espera el backend FastAPI en ownerId/customerId/vendorId).
// Las contraseñas de estos usuarios son aleatorias y no se usan: el flujo
// demo opera contra el backend con service_role.
const IDS_DEMO = {
  comprador: '3376af7d-d61d-4c09-96c8-b005b8c1c6b8',  // demo.customer@toolbox.dev
  repuestero: '7d05e82c-82e3-4162-bc18-5147d8a21e36', // demo.vendor@toolbox.dev
  repartidor: '59095a14-10a2-4954-acbd-4e934944f0b3', // demo.courier@toolbox.dev
  mecanico: 'eaeb8dac-3c5b-49d4-8d82-5a0c290d8354',   // demo.mechanic@toolbox.dev
} as const;

// ── Modelos (espejo de los DTOs del backend FastAPI) ─────────────────────────

export interface VehiculoBackend {
  id: string;
  owner_id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  vin: string | null;
  engine_details: string | null;
}

export interface ItemSolicitudBackend {
  id: string;
  part_name: string;
  part_number: string | null;
  description: string | null;
  quantity: number;
  sample_photo_url: string | null;
  is_technical_specified: boolean;
}

export interface SolicitudBackend {
  id: string;
  customer_id: string;
  vehicle_id: string;
  status: string;
  is_delegated: boolean;
  urgency_level: string;
  items: ItemSolicitudBackend[];
  created_at: string;
}

export interface CotizacionBackend {
  id: string;
  parts_request_id: string;
  vendor_id: string;
  total_amount: number;
  currency: string;
  status: string;
  notes: string | null;
  item_photo_url: string | null;
  expires_at: string;
  created_at: string;
}

export interface PedidoBackend {
  id: string;
  vendor_quote_id: string;
  parts_request_id: string;
  buyer_id: string;
  total_amount: number;
  status: string;
  paid_at: string | null;
  created_at: string | null;
}

// ── Taxonomía / catálogo inteligente / búsqueda híbrida ─────────────────────

export interface SubCategoriaTaxonomia {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  applies_to_engines: string[];
  position_required: boolean;
  position_options: string[];
  sort_order: number;
}

export interface CategoriaTaxonomia {
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
  subcategories: SubCategoriaTaxonomia[];
}

export interface VehiculoDecodificado {
  vin: string;
  brand: string;
  model: string | null;
  year: number | null;
  engine: {
    prefix: string | null;
    family: string;
    timing: string;
    aspiration: string;
    label: string;
    displacement_cc: number | null;
  };
  fuel: string;
  source: 'decoded' | 'cache';
}

export interface ResultadoBusqueda {
  title: string;
  source: 'vendor_catalog' | 'mercado_libre';
  image_url: string | null;
  oem: string | null;
  price: number | null;
  currency: string | null;
  compatible: 'yes' | 'no' | 'unknown';
  catalog_part_id: string | null;
  permalink: string | null;
}

export interface BusquedaHibridaRespuesta {
  query: string;
  total: number;
  vehicle: VehiculoDecodificado | null;
  results: ResultadoBusqueda[];
}

export interface ParteCatalogoBackend {
  id: string;
  part_name: string;
  part_number: string | null;
  default_photo_url: string | null;
  last_quoted_price: number | null;
  currency: string;
  times_quoted: number;
}

export interface MecanicoBackend {
  id: string;
  full_name: string;
  business_name: string | null;
  phone: string | null;
}

export interface DelegacionBackend {
  tokenId: string;
  accessUrl: string;
  expiresAt: string;
}

// El backend envuelve todo en { success: true, data: ... }
interface RespuestaBackend<T> { success: boolean; data: T; }

/** Usuario real creado desde /registro (persistido en sessionStorage 'toolbox-usuario'). */
export interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
}

/** Lee el usuario real de la sesión (o null si es una sesión demo por rol). */
export function usuarioSesion(): UsuarioSesion | null {
  const raw = sessionStorage.getItem('toolbox-usuario');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UsuarioSesion;
  } catch {
    return null;
  }
}

export function setUsuarioSesion(usuario: UsuarioSesion): void {
  sessionStorage.setItem('toolbox-usuario', JSON.stringify(usuario));
}

/** Espejo del payload de POST /cedulas/extraer (backend FastAPI + OpenRouter visión). */
export interface CedulaExtraidaBackend {
  dominio: string | null;
  marca: string | null;
  modelo: string | null;
  modelo_detalle: string | null;
  tipo_carroceria: string | null;
  chasis: string | null;
  motor_codigo: string | null;
  motor_specs: string | null;
  compat: string[];
}

// ── Servicio ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DemoApiService {

  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** ID del comprador: el usuario real del registro si existe, si no el demo. */
  get idComprador(): string {
    return usuarioSesion()?.id ?? IDS_DEMO.comprador;
  }
  readonly idRepuestero = IDS_DEMO.repuestero;
  readonly idRepartidor = IDS_DEMO.repartidor;
  readonly idMecanico = IDS_DEMO.mecanico;

  /** Alta real del nuevo usuario (auth.users + profiles + vehículo de la cédula). */
  crearCuenta(dto: {
    email: string; password: string; nombre: string; apellido: string; whatsapp?: string;
    vehiculo?: {
      dominio?: string | null; marca?: string | null; modelo?: string | null; modelo_detalle?: string | null;
      tipo_carroceria?: string | null; chasis?: string | null; motor_codigo?: string | null;
    };
  }): Observable<UsuarioSesion & { phone: string | null; vehiculo: unknown }> {
    return this.http
      .post<RespuestaBackend<{ id: string; email: string; full_name: string; phone: string | null; vehiculo: unknown }>>(
        `${this.base}/auth/registro`, dto)
      .pipe(map(r => ({ id: r.data.id, email: r.data.email, nombre: r.data.full_name, phone: r.data.phone, vehiculo: r.data.vehiculo })));
  }

  // ── Garaje ──
  garaje(ownerId: string): Observable<VehiculoBackend[]> {
    return this.http.get<RespuestaBackend<VehiculoBackend[]>>(`${this.base}/vehicles/owner/${ownerId}`)
      .pipe(map(r => r.data));
  }

  altaVehiculo(dto: {
    ownerId: string; licensePlate: string; brand: string; model: string; year: number;
    vin?: string; engineDetails?: string;
  }): Observable<VehiculoBackend> {
    return this.http.post<RespuestaBackend<VehiculoBackend>>(`${this.base}/vehicles/`, dto)
      .pipe(map(r => r.data));
  }

  // ── Solicitudes de repuestos ──
  crearSolicitud(dto: {
    customerId: string; vehicleId: string; urgencyLevel?: string; isDelegated?: boolean;
    items: { partName: string; partNumber?: string; description?: string; quantity?: number; samplePhotoUrl?: string }[];
  }): Observable<SolicitudBackend> {
    return this.http.post<RespuestaBackend<SolicitudBackend>>(`${this.base}/parts-requests/`, dto)
      .pipe(map(r => r.data));
  }

  /** Todas las solicitudes OPEN_FOR_QUOTING (el vendedor las ve; el comprador filtra por customer_id) */
  solicitudesAbiertas(): Observable<SolicitudBackend[]> {
    return this.http.get<RespuestaBackend<SolicitudBackend[]>>(`${this.base}/parts-requests/open`)
      .pipe(map(r => r.data));
  }

  // ── Cotizaciones ──
  cotizacionesDeSolicitud(requestId: string): Observable<CotizacionBackend[]> {
    return this.http.get<RespuestaBackend<CotizacionBackend[]>>(`${this.base}/quotes/request/${requestId}`)
      .pipe(map(r => r.data));
  }

  cotizar(dto: {
    partsRequestId: string; vendorId: string; totalAmount: number;
    currency?: string; validityHours?: number; notes?: string; itemPhotoUrl?: string;
  }): Observable<CotizacionBackend> {
    return this.http.post<RespuestaBackend<CotizacionBackend>>(`${this.base}/quotes/`, dto)
      .pipe(map(r => r.data));
  }

  // ── Catálogo (alimentado por las fotos de los vendedores) ──
  catalogo(q: string): Observable<ParteCatalogoBackend[]> {
    return this.http.get<RespuestaBackend<ParteCatalogoBackend[]>>(`${this.base}/catalog/`, { params: { q } })
      .pipe(map(r => r.data));
  }

  // ── Catálogo inteligente ──
  taxonomy(engineFamily?: string): Observable<CategoriaTaxonomia[]> {
    const params = engineFamily ? { engine_family: engineFamily } : undefined;
    return this.http.get<RespuestaBackend<CategoriaTaxonomia[]>>(`${this.base}/catalog/taxonomy`, { params })
      .pipe(map(r => r.data));
  }

  decodeVehiculo(vin: string, engineNumber?: string): Observable<VehiculoDecodificado> {
    const params: Record<string, string> = { vin };
    if (engineNumber) params['engine_number'] = engineNumber;
    return this.http.get<RespuestaBackend<VehiculoDecodificado>>(`${this.base}/catalog/decode`, { params })
      .pipe(map(r => r.data));
  }

  buscarHibrido(q: string, opts: { vin?: string; engineNumber?: string; position?: string; limit?: number } = {}): Observable<BusquedaHibridaRespuesta> {
    const params: Record<string, string> = { q };
    if (opts.vin) params['vin'] = opts.vin;
    if (opts.engineNumber) params['engine_number'] = opts.engineNumber;
    if (opts.position) params['position'] = opts.position;
    if (opts.limit) params['limit'] = String(opts.limit);
    return this.http.get<RespuestaBackend<BusquedaHibridaRespuesta>>(`${this.base}/catalog/search`, { params })
      .pipe(map(r => r.data));
  }

  // ── Fotos (Supabase Storage vía backend) ──
  subirFoto(file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<RespuestaBackend<{ url: string; path: string }>>(`${this.base}/uploads/photo`, form)
      .pipe(map(r => r.data.url));
  }

  // ── Órdenes (aceptar cotización → pedido → pago) ──
  aceptarCotizacion(quoteId: string, buyerId: string): Observable<PedidoBackend> {
    return this.http.post<RespuestaBackend<PedidoBackend>>(`${this.base}/orders/`, { quoteId, buyerId })
      .pipe(map(r => r.data));
  }

  marcarPagado(orderId: string, buyerId: string): Observable<PedidoBackend> {
    return this.http.post<RespuestaBackend<PedidoBackend>>(`${this.base}/orders/${orderId}/mark-paid`, {
      paidByUserId: buyerId,
      paidByType: 'customer',
    }).pipe(map(r => r.data));
  }

  pedidos(buyerId: string): Observable<PedidoBackend[]> {
    return this.http.get<RespuestaBackend<PedidoBackend[]>>(`${this.base}/orders/buyer/${buyerId}`)
      .pipe(map(r => r.data));
  }

  // ── Mecánicos habilitados (delegación de lista de compra) ──
  mecanicos(): Observable<MecanicoBackend[]> {
    return this.http.get<RespuestaBackend<MecanicoBackend[]>>(`${this.base}/mechanics/`)
      .pipe(map(r => r.data));
  }

  /** Crea un token de acceso de 48h y le avisa al mecánico (WhatsApp simulado). */
  delegar(dto: {
    partsRequestId: string; mechanicName: string; mechanicPhone: string; durationHours?: number;
  }): Observable<DelegacionBackend> {
    return this.http.post<RespuestaBackend<DelegacionBackend>>(`${this.base}/delegations/delegate`, dto)
      .pipe(map(r => r.data));
  }

  /** Datos técnicos extraídos por visión (OpenRouter) desde la foto de la Cédula Verde DNRPA. */
  extraerCedula(file: File): Observable<CedulaExtraidaBackend & { warnings?: string[] }> {
    const form = new FormData();
    form.append('file', file);
    return this.http
      .post<RespuestaBackend<CedulaExtraidaBackend> & { warnings?: string[] }>(`${this.base}/cedulas/extraer`, form)
      .pipe(map(r => ({ ...r.data, warnings: r.warnings ?? [] })));
  }
}
