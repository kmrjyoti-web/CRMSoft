# General Vertical — Data Models

Reference copies of the GV Prisma schemas.

**Live schemas** (used by Prisma client): `apps-backend/api/prisma/working/v1/`  
**These files**: Documentation copies for architecture clarity. Do NOT edit here — edit the live schemas.

## Files

| File | Database | Domain |
|---|---|---|
| `crm.prisma` | WorkingDB | Contacts, Leads, Organizations, Activities, Tour Plans, Tasks |
| `accounts.prisma` | WorkingDB | Payments, Wallets, Customer Accounts |
| `inventory.prisma` | WorkingDB | Inventory, BOM, Serials, Transactions |
| `sales.prisma` | WorkingDB | Quotations, Sale Orders, Delivery, Invoices |
| `documents.prisma` | WorkingDB | Documents, Templates, Bulk Operations |

## Note on Prisma Multi-Client Architecture

Each database has its own generated Prisma client (7 clients total in the monolith).
See `PRISMA_CLIENTS.md` or memory file `project_prisma_clients.md` for details.

When the GV vertical eventually becomes a standalone microservice, these schemas
will be the source of truth for its own Prisma client.
