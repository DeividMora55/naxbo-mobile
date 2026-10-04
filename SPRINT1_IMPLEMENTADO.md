# NAXVO · Sprint 1 implementado (sin efectos ni ambientación)

**Sprint 1: Base de Datos, Accesibilidad Visual y Confirmación de Servicio**

Esta entrega implementa todo el Sprint 1 solicitado excepto la tarea **“Implementación de efectos y sonidos de ambientación”**, excluida expresamente.

## Tareas implementadas

### 1. Diseño y estructuración de tablas faltantes
- Migración `backend/database/010_sprint1_bd_accesibilidad_finalizacion.sql`.
- Garantiza la estructura de finalización en `solicitudes`.
- Garantiza `solicitud_evidencias` para fotografías de cierre.
- Mantiene el índice de finalizaciones para cliente/trabajador/estado.

### 2. Migración y validación de datos en BD
- Migra solicitudes históricas `completado` a `finalizacion_estado = confirmada`.
- Repara fechas faltantes de solicitud/confirmación de cierre.
- Normaliza registros confirmados que todavía conservaban estado `en_curso`.
- Genera eventos históricos faltantes de finalización.
- Incluye consultas finales de validación que deben devolver cero inconsistencias.
- La migración está integrada también en los SQL completos del proyecto para instalaciones nuevas.

### 3. Ajuste de paleta de colores accesibles
- Paletas específicas para protanopia, deuteranopia y tritanopia.
- Se ajustan color primario, éxito, advertencia, peligro, información y bordes según modo claro/oscuro.
- Estados críticos conservan texto, iconos y símbolos además del color.
- La pantalla **Apariencia y accesibilidad** permite cambiar tema y modo cromático y muestra una vista previa.

### 4. Diseño de vista para servicio completado
- Nueva pantalla móvil `app/completed/[id].tsx`.
- Muestra folio, servicio, estado confirmado, fechas, cliente/profesional, notas finales, evidencias e historial de eventos.
- La confirmación se comunica mediante texto, iconografía, símbolos y color accesible.

### 5. Integración de lógica y estado “servicio completado”
- El trabajador puede iniciar un servicio cuando el estado lo permite.
- Durante un servicio en curso puede subir hasta 5 evidencias.
- Puede agregar notas y marcar el trabajo como terminado.
- El cliente recibe el estado **Esperando revisión**.
- El cliente puede solicitar una corrección con motivo o confirmar el servicio.
- La corrección devuelve el flujo al profesional y permite reenviar la finalización.
- Al confirmar se actualizan estados y fechas, se registra evento, se genera notificación y queda disponible la vista de cierre.

## Nuevos endpoints móviles
- `POST /api/v1/requests/start.php`
- `POST /api/v1/completion/evidence.php`
- `POST /api/v1/completion/request.php`
- `POST /api/v1/completion/correction.php`
- `POST /api/v1/completion/confirm.php`

`GET /api/v1/requests/show.php?id=...` devuelve también el bloque `completion` y evidencias.

## Validación técnica
- Sintaxis PHP validada en el backend.
- TypeScript validado con `tsc --noEmit`.
- Se conservaron autenticación, perfiles, fotografías, portafolio, verificación y XAMPP.
- `expo-audio`, `SoundContext` y archivos de sonido no forman parte de esta entrega.

Sprint 2 no está incluido.
