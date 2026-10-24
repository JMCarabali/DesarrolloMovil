# Challenge 07 - Sensor Lab

Aplicacion Ionic React escrita en JavaScript para probar ocho APIs de Capacitor: geolocalizacion, camara, movimiento, informacion del dispositivo, hapticos, sistema de archivos, notificaciones locales y notificaciones push.

## Ejecutar en el navegador

```bash
npm install
npm run dev
```

La plataforma Android ya esta creada. Para compilar los recursos web y sincronizar los plugins nativos:

```bash
npm run android:sync
npm run android:open
```

Los plugins de GPS, camara, acelerometro, vibracion y notificaciones deben probarse en un dispositivo real para ver el comportamiento del hardware.

## Push notifications

El registro push necesita un proyecto Firebase, Firebase Cloud Messaging habilitado y su archivo de configuracion nativo (`google-services.json` para Android). El envio de notificaciones se realiza desde Firebase o desde un backend; no se debe exponer una clave privada de servidor dentro de la app.# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
