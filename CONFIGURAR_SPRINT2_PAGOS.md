# NAXVO · Configuración Sprint 2 (Pagos)

El flujo actual de Mercado Pago está configurado para **Checkout Pro real**, no para simulación automática.

## Base de datos

Importa una sola vez `backend/database/012_sprint2_pagos_funcional.sql` sobre la base `naxvo`.

## Mercado Pago real

En `backend/.env` coloca tus credenciales de Mercado Pago:

```env
PAYMENT_LOCAL_SIMULATION=0
MP_ACCESS_TOKEN=TU_ACCESS_TOKEN_REAL
MP_WEBHOOK_SECRET=TU_CLAVE_SECRETA_DE_WEBHOOK
```

Las credenciales nunca deben colocarse en la app móvil. El backend crea la preferencia y valida el resultado.

Para producción configura también una `APP_URL` HTTPS pública y registra el evento **Pagos** en Mercado Pago apuntando a:

`https://TU-DOMINIO/NAXVO_Movil/backend/public/webhooks/mercadopago.php`

Consulta **`MERCADOPAGO_REAL.md`** para el procedimiento completo y la prueba paso a paso.
