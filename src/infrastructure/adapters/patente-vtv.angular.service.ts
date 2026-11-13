import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SolicitudVtvAngular {
  patente: string[];
  jurisdiccion: string[];
}

@Injectable({ providedIn: 'root' })
export class PatenteVtvAngularService {
  private http = inject(HttpClient);
  // La API key NUNCA va en frontend: este servicio llama a tu backend proxy.
  private readonly apiUrl = '/api/vtv/consultas';

  consultarVtv(body: SolicitudVtvAngular): Observable<unknown> {
    return this.http.post(this.apiUrl, body);
  }
}
