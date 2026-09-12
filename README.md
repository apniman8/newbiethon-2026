# Easy-Transfer Backend

Easy-Transfer is a hackathon proof of concept for English turn-by-turn indoor transfer guidance at Seoul Station.

The Phase 0 backend uses an immutable, versioned indoor graph and profile-aware routing. It deliberately has no database or live external API dependency so the demo remains reproducible offline.

## Phase 0 scope

- Map: `SEOUL_STATION_KTX_TO_AREX`
- Profiles exposed to users: `STANDARD`, `LUGGAGE`
- Place selection by stable `placeId`
- Directed indoor graph loaded from a versioned JSON resource
- Dijkstra route finding with a per-request cost policy
- English route steps and stable error responses
- Frontend images selected locally with `step.toNodeId`

The JPA/PostgreSQL Sample CRUD from the boilerplate has been removed. External facility APIs, Vision/OCR, graph persistence and verified wheelchair routing are outside Phase 0.

## Shared API contracts

The frozen frontend fixtures are under [`contracts/v1.1`](contracts/v1.1):

- `places-contract-v1.1.json`
- `route-contract-v1.1.json`
- `route-enums-v1.1.md`
- `node-image-key-v1.1.json`

The planned endpoints are:

```text
GET  /api/v1/maps/{mapId}/places
POST /api/v1/routes
```

## Run checks

```bash
cd backend
./mvnw test
```

No local PostgreSQL instance or `.env` file is required.

## Existing deployment utilities

- Swagger UI: `/swagger-ui/index.html`
- Health check: `/actuator/health`
- OpenAPI JSON: `/v3/api-docs`

The API is intended to run on port `8080` locally and uses Render's injected `PORT` value in production.

The public demo API accepts browser requests from any origin by default so that
Expo web previews, deployed frontends, and LAN development URLs all work. To
restrict this in production, set `CORS_ALLOWED_ORIGINS` to a comma-separated
list of allowed origins without trailing slashes.
