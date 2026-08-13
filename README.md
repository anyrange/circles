# Vite+ Monorepo Starter

A starter for creating a Vite+ monorepo.

## Development

- Check everything is ready:

```bash
vp run ready
```

- Run the tests:

```bash
vp run test -r
```

- Build the monorepo:

```bash
vp run build -r
```

- Run the development server:

```bash
vp run dev
```

## Local Infra

Start Postgres, RustFS, and Hatchet Lite from the repo root:

```bash
docker compose up -d
```

This compose file provisions:

- `postgres` on `localhost:5432` for the backend app using `postgres://circles:password@127.0.0.1:5432/circles_dev`
- `rustfs` with its S3 API on `localhost:9000` and console on `localhost:9001` using `circles` / `password`
- `hatchet-postgres` as a separate internal Postgres instance for Hatchet Lite
- `hatchet-lite` on `localhost:8888` and gRPC on `localhost:7077`

For the backend worker, set `HATCHET_CLIENT_TOKEN` in `apps/backend/.env`. If your Hatchet client needs explicit self-hosted settings, also set `HATCHET_SERVER_URL=http://127.0.0.1:8888` and `HATCHET_CLIENT_TLS_STRATEGY=none`.
