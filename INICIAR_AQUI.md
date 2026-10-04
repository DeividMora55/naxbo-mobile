# NAXVO · React Native + XAMPP

Este proyecto usa únicamente:

- React Native + Expo + TypeScript para la app móvil.
- PHP + Apache de XAMPP para la API.
- MariaDB/MySQL de XAMPP para la base de datos.

## 1. Coloca el proyecto en XAMPP

La carpeta debe quedar exactamente en:

`C:\xampp\htdocs\NAXVO_Movil`

La app detecta automáticamente la IP de la computadora desde Expo y construye la URL de la API de XAMPP.

## 2. Base de datos

Enciende Apache y MySQL en XAMPP.

En phpMyAdmin crea una base llamada:

`naxvo`

Importa:

`backend/database/naxvo_xampp_sprint2_completo.sql`

Este archivo incluye la estructura actual y la migración del Sprint 2 (efectivo + Mercado Pago). Si ya importaste `naxvo_xampp_completo.sql`, no vuelvas a importar la base completa: usa únicamente la migración `012_sprint2_pagos_funcional.sql`.

### Si ya tienes una base `naxvo` existente

Haz primero un respaldo y ejecuta una sola vez:

`backend/database/011_estabilizacion_actual.sql`

y después, una sola vez:

`backend/database/012_sprint2_pagos_funcional.sql`

Los scripts están preparados para conservar tus registros existentes.

## 3. Backend

Ya se incluye `backend/.env` preparado para el XAMPP estándar:

- host: 127.0.0.1
- base: naxvo
- usuario: root
- contraseña: vacía

Si tu MySQL tiene otra contraseña, cambia `DB_PASS` en `backend/.env`.

Prueba en la PC:

`http://localhost/NAXVO_Movil/backend/public/api/v1/health.php`

Debe responder JSON con `ok: true`.

## 4. React Native

En PowerShell:

```powershell
cd C:\xampp\htdocs\NAXVO_Movil\mobile
npm ci
npm run typecheck
npx expo start --clear --lan
```

Escanea el QR con Expo Go.

### Teléfono físico

El teléfono y la computadora deben estar conectados a la misma red Wi-Fi. Esto es necesario porque XAMPP está corriendo dentro de tu computadora y no está publicado en Internet.

No tienes que escribir la IP manualmente: durante desarrollo la app usa la dirección LAN que Expo le entrega.

Si Windows pregunta por acceso de red para Apache o Node, permite redes privadas.

## 5. Si cambias el nombre de la carpeta

El nombre esperado es `NAXVO_Movil`. Si lo cambias, puedes crear `mobile/.env` y especificar manualmente:

`EXPO_PUBLIC_API_URL=http://IP-DE-TU-PC/NOMBRE/backend/public/api/v1`

## 6. Qué se mantiene

La app conserva la interfaz móvil de NAXVO y sus funciones de cliente, trabajador y administrador: registro, login, perfiles, foto, profesión, verificación, portafolio, favoritos, solicitudes, chat, notificaciones, apariencia y accesibilidad.


## 7. Sprint 2 · Pagos

La app incluye pago en efectivo con doble confirmación y Mercado Pago Checkout Pro real. El flujo móvil ya no cae automáticamente a una simulación: para cobrar con Mercado Pago configura `MP_ACCESS_TOKEN` y, para producción, `MP_WEBHOOK_SECRET` + una `APP_URL` HTTPS pública. Consulta `MERCADOPAGO_REAL.md`.
