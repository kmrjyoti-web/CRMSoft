# Diff Triage — WorkingDB + MarketplaceDB
**Date:** 2026-04-13
**Authorization:** Pre-production, no data preservation required.
**Resolution:** `prisma db push --accept-data-loss` per DB

---

## Executive Summary

| Category | WorkingDB | MarketplaceDB | Total | Resolution |
|---|---|---|---|---|
| **A** — Schema ahead of DB | 13 | 77 | 90 | CREATE (db push) |
| **B** — DB ahead of schema | 193 | 312 | 505 | DROP from DB (db push --accept-data-loss) |
| **C** — Sprint A leftover | 79 | 243 | 322 | DROP _deprecated_ tables (db push --accept-data-loss) |
| **D** — Type/constraint mismatch | 10 | 0 | 10 | ALTER to match schema (db push --accept-data-loss) |
| **Total** | **295** | **632** | **927** | |

---

## WorkingDB — 295 statements

### Category A — Schema ahead of DB (13)
| Statement | Object | Decision |
|---|---|---|
| CreateTable: saved_filters (in schema, not in DB) | — | db push to create |
| CreateTable: price_lists (in schema, not in DB) | — | db push to create |
| CreateTable: price_list_items (in schema, not in DB) | — | db push to create |
| CreateIndex: saved_filters_tenant_id_entity_type_idx (in schema, not in DB) | — | db push to create |
| CreateIndex: saved_filters_tenant_id_created_by_id_idx (in schema, not in DB) | — | db push to create |
| CreateIndex: saved_filters_is_deleted_idx (in schema, not in DB) | — | db push to create |
| CreateIndex: price_lists_tenant_id_idx (in schema, not in DB) | — | db push to create |
| CreateIndex: price_lists_tenant_id_is_active_idx (in schema, not in DB) | — | db push to create |
| CreateIndex: price_lists_is_deleted_idx (in schema, not in DB) | — | db push to create |
| CreateIndex: price_list_items_price_list_id_idx (in schema, not in DB) | — | db push to create |
| CreateIndex: price_list_items_product_id_idx (in schema, not in DB) | — | db push to create |
| CreateIndex: price_list_items_price_list_id_product_id_min_quantity_key (in schema, not in DB) | — | db push to create |
| AddForeignKey on price_list_items | — | db push to create |

### Category B — DB ahead of schema (193)

Tables/FKs/enums in WorkingDB Postgres but not in `working.prisma`. These are from IdentityDB/PlatformDB schemas (pre-split era) and non-SAFE_DROP tables from Sprint A drift audit.

| Type | Count | Decision |
|---|---|---|
| DropEnum | 58 | DROP from DB (pre-prod, no data preservation) |
| DropFK | 85 | DROP from DB (pre-prod, no data preservation) |
| DropTable | 50 | DROP from DB (pre-prod, no data preservation) |

### Category C — Sprint A leftover (79)
| Type | Count | Decision |
|---|---|---|
| Other | 35 | DROP _deprecated_ tables (effectively Sprint A.2) |
| Sprint A leftover | 44 | DROP _deprecated_ tables (effectively Sprint A.2) |

### Category D — Type/constraint mismatches (10)
| Table | Change | Decision |
|---|---|---|
| `activities` | DROP COLUMN `vertical_data` | DROP — column not in schema (vestigial) |
| `demos` | DROP COLUMN `vertical_data` | DROP — column not in schema (vestigial) |
| `follow_ups` | DROP COLUMN `vertical_data` | DROP — column not in schema (vestigial) |
| `leads` | ALTER DEFAULT | Set to match schema |
| `proforma_invoices` | DROP COLUMN `vertical_data` | DROP — column not in schema (vestigial) |
| `quotations` | DROP COLUMN `vertical_data` | DROP — column not in schema (vestigial) |
| `raw_contacts` | DROP COLUMN `vertical_data` | DROP — column not in schema (vestigial) |
| `tasks` | DROP COLUMN `vertical_data` | DROP — column not in schema (vestigial) |
| `tour_plans` | DROP COLUMN `vertical_data` | DROP — column not in schema (vestigial) |
| `verification_invites` | ALTER COLUMN types + pkey | Align to schema types |

---

## MarketplaceDB — 632 statements

### Category A — Schema ahead of DB (77)
| Type | Count | Decision |
|---|---|---|
| AddForeignKey on mkt_analytics_summaries | 3 | CREATE (db push) |
| AddForeignKey on mkt_enquiries | 1 | CREATE (db push) |
| AddForeignKey on mkt_listing_price_tiers | 1 | CREATE (db push) |
| AddForeignKey on mkt_offer_redemptions | 1 | CREATE (db push) |
| AddForeignKey on mkt_offers | 1 | CREATE (db push) |
| AddForeignKey on mkt_post_comments | 1 | CREATE (db push) |
| AddForeignKey on mkt_post_engagements | 1 | CREATE (db push) |
| AddForeignKey on mkt_reviews | 1 | CREATE (db push) |
| CreateEnum | 14 | CREATE (db push) |
| CreateIndex | 40 | CREATE (db push) |
| CreateTable | 13 | CREATE (db push) |

### Category B — DB ahead of schema (312)
| Type | Count | Decision |
|---|---|---|
| DropEnum | 159 | DROP from DB (pre-prod) |
| DropFK | 72 | DROP from DB (pre-prod) |
| DropTable | 81 | DROP from DB (pre-prod) |

### Category C — Sprint A leftover (243)
| Type | Count | Decision |
|---|---|---|
| DropTable | 148 | DROP _deprecated_ (effectively Sprint A.2) |
| Other | 95 | DROP _deprecated_ (effectively Sprint A.2) |
