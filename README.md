# Web Universal Trabajos - Vue

Aplicacion Vue 3 + TypeScript para crear webs profesionales por sector, administrar negocios y recibir solicitudes publicas.

## Desarrollo

```bash
npm install
npm run dev
npm run build
npm run lint
```

La aplicacion usa Firebase Authentication y Firestore. Necesitas un archivo `.env.local` con las variables `VITE_FIREBASE_*` para iniciar la conexion.

## Rutas

- `/login`: acceso de administradores.
- `/admin`: panel protegido.
- `/`: web publica del primer negocio publicado.
- `/site/:businessId`: web publica de un negocio concreto.

La web publica no incluye la calculadora de orientacion. Los formularios usan un unico modal, sin panel lateral duplicado.

## Firebase

Los documentos privados deben mantenerse bajo `users/{uid}`. Para lectura publica usa `publicBusinesses/{businessId}` con una copia filtrada de los campos publicables. No expongas perfiles, ajustes, estadisticas ni todos los negocios privados. Las solicitudes publicas deben validarse mediante una Cloud Function o una escritura controlada.

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
