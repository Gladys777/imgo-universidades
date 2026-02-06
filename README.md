# UniTrivago Colombia (demo → escala a “Trivago real”)

Metabuscador tipo “Trivago” para instituciones y programas en Colombia.

Incluye:
- Metabúsqueda
- Filtros avanzados (presupuesto, ciudad, modalidad, duración, nivel, área)
- Comparación (hasta 4 programas) + link compartible
- Favoritos / alertas (demo local)
- Captura de leads + CRM demo (/admin)
- Analytics demo: tracción, embudo, retención básica (/insights)
- Indicadores verificables (SNIES/IES, modalidades, sedes, etc.)
- Enlace al sitio web oficial + estado (validado / revisar / sin validar)

## Deploy en Vercel (serverless)

Este repo ya trae una carpeta `/api` compatible con **Vercel Functions** para:
- `/api/health`
- `/api/events`
- `/api/leads`
- `/api/agreements`
- `/api/metrics`

### Persistencia
- **Demo local**: se guarda en `server/data/db.json` (Express) o fallback local.
- **Vercel**: el filesystem es efímero. Para persistencia real, habilita **Vercel KV** y define las variables de entorno; el código en `/api/_store.js` intentará usar `@vercel/kv` automáticamente.

### Variables de entorno
- `ADMIN_TOKEN` (por defecto: `admin-demo`)

### SPA Routing
Incluye `vercel.json` con rewrites para que React Router funcione en producción.
