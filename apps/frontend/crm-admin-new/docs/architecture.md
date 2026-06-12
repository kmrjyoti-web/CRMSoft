# Architecture

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Routing, SSR, file-based pages |
| Language | TypeScript strict | Type safety across all layers |
| UI Library | CoreUI (AIC-prefixed fork) | Base components via Git submodule |
| State — client | Zustand | Auth, UI state, panel state |
| State — server | TanStack React Query | API data fetching, caching, mutations |
| Forms | react-hook-form + zod | Validation + schema-driven forms |
| HTTP | Axios | API requests with interceptors |
| Icons | lucide-react (via Icon.tsx only) | Consistent icon system |
| Charts | Recharts | Dashboard KPI charts |
| Drag & Drop | @dnd-kit | Kanban board (leads) |

## Architecture Diagram

```
+----------------------------------------------------------+
|                      Browser / Client                    |
+----------------------------------------------------------+
|                        UI Layer                          |
|  src/app/(main)/...  — thin route pages                  |
|  src/features/*/components/ — feature UI components      |
|  src/components/ui/ — 56 CoreUI wrappers                 |
|  src/components/common/ — shared components              |
+----------------------------------------------------------+
|                      Hooks Layer                         |
|  src/features/*/hooks/ — useXxxList, useXxxMutation      |
|  src/hooks/ — shared hooks (useEntityPanel, etc.)        |
+----------------------------------------------------------+
|                      State Layer                         |
|  Zustand stores (auth, UI, panel state)                  |
|  TanStack React Query (server cache, mutations)          |
+----------------------------------------------------------+
|                     Service Layer                        |
|  src/features/*/services/ — typed API calls via Axios    |
|  src/services/ — shared services (apiClient)             |
+----------------------------------------------------------+
           |  HTTP (Axios + JWT Bearer)  |
+----------------------------------------------------------+
|                    NestJS API (port 3001)                 |
|  REST endpoints at /api/v1/...                           |
|  PostgreSQL + Prisma ORM                                 |
|  Redis (cache + sessions)                                |
+----------------------------------------------------------+
```

## Feature Module Structure (DDD)

Every feature follows this layout under `src/features/{name}/`:

```
src/features/contacts/
  components/
    ContactList.tsx       # Main list page component
    ContactDetail.tsx     # Detail/view component
    ContactForm.tsx       # Create/edit form
    ContactFilters.tsx    # Filter panel
  hooks/
    useContactList.ts     # React Query list hook
    useContactMutation.ts # Create/update/delete mutations
  services/
    contact.service.ts    # Axios API calls
  types/
    contact.types.ts      # TypeScript interfaces + zod schemas
  utils/                  # Feature-specific helpers (optional)
```

## 3-Layer Import Chain

```
lib/coreui/           — CoreUI Git submodule (raw @coreui/* components)
      |
      v
src/components/ui/    — 56 AIC-prefixed wrappers (ONLY layer that imports @coreui/*)
      |
      v
src/features/         — Feature components (import from @/components/ui, never @coreui/*)
src/components/common/
```

**Rule**: The import chain is strictly one-directional. `lib/coreui/` is never imported outside `src/components/ui/`. Features never bypass the wrapper layer.

ESLint rule `no-restricted-imports` enforces this at build time.

## Data Flow

```
User Action
    |
    v
Feature Component (e.g., ContactList)
    |
    v
Custom Hook (e.g., useContactList)
    |  useQuery({ queryKey, queryFn })
    v
Service Function (e.g., contactService.getAll)
    |  apiClient.get<ApiResponse<Contact[]>>(...)
    v
Axios Instance (with JWT interceptor)
    |  GET /api/v1/contacts
    v
NestJS API
    |  Response: { data: { data: [...], meta: {...} } }
    v
React Query Cache
    |
    v
Component Re-renders with fresh data
```

## Authentication Flow

```
1. User submits login form
2. POST /api/v1/auth/login  →  { accessToken, refreshToken, user }
3. Tokens saved to localStorage
4. Zustand authStore updated with user + tokens
5. Axios request interceptor attaches:
     Authorization: Bearer <accessToken>
6. On 401 response:
     - Interceptor calls POST /api/v1/auth/refresh
     - On success: update tokens + retry original request
     - On failure: clear tokens + redirect to /login
```

## Component Naming Conventions

| Type | Convention | Example |
|---|---|---|
| CoreUI wrapper | `AIC` prefix | `AICButton`, `AICTable` |
| UI wrapper (src/components/ui) | No prefix | `Button`, `Input`, `TableFull` |
| Feature component | PascalCase, noun-based | `ContactList`, `LeadKanban` |
| Hook | `use` prefix | `useContactList`, `useEntityPanel` |
| Service | `.service.ts` suffix | `contact.service.ts` |
| Zod schema | `Schema` suffix | `ContactSchema`, `LeadSchema` |
| Type/Interface | PascalCase | `Contact`, `LeadFormData` |

## Key Patterns

### Service Pattern

```ts
// src/features/contacts/services/contact.service.ts
import { apiClient } from "@/services/apiClient";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Contact } from "../types/contact.types";

export const contactService = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<Contact>>>("/contacts", { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Contact>>(`/contacts/${id}`)
      .then((r) => r.data),

  create: (data: Partial<Contact>) =>
    apiClient
      .post<ApiResponse<Contact>>("/contacts", data)
      .then((r) => r.data),

  update: (id: string, data: Partial<Contact>) =>
    apiClient
      .patch<ApiResponse<Contact>>(`/contacts/${id}`, data)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/contacts/${id}`).then((r) => r.data),
};
```

### Hook Pattern

```ts
// src/features/contacts/hooks/useContactList.ts
import { useQuery } from "@tanstack/react-query";
import { contactService } from "../services/contact.service";

export function useContactList(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["contacts", filters],
    queryFn: () => contactService.getAll(filters),
  });
}
```

### Component Rules

- Route pages (`src/app/(main)/contacts/page.tsx`) are thin — they import and render the feature root component only. No hooks, no logic, no JSX beyond the single component call.
- All form fields use floating labels + left icon (see `Input`, `SelectInput`, `LookupSelect`).
- All list pages use `TableFull` — never a custom table.
- All sidebars use `useEntityPanel` or `useContentPanel` — never raw drawer primitives.

## State Management

| Store | Location | Purpose |
|---|---|---|
| `authStore` | `src/stores/authStore.ts` | Current user, tokens, login/logout |
| `uiStore` | `src/stores/uiStore.ts` | Sidebar open/close, theme |
| `panelStore` | `src/stores/panelStore.ts` | Entity/content panel state |

React Query handles all server state. Zustand handles UI and auth state only.

## CSS Architecture

Load order is locked — never reorder:

```
1. globals.css          — resets, base styles
2. CoreUI tokens        — design tokens (@coreui/*)
3. CoreUI base          — component base styles
4. crm-theme.css        — CRM-specific overrides and additions
```

Overrides go in `crm-theme.css` only. Never edit `lib/coreui/` directly.
