# Prueba funcional del Sprint 2

Usa dos cuentas: un **cliente** y un **trabajador verificado**.

## A. Efectivo

1. Cliente crea una solicitud y elige **Efectivo**.
2. Trabajador acepta/asigna la solicitud y envía una cotización.
3. Cliente acepta la cotización.
4. Trabajador pulsa **Iniciar servicio**.
5. Cliente abre **Pago** y pulsa **Marcar efectivo como entregado**.
6. Comprueba que el trabajador vea **Cliente indicó efectivo entregado**.
7. Trabajador pulsa **Confirmar efectivo recibido**.
8. Comprueba en ambas cuentas: estado **Pagado**, referencia registrada y evento en actividad.
9. Trabajador solicita finalización; cliente ya puede confirmar el servicio.

Prueba negativa: antes del paso 5, el trabajador no debe poder confirmar efectivo. Antes de aparecer `Pagado`, el cliente no debe poder cerrar definitivamente el servicio.

## B. Mercado Pago local, sin credenciales

1. En `backend/.env`: `APP_DEBUG=1`, `PAYMENT_LOCAL_SIMULATION=1`, `MP_ACCESS_TOKEN=` vacío.
2. Cliente crea una solicitud con **Mercado Pago**.
3. Trabajador cotiza; cliente acepta.
4. Cliente abre **Pago** → **Pagar con Mercado Pago**.
5. Debe aparecer **Modo de prueba local**.
6. Prueba **pendiente** y **rechazado**: el sistema no debe marcar pagado.
7. Prueba **aprobado**: debe cambiar a **Pagado**, registrar transacción, evento y notificaciones.

## C. Mercado Pago real

1. Configura `MP_ACCESS_TOKEN` en `backend/.env`.
2. Reinicia Apache para asegurar que PHP relea la configuración si fuera necesario.
3. Crea/acepta una cotización con método Mercado Pago.
4. Abre el módulo de pago y pulsa **Pagar con Mercado Pago**.
5. Debe abrirse Checkout Pro en `https://` de Mercado Pago.
6. Al volver a NAXVO pulsa **Actualizar estado del pago**. El backend consulta a Mercado Pago por `external_reference`; esto funciona aunque XAMPP no sea público.

## D. Webhook

Para probar el algoritmo de firma sin depender de Internet:

```powershell
cd C:\xampp\htdocs\NAXVO_Movil\backend
C:\xampp\php\php.exe tools\test-mercadopago-webhook.php
```

Debe mostrar dos `OK`.

Para Webhook real, configura `MP_WEBHOOK_SECRET`, `APP_URL` HTTPS público y registra `.../webhooks/mercadopago.php` en Mercado Pago.
