export interface ParamsImagenVehiculo {
  make: string;
  model: string;
  year?: number;
  view?: 'front34' | 'side' | 'rear34' | 'front' | 'rear';
  width?: number;
  format?: 'webp' | 'png' | 'jpg';
}

export interface ImagenVehiculoPort {
  url(params: ParamsImagenVehiculo): string;
}
