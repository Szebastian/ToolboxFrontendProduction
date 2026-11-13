export type TipoPatente = 'MERCOSUR' | 'CLASICA';

export function normalizarPatente(raw: string): string {
  return raw.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

export function tipoPatente(p: string): TipoPatente | null {
  const n = normalizarPatente(p);
  if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(n)) return 'MERCOSUR';
  if (/^[A-Z]{3}\d{3}$/.test(n)) return 'CLASICA';
  return null;
}

export function esPatenteValida(p: string): boolean {
  return tipoPatente(p) !== null;
}
