# Sprint 2 · Módulo de Pagos — Implementado

El Sprint 2 del backlog solicita 28 horas distribuidas en cinco tareas. Esta entrega integra esas tareas al flujo real de NAXVO: cotización → pago → finalización.

| Tarea del Sprint 2 | Estado | Implementación |
|---|---|---|
| Flujo e interfaz de cobro en efectivo | **Completado** | El cliente marca el efectivo como entregado y el profesional asignado confirma que lo recibió. La interfaz móvil muestra cada paso y el estado actual. |
| Validación y registro de transacciones en efectivo | **Completado** | El servidor valida cliente, profesional, cotización aceptada, servicio iniciado, monto e idempotencia. Solo después de la doble confirmación se marca `pagado`. |
| Configuración de SDK y credenciales Mercado Pago | **Completado** | `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` viven únicamente en `backend/.env`. Se agregó `composer.json` para `mercadopago/dx-php 3.16.0`; si Composer no está instalado, el cliente REST seguro incluido mantiene el sistema operativo. |
| Maquetado del checkout de Mercado Pago | **Completado** | La app abre una pantalla de pago propia, solicita al backend una preferencia Checkout Pro y abre el `init_point` de Mercado Pago sin exponer el Access Token. |
| Pruebas de Webhooks y confirmación de pago MP | **Completado en código y modo local** | Webhook con HMAC/SDK, idempotencia, validación de monto/moneda, sincronización por `external_reference`, actualización de estados, notificaciones y simulador local autenticado. |

## Flujo en efectivo

1. La cotización debe estar aceptada.
2. El profesional inicia el servicio.
3. El cliente entrega físicamente el dinero y pulsa **Marcar efectivo como entregado**.
4. NAXVO registra una transacción pendiente y notifica al profesional.
5. El profesional pulsa **Confirmar efectivo recibido**.
6. NAXVO marca la transacción y la solicitud como `pagado`, registra fecha, referencia, evento y notificación.

No es posible cerrar definitivamente el servicio mientras el pago no aparezca confirmado.

## Flujo Mercado Pago

1. El cliente acepta la cotización.
2. NAXVO crea un intento con `external_reference` único.
3. El backend crea la preferencia de Checkout Pro usando el SDK oficial si está instalado, o la misma API oficial mediante el cliente REST incluido.
4. La app abre el checkout de Mercado Pago.
5. NAXVO confirma el resultado por Webhook cuando existe una URL HTTPS pública o, durante desarrollo con XAMPP, consultando a Mercado Pago por `external_reference` cuando el usuario vuelve a la app.
6. Se valida importe, moneda, referencia y duplicados antes de marcar la solicitud como pagada.

## Seguridad

- El `MP_ACCESS_TOKEN` nunca se entrega a React Native.
- El Webhook valida `x-signature` con HMAC-SHA256 o con `WebhookSignatureValidator` del SDK oficial cuando está disponible.
- `external_reference`, `provider_payment_id` y `pago_webhook_eventos.event_key` evitan duplicados.
- Un evento tardío pendiente/rechazado no degrada un pago que ya fue aprobado.
- La simulación solo funciona con `APP_DEBUG=1` y `PAYMENT_LOCAL_SIMULATION=1`.

## Archivos principales

- `mobile/app/payment/[id].tsx`
- `mobile/app/request/[id].tsx`
- `backend/app/Services/PaymentService.php`
- `backend/app/Services/MercadoPagoClient.php`
- `backend/app/Repositories/PaymentRepository.php`
- `backend/app/Controllers/PaymentWebhookController.php`
- `backend/public/webhooks/mercadopago.php`
- `backend/database/012_sprint2_pagos_funcional.sql`
