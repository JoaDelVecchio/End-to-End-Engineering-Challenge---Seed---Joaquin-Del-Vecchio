# Panel de ventas: órdenes y preguntas

Challenge full-stack para vendedores de MELI. La idea es simple: un vendedor necesita ver sus órdenes recientes, entender qué productos se compraron, responder preguntas de compradores y priorizar los casos más importantes sin depender de mails sueltos.

## Qué construimos

- Dashboard para consultar órdenes recientes de un vendedor.
- Órdenes con comprador, estado, fecha, total y múltiples productos por compra.
- Filtros por texto, estado y rango de fechas.
- Detalle de orden con productos, preguntas, respuestas y resolución.
- Cola de prioridad para preguntas sin resolver.
- Lógica propia para clasificar preguntas como `low`, `medium`, `high` o `critical`.
- Notificación simulada por consola cuando una pregunta nueva queda en prioridad alta o crítica.
- Dataset precargado para mostrar escenarios realistas sin depender de una base externa.

## Stack

| Capa           | Tecnología                               |
| -------------- | ---------------------------------------- |
| Frontend       | React, Vite, TypeScript                  |
| Backend        | Node.js, Express, TypeScript             |
| Validación API | Zod                                      |
| Tests          | Jest, Supertest, Playwright              |
| UI             | CSS, responsive, iconos con lucide-react |

## Arquitectura

```text
Frontend React + Vite
Dashboard, filtros, acciones
          |
          | HTTP
          v
Backend Express + TypeScript
API, validacion, reglas
          |
          v
JSON Store + seed data
Persistencia local demo
```

El backend decide transiciones de estado, prioridad de preguntas, validaciones y notificaciones. El frontend consume esa información y se ocupa de la experiencia del vendedor.

## Cómo correrlo localmente

Desde la raíz del proyecto:

```bash
npm run install:all
npm run seed
npm run dev
```

URLs locales:

- Frontend: `http://127.0.0.1:3000`
- Backend API: `http://127.0.0.1:8080/api`
- Health check: `http://127.0.0.1:8080/api/health`

También se pueden levantar por separado:

```bash
npm run dev:api
npm run dev:web
```

## Variables de entorno

Para desarrollo local no hace falta configurar nada: hay defaults seguros. Para deploy o cambios de puertos/orígenes, usar `.env.example` como guía.

```env
# Backend
PORT=8080
CLIENT_ORIGINS=http://127.0.0.1:3000,http://localhost:3000

# Frontend
VITE_API_URL=http://127.0.0.1:8080/api
```

- `PORT`: puerto del backend.
- `CLIENT_ORIGINS`: orígenes permitidos por CORS, separados por coma.
- `VITE_API_URL`: URL base que usa el frontend para llamar a la API.

CORS no queda abierto con `*`: se permiten los orígenes configurados. Esto deja el proyecto listo para local y para un deploy donde el frontend viva en otro dominio.

## Tests y build

```bash
npm test
npm run build
```

Para los tests end-to-end:

```bash
npx playwright install chromium
npm run test:e2e
```

`npm run test:e2e` regenera el seed y levanta backend + frontend para la prueba. Si ya tenés servidores manuales abiertos en `3000` o `8080`, frenalos antes para que Playwright use una instancia limpia.

Qué cubren los tests:

- Dominio backend: transiciones de estados y prioridad de preguntas.
- API backend: filtros, errores defensivos, respuestas, resolución y notificaciones.
- Frontend: helpers puros, selección, filtros, métricas y render de preguntas.
- E2E: flujo real de vendedor en navegador, incluyendo cola de prioridad, filtros, respuesta y resolución.

## Datos de demo

El seed vive en:

```text
backend/src/data/seedData.ts
```

`npm run seed` genera:

```text
backend/data/store.json
```

Si el backend arranca y ese archivo no existe, lo crea automáticamente desde el mismo seed.

El dataset incluye:

- Vendedores.
- Productos por vendedor.
- Órdenes con varios productos y precios al momento de compra.
- Estados distintos de orden.
- Preguntas abiertas, respondidas y resueltas.
- Casos críticos para demostrar la cola de prioridad.

## API principal

```http
GET /api/health
GET /api/sellers/:sellerId
```

```http
GET /api/sellers/:sellerId/orders
GET /api/sellers/:sellerId/orders?status=shipped&buyer=ana
GET /api/sellers/:sellerId/orders?from=2026-06-01&to=2026-06-06
PATCH /api/orders/:orderId/status
```

```http
GET /api/sellers/:sellerId/questions/unresolved
POST /api/orders/:orderId/questions
POST /api/questions/:questionId/replies
PATCH /api/questions/:questionId/resolve
```

## Ciclo de vida de órdenes

Transiciones válidas:

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

Las transiciones inválidas devuelven error. Preferí validar esto en backend para que la UI no sea la única línea de defensa.

## Ciclo de vida de preguntas

Las preguntas tienen un ciclo propio, separado del estado logístico de la orden:

```text
open -> answered
open | answered -> resolved
resolved -> open
```

Una orden entregada puede seguir teniendo una pregunta en prioridad si la conversación todavía no está resuelta. Esto es intencional: `delivered` cierra la parte logística, pero no necesariamente cierra el problema del comprador.

Para reducir errores humanos:

