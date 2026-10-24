# Challenge 08 · Ritmo

Aplicación móvil con Ionic React, Supabase y Capacitor Camera. Incluye registro e inicio de sesión, CRUD de tareas por usuario, sincronización Realtime y captura de avatar.

## Preparar Supabase

1. Crea un proyecto en Supabase.
2. En SQL Editor, ejecuta `supabase/setup.sql`. Esto crea `public.tareas`, activa RLS y Realtime, y crea el bucket privado `avatars` con políticas por carpeta de usuario.
3. En Project Settings → API Keys, copia el Project URL y la publishable key (o la antigua `anon`). No uses una `secret` ni `service_role` en el frontend.
4. Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`.
5. En Authentication → URL Configuration, agrega la URL local `http://localhost:5173` como Site URL y Redirect URL.
6. En Authentication → Sign In / Providers, verifica que Email esté habilitado.

## Ejecutar

```sh
npm install
npm run dev
```

Abre la URL que muestra Vite. Para usar la cámara nativa en Android, agrega Android con Capacitor y sincroniza el proyecto después de instalar las dependencias nativas.

Sin un archivo `.env` válido, la pantalla de acceso muestra el aviso de configuración y desactiva el envío del formulario.
