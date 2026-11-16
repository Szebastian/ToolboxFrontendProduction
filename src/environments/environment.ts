export const environment = {
   carImagesApiKey: 'ci_2d0f7390a2ad4071a4060cd38b5a0c5c05233ad661ab9e0ff2e9fc72', // <- pegá acá tu ci_xxx de carimagesapi.com

   // Supabase (Project Settings → API). La anon key es pública: la seguridad
   // la dan las políticas RLS del proyecto (ver /supabase/02_policies.sql).
   supabaseUrl: 'https://cwezvfhytzxuyjndpiel.supabase.co',
   supabaseAnonKey: 'sb_publishable_AG_kGyEz3UWSxVAblAgLJQ_1HLaVeWP',

   // Backend FastAPI (toolbox-backend). Local: uvicorn en el puerto 10000.
   // En producción (Render) se reemplaza por https://toolbox-backend.onrender.com/api/v1
   apiUrl: 'http://127.0.0.1:10000/api/v1',
};
