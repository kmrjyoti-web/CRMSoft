# WhiteLabelDB — Deep Documentation

**Schema root:** `WhiteLabel/wl-api/prisma/schema.prisma` (standalone, not in main backend)
**Generator output:** Default (`node_modules/.prisma/client` inside `wl-api`)
**Env var:** `DATABASE_URL` (scoped to the `wl-api` app)
**Model count:** 21
**Migration policy:** `prisma migrate deploy` (formal migrations)

---

## Purpose

The White Label platform's database. Tracks WhiteLabel partners (resellers / agencies who offer CRMSoft under their own brand), their branding, domains, pricing, deployments, custom builds, billing, and SLAs.

**Blast radius:** Medium — losing this DB means WL partners can't manage their brand configs, but end-user tenants in IdentityDB/WorkingDB keep working.

**Why separate and in its own app:** WL partners are a separate multi-tenancy scope on top of CRMSoft's core multi-tenancy. They need their own admin surface (`wl-api` + corresponding frontends) with its own security boundary. Co-mingling partner PII/billing with the main SaaS's DBs would blur that boundary.

---

## Location Note for V5 Restructure

This schema lives **outside** `Application/backend/prisma/`. It's a separate Next.js service at `WhiteLabel/wl-api/`. The V5 restructure should probably leave it in place unless the WL app is being explicitly restructured — it has its own Prisma generator, its own `DATABASE_URL`, its own deployment.

---

## Schema Overview

Single `schema.prisma` file with 14 enums and 21 models. Enums include:

- `PartnerStatus` (TRIAL, ACTIVE, SUSPENDED, CANCELLED)
- `PartnerPlan` (STARTER, PROFESSIONAL, ENTERPRISE)
- `DomainType` (PRIMARY, CRM_ADMIN, VENDOR_PANEL, MARKETPLACE, API)
- `SslStatus`, `DeploymentStatus`
- `BranchType` (MAIN, FEATURE, HOTFIX, CUSTOM), `BranchScope` (FULL, FUNCTION_SPECIFIC)
- `DevRequestType` (FEATURE, BUG_FIX, CUSTOMIZATION, INTEGRATION), `DevRequestStatus`
- `InvoiceStatus`

---

## Full Model List

### Partner identity + branding (3 models)

| Model | Purpose |
|---|---|
| `WhiteLabelPartner` | The root partner record (name, plan, status, contact) |
| `PartnerBranding` | Logos, colors, fonts, email templates for the partner's brand |
| `PartnerDomain` | Registered domains per `DomainType` with SSL status |

### Pricing (3 models)

| Model | Purpose |
|---|---|
| `ServicePricingTier` | Platform-defined tiers of service pricing |
| `PartnerServicePricing` | Partner's agreed pricing per service |
| `PartnerCustomerPricing` | Pricing the partner charges their customers (retail markup) |

### Deployment + DevOps (5 models)

| Model | Purpose |
|---|---|
| `PartnerDeployment` | Deployment records (env, status, version) |
| `PartnerGitBranch` | Git branches associated with the partner (for custom builds) |
| `PartnerErrorLog` | Partner-specific error logs |
| `PartnerTestLog` | Partner-specific test run logs |
| `PartnerScalingPolicy` | Auto-scaling policy per partner |
| `PartnerScalingEvent` | Scaling event log |

### Custom Development (2 models)

| Model | Purpose |
|---|---|
| `PartnerDevRequest` | Feature/bug/customization requests from partner |
| `PartnerDevRequestComment` | Threaded comments on dev requests |

### Configuration (2 models)

| Model | Purpose |
|---|---|
| `PartnerFeatureFlag` | Feature flags per partner |
| `PartnerLayoutOverride` | UI layout overrides per partner |

### Billing + Audit (3 models)

| Model | Purpose |
|---|---|
| `PartnerUsageLog` | Usage metering per partner |
| `PartnerInvoice` | Invoices billed to partner |
| `PartnerAuditLog` | Audit log of partner-scoped actions |

