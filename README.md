# Parcial 1 - Desarrollo de Plataformas Móviles - MediClinic

JUAN MIGUEL CARABALI

## Ejercicio 1 - PWA React

### Cómo correr

cd mediclinic-pwa
npm install
npm run dev

### Cómo probar la PWA (manifest + service worker)

npm run build
npm run preview

### Credenciales de prueba

- admin / 1234
- doctor / abcd

### Funcionalidades

- Login con usuarios fijos, sesión persistida en localStorage
- Lista de pacientes con formulario de creación (nombre, apellido, CC, teléfono)
- Validación de campos obligatorios y CC numérica
- Buscador por nombre, apellido o CC (estado en el componente padre)

## Ejercicio 2 - Ionic React

### Cómo correr

cd mediclinic-ionic
ionic serve

### Credenciales de prueba

- medico / 1234

### Funcionalidades

- Login con IonToast en caso de error, sesión en localStorage
- IonTabs: Visitas, Pacientes, Perfil
- Detalle de visita con cambio de estado (pendiente → en_camino → finalizada)
- Cierre de sesión desde el tab de Perfil

## Capturas de pantalla

Ver carpeta /capturas

