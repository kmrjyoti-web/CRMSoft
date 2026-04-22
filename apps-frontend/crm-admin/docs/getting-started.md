# Getting Started

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18+ |
| pnpm | 8+ |
| Git | Any recent version |
| PostgreSQL | 14+ (for API backend) |
| Redis | 6+ (for API backend) |

## Clone and Install

```bash
# Clone the repo (includes submodules)
git clone --recurse-submodules https://github.com/your-org/crm-soft.git
cd crm-soft/UI/crm-admin

# If you cloned without --recurse-submodules, init the CoreUI submodule
git submodule update --init --recursive

# Install dependencies
pnpm install
```

## Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required: point to your running NestJS API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Optional overrides
NEXT_PUBLIC_APP_NAME=CRMSoft
NEXT_PUBLIC_ENABLE_SSE=true
```

## Running the Dev Server

```bash
pnpm dev
# Starts on http://localhost:3005
```

## Running the API Backend

The API lives in `API/` at the repository root:

```bash
cd ../../API

# Install API dependencies
pnpm install

# Set up API environment
cp .env.example .env
# Edit .env with DATABASE_URL, REDIS_URL, JWT_SECRET

# Run database migrations
pnpm prisma migrate dev

# Seed lookup data
pnpm seed

# Start API (port 3001)
pnpm dev
```

The frontend at port 3005 expects the API at the URL set in `NEXT_PUBLIC_API_URL`.

## Project Structure Walkthrough

```
src/
  app/
    (auth)/
      login/page.tsx             # Login page — renders LoginFeature
      forgot-password/page.tsx   # Password reset
    (main)/
      dashboard/page.tsx         # Protected — renders DashboardFeature
      contacts/page.tsx
      contacts/[id]/page.tsx
      ...

  components/
    ui/
      Button.tsx                 # Wrapper over AICButton
      Input.tsx                  # Floating label input
      TableFull.tsx              # Wraps AICTableFull — use for ALL list pages
      Icon.tsx                   # ONLY file that imports lucide-react
      SelectInput.tsx
      ... (56 wrappers total)
    common/
      DataTable.tsx
      FilterPanel.tsx
      ColorBadge.tsx
      PageHeader.tsx
      ...

  features/
    contacts/
      components/                # UI components
      hooks/                     # React Query hooks
      services/                  # Axios service
      types/                     # Interfaces + zod schemas
    leads/
    organizations/
    quotations/
    finance/
    post-sales/
    dashboard/
    workflows/
    communication/
    settings/
    ... (65 modules total)

  stores/
    authStore.ts
    uiStore.ts
    panelStore.ts

  services/
    apiClient.ts                 # Axios instance with JWT interceptor

  hooks/
    useEntityPanel.ts            # CRUD sidebar panel hook
    useContentPanel.ts           # Info/help sidebar panel hook
```

## Creating a New Feature

Follow this step-by-step pattern. Example: adding a "Warranties" feature.

**Step 1: Create the feature directory**

```bash
mkdir -p src/features/warranties/{components,hooks,services,types}
```

**Step 2: Define types and zod schema**

```ts
// src/features/warranties/types/warranty.types.ts
import { z } from "zod";

export const WarrantySchema = z.object({
  id: z.string().optional(),
  contactId: z.string().min(1, "Contact is required"),
  productName: z.string().min(1, "Product name is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  status: z.enum(["active", "expired", "void"]),
});

export type Warranty = z.infer<typeof WarrantySchema>;
export type WarrantyFormData = Omit<Warranty, "id">;
```

**Step 3: Create the service**

```ts
// src/features/warranties/services/warranty.service.ts
import { apiClient } from "@/services/apiClient";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Warranty } from "../types/warranty.types";

export const warrantyService = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<Warranty>>>("/warranties", { params })
      .then((r) => r.data),

  create: (data: Partial<Warranty>) =>
    apiClient.post<ApiResponse<Warranty>>("/warranties", data).then((r) => r.data),

  update: (id: string, data: Partial<Warranty>) =>
    apiClient.patch<ApiResponse<Warranty>>(`/warranties/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/warranties/${id}`).then((r) => r.data),
};
```

**Step 4: Create hooks**

```ts
// src/features/warranties/hooks/useWarrantyList.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { warrantyService } from "../services/warranty.service";

export function useWarrantyList() {
  return useQuery({
    queryKey: ["warranties"],
    queryFn: () => warrantyService.getAll(),
  });
}

export function useWarrantyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof warrantyService.create>[0]) =>
      warrantyService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["warranties"] }),
  });
}
```

**Step 5: Build the list component**

```tsx
// src/features/warranties/components/WarrantyList.tsx
"use client";
import { TableFull } from "@/components/ui";
import type { Column } from "@/components/ui/TableFull";
import { useWarrantyList } from "../hooks/useWarrantyList";
import type { Warranty } from "../types/warranty.types";

const COLUMNS: Column<Warranty>[] = [
  { key: "productName", header: "Product" },
  { key: "expiryDate", header: "Expiry Date" },
  { key: "status", header: "Status" },
];

export function WarrantyList() {
  const { data, isLoading } = useWarrantyList();

  return (
    <TableFull
      title="Warranties"
      tableKey="warranties"
      data={data?.data ?? []}
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="cozy"
    />
  );
}
```

**Step 6: Create the thin route page**

```tsx
// src/app/(main)/warranties/page.tsx
import { WarrantyList } from "@/features/warranties/components/WarrantyList";

export default function WarrantiesPage() {
  return <WarrantyList />;
}
```

**Step 7: Add to navigation** (Settings > Menu Editor, or add to sidebar config directly)

## Running Tests

```bash
# All tests
pnpm test

# Watch mode during development
pnpm test --watch

# Coverage report
pnpm test:coverage

# Single feature
pnpm test -- --testPathPattern=warranties

# E2E tests (requires running dev server)
pnpm e2e
```

When adding tests for a list component that uses `TableFull`, add the ResizeObserver polyfill:

```ts
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
```

## Building for Production

```bash
# Type check + build
pnpm build

# Run production server locally
pnpm start
# Starts on port 3005
```

The build will fail if there are TypeScript errors or ESLint violations — this is intentional. Fix all errors before shipping.
