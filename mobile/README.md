# NAXVO Mobile

React Native + Expo + TypeScript conectado al backend PHP de XAMPP.

## Instalación limpia

No copies ni guardes `node_modules` dentro del proyecto. Las dependencias se reconstruyen desde `package-lock.json`:

```powershell
cd C:\xampp\htdocs\NAXVO_Movil\mobile
npm ci
npm run typecheck
npx expo start --clear --lan
```

Durante desarrollo la URL de XAMPP se detecta automáticamente desde el host de Expo. La carpeta raíz esperada en XAMPP es `NAXVO_Movil`.

Si necesitas usar otra ruta o un backend remoto, crea `mobile/.env` a partir de `.env.example` y define `EXPO_PUBLIC_API_URL`.
