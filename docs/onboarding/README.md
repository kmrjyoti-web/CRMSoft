# CRMSoft — Quick Start

Get from zero to running in ~30 minutes.

## Prerequisites

- Node.js 20+ (`node --version` — currently using v24)
- pnpm 10.33.0 (`pnpm --version`)
- Git 2.30+

Install pnpm if needed:
```bash
npm install -g pnpm@10.33.0
```

## Step 1 — Clone + Install

```bash
git clone git@github.com:kmrjyoti-web/CRMSoft.git
cd CRMSoft
git checkout develop          # all active work is here
pnpm install                  # ~10 seconds, installs all 23 workspace packages
```

## Step 2 — Get .env from Kumar

**Ask Kumar for the `.env` file values.** Do not commit `.env` — it is gitignored.

```bash
cp apps-backend/api/.env.example apps-backend/api/.env
# Fill in values provided by Kumar
```

Key vars you'll need:
- `DATABASE_URL`, `IDENTITY_DATABASE_URL`, `PLATFORM_DATABASE_URL` — Railway DB connections
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — auth tokens
- `ADMIN_INITIAL_PASSWORD`, `PLATFORM_INITIAL_PASSWORD` — for seed runs only

## Step 3 — Generate Prisma Clients

```bash
pnpm --filter crm-backend run prisma:generate
# Generates 7 per-DB clients (~9 seconds)
```

## Step 4 — Start Backend

```bash
cd apps-backend/api
pnpm run start:dev
# Wait for: "Nest application successfully started"
# API available at http://localhost:3001
```

## Step 5 — Start Your Frontend

```bash
# In a new terminal:
cd apps-frontend/crm-admin      # or your assigned portal
pnpm dev
# Ready in ~3 seconds at http://localhost:3005
```

## Step 6 — Verify Login

Use the credentials Kumar provides. Default admin:
- `POST http://localhost:3001/api/v1/auth/admin/login`
- Body: `{"email":"admin@crm.com","password":"<ask Kumar>"}`
- Response: JWT access token

## Common First-Day Issues

| Problem | Fix |
|---|---|
| Port 3001 in use | `lsof -ti:3001 \| xargs kill -9` |
| `ENOTEMPTY` on start | `rm -rf apps-backend/api/dist && retry` |
| Prisma generate fails | `rm -rf apps-backend/api/node_modules/.prisma && retry` |
| pnpm install fails | `rm -rf node_modules && pnpm install` |
| `nest start` stays at "Found N errors" | Check `.env` exists with all required vars |

Full troubleshooting in [SETUP.md](SETUP.md).
