#!/usr/bin/env sh
set -e
npm ci
npm run typecheck
printf '\nListo. Ejecuta: npx expo start --clear --lan\n'
