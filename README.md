# Task Manager - Challenge 05

Aplicacion Ionic + React en JavaScript con Firebase Authentication, Context API y custom hooks.

## Configuracion de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. En **Authentication > Sign-in method**, habilita **Email/Password**.
3. Registra una aplicacion web y copia sus valores en `src/firebase/config.js`.

La configuracion de Firebase es publica para una app web. Las tareas se guardan en localStorage por usuario; Firebase se utiliza para autenticacion y Analytics.

## Ejecutar

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Rutas

- `/login`: inicio de sesion con Firebase.
- `/register`: registro con Firebase.
- `/tasks`: lista privada de tareas.
- `/tasks/new`: crear tarea.
- `/tasks/:id`: detalle de tarea.
- `/tasks/:id/edit`: editar tarea.

## Arquitectura

- `src/firebase/config.js`: inicializa Firebase, Authentication, Firestore y Analytics.
- `src/context/AuthContext.jsx`: comparte usuario y acciones de autenticacion.
- `src/context/TaskContext.jsx`: comparte las tareas entre paginas.
- `src/hooks/useFirebaseAuth.js`: encapsula Firebase Auth.
- `src/hooks/useTasks.js`: encapsula el almacenamiento por usuario y las operaciones CRUD.

