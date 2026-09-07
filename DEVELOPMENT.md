# Development

Docker runs infrastructure. Vite+ handles builds, linting, and tests.

```bash
vp install
cp apps/frontend/.dev.vars.example apps/frontend/.dev.vars
vp run infra:up
vp run db:migrate
vp run db:seed
vp run dev
```

`vp run dev` starts the frontend, API, and worker.
Run them individually with `vp run dev:frontend`, `vp run dev:api`, and `vp run dev:worker`.
The API uses Node watch mode with the existing tsx loader. The worker runs without watch mode.

Configure backend services in `apps/backend/.env`.
The worker needs a Hatchet instance and `HATCHET_CLIENT_TOKEN`; Compose does not provide Hatchet.

Build with `vp run -r build`, then run the compiled backend with `vp run start:api` or `vp run start:worker`.

## Infrastructure

| Command              | Action                                                                  |
| -------------------- | ----------------------------------------------------------------------- |
| `vp run infra:up`    | Start Postgres and RustFS and wait for health checks                    |
| `vp run infra:down`  | Stop and remove infrastructure containers, preserving data              |
| `vp run infra:logs`  | Follow infrastructure logs                                              |
| `vp run infra:reset` | Stop infrastructure, delete local Postgres and RustFS data, and restart |

Postgres listens on `localhost:5432`, using `postgres://circles:password@127.0.0.1:5432/circles_dev`. RustFS exposes its S3 API on `localhost:9000` and console on `localhost:9001`, using `circles` / `password`. Data lives in `data/postgres` and `data/rustfs`.

After `infra:reset`, run `db:migrate` and `db:seed` and recreate any S3 buckets you need.

## Database

Database commands run locally against the backend's configured `DATABASE_URL`.

| Command              | Action                                                                |
| -------------------- | --------------------------------------------------------------------- |
| `vp run db:migrate`  | Apply Drizzle migrations                                              |
| `vp run db:seed`     | Report that no seed data is needed; users and music come from Spotify |
| `vp run db:reset`    | Drop the public and Drizzle schemas, then migrate and seed            |
| `vp run db:generate` | Generate migrations after schema changes                              |
| `vp run db:studio`   | Open Drizzle Studio                                                   |

Stop application services before resetting the database. `db:reset` deletes application data in the configured database and refuses to run with `NODE_ENV=production`. It leaves RustFS data intact.

## Validation

```bash
vp check
vp test run
vp run -r build
```

## Authentication

The backend owns one Better Auth session. Spotify sign-in sets an HttpOnly, SameSite=Lax cookie on the frontend origin. The frontend proxies `/api/*` to the backend, preserving cookies and redirects. Server-rendered authentication forwards that same cookie and returns renewed cookies to the browser. Logout revokes the Better Auth session and clears cached user data.

Set the frontend Worker's `API_URL` variable in `apps/frontend/wrangler.jsonc` to the backend origin reachable by the frontend server. For local development, set `API_URL=http://127.0.0.1:8000` in `apps/frontend/.dev.vars`. Set `FRONTEND_URL` in the backend environment to the public frontend origin. Register `<FRONTEND_URL>/api/auth/callback/spotify` as the redirect URI in the Spotify developer dashboard. Production requires HTTPS and a configured `BETTER_AUTH_SECRET`.

Username assignment happens when a user is created. The worker's existing 15-minute schedule imports history and saved tracks; signing in does not depend on Hatchet being available. New accounts may wait until the next scheduled sync for their music to appear.
