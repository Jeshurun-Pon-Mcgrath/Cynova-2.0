# Cynova API

Production-oriented NestJS API for Cynova. It owns authentication, game rules, persistence, rewards, streaks, achievements, and skill upgrades. The frontend talks to it through `/api/v1`.

## Local setup

Requirements: Node.js 24+, npm, and a Supabase project.

1. Copy `.env.example` to `.env`.
2. In Supabase, open **Project Settings → Database → Connection string**.
3. Put the transaction-pooler URI (port `6543`) in `DATABASE_URL`. This is the runtime URL.
4. Put the direct database URI (port `5432`) in `DIRECT_URL`. Prisma CLI uses it for migrations. If your network does not support IPv6, use Supabase's session pooler URI on port `5432` instead.
5. URL-encode special characters in the database password.
6. Generate two different secrets of at least 64 characters and set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
7. Set `FRONTEND_ORIGINS` to the exact comma-separated frontend origins. Do not use `*` with credentialed requests.

PowerShell commands:

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run prisma:deploy
npm.cmd run prisma:seed
npm.cmd run start:dev
```

For a new migration during development, update `prisma/schema.prisma` and run:

```powershell
npm.cmd run prisma:migrate -- --name describe_change
```

For production or CI, commit the generated migration and use only:

```powershell
npm.cmd run prisma:deploy
npm.cmd run prisma:seed
```

The seed is idempotent. It creates the reward catalog, skill tree, and achievement catalog. A demo account is created only when `ENABLE_DEMO_USER=true` and valid `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD` values are set.

The initial migration enables row-level security on every application table and creates no browser-facing policies. Do not put the Supabase service-role key or either database URL in the frontend. All application data access goes through this API.

## Frontend setup

Set these values in `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_ENABLE_MOCK_API=false
```

Keep `COOKIE_SECURE=false` only for local HTTP. In production use HTTPS, set `COOKIE_SECURE=true`, choose the appropriate `COOKIE_SAME_SITE` value, and set `COOKIE_DOMAIN` only when a shared parent domain is required.

## Routes

Public routes:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `GET /api/v1/health`
- `GET /api/v1/ready`

Authenticated routes:

- Auth: `GET /auth/me`, `POST /auth/logout-all`
- Profile: `GET/PATCH /profile`, `PUT /profile/onboarding`, `GET/PATCH /preferences`
- Dashboard: `GET /dashboard`, `/progression`, `/progression/attributes`, `/streaks/current`, `/achievements`, `/activities`, `/history/calendar`
- Quests: list, create, read, update, soft-delete, duplicate, complete, and completion history under `/quests`
- Economy: `GET /rewards`, `GET /rewards/:id`, `POST /rewards/:id/purchase`, `GET /inventory`, equip, and unequip
- Skills: `GET /skills`, `POST /skills/:id/upgrade`

Swagger is available at `/api/docs` when `SWAGGER_ENABLED=true`.

## Verification

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
npm.cmd audit --omit=dev
```

`GET /api/v1/ready` verifies the database connection. Run authenticated integration tests against a separate Supabase test project, never the production database.