### Observability (2 models)

| Model | Purpose |
|---|---|
| `SlaAlert` | SLA breach alerts |
| `WebhookEvent` | Outgoing webhook event log |

---

## Key Models (Deeper Detail)

### `WhiteLabelPartner`

The root. Fields include:

- Contact info (name, email, phone)
- Plan (`PartnerPlan` — Starter / Professional / Enterprise)
- Status (`PartnerStatus` — trial / active / suspended / cancelled)
- Billing + KYC data

### `PartnerBranding`

Theming for the partner's own CRMSoft-branded app. Powers the frontend theme engine when a user accesses the partner's domain. Fields:

- Logos (light/dark, favicon)
- Color palette
- Font families
- Email sender name + reply-to
- Footer text, terms URL, privacy URL

### `PartnerDomain`

A partner can have multiple domains — one per portal type (`DomainType`):

- `PRIMARY` — partner's main domain
- `CRM_ADMIN` — e.g. `app.partner.com` for CRM admin
- `VENDOR_PANEL` — e.g. `vendor.partner.com`
- `MARKETPLACE` — e.g. `market.partner.com`
- `API` — e.g. `api.partner.com`

Each domain has `SslStatus` tracking (Let's Encrypt / manual certs).

### `PartnerServicePricing` + `PartnerCustomerPricing`

Two-layer pricing:

- **`PartnerServicePricing`** — what CRMSoft charges the partner (wholesale).
- **`PartnerCustomerPricing`** — what the partner charges their own customers (retail).

The delta is the partner's margin.

### `PartnerDevRequest` + `PartnerDevRequestComment`

Partner-scoped feature request system. Lifecycle: `SUBMITTED` → `REVIEWING` → `APPROVED` → `IN_PROGRESS` → `TESTING` → `DELIVERED` → `ACCEPTED` (or `REJECTED`).

### `PartnerUsageLog` + `PartnerInvoice`

Metering + billing. Usage is aggregated from `PartnerUsageLog` into `PartnerInvoice` on a configurable cycle.

### `PartnerFeatureFlag` + `PartnerLayoutOverride`

Partner-level overrides on top of CRMSoft defaults. Feature flags enable/disable modules for the partner's entire customer base. Layout overrides tweak UI placement.

### `SlaAlert`

SLA monitoring — partner's uptime/response commitments. Breach triggers alerts to CRMSoft ops.

---

## Cross-DB Touchpoints

WhiteLabelDB is **referenced by IdentityDB** (a partner is also a `Tenant` in the main IdentityDB) and references very little from other DBs.

| From | To | Field |
|---|---|---|
| IdentityDB `Tenant` | WhiteLabelDB `WhiteLabelPartner` | `tenantId = partnerId` linkage (when a Tenant is a WL partner) |
| WhiteLabelDB `PartnerAuditLog` | IdentityDB | `userId` (resolve for display) |
| End-user tenants created under a partner | IdentityDB | `Tenant.parentPartnerId` → partner row |

No `include:` across boundaries — cross-DB resolver only.

---

## Ops Notes

- The `wl-api` service has its own deployment lifecycle; can be updated independently.
- `PartnerDeployment` + `PartnerGitBranch` track custom-build tenants (Enterprise tier partners may get custom code branches).
- `PartnerTestLog` is distinct from PlatformDB testing — it's specifically for partner-environment smoke tests.

---

## V5 Integration

- **Brand axis (V5):** A `WhiteLabelPartner` is a brand in the 3-axis sense. The partner's `PartnerBranding` is the concrete brand configuration.
- **Domain-based routing:** Frontend code reads the request hostname, looks up `PartnerDomain`, and applies the partner's branding.
- **Partner-level feature gating:** `PartnerFeatureFlag` layers on top of plan-level feature gating from IdentityDB `PlanModuleAccess`.
