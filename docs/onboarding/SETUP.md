# Environment Setup Guide

## System Requirements

| Tool | Version | Check |
|---|---|---|
| Node.js | 20+ (v24 current) | `node --version` |
| pnpm | 10.33.0 | `pnpm --version` |
| Git | 2.30+ | `git --version` |
| PostgreSQL client | optional | TablePlus / DBeaver / pgAdmin |

### Install pnpm

```bash
npm install -g pnpm@10.33.0
# or
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## Clone and Checkout

```bash
git clone git@github.com:kmrjyoti-web/CRMSoft.git
cd CRMSoft
git checkout develop
pnpm install
```

The root `pnpm-workspace.yaml` covers all 23 packages. A single `pnpm install` at the root is all you need — no per-app installs required.

## Backend .env Setup

```bash
cd apps-backend/api
cp .env.example .env
```

Open `.env` and fill in the values Kumar provides. Required variables:

```bash
# Databases (7 connections to Railway cloud)
DATABASE_URL=
IDENTITY_DATABASE_URL=
PLATFORM_DATABASE_URL=
GLOBAL_WORKING_DATABASE_URL=
MARKETPLACE_DATABASE_URL=
PLATFORM_CONSOLE_DATABASE_URL=
GLOBAL_REFERENCE_DATABASE_URL=
DEMO_DATABASE_URL=

# JWT (ask Kumar)
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3001
NODE_ENV=development
BCRYPT_SALT_ROUNDS=12

# Seed (only needed when running prisma:seed)
ADMIN_INITIAL_PASSWORD=
PLATFORM_INITIAL_PASSWORD=
```

**Security rule:** Never commit `.env`. It is gitignored. Never share via Slack/email — use secure channels.

## Frontend .env Setup

Each portal uses its own `.env.local` (gitignored):

```bash
cd apps-frontend/crm-admin
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
# Note: no /api/v1 suffix in this var — Next.js config adds the prefix
```

Repeat for any other portal you work on (`vendor-panel`, `customer-portal`, etc.).

## Generate Prisma Clients

The project uses 7 per-database Prisma clients. They must be generated before starting the backend:

```bash
# From repo root:
pnpm --filter crm-backend run prisma:generate
```

Expected output: 7 clients generated (identity, platform, working, marketplace, platform-console, global-reference, demo). Takes ~9 seconds.

If you see `npx prisma` anywhere in docs — **ignore it**. Always use `pnpm exec prisma` or the npm scripts. The `npx` version pulls Prisma 7.x which is incompatible with this repo's schemas (the repo pins 5.x).

## Starting the Backend

```bash
cd apps-backend/api
pnpm run start:dev
```

Watch for:
```
[NestApplication] Nest application successfully started +Xms
[Bootstrap] Server running on port 3001
```

If you see `Found 41 errors. Watching for file changes.` — check that your `.env` exists and has all required vars. The backend will not initialize without DB connections.

## Starting a Frontend

```bash
cd apps-frontend/crm-admin   # or your portal
pnpm dev
```

Starts in ~3 seconds. Opens at `http://localhost:3005`.

Portal ports:
| Portal | Port |
|---|---|
| crm-admin | 3005 |
| vendor-panel | 3006 |
| customer-portal | 3007 |
| marketplace | 3008 |
| wl-admin | 3009 |
| wl-partner | 3011 |
| platform-console | 3012 |

## Troubleshooting

### Port already in use

```bash
lsof -ti:3001 | xargs kill -9   # kill whatever holds port 3001
```

### ENOTEMPTY error on start:dev

Stale `dist/` from a previous build:

```bash
rm -rf apps-backend/api/dist
pnpm run start:dev
```

### Prisma generate fails

```bash
rm -rf apps-backend/api/node_modules/.prisma
rm -rf apps-backend/api/node_modules/@prisma
pnpm --filter crm-backend run prisma:generate
```

### pnpm install fails

```bash
rm -rf node_modules
pnpm install
```

### tsc shows 332 errors in crm-admin

Expected — `crm-admin` has a known 332-error baseline (documented in `docs/v5/BASELINE_GATE.md`). Next.js dev mode compiles lazily per-route and ignores these. The frontend works normally despite the tsc count.

### Backend tsc shows errors

Backend target is 0 errors. If you see any:
1. Check `docs/v5/BASELINE_GATE.md` — it may be a known issue
2. If it's a new error, stop and notify the team before merging

## IDE Setup (VS Code)

Recommended extensions:
- **Prisma** — schema syntax highlighting
- **ESLint** — linting
- **Tailwind CSS IntelliSense** — class autocompletion
- **Thunder Client** or **REST Client** — API testing
- **GitLens** — git history

The repo has no committed `.vscode/` settings — configure your own preferences locally.
