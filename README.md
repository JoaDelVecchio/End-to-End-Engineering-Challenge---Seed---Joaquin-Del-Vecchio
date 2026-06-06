# Panel de ventas: órdenes y preguntas

Dashboard full-stack para vendedores de MELI. Permite revisar órdenes recientes, ver productos comprados, responder preguntas de compradores y priorizar casos importantes.

- Demo online: [https://meli-seller-dashboard-push.vercel.app](https://meli-seller-dashboard-push.vercel.app)
- Video demo: [Google Drive](https://drive.google.com/file/d/1TOPdWQH04NAgXlwHu7EjeQRrZesIhCZo/view?usp=sharing)

## Qué incluye

- Dashboard de órdenes por vendedor.
- Órdenes con comprador, estado, fecha, total y múltiples productos.
- Filtros por texto, estado y rango de fechas.
- Detalle de orden con productos, preguntas, respuestas y resolución.
- Cola de prioridad para preguntas sin resolver.
- Clasificación de prioridad: `low`, `medium`, `high`, `critical`.
- Notificación simulada por consola para preguntas `high` o `critical`.
- Seed local con datos de demo, sin depender de servicios externos.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React, Vite, TypeScript |
| Backend | Node.js, Express, TypeScript |
| API | Zod, JSON responses |
| Tests | Jest, Supertest, Playwright |
| UI | CSS responsive, lucide-react |

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

También se pueden levantar por separado:

```bash
npm run dev:api
npm run dev:web
```

## Local y HackerRank

- El frontend usa `/api` por default.
- Vite proxya `/api` a `http://127.0.0.1:8080`.
- Vite escucha en `0.0.0.0:3000`.
- `server.allowedHosts` y `preview.allowedHosts` están habilitados para correr en hosts dinámicos como HackerRank.
- Si HackerRank abre el puerto `8080`, eso muestra solo la API. La UI corre en el puerto `3000`.

El comando `npm start` desde `frontend/` delega al `npm run dev` de la raíz, por eso levanta backend y frontend juntos.

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
npm test
npm run build
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

La prioridad de preguntas combina:

- Valor de la orden.
- Antigüedad de la pregunta.
- Estado de la orden.
- Palabras de riesgo, como devolución, reembolso, urgente, roto, dañado o no llegó.
- Categoría y valor del producto referenciado.

Niveles:

```text
critical >= 75
high     >= 50
medium   >= 25
low      < 25
```

La API devuelve `priority.score` y `priority.reasons` para que la decisión sea explicable.

## Estructura

```text
api/                     # Serverless API routes
backend/src/api/          # Express app y endpoints
backend/src/config/       # Configuración por entorno
backend/src/data/         # Seed y store local
backend/src/domain/       # Reglas de negocio
backend/src/services/     # Notificaciones
frontend/src/api/         # Cliente HTTP
frontend/src/components/  # UI
frontend/src/hooks/       # Estado y orquestación
frontend/src/utils/       # Helpers y tests
tests/e2e/                # Playwright
```

## Comandos útiles

```bash
npm run dev          # backend + frontend
npm run dev:api      # solo backend
npm run dev:web      # solo frontend
npm run seed         # regenerar datos demo
npm test             # tests backend + frontend
npm run test:e2e     # tests de navegador
npm run build        # build completa
```
