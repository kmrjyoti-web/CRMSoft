# General Vertical (GV)

The default business vertical. All CRMSoft customers start here.
Other verticals (Travel, Electronic, Software, Restaurant, Tourism, Retail) extend from GV patterns.

## Modules

| Group | Path | Modules |
|---|---|---|
| CRM | `modules/crm/` | contacts, raw-contacts, organizations, contact-organizations, leads, activities, follow-ups, demos, accounts, ownership |
| Accounting | `modules/accounting/` | quotations, sales, payment, procurement, price-lists, product-pricing, product-tax, product-units, wallet, customer-price-groups, products, manufacturers |
| Inventory | `modules/inventory/` | inventory (BOM, transactions, adjustments, serials, labels) |
| Communication | `modules/communication/` | communications, email, whatsapp, reminders, comments, support |
| Platform | `modules/platform/` | dashboard, tasks, calendar, bulk-import/export, documents, mis-reports, approvals, workflows |

## Data Models

Prisma schemas: `data-models/` (reference copies from `apps-backend/api/prisma/working/v1/`)

## Migration Status

See `docs/v6-restructure/01-audit/08_GV_VERTICAL_AUDIT.md` for full migration tracker.

`inventory/` is fully live at this location. All other modules have stub indexes pointing
to their current `customer/` paths during the transition.
