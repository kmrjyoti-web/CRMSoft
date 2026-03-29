# CRMSoft — Multi-Tenant SaaS CRM Platform

## Folder Structure

| Folder | Purpose | Port |
|---|---|---|
| **Application/backend/** | NestJS monolith (CRM API + all modules) | 3000 |
| **Application/frontend/marketplace/** | Customer-facing marketplace PWA | 3008 |
| **Application/frontend/customer-portal/** | Customer self-service portal | 3007 |
| **Customer/frontend/crm-admin/** | CRM Admin Panel (Next.js 14) | 3005 |
| **Vendor/frontend/vendor-panel/** | Software Vendor Panel (Next.js 14) | 3006 |
| **WhiteLabel/wl-api/** | White Label Platform API (NestJS) | 3010 |
| **WhiteLabel/wl-admin/** | White Label Admin Panel (Next.js 14) | 3009 |
| **WhiteLabel/wl-partner/** | White Label Partner Portal (Next.js 14) | 3011 |
| **Shared/backend/** | Future SDK modules (identity, prisma, tenant, …) | — |
| **Shared/frontend/** | Future shared UI components (AIC, hooks, stores) | — |
| **Shared/common/** | Shared TypeScript types, enums, constants | — |
| **Shared/prisma-schemas/** | Reference copies of all Prisma schemas | — |
| **Customer/backend/** | Future: customer microservice (extracted from monolith) | 3002 |
| **Vendor/backend/** | Future: vendor microservice (extracted from monolith) | 3003 |
| **Mobile/** | Flutter mobile app | — |
| **RAW/** | Backups, exports, seeds, credentials (gitignored) | — |
| **infra/** | Docker, scripts, nginx configs | — |
| **docs/** | Architecture docs, API docs, guides | — |

## Quick Start

```bash
# All 8 services (requires Redis + PostgreSQL)
npm run dev

# CRM stack only (API + admin + vendor + portal)
npm run dev:crm

# WhiteLabel stack only
npm run dev:wl

# Individual services
npm run dev:api       # Application/backend  → :3000
npm run dev:admin     # Customer/frontend    → :3005
npm run dev:vendor    # Vendor/frontend      → :3006
npm run dev:portal    # Application/frontend → :3007
npm run dev:marketplace # Application/frontend → :3008
npm run dev:wl-api    # WhiteLabel/wl-api    → :3010
npm run dev:wl-admin  # WhiteLabel/wl-admin  → :3009
npm run dev:wl-partner # WhiteLabel/wl-partner → :3011
```

## Tech Stack
- **Backend:** NestJS 10 + Prisma 5 + PostgreSQL (CQRS + DDD)
- **Frontend:** Next.js 14 + React 18 + Tailwind CSS + CoreUI (AIC fork)
- **State:** Zustand + TanStack React Query v5
- **Queue:** BullMQ + Redis
- **Storage:** Cloudflare R2
- **Testing:** Jest (60+ suites, 1,300+ tests)

## Rollback
```bash
git checkout restructure-backup-20260329
```
