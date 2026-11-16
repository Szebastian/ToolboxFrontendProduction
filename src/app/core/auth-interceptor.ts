import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { SupabaseService } from '../../application/services/supabase.service';

/** Agrega `Authorization: Bearer <access_token>` a las llamadas al backend
 *  cuando hay sesión real de Supabase. Los paneles demo (sin sesión) viajan
 *  sin token: el backend decide con EXIGIR_JWT si los acepta. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req); // no mandamos token a terceros
  }
  const supabase = inject(SupabaseService);
  return from(supabase.client.auth.getSession()).pipe(
    switchMap(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return next(req);
      const conAuth = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next(conAuth);
    })
  );
};
