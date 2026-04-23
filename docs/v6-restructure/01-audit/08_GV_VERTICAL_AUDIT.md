# General Vertical (GV) Audit

**Date:** 2026-04-25  
**Author:** Dev 4 (war sprint Day 3-4)  
**Status:** Migration in progress

---

## Finding: GV = the entire `customer/` directory

The war prompt assumed sub-directories `customer/crm/`, `customer/accounting/`,
`customer/inventory/`. Reality: there is NO sub-grouping. All 50 GV business
modules live flat in `apps-backend/api/src/modules/customer/`.

The mapping below defines how they group into V6 `verticals/general/modules/`.

---

## Module Map (50 modules → 5 logical groups)

### Group 1: CRM (10 modules)
Maps to `verticals/general/modules/crm/`

| Current path (`customer/`) | V6 target | Status |
|---|---|---|
| contacts/ | crm/contacts/ | stub index ✅ |
| raw-contacts/ | crm/raw-contacts/ | stub index ✅ |
| organizations/ | crm/organizations/ | stub index ✅ |
| contact-organizations/ | crm/contact-organizations/ | stub index ✅ |
| leads/ | crm/leads/ | stub index ✅ |
| activities/ | crm/activities/ | stub index ✅ |
| follow-ups/ | crm/follow-ups/ | stub index ✅ |
| demos/ | crm/demos/ | stub index ✅ |
| accounts/ | crm/accounts/ | stub index ✅ |
| ownership/ | crm/ownership/ | stub index ✅ |

### Group 2: Sales & Accounting (12 modules)
Maps to `verticals/general/modules/accounting/`

| Current path (`customer/`) | V6 target | Status |
|---|---|---|
| quotations/ | accounting/quotations/ | stub index ✅ |
| sales/ | accounting/sales/ | stub index ✅ |
| payment/ | accounting/payment/ | stub index ✅ |
| procurement/ | accounting/procurement/ | stub index ✅ |
| price-lists/ | accounting/price-lists/ | stub index ✅ |
| product-pricing/ | accounting/product-pricing/ | stub index ✅ |
| product-tax/ | accounting/product-tax/ | stub index ✅ |
| product-units/ | accounting/product-units/ | stub index ✅ |
| wallet/ | accounting/wallet/ | stub index ✅ |
| customer-price-groups/ | accounting/customer-price-groups/ | stub index ✅ |
| products/ | accounting/products/ | stub index ✅ |
| manufacturers/ | accounting/manufacturers/ | stub index ✅ |

### Group 3: Inventory (1 module)
Maps to `verticals/general/modules/inventory/`

| Current path (`customer/`) | V6 target | Status |
|---|---|---|
| inventory/ | inventory/ | **MOVED ✅ (proof module)** |

### Group 4: Communication (6 modules)
Maps to `verticals/general/modules/communication/`

| Current path (`customer/`) | V6 target | Status |
|---|---|---|
| communications/ | communication/communications/ | stub index ✅ |
| email/ | communication/email/ | stub index ✅ |
| whatsapp/ | communication/whatsapp/ | stub index ✅ |
| reminders/ | communication/reminders/ | stub index ✅ |
| comments/ | communication/comments/ | stub index ✅ |
| support/ | communication/support/ | stub index ✅ |

### Group 5: Platform (21 modules)
Maps to `verticals/general/modules/platform/`

| Current path (`customer/`) | V6 target | Status |
|---|---|---|
| dashboard/ | platform/dashboard/ | stub index ✅ |
| tasks/ | platform/tasks/ | stub index ✅ |
| task-logic/ | platform/task-logic/ | stub index ✅ |
| calendar/ | platform/calendar/ | stub index ✅ |
| calendar-highlights/ | platform/calendar-highlights/ | stub index ✅ |
| bulk-import/ | platform/bulk-import/ | stub index ✅ |
| bulk-export/ | platform/bulk-export/ | stub index ✅ |
| documents/ | platform/documents/ | stub index ✅ |
| document-templates/ | platform/document-templates/ | stub index ✅ |
| mis-reports/ | platform/mis-reports/ | stub index ✅ |
| performance/ | platform/performance/ | stub index ✅ |
| approval-requests/ | platform/approval-requests/ | stub index ✅ |
| approval-rules/ | platform/approval-rules/ | stub index ✅ |
| saved-filters/ | platform/saved-filters/ | stub index ✅ |
| recurrence/ | platform/recurrence/ | stub index ✅ |
| recycle-bin/ | platform/recycle-bin/ | stub index ✅ |
| brands/ | platform/brands/ | stub index ✅ |
| amc-warranty/ | platform/amc-warranty/ | stub index ✅ |
| entity-verification/ | platform/entity-verification/ | stub index ✅ |
| tour-plans/ | platform/tour-plans/ | stub index ✅ |
| raw-contacts/ | (in crm group above) | — |

---

## Databases

| Database | Schema files | Purpose |
|---|---|---|
| WorkingDB | `prisma/working/v1/*.prisma` | All GV runtime data |
| IdentityDB | `prisma/identity/v1/*.prisma` | Users, tenants |
| DemoDB | `prisma/demo/v1/*.prisma` | Demo/seed data |

Relevant GV schemas (copied to `verticals/general/data-models/`):
- `working/v1/crm.prisma` — Leads, Contacts, Organizations, Activities
- `working/v1/accounts.prisma` — Accounts, Payments, Wallets
- `working/v1/inventory.prisma` — Inventory, BOM, Transactions
- `working/v1/sales.prisma` — Quotations, Sales Orders
- `working/v1/documents.prisma` — Documents, Templates

---

## Migration Status

**This PR:**
- ✅ `verticals/general/` skeleton with 5 logical sub-groups
- ✅ `inventory/` physically moved (proof of concept with tsc passing)
- ✅ tsconfig path alias `@verticals/*` added
- ✅ 4 import files updated for inventory
- ✅ Prisma schemas copied to `data-models/` (reference copies)
- ✅ Stub index files for all other 49 modules

**Next sprint:**
- Move remaining 49 modules (batch by group)
- Full import path updates
- Backend smoke test after each batch

---

## Customer Demo Value

Show this structure to customer:

```
verticals/general/          ← Your 2 months of business logic
├── modules/
│   ├── crm/               ← 10 CRM modules (contacts, leads, activities...)
│   ├── accounting/        ← 12 Sales + Accounting modules
│   ├── inventory/         ← Inventory + BOM (LIVE — fully migrated)
│   ├── communication/     ← Email, WhatsApp, Reminders
│   └── platform/          ← Dashboard, Tasks, Documents, Reports...
└── data-models/           ← Your Prisma database schemas
```

Key message: "All 50 modules mapped, 1 fully live as proof. Rest migrate in batches."
