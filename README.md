# Patas en Ruta

Aplicación Ionic/React para registrar paseos de mascotas. Este proyecto está escrito en **JavaScript/JSX**, no TypeScript.

## Ejecutar

```bash
npm install
npm run dev
```

En la pantalla de acceso, selecciona **Entrar a la demostración** para probar sin una cuenta. Los paseos demo se guardan en el almacenamiento local de ese navegador. Al elegir **Crear cuenta**, también se solicita el nombre de la mascota y se guarda en los metadatos de Supabase.

## Funciones

- Rutas con React Router y componentes Ionic.
- Registro e inicio de sesión con Supabase; el nombre de la mascota se guarda junto a la cuenta.
- Ubicación GPS en el mapa Leaflet/OpenStreetMap, distancia y tiempo del paseo.
- Captura de foto, nota y gestión del historial (crear, consultar, editar nota y eliminar).
- Persistencia local para la demostración.
- Estado de conectividad de red y respuesta háptica.
- Integración con Supabase: Auth, base de datos PostgreSQL, Storage privado y Realtime.

## Supabase

El proyecto `Patas en Ruta` ya está creado en la región South America (São Paulo), y el esquema, las políticas RLS, el bucket privado y la publicación Realtime ya fueron aplicados. La URL y la clave publicable se guardan en `.env.local`, que no se debe subir al repositorio.

- Dashboard: https://supabase.com/dashboard/project/ryinuhgkttedzkyxywii
- URL del proyecto: `https://ryinuhgkttedzkyxywii.supabase.co`
- Región: `sa-east-1`

La contraseña de Postgres no se usa en la app. Guárdala en un gestor seguro y cámbiala si fue expuesta; nunca la incluyas en el repositorio ni en el cliente.

Para repetir la instalación en otro proyecto:

1. Ejecuta [`supabase/setup.sql`](./supabase/setup.sql) en el SQL Editor.
2. Copia `.env.example` como `.env.local` y configura la URL y la clave publicable/anon. Nunca uses una clave `service_role` en el cliente.

La tabla aplica RLS por `user_id`. El bucket privado `walk-photos` guarda cada imagen bajo una carpeta cuyo nombre debe coincidir con el UUID del usuario. La app tiene registro e inicio de sesión reales; si Supabase exige confirmación por correo, confirma el mensaje antes de iniciar sesión.

## Compilar

```bash
npm run build
npm run preview
```

Para preparar la plataforma Android (requiere Android Studio y SDK configurados):

```bash
npm run build
npm run cap:sync
npm run android
```

Los sensores se prueban mejor en un dispositivo o emulador con permisos de ubicación/cámara habilitados.

## Prototipo y entrega académica

- Idea: registro sencillo de paseos de mascotas con GPS, fotos e historial.
- Prototipo de Lovable: [Patas en Ruta](https://lovable.dev/projects/8ea0a4bd-5c98-53f5-b337-754287ccc9d7).
- Integrantes y ramas: **completar con nombres y enlaces reales antes de entregar**.
- APIs/servicios: Supabase y teselas de OpenStreetMap.
- Documento de alcance: [`docs/ALCANCE_Y_TECNOLOGIAS.md`](./docs/ALCANCE_Y_TECNOLOGIAS.md).

### Prompt listo para Lovable

Pega este texto en Lovable para generar el prototipo visual:

> Diseña una app móvil en español llamada “Patas en Ruta” para registrar paseos de mascotas. Estilo cálido, limpio y natural: fondo marfil verdoso, verde bosque, acentos durazno, tarjetas redondeadas, tipografía Manrope/DM Sans y diseño mobile-first. Crea tres vistas navegables: Inicio con saludo, mapa con marcador y recorrido, estadísticas de distancia/duración/puntos GPS y botón grande “Iniciar paseo”; Historial con tarjetas de paseos, fecha, distancia, duración, miniatura y acciones de editar nota/eliminar; Perfil con email, modo de cuenta y botón de cerrar sesión. Incluye una pantalla de login y registro con opción “Entrar a la demostración”. En el paseo activo, muestra controles de GPS, cámara, nota y finalizar. Usa datos de ejemplo claramente marcados, estados vacíos y etiquetas de conexión. Mantén una interfaz accesible, clara y consistente; no incluyas pagos ni funciones ajenas al registro de paseos.
