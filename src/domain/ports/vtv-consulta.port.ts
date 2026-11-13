export type JurisdiccionVtv = 'pba' | 'caba' | 'chubut' | string;

export interface SolicitudVtv {
  patente: string[];
  jurisdiccion: JurisdiccionVtv[];
}

export interface RespuestaVtvAceptada {
  code: number;
  status: 'accepted' | string;
  message?: string;
  requestId: string;
  timestamp: string;
}

export interface VtvConsultaPort {
  consultarVtv(solicitud: SolicitudVtv, opts?: { idempotencyKey?: string; xToken?: string }): Promise<RespuestaVtvAceptada>;
}
