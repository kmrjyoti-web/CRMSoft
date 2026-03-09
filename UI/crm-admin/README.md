# CRMSoft Admin Panel

Multi-tenant CRM administration panel built for Indian SMB businesses. Covers the full CRM lifecycle — leads, quotations, contacts, organizations, activities, finance, post-sales, reporting, and more.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| UI Library | CoreUI (AIC-prefixed, custom fork) |
| State (client) | Zustand |
| State (server) | TanStack React Query |
| Forms | react-hook-form + zod |
| HTTP | Axios |
| Testing | Jest + React Testing Library + Playwright |

## Quick Start

**Prerequisites:** Node 18+, pnpm

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL

# Start dev server (port 3005)
pnpm dev
```

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    (auth)/               # Login, forgot-password (public)
    (main)/               # Protected pages — render feature components
  components/
    ui/                   # 56 CoreUI wrapper components (ONLY place @coreui/* is imported)
    common/               # Shared components (DataTable, FilterPanel, ColorBadge, etc.)
  features/               # 65 feature modules (DDD pattern)
    contacts/
    organizations/
    leads/
    quotations/
    ...
  stores/                 # Zustand stores
  services/               # API service layer (Axios)
  hooks/                  # Shared custom hooks
lib/
  coreui/                 # CoreUI Git submodule (never edit directly)
```

## Key Features

| Domain | Features |
|---|---|
| Sales | Lead Management (Kanban + list), Quotation Builder (GST), Pipeline |
| Contacts | Contacts CRUD, Organizations CRUD, Merge & Dedupe |
| Activities | Activities, Follow-ups, Tour Plans, Calendar |
| Finance | Invoices, Payments, Receipts, Credit Notes |
| Post-Sales | Installations, Trainings, Support Tickets |
| Dashboard | KPI cards, Recharts charts, filterable reports |
| Communication | Email Templates, Signatures, Bulk Campaigns, Email Tracking |
| Workflows | Visual Workflow Builder, Trigger/Action editor |
| Settings | Users, Roles, Permissions, Lookups, Data Masking |
| Marketplace | Plugin Store, API Gateway Admin, Integrations |
| Platform | Offline Sync Admin, Verification Service, Help System |
| Developer | Menu Editor, User Overrides, Table Config |

50+ additional modules included.

## Testing

```bash
pnpm test               # Unit + integration tests (Jest)
pnpm test:coverage      # With coverage report
pnpm e2e                # End-to-end tests (Playwright)
```

Current: 341 tests, 64 suites, all passing.

## Building

```bash
pnpm build      # Production build
pnpm start      # Start production server
```

## Docker

```bash
# Build image
docker build -t crmsoft-admin .

# Run container
docker run -p 3005:3005 \
  -e NEXT_PUBLIC_API_URL=http://your-api:3001/api/v1 \
  crmsoft-admin
```

See [docs/deployment.md](docs/deployment.md) for Docker Compose (full stack with API + PostgreSQL + Redis).

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | NestJS API base URL | `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | App display name | `CRMSoft` |
| `NEXT_PUBLIC_ENABLE_SSE` | Enable Server-Sent Events | `true` |

## 8 Golden Rules

1. **Never import `@coreui/*` outside `src/components/ui/`** — ESLint enforces this.
2. **Never import `lucide-react` outside `src/components/ui/Icon.tsx`** — use `<Icon name="..." />` everywhere.
3. **Never edit `lib/coreui/` for styling** — add overrides to `crm-theme.css` only.
4. **Never use inline SVGs** — always use `<Icon name="..." />`.
5. **Features are self-contained** — all logic for a feature lives in `src/features/{name}/`.
6. **Route pages are thin** — pages only render the feature root component; no logic in pages.
7. **After CoreUI update** — run `pnpm coreui:update` to validate all 56 wrappers.
8. **All sidebars use shared hooks** — `useEntityPanel` (CRUD panels) or `useContentPanel` (info/help). Never use raw `openPanel()` in features.

## Docs

- [Architecture](docs/architecture.md)
- [Getting Started](docs/getting-started.md)
- [Deployment](docs/deployment.md)
- [Changelog](CHANGELOG.md)
