# Mercado Pago real en NAXVO

NAXVO usa **Checkout Pro real**. La app móvil no contiene el Access Token y no procesa datos de tarjeta: el backend PHP crea la preferencia, Mercado Pago realiza el cobro y NAXVO confirma el estado consultando al proveedor y/o mediante Webhook.

## 1. Credenciales

En `backend/.env` configura:

```env
PAYMENT_LOCAL_SIMULATION=0
MP_ACCESS_TOKEN=TU_ACCESS_TOKEN_REAL
MP_WEBHOOK_SECRET=TU_SECRET_DE_WEBHOOK
```

No subas ese archivo a un repositorio público. `MP_ACCESS_TOKEN` se obtiene desde la aplicación creada en **Mercado Pago Developers > Tus integraciones > Credenciales de producción**.

## 2. URL pública para Webhooks

Para producción configura una URL HTTPS pública:

```env
APP_ENV=production
APP_DEBUG=0
APP_URL=https://tu-dominio.com/NAXVO_Movil/backend/public
APP_FORCE_HTTPS=1
```

En Mercado Pago Developers configura el Webhook del evento **Pagos** apuntando a:

```text
https://tu-dominio.com/NAXVO_Movil/backend/public/webhooks/mercadopago.php
```

Copia la clave secreta generada por Mercado Pago a `MP_WEBHOOK_SECRET`.

## 3. Base de datos

Ejecuta `backend/database/012_sprint2_pagos_funcional.sql` sobre la base `naxvo` si todavía no fue aplicada.

## 4. Dependencia PHP

Desde `backend/` ejecuta:

```bash
composer install --no-dev --optimize-autoloader
```

El proyecto también incluye un fallback REST con cURL, pero el SDK oficial es la ruta recomendada cuando Composer está disponible.

## 5. Prueba real controlada

1. Cliente crea una solicitud con `Mercado Pago`.
2. Profesional acepta la solicitud y envía cotización.
3. Cliente acepta la cotización.
4. Cliente abre **Pago del servicio > Pagar con Mercado Pago**.
5. El backend crea una preferencia con el monto de la cotización y una `external_reference` única.
6. La app abre el `init_point` de Mercado Pago.
7. Al volver a NAXVO, la app vuelve a consultar Mercado Pago. En producción, el Webhook actualiza el estado aunque la app no esté abierta.
8. NAXVO solo marca `estado_pago=pagado` después de recibir/consultar un pago `approved` cuyo importe y moneda coinciden con el intento registrado.

## Importante

El ZIP no incluye credenciales reales por seguridad. Sin `MP_ACCESS_TOKEN`, el botón de Mercado Pago muestra un error de configuración en lugar de simular un cobro.
