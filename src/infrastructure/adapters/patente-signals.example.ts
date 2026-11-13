// Ejemplo Angular 21 (Signals) slice vehiculo-garaje: cliente solo pone patente
// import { signal, computed, resource } from '@angular/core';
/*
const patente = signal('AB123CD');
const vehiculo = resource({
  params: () => ({ patente: patente() }),
  loader: ({ params }) => fetch(`/api/vehiculo/${params.patente}`).then(r => r.json()),
});
const vinCorto = computed(() => vehiculo.value()?.vin?.slice(-8) ?? '…');
const listoParaCotizar = computed(() => !!vehiculo.value()?.vin);
*/
export {};
