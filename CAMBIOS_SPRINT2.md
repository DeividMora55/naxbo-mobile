# NAXVO · Cambios Sprint 2

## Pagos en efectivo

- El cliente registra explícitamente que entregó el efectivo.
- El profesional no puede confirmar antes de esa declaración.
- Solo la confirmación del profesional cambia la solicitud a `estado_pago=pagado`.
- Se registra una fila en `pagos`, referencia única, fecha, monto, evento y notificación.
- Las acciones son idempotentes: repetir una confirmación no genera un segundo cobro.

## Mercado Pago

- Checkout Pro creado exclusivamente en PHP.
- Credenciales exclusivamente en `backend/.env`.
- Soporte del SDK oficial PHP `mercadopago/dx-php 3.16.0` mediante Composer.
- Fallback REST seguro para XAMPP si Composer no está instalado.
- El móvil únicamente recibe `checkout_url` y estados; nunca recibe el Access Token.
- Cada intento tiene `external_reference` única.
- Confirmación por Webhook firmado cuando hay HTTPS público.
- Sincronización manual/automática por `external_reference` para desarrollo local con XAMPP.
- Se valida monto, moneda, referencia, Payment ID duplicado y estados tardíos.

## App móvil

- Nueva pantalla `app/payment/[id].tsx`.
- Solicitudes nuevas permiten **Efectivo** o **Mercado Pago**.
- El detalle de solicitud incluye cotización, acceso al pago y bloqueo de cierre mientras el pago siga pendiente.
- Modo de simulación local para aprobar, dejar pendiente o rechazar Mercado Pago sin usar dinero real.

## API móvil

- `POST /payments/checkout.php`
- `GET /payments/status.php?request_id=ID&refresh=1`
- `POST /payments/cash-declare.php`
- `POST /payments/cash.php`
- `POST /payments/simulate.php` (solo debug local)

## Migración

Para una base existente ejecuta una sola vez:

`backend/database/012_sprint2_pagos_funcional.sql`
