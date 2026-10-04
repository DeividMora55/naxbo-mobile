# Revisión técnica y estabilización de NAXVO

Fecha de revisión: 29 de septiembre de 2026.

## Correcciones realizadas

1. **TypeScript / Expo**
   - Se eliminó configuración obsoleta de TypeScript (`baseUrl`/`ignoreDeprecations`) y se dejó el alias `@/*` compatible con TypeScript 6.
   - Se activaron `noUnusedLocals` y `noUnusedParameters` y se retiraron imports residuales.
   - Se comprobó que las dependencias instaladas coinciden con el mapa local de Expo SDK 57.

2. **Inicio de sesión y sesión móvil**
   - Web continúa usando `localStorage`; Android/iOS usan SecureStore.
   - Un fallo temporal de red, Apache, MySQL o un HTTP 5xx durante el refresh ya **no borra una sesión válida**. Los tokens solo se eliminan cuando el backend confirma que el refresh expiró o fue revocado.
   - Los errores de API conservan mensajes claros para login/registro y fallos de conectividad.

3. **Registro**
   - Validación frontal y backend alineada con el tamaño real de las columnas de MySQL.
   - Nombre, apellidos, correo, teléfono y datos profesionales tienen límites consistentes.
   - Se valida contraseña fuerte, categoría profesional, experiencia y ubicación antes del INSERT.

4. **Solicitudes**
   - Se validan longitud, formato y campos obligatorios antes de guardar dirección, fecha, hora y descripción.
   - Las validaciones del backend ahora se muestran correctamente en la app en lugar de un mensaje genérico.
   - Al solicitar desde un servicio publicado, la solicitud guarda `servicio_publicado_id` y comprueba que el servicio siga activo, pertenezca al profesional y coincida con la categoría.
   - Se mantiene el flujo de solicitud abierta y solicitud directa a un profesional.

5. **Perfil**
   - Límites de teléfono, ciudad, estado, código postal, redes y horario alineados con MySQL.
   - `fecha_nacimiento` se valida como fecha real y no puede estar en el futuro.

6. **Compatibilidad PHP/XAMPP**
   - Se agregó una compatibilidad segura para funciones `mb_*` cuando `mbstring` no está habilitado. Si la extensión existe, PHP usa la implementación nativa.
   - La API devuelve JSON controlado cuando la base de datos no está disponible en vez de terminar con un error fatal.

7. **Limpieza**
   - Se retiraron sonidos WAV sin referencias en la aplicación.
   - Se eliminan de la entrega `node_modules`, `.expo` y logs generados. Se reconstruyen las dependencias con `npm ci`.
   - Los scripts de preparación ya no ejecutan `expo install --fix` automáticamente, evitando cambios involuntarios en el lockfile durante una instalación normal.

## Validaciones ejecutadas

- TypeScript (`tsc --noEmit`): **OK**.
- PHP (`php -l`) sobre 271 archivos: **OK**.
- Expo export Web: **OK**.
- Expo export Android/Hermes: **OK**.
- Expo export iOS/Hermes: **OK**.
- Rutas móviles de API revisadas contra endpoints PHP existentes.
- Pruebas de borde de validación para registro y solicitudes: **OK**.
- Respuesta controlada de API sin base disponible: **OK** (`database_unavailable`).

## Prueba final en tu XAMPP

El entorno donde se hizo esta revisión no tiene MariaDB/MySQL ni `pdo_mysql`, por lo que no puede conectarse a la base que vive en tu computadora. La compilación, sintaxis, rutas y contratos app/API fueron verificados, pero la prueba final de integración con datos reales debe hacerse con Apache y MySQL de tu XAMPP encendidos.

En la PC abre:

`http://localhost/NAXVO_Movil/backend/public/api/v1/health.php`

Debe devolver JSON con `ok: true`. Después ejecuta desde `mobile`:

```powershell
npm ci
npm run typecheck
npx expo start --clear --lan
```
