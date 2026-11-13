export interface RepuestoCandidato {
  id: string;
  nombre: string;
  descripcionTecnica: string;
  marca: string;
  numeroOem?: string;
  compatibilidad: string[];
  stockLocal: boolean;
  precioRango: string;
  fuente: 'mock-demo' | 'mercadolibre' | 'whatsapp-local';
  imagen?: string;
}

export function normalizarTexto(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
