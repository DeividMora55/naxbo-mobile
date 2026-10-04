@echo off
npm ci
npm run typecheck
echo.
echo Listo. Ejecuta: npx expo start --clear --lan
