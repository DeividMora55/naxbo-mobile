# NAXVO · Sprint 1 (sin sonidos)

Este paquete implementa el Sprint 1 definido en `SCRUM.xlsx`, excepto la tarea de **efectos y sonidos de ambientación**, excluida por solicitud.

Incluye:
- diseño/estructuración de datos faltantes;
- migración y validación de datos;
- paletas accesibles para protanopia, deuteranopia y tritanopia;
- vista móvil de servicio completado;
- flujo completo de finalización: trabajador solicita revisión → cliente corrige o confirma → servicio completado.

## 1. Base de datos
Con Apache y MySQL activos en XAMPP, abre phpMyAdmin, selecciona `naxvo` e importa:

`backend/database/010_sprint1_bd_accesibilidad_finalizacion.sql`

El script es idempotente.

## 2. Dependencias móviles
Desde `C:\xampp\htdocs\NAXVO_Movil\mobile`:

```powershell
npm install
npx expo install --fix
npx expo-doctor
```

No es necesario instalar `expo-audio`.

## 3. Ejecutar
```powershell
npx expo start --clear --lan
```

## 4. Prueba rápida
1. Inicia sesión como trabajador verificado.
2. Abre un trabajo asignado con cotización aceptada y pulsa **Iniciar servicio**.
3. Agrega opcionalmente evidencias y notas.
4. Pulsa **Marcar trabajo como terminado**.
5. Inicia sesión como el cliente de la solicitud.
6. Abre la solicitud y usa **Solicitar corrección** o **Confirmar servicio completado**.
7. Al confirmar se guarda `completado`, el historial y la vista especial de cierre.
8. En **Perfil → Apariencia y accesibilidad** prueba los temas y las paletas cromáticas.

> Sprint 2 no está incluido.
