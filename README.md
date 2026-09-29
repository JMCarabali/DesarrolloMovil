# Challenge 06 - Ionic data lab

Aplicacion Ionic + React con autenticacion real, rutas protegidas y tres fuentes de datos: contactos en Firestore, tareas en Realtime Database y frutas en Dexie.

## Configuracion de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. En **Authentication > Sign-in method**, habilita **Email/Password**.
3. Registra una aplicacion web y copia sus valores en `src/firebase/config.js`.

La configuracion de Firebase es publica para una app web. Habilita Email/Password, crea Firestore y Realtime Database en el proyecto y publica las reglas incluidas en `firestore.rules` y `database.rules.json`.

## Ejecutar

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Rutas

- `/login`: inicio de sesion con Firebase.
- `/register`: registro con Firebase.
- `/dashboard`: panel de acceso y estado de red.
- `/tasks`: tareas privadas sincronizadas en Realtime Database.
- `/tasks/new`: crear tarea.
- `/tasks/:id`: detalle de tarea.
- `/tasks/:id/edit`: editar tarea.
- `/contacts`: contactos sincronizados en Firestore.
- `/contacts/new`: crear contacto.
- `/fruits`: frutas almacenadas localmente con Dexie y `useLiveQuery`.

## Arquitectura

- `src/firebase/config.js`: inicializa Firebase, Authentication, Firestore, Realtime Database y Analytics.
- `src/context/AuthContext.jsx`: comparte usuario y acciones de autenticacion.
- `src/context/TaskContext.jsx`: comparte las tareas entre paginas.
- `src/hooks/useFirebaseAuth.js`: encapsula Firebase Auth.
- `src/hooks/useTasks.js`: encapsula el listener y CRUD de Realtime Database.
- `src/hooks/useCollection.js`: listener y CRUD de la coleccion Firestore.
- `src/hooks/useDexie.js`: CRUD local y escucha reactiva de frutas.
- `src/hooks/useNetwork.js`: estado de conectividad con Capacitor Network.

