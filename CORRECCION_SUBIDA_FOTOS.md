# Corrección de subida de fotos en Android

Esta versión corrige el error `Network request failed` que podía aparecer al subir fotos desde Android usando `FormData + fetch` con React Native reciente.

Cambios:
- las subidas de foto de perfil usan `expo-file-system/legacy` + `uploadAsync`;
- la verificación profesional usa la misma ruta nativa de subida;
- el portafolio usa subida nativa y separa la foto “antes” en un segundo endpoint;
- las URLs de fotos devueltas por PHP ahora son absolutas usando el host real de XAMPP;
- el mensaje de error diferencia fallos de transferencia de archivos de una caída general de XAMPP.

Después de reemplazar el proyecto ejecuta dentro de `mobile`:

```powershell
npm install
npx expo install --fix
npx expo start --clear --lan
```
