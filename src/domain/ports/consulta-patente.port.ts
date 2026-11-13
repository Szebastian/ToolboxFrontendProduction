// @deprecated - Se eliminó patente del flujo de repuestos. Solo se mantiene VTV en su propio puerto.
export interface VehiculoResuelto {
  vin: string;
  marca: string;
  modelo: string;
  version: string;
  anio: number;
  motorCodigo: string;
  combustible: string;
}

export interface ConsultaPatentePort {
  resolverPorPatente(patente: string): Promise<VehiculoResuelto>;
}
