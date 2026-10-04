# NAXVO — corrección de inicio de sesión y registro

## Causa encontrada

El frontend de Expo estaba compilando correctamente. El problema estaba en XAMPP/MySQL.
En el registro de PHP del proyecto se encontraron estos errores reales:

- `SQLSTATE[HY000]: General error: 1205 Lock wait timeout exceeded` durante el inicio de sesión.
- `SQLSTATE[HY000]: General error: 2006 MySQL server has gone away` durante el registro.
- solicitudes PHP que terminaban por `Maximum execution time of 120 seconds exceeded`.

Esto explica por qué Metro solo mostraba mensajes normales: la app cargaba, pero la API quedaba esperando a MariaDB.

## Cambios aplicados

1. El login de cuentas activas ya no hace un `UPDATE usuarios` innecesario antes de autenticar.
2. `ultimo_acceso_at` y otras escrituras informativas ya no pueden bloquear un login válido.
3. La API usa un tiempo de espera corto para bloqueos de InnoDB y devuelve un error claro en lugar de quedarse congelada.
4. `/api/v1/health.php` ahora comprueba también la conexión real con MariaDB y las tablas `usuarios` y `api_sesiones`.
5. La app corta una petición después de 15 segundos y muestra un mensaje útil si XAMPP/MySQL no responde.
6. Login y registro muestran el error directamente dentro de la pantalla, también en Web.
7. Se mantuvo `localStorage` para la sesión Web y SecureStore para Android/iOS.
8. Se eliminaron los recursos de sonidos que no forman parte del Sprint 1 solicitado.

## Paso obligatorio una sola vez

Como el error original era un bloqueo activo de MariaDB, antes de probar esta versión:

1. Cierra cualquier importación/consulta abierta de phpMyAdmin.
2. En XAMPP pulsa **Stop** en MySQL.
3. Espera 3–5 segundos.
4. Pulsa **Start** en MySQL.
5. Confirma también que Apache esté en **Running**.

Reiniciar MySQL elimina las transacciones/bloqueos que ya estaban abiertos en la instancia anterior.

## Comprobación

Abre en el navegador:

`http://localhost/NAXVO_Movil/backend/public/api/v1/health.php`

Debe mostrar un JSON con:

- `"ok": true`
- `"status": "ok"`
- `"database": "ok"`

Si aparece `database_schema_missing`, importa una sola vez:

`backend/database/011_estabilizacion_actual.sql`

No vuelvas a importar la base completa si ya contiene tus usuarios y datos.
