# MQI Project Backend

Backend API for Mingachevir Qadin Icmasi (Mingachevir Women's Community). It serves public content (categories, products, services, events, community content) and provides an admin-only API for managing that content.

## Requirements

- Node.js 18+
- PostgreSQL 13+

## Installation

```
cd backend
npm install
```

## Environment setup

Copy `.env.example` to `.env` and configure the values:

```
cp .env.example .env
```

Variables:

- `DATABASE_URL` — PostgreSQL connection string, e.g. `postgresql://USERNAME:PASSWORD@localhost:5432/mqi_project`
- `PORT` — port the server listens on (default `3000`)
- `JWT_SECRET` — secret used to sign admin JWTs
- `JWT_EXPIRES_IN` — JWT expiry (e.g. `1d`)
- `CORS_ORIGIN` — comma-separated list of allowed frontend origins

Never commit `.env` — only `.env.example` is tracked.

## Database setup

Create the database, then run the schema and seed scripts:

```
createdb mqi_project
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
```

`db/seed.sql` creates a local admin account (`admin@mqi-project.local` / `ChangeMe123!`), a starter set of categories, and a small amount of sample product/service data. Change the admin password before using this in any shared environment.

## Development

```
npm run dev
```

## Production

```
npm start
```

## Tests

```
npm test
```

Tests run with the Node test runner and Supertest against an in-memory fake database (no real PostgreSQL connection required).

## API Endpoints

All responses are JSON. Errors follow `{ "message": "..." }`.

### Authentication

- `POST /api/auth/login` — admin login, returns `{ token, admin }`
- `GET /api/auth/me` — current admin (requires auth)

### Public (read-only)

- `GET /api/categories`
- `GET /api/categories/:id`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/services`
- `GET /api/services/:id`
- `GET /api/events`
- `GET /api/events/:id`
- `GET /api/content`
- `GET /api/content/:key`

### Admin (require `Authorization: Bearer <JWT>`)

- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `PUT /api/content/:key`
- `GET /api/admin/stats`

Admin mutation endpoints return `401` when the `Authorization: Bearer <JWT>` header is missing or invalid.
