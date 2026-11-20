export interface RepuestoCandidato {
  id: string;
  nombre: string;
  descripcionTecnica: string;
  marca: string;
  numeroOem?: string;
  compatibilidad: string[];
  stockLocal: boolean;
  stockDisponible?: number;
  precioRango: string;
  fuente: 'mock-demo' | 'mercadolibre' | 'whatsapp-local' | 'toolbox-backend' | 'mercado_libre' | 'tiendanube';
  imagen?: string;
  permalink?: string;
}

export function normalizarTexto(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
