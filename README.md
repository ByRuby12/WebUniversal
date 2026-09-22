# WebUniversal

Plataforma web para crear, publicar y administrar sitios profesionales para negocios y servicios. Cada negocio puede tener su propia identidad, contenido, módulos y formulario de contacto.

## Enlaces

- **Repositorio público:** [github.com/ByRuby12/WebUniversal](https://github.com/ByRuby12/WebUniversal)
- **Web publicada:** [byruby12.github.io/WebUniversal](https://byruby12.github.io/WebUniversal/)
- **Sitio cliente:** [Abrir web pública](https://byruby12.github.io/WebUniversal/)
- **Acceso de administrador:** [Iniciar sesión](https://byruby12.github.io/WebUniversal/login)
- **Panel de administración:** [Abrir panel](https://byruby12.github.io/WebUniversal/admin)

El panel `https://byruby12.github.io/WebUniversal/admin` requiere una sesión válida de Firebase. Si no hay una sesión iniciada, la aplicación redirige automáticamente a `https://byruby12.github.io/WebUniversal/login`.

## Qué incluye

### Sitio público del cliente

- Página principal con identidad visual, imagen, descripción, servicios e historia del negocio.
- Galería de trabajos, preguntas frecuentes y reseñas aprobadas.
- Páginas personalizadas publicadas desde el panel.
- Formularios para consultas, reservas y solicitudes de presupuesto.
- Enlaces directos a teléfono, email, WhatsApp y redes sociales.
- Soporte en español e inglés.
- Modo claro y modo oscuro.
- Modo mantenimiento y aviso para sitios todavía no publicados.
- Secciones configurables para precios, equipo, proceso de trabajo y zonas de servicio.
- Información legal: privacidad, términos, devoluciones y soporte.
- SEO dinámico con título, descripción, palabras clave, favicon, Open Graph, URL canónica e indexación.

Los módulos disponibles se activan de forma independiente para cada negocio: reservas, presupuestos, formularios, galería, reseñas, preguntas frecuentes, redes sociales, precios, equipo y zonas de servicio.

### Panel de administración

- Resumen del negocio y métricas principales.
- Creación, edición, selección, publicación y ocultación de negocios.
- Gestión de identidad, contacto, imágenes, servicios, historia y zonas de servicio.
- Edición de contenido en español e inglés.
- Configuración de páginas personalizadas, redes, preguntas frecuentes y textos legales.
- Activación y desactivación de módulos públicos.
- Gestión de mensajes y solicitudes recibidas.
- Estados de solicitudes: nuevas, en estudio, confirmadas y canceladas.
- Notas internas y seguimiento de solicitudes contestadas.
- Estadísticas de visitas, solicitudes, conversión y negocios activos.
- Ajustes de formularios, WhatsApp, cookies, mantenimiento, analítica, aprobación e indexación.
- Gestión del perfil y credenciales de Firebase.
- Área de soporte.

## Rutas publicadas

Todas las rutas parten de `https://byruby12.github.io/WebUniversal/`:

| URL pública | Descripción |
| --- | --- |
| [https://byruby12.github.io/WebUniversal/](https://byruby12.github.io/WebUniversal/) | Sitio público del negocio seleccionado o del primer negocio publicado. |
| `https://byruby12.github.io/WebUniversal/site/:businessId` | Sitio público de un negocio concreto. Sustituye `:businessId` por el identificador del negocio. |
| [https://byruby12.github.io/WebUniversal/login](https://byruby12.github.io/WebUniversal/login) | Acceso de administradores. |
| [https://byruby12.github.io/WebUniversal/admin](https://byruby12.github.io/WebUniversal/admin) | Panel protegido de administración. |

Las rutas desconocidas redirigen a `https://byruby12.github.io/WebUniversal/`.

## Tecnologías

- Vue 3 con `<script setup>`.
- TypeScript.
- Vite.
- Vue Router.
- Pinia.
- Firebase Authentication, Firestore y App Check.
- `lucide-vue-next` para iconos.
- GitHub Actions y GitHub Pages para el despliegue.

## Instalación local

Necesitas Node.js 22 o una versión compatible.

```bash
npm install
npm run dev
```

Comandos disponibles:

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Comprobación TypeScript y build de producción
npm run lint     # Comprobación TypeScript
npm run preview  # Previsualización del build
```

## Configuración de Firebase

Crea un archivo `.env.local` en la raíz del proyecto con las variables de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_APPCHECK_SITE_KEY=tu_site_key
```

`VITE_FIREBASE_APPCHECK_SITE_KEY` es opcional. Las seis primeras variables son necesarias para conectar la aplicación con Firebase.

En Firebase debes configurar:

1. Authentication para las cuentas de administración.
2. Firestore para negocios, solicitudes, perfiles y métricas.
3. Storage para imágenes públicas.
4. App Check si se utiliza reCAPTCHA.
5. Los dominios autorizados, incluyendo `byruby12.github.io`.

Las reglas de seguridad están en [firestore.rules](firestore.rules) y [storage.rules](storage.rules). Los datos privados se guardan bajo `users/{uid}` y los negocios publicados se exponen mediante `publicBusinesses/{businessId}`.

No subas `.env.local` ni credenciales privadas al repositorio.

## Despliegue en GitHub Pages

El despliegue está automatizado en [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml). Se ejecuta cuando se hace push a `main` o manualmente desde GitHub Actions.

El workflow:

1. Instala Node.js 22 y las dependencias.
2. Ejecuta `npm run build`.
3. Genera el fallback `dist/404.html` para que funcionen `/login` y `/admin` al recargar la página.
4. Publica la carpeta `dist` en GitHub Pages.

La base de Vite está configurada como `/WebUniversal/` en [vite.config.ts](vite.config.ts), que corresponde al nombre del repositorio y a la URL publicada.

En GitHub, abre **Settings → Pages** y selecciona **GitHub Actions** como fuente de despliegue.

## Estructura principal

```text
src/
├── components/admin/     Componentes del panel de administración
├── composables/          Lógica reutilizable de formularios y workspace
├── data/                 Catálogos y contenido inicial por sector
├── router/               Rutas y protección de acceso
├── services/             Firebase, autenticación, solicitudes y workspace
├── stores/               Estado global de la aplicación
├── views/                Sitio público, login y panel admin
└── types/                Tipos TypeScript
```

## Seguridad y datos

- Los perfiles, ajustes y estadísticas privadas solo deben ser accesibles por su usuario autenticado.
- Los negocios públicos se sirven desde una copia filtrada de los datos publicables.
- Las solicitudes públicas deben validarse antes de guardarse.
- Las reglas de Firestore y Storage deben revisarse antes de usar la aplicación en producción.