- `Resolver` pide confirmación inline porque saca la pregunta de la cola de prioridad.
- Una pregunta resuelta se puede `Reabrir` desde el detalle de la orden.
- Los cambios de estado de orden también piden confirmación inline. No habilité rollback libre de órdenes porque en un flujo real esos estados deberían ser auditables y más controlados.

## Prioridad de preguntas

La consigna decía que Operaciones quería ver primero las preguntas más importantes, pero no definía qué significa “importante”.

La decisión fue usar una fórmula. En vez de ordenar solo por fecha o solo por valor de orden, la prioridad combina cuatro dimensiones:

- **Impacto:** cuánto puede afectar al negocio o al vendedor. Por ejemplo, valor total de la orden, producto caro o categoría de mayor riesgo.
- **Urgencia:** cuánto tiempo lleva esperando la pregunta.
- **Riesgo operativo:** estado de la orden y posibilidad de que el caso escale. Por ejemplo, una orden enviada, entregada o cancelada con una pregunta activa.
- **Intención del comprador:** señales del texto, como devolución, reembolso, reclamo, urgente, roto, dañado, no funciona o no llegó.

En el código eso se traduce en estas señales:

- Valor total de la orden.
- Tiempo de espera de la pregunta.
- Estado de la orden.
- Palabras críticas: devolución, reembolso, reclamo, urgente, roto, dañado, no funciona, no llegó.
- Palabras de envío: envío, entrega, dirección, paquete, seguimiento, demora.
- Categorías de mayor riesgo, como electrónica o autopartes.
- Valor del producto referenciado, si la pregunta apunta a un producto específico.

Niveles:

```text
critical >= 75
high     >= 50
medium   >= 25
low      < 25
```

Orden de la cola:

1. Nivel de prioridad.
2. Score.
3. Pregunta más antigua.

La API devuelve `priority.score` y `priority.reasons` para que la decisión se pueda explicar.

Con datos reales, esta regla podría evolucionar. Por ejemplo, Operaciones podría revisar qué preguntas terminaron en reclamos, devoluciones, cancelaciones o baja satisfacción y ajustar pesos/umbrales con evidencia. Más adelante también se podría usar IA para clasificar intención o riesgo del mensaje, pero recién tendría sentido con ejemplos históricos y validación humana; para este challenge preferí una regla transparente, fácil de testear y fácil de defender.

## Notificaciones

Cuando una pregunta nueva queda como `high` o `critical`, el backend dispara un `Notifier`. No se notifica por cualquier pregunta para evitar ruido: una consulta normal queda en la cola, pero una pregunta urgente o crítica además genera alerta.

Hoy se usa:

```text
ConsoleEmailNotifier
```

Simula un email con un log en la consola donde corre el backend. Se ve al crear una pregunta nueva de prioridad alta o crítica, por ejemplo desde `POST /api/orders/:orderId/questions`. No se dispara al responder, resolver o reabrir una pregunta.

La extensión para Slack o SMS ya queda preparada con la interfaz `Notifier`. Para sumar otro canal no habría que cambiar las rutas ni la lógica de preguntas: se crea otro notifier, por ejemplo `SlackNotifier` o `SmsNotifier`, y se conecta en la configuración del servidor.

Si se quisieran mandar varios canales a la vez, `CompositeNotifier` permite combinar implementaciones:

```text
CompositeNotifier([
  ConsoleEmailNotifier,
  SlackNotifier,
  SmsNotifier
])
```

Así el caso de uso sigue dependiendo de una abstracción (`Notifier`) y no de un canal específico.

## UX, performance y seguridad

- Los filtros se aplican en memoria porque el dataset es local y chico.
- No agregué debounce para esos filtros porque no hay llamadas al backend en cada tecla. En producción, si la búsqueda fuera remota, sí usaría debounce y cancelación de requests para evitar race conditions y tráfico innecesario.
- Las cargas iniciales se hacen en paralelo.
- Las respuestas viejas de refresh se ignoran para evitar pisar datos nuevos.
- Las acciones del vendedor tienen estado pendiente para evitar dobles envíos.
- Los errores se muestran sin borrar el dashboard cargado.
- La API valida payloads con Zod y devuelve errores JSON consistentes.
- Las rutas desconocidas devuelven `404` JSON.
- CORS se configura por entorno.

## HackerRank

Este repo debe correr con comandos npm desde la raíz:

```bash
npm run install:all
npm run build
npm test
npm start
```

## Estructura del repo

```text
backend/
  src/api/                 # Express app y endpoints
  src/config/              # Configuración por entorno
  src/data/                # Seed y store local
  src/domain/              # Reglas de negocio
  src/scripts/             # Seed script
  src/services/            # Notificaciones

frontend/
  src/api/                 # Cliente HTTP y operaciones API
  src/components/          # Componentes presentacionales
  src/constants/           # Labels y constantes UI
  src/domain/              # Tipos del frontend
  src/hooks/               # Estado y orquestación del dashboard
  src/utils/               # Helpers puros y tests

tests/e2e/                 # Playwright
docs/superpowers/          # Specs y planes usados durante el desarrollo
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

Si el IDE de HackerRank ejecuta `npm start` parado dentro de `frontend/`, ese script también levanta backend + frontend delegando al proyecto raíz.
