import type { ImagenVehiculoPort, ParamsImagenVehiculo } from '../../domain/ports/imagen-vehiculo.port.js';

// Adapter carimagesapi.com : GET /image?make=&model=&year=&key=
// Docs: https://carimagesapi.com/docs  Base: https://carimagesapi.com
export class CarImagesAdapter implements ImagenVehiculoPort {
  constructor(private readonly apiKey: string, private readonly base = 'https://carimagesapi.com') {
    if (!apiKey || apiKey === 'ci_your_api_key') console.warn('CARIMAGES_API_KEY no configurada. Usá .env real o clave de dashboard.');
  }
  url(p: ParamsImagenVehiculo): string {
    const qs = new URLSearchParams({
      make: p.make,
      model: p.model,
      ...(p.year ? { year: String(p.year) } : {}),
      ...(p.view ? { view: p.view } : {}),
      ...(p.width ? { width: String(p.width) } : { width: '800' }),
      ...(p.format ? { format: p.format } : { format: 'webp' }),
      key: this.apiKey,
    });
    return `${this.base}/image?${qs.toString()}`;
  }
}
