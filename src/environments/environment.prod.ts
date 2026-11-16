// Entorno de producción (build --configuration production reemplaza environment.ts).
// Actualizá apiUrl si el dominio de Render cambia (ver toolbox-backend/render.yaml).
export const environment = {
  carImagesApiKey: 'ci_2d0f7390a2ad4071a4060cd38b5a0c5c05233ad661ab9e0ff2e9fc72',

  supabaseUrl: 'https://cwezvfhytzxuyjndpiel.supabase.co',
  supabaseAnonKey: 'sb_publishable_AG_kGyEz3UWSxVAblAgLJQ_1HLaVeWP',

  // Backend publicado en Render (uvicorn). Dominio real del servicio.
  apiUrl: 'https://toolboxbackendproduction-1.onrender.com/api/v1',
};
