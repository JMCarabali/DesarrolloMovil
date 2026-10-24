# Misiones UAO

Aplicación Ionic + React en JavaScript para el Parcial 2. Incluye registro e inicio de sesión con Firebase, misiones con Camera/Geolocation/Motion/Haptics, notificaciones, puntos, progreso, ranking y persistencia local.

## Ejecutar en navegador

```bash
npm install
npm run dev
```

Sin configurar Firebase puedes entrar con el modo demo para probar la interfaz y guardar progreso en este dispositivo. El modo demo no valida sensores físicos.

## Activar Firebase

1. Crea un proyecto Firebase, habilita Authentication con correo/contraseña y Cloud Firestore.
2. Completa las seis variables `VITE_FIREBASE_*` de `.env.local` con la configuración de tu app web. Este archivo está excluido de Git.
3. Publica las reglas de `firestore.rules` desde Firebase Console y reinicia Vite.

La colección `users` guarda el perfil, puntaje y estado de misiones privados por usuario. `leaderboard` contiene solo nombre y puntos para el ranking, que muestra hasta cuatro usuarios más el usuario actual. Para ver cinco personas deben existir cuatro cuentas adicionales.

## Probar funciones nativas

Los sensores reales requieren instalar el APK en un teléfono Android y aceptar los permisos. Para compilarlo se requiere Android Studio, Android SDK API 36 y JDK 21. La plataforma `android/` ya está creada en este proyecto.

```bash
npm run android:sync
npm run android:open
```

Para generar el APK de depuración desde Windows:

```powershell
npm run android:sync
cd android
.\gradlew.bat assembleDebug
```

El archivo se genera en `android/app/build/outputs/apk/debug/app-debug.apk`. En otra computadora, configura la ruta del SDK en `android/local.properties` y JDK 21 en `JAVA_HOME`; ese archivo local no se versiona. Prueba cámara, geolocalización precisa, acelerómetro, vibración y notificaciones aceptando los permisos. La misión de movimiento se completa al superar 30 m y la pausa se habilita al llegar a 50 m.