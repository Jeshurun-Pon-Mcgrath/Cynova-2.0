# Cynova 2.0

The repository contains:

- `frontend`: Next.js application and an explicit test-only mock adapter.
- `backend`: NestJS REST API, Prisma schema and migration, deterministic seed, JWT session rotation, and Supabase PostgreSQL integration.

Start with [backend/README.md](backend/README.md) for Supabase setup, migration, seeding, routes, and verification. Then copy `frontend/.env.example` to `frontend/.env.local`, keep `NEXT_PUBLIC_ENABLE_MOCK_API=false`, and start the frontend.
