import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// Roles tal como viven en la tabla public.profiles (ver /supabase/01_schema.sql)
export type RolSupabase = 'admin' | 'vendor' | 'customer' | 'mechanic' | 'courier';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
    { auth: { persistSession: true, autoRefreshToken: true } },
  );

  /**
   * Login con email + contraseña.
   * Devuelve el rol REAL (desde public.profiles) + los datos del usuario para la sesión.
   */
  async iniciarSesion(email: string, password: string): Promise<{ rol: RolSupabase; id: string; email: string; nombre: string }> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: perfil, error: errPerfil } = await this.client
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user!.id)
      .single();
    if (errPerfil) throw errPerfil;
    return {
      rol: (perfil?.role ?? 'customer') as RolSupabase,
      id: data.user!.id,
      email: data.user!.email ?? email,
      nombre: perfil?.full_name ?? email,
    };
  }

  /**
   * Registro de comprador. El trigger handle_new_user de la base crea el
   * perfil con rol 'comprador' a partir del metadata.
   * Si el proyecto exige confirmar email, devuelve `necesita_confirmar: true`
   * y no hay sesión activa hasta que el usuario confirme.
   */
  async registrarComprador(email: string, password: string, nombreCompleto: string): Promise<{ necesitaConfirmar: boolean }> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { data: { full_name: nombreCompleto, role: 'customer' } },
    });
    if (error) throw error;
    return { necesitaConfirmar: !data.session };
  }

  async cerrarSesion(): Promise<void> {
    await this.client.auth.signOut();
  }

  /** ¿Hay sesión de Supabase activa? (persistida en localStorage) */
  async sesionActiva(): Promise<boolean> {
    const { data } = await this.client.auth.getSession();
    return !!data.session;
  }
}
