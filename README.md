                    WEBSITE
                       │
       ┌───────────────┼────────────────┐
       │               │                │
    COMMUNITY       PRODUCTS         EVENTS
       │               │                │
     About         Product Detail    Event Detail
     Mission       Price             Date
     Activities    Description       Location
                   Contact
                       │
                       ↓
                  WhatsApp/
                  Instagram


                    ADMIN
                       │
       ┌───────────────┼───────────────┐
       │               │               │
   PRODUCTS         SERVICES        EVENTS
       │               │               │
     Create           Create          Create
     Edit             Edit            Edit
     Delete           Delete          Delete


# MQI Project

## Backend B — Community/Admin API

This repository contains the administrative and community backend for the MQI project.

## Requirements

- Node.js 18+
- PostgreSQL 14+
- Express REST API
- PostgreSQL connection via environment variables
- JWT-based admin authentication
- bcrypt password hashing
- Event and content CRUD for admins
- Community dashboard stats

## PostgreSQL setup

Create a database named `mqi_project` and load the schema:

```bash
createdb mqi_project
psql -d mqi_project -f backend/db/schema.sql
psql -d mqi_project -f backend/db/seed.sql
```

## Environment variables

Copy the example and update it with real local values:

```bash
cp backend/.env.example backend/.env
```

Example values:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/mqi_project
PORT=3000
JWT_SECRET=replace_with_secure_random_string
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

`CORS_ORIGIN` accepts a comma-separated list of allowed frontend origins (defaults to the Vite dev server on `http://localhost:5173`).

The server validates `DATABASE_URL` and `JWT_SECRET` at startup and refuses to boot with a clear error message if either is missing.

Do not commit real secrets or a checked-in `.env` file. The repository ignores `.env`.

## Installing dependencies

```bash
cd backend
npm install
```

## Starting the backend

```bash
cd backend
npm run dev
```

## API endpoints

### Auth

- POST /api/auth/login
- GET /api/auth/me

### Events

- GET /api/events
- GET /api/events/:id
- POST /api/events
- PUT /api/events/:id
- DELETE /api/events/:id

### Content

- GET /api/content
- GET /api/content/:key
- PUT /api/content/:key

### Admin

- GET /api/admin/stats

## Authentication instructions

Use the seeded admin account for local development:

```json
{
  "email": "admin@mqi-project.local",
  "password": "ChangeMe123!"
}
```

Login returns a JWT. Use it with the `Authorization: Bearer <token>` header for protected admin endpoints.

Development seed passwords must be changed before production deployment.

## Testing

```bash
cd backend
npm test
```

## Database structure

PostgreSQL includes these tables used by the backend:

- admins
- events
- content
- products
- services
- categories

## Connecting the frontend

The `frontend/` app (Vite + React) already calls this API via `frontend/src/services/*.js`. To run both together locally:

```bash
# terminal 1
cd backend
cp .env.example .env   # fill in real values
npm install
npm run dev

# terminal 2
cd frontend
cp .env.example .env
npm install
npm run dev
```

`frontend/.env` should contain `VITE_API_BASE_URL=http://localhost:3000/api`, matching the backend's `PORT` and `CORS_ORIGIN` values (`http://localhost:5173` by default).

## Manual API testing (PowerShell)

```powershell
# 1. Login
$login = Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method Post -ContentType 'application/json' -Body '{"email":"admin@mqi-project.local","password":"ChangeMe123!"}'
$token = $login.token

# 2. Who am I
Invoke-RestMethod -Uri http://localhost:3000/api/auth/me -Headers @{ Authorization = "Bearer $token" }

# 3. List events (public)
Invoke-RestMethod -Uri http://localhost:3000/api/events

# 4. Create an event (admin only)
$event = Invoke-RestMethod -Uri http://localhost:3000/api/events -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body '{"title":"Community Workshop","event_date":"2026-09-15T14:00:00Z","location":"Baku"}'

# 5. Update it
Invoke-RestMethod -Uri "http://localhost:3000/api/events/$($event.id)" -Method Put -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body '{"location":"Ganja"}'

# 6. Delete it
Invoke-RestMethod -Uri "http://localhost:3000/api/events/$($event.id)" -Method Delete -Headers @{ Authorization = "Bearer $token" }

# 7. Update community content
Invoke-RestMethod -Uri http://localhost:3000/api/content/about -Method Put -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body '{"value":"Updated about text"}'

# 8. Dashboard stats
Invoke-RestMethod -Uri http://localhost:3000/api/admin/stats -Headers @{ Authorization = "Bearer $token" }
```

## Notes

The admin API is intended for internal administrator use. Public read endpoints remain readable without authentication, while write operations require a valid JWT.
