# NAXVO · Mejoras de cliente, solicitudes y pagos

## Inicio del cliente

- Buscador principal visible desde Inicio.
- Carrusel de categorías con imágenes.
- Profesionales destacados con foto, especialidad, ubicación, reputación, servicios y disponibilidad.
- Accesos rápidos a nueva solicitud e historial.
- Resumen de actividad y solicitudes recientes.

## Nueva solicitud

- Selector visual de categoría.
- Dirección y ubicación GPS.
- Calendario real dentro de la app para elegir fecha.
- Selector visual de hora.
- Horario flexible si el cliente todavía no desea fijarlo.
- Urgencia e instrucciones adicionales.
- Hasta 5 fotos opcionales del problema, guardadas en el backend.
- Efectivo o Mercado Pago.

## Aceptación por trabajadores

- Una solicitud directa ya no se considera aceptada automáticamente.
- Se muestra en **Solicitudes disponibles** del trabajador.
- El trabajador abre una ventana con descripción, urgencia, pago, fecha/hora, ubicación, cliente y fotos antes de decidir.
- Solo después de aceptar pasa a `asignado` y se habilita la cotización.
- Las solicitudes directas pueden rechazarse; en ese caso vuelven a quedar abiertas para otros profesionales compatibles.
- Los trabajos pendientes de aceptación no inflan el listado de trabajos ya aceptados.

## Mercado Pago

- El checkout móvil no usa simulación automática.
- Sin `MP_ACCESS_TOKEN`, NAXVO muestra un error de configuración en lugar de fingir un pago.
- El Access Token vive solo en PHP.
- Se crea una preferencia Checkout Pro con el importe de la cotización aceptada.
- El pago se comprueba contra `external_reference`, importe y moneda antes de marcarlo como pagado.
- En producción se soporta Webhook HTTPS firmado; en desarrollo local se puede resincronizar consultando Mercado Pago cuando la app vuelve al primer plano.

Consulta `MERCADOPAGO_REAL.md` para conectar tus credenciales reales.
