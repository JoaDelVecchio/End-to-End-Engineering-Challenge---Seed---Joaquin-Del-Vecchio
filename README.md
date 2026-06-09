# Panel de ventas: órdenes y preguntas

Dashboard full-stack para vendedores de MELI. Permite revisar órdenes recientes, ver productos comprados, responder preguntas de compradores y priorizar casos importantes.

- Demo online: [https://meli-seller-dashboard-push.vercel.app](https://meli-seller-dashboard-push.vercel.app)

## Qué incluye

- Dashboard de órdenes por vendedor.
- Órdenes con comprador, estado, fecha, total y múltiples productos.
- Filtros por texto, estado y rango de fechas.
- Detalle de orden con productos, preguntas, respuestas y resolución.
- Cola de prioridad para preguntas pendientes de resolución.
- Clasificación de prioridad: `low`, `medium`, `high`, `critical`.
- Notificación simulada por consola para preguntas `high` o `critical`.
- Cancelación de órdenes pagadas o en preparación.
- Seed local con datos de demo, sin depender de servicios externos.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React, Vite, TypeScript |
| Backend | Node.js, Express, TypeScript |
| API | Zod, JSON responses |
| Tests | Jest, Supertest, Playwright |
| UI | SCSS responsive, lucide-react |

## Correr local

Desde la raíz del proyecto:

```bash
npm run install:all
npm run seed
npm run dev
```

URLs locales:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`
- Health check: `http://localhost:8080/api/health`

En desarrollo, el frontend consume `/api` y Vite lo proxya al backend local.

También se pueden levantar por separado:

```bash
npm run dev:api
npm run dev:web
```

## Variables de entorno

Para local no hace falta crear `.env`. Los defaults ya funcionan.

```env
# Backend
PORT=8080
CLIENT_ORIGINS=http://127.0.0.1:3000,http://localhost:3000

# Frontend
VITE_API_URL=/api
```

- `PORT`: puerto del backend.
- `CLIENT_ORIGINS`: orígenes permitidos por CORS cuando la API se consume directo.
- `VITE_API_URL`: base URL que usa el frontend. Mantener `/api` si frontend y API comparten origen o si Vite usa proxy.

Si se separan frontend y backend en dominios distintos, configurar `VITE_API_URL` con la URL pública del backend y agregar el dominio del frontend a `CLIENT_ORIGINS`.

## Tests y build

```bash
npm run lint
npm test
npm run build
npm run check
```

Tests end-to-end:

```bash
npx playwright install chromium
npm run test:e2e
```

`npm run test:e2e` regenera el seed y levanta una instancia limpia de backend + frontend. Conviene frenar servidores abiertos en `3000` o `8080` antes de correrlo.

## Datos de demo

El seed vive en:

```text
backend/src/data/seedData.ts
```

`npm run seed` genera:

```text
backend/data/store.json
```

Si el backend arranca y ese archivo no existe, lo crea automáticamente desde el seed.

## API principal

```http
GET /api/health
GET /api/sellers/:sellerId
GET /api/sellers/:sellerId/orders
GET /api/sellers/:sellerId/orders?status=shipped&buyer=ana
GET /api/sellers/:sellerId/orders?from=2026-06-01&to=2026-06-06
GET /api/sellers/:sellerId/questions/unresolved

POST /api/orders/:orderId/questions
POST /api/questions/:questionId/replies

PATCH /api/orders/:orderId/status
PATCH /api/questions/:questionId/resolve
PATCH /api/questions/:questionId/reopen
```

## Reglas de negocio

Transiciones válidas de órdenes:

```text
new -> paid
paid -> packing | cancelled
packing -> shipped | cancelled
shipped -> delivered
```

Estados terminales:

```text
delivered
cancelled
```

Las preguntas tienen ciclo propio:

```text
open -> answered
open | answered -> resolved
resolved -> open
```

Responder una pregunta no la saca de la cola. Una pregunta `answered` sigue pendiente de resolución hasta que el vendedor la marca como `resolved`.

Categorías internas:

```text
electronics
office
supplies
home
```

La prioridad de preguntas combina:

- Valor de la orden.
- Antigüedad de la pregunta.
- Estado de la orden.
- Palabras de riesgo, como devolución, reembolso, urgente, roto, dañado o no llegó.
- Categoría y valor del producto referenciado.

En el seed actual, `electronics` es la única categoría con boost de riesgo.

Niveles:

```text
critical >= 75
high     >= 50
medium   >= 25
low      < 25
```

La API devuelve `priority.score` y `priority.reasons` para que la decisión sea explicable.

## Decisiones de UX y seguridad

- Los filtros se aplican en memoria porque el dataset es chico y ya está cargado en el frontend.
- No se agregó debounce en filtros porque no disparan requests por tecla. Si la búsqueda pasara al backend, agregaría debounce y cancelación de requests para evitar tráfico innecesario y race conditions.
- Las cargas iniciales se hacen en paralelo y las respuestas viejas se ignoran para no pisar datos más nuevos.
- Las acciones del vendedor muestran estado pendiente por entidad para evitar dobles envíos sin bloquear todo el panel.
- Después de responder, resolver, reabrir o cambiar estado se recargan órdenes y preguntas; no se recarga la identidad del seller.
- Los errores no borran el dashboard ya cargado; se muestran como feedback sin romper el contexto.
- Resolver preguntas y cambiar estados pide confirmación inline porque son acciones que alteran la cola o el estado logístico.
- Cancelar una orden está disponible para `paid` y `packing`, que son las transiciones válidas del dominio.
- El backend valida payloads con Zod y devuelve errores JSON consistentes con `code` y `message`. La UI ayuda, pero la regla final queda en la API.

## Simular una pregunta crítica

Con el backend corriendo:

```bash
npm --prefix backend run simulate:critical
```

El script crea una pregunta crítica en `ord-1002`. La notificación simulada aparece en la consola donde corre el backend.

## Estructura

```text
api/index.ts              # Adapter serverless para Vercel; delega en la API Express
backend/src/api/          # Express app, routes, controllers, schemas y middleware
backend/src/config/       # Configuración por entorno
backend/src/data/         # Seed y store local
backend/src/domain/       # Reglas puras de negocio, categorías y prioridad
backend/src/errors/       # Errores controlados
backend/src/services/     # Casos de aplicación y notificaciones
backend/src/scripts/      # Seed y scripts operativos
frontend/src/api/         # Cliente HTTP
frontend/src/components/  # UI
frontend/src/hooks/       # Estado y orquestación
frontend/src/utils/       # Helpers y tests
e2e/                      # Playwright
```

## Comandos útiles

```bash
npm run dev          # backend + frontend
npm start            # alias de npm run dev
npm run dev:api      # solo backend
npm run dev:web      # solo frontend
npm run seed         # regenerar datos demo
npm --prefix backend run simulate:critical
npm run lint         # análisis estático
npm test             # tests backend + frontend
npm run test:e2e     # tests de navegador
npm run build        # build completa
npm run check        # lint + tests + build
```
