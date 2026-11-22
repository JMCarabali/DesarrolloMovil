# Patas en Ruta

## Alcance del sistema

Patas en Ruta es una aplicación móvil para que una persona registre los paseos de su mascota. Permite iniciar y finalizar una caminata, visualizar la ubicación y el recorrido sobre un mapa, consultar distancia y duración, adjuntar una fotografía, agregar una nota y revisar, editar o eliminar el historial.

La demostración local permite recorrer la aplicación sin crear cuentas y conserva los paseos en el almacenamiento del navegador. Con Supabase configurado, la aplicación ofrece registro e inicio de sesión reales, guarda los paseos por usuario, almacena fotografías en un bucket privado y actualiza la lista mediante Realtime. Las políticas RLS restringen las operaciones a la cuenta autenticada.

El GPS y la cámara solicitan permiso del dispositivo al usarse. El mapa utiliza teselas de OpenStreetMap y necesita conexión. La vista de historial del modo demo queda guardada localmente; la sincronización de cuentas Supabase requiere conexión.

## Tecnologías

- React y JavaScript (JSX), sin TypeScript.
- Ionic React y React Router para interfaz móvil y navegación.
- Capacitor Geolocation, Camera, Network y Haptics para funciones del dispositivo.
- Leaflet y React Leaflet con OpenStreetMap.
- Supabase Auth, PostgreSQL, Storage y Realtime.
- Vite para desarrollo y compilación.

## Estado de la entrega

- Aplicación funcional y demostrable en modo local.
- Prototipo visual de Lovable: https://lovable.dev/projects/8ea0a4bd-5c98-53f5-b337-754287ccc9d7
- Supabase configurado en la región `sa-east-1`: tabla `walks`, RLS por usuario, bucket privado `walk-photos` y Realtime.
- Credenciales públicas locales configuradas en `.env.local`; la clave privada de base de datos no se usa en el cliente.
- Los nombres del equipo y sus enlaces de Git deben añadirse en `README.md` una vez confirmados por el grupo.

El mapa y el recorrido del prototipo Lovable son simulados; la app Ionic del repositorio usa GPS y OpenStreetMap. La configuración local de Supabase ya está aplicada en este equipo; para usarla en otro equipo, sigue las instrucciones de `README.md`.

