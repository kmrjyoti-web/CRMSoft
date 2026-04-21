# IdentityDB — Deep Documentation

**Schema root:** `Application/backend/prisma/identity/v1/`
**Generator output:** `node_modules/@prisma/identity-client`
**Env var:** `IDENTITY_DATABASE_URL`
**Model count:** 43
**Migration policy:** `prisma migrate deploy` (formal migrations)

---

## Purpose

The security perimeter of CRMSoft. Holds all authentication, authorization, tenant metadata, licensing, and audit data. Everything that answers "who is this request, and are they allowed to do this?"

**Blast radius:** If this DB is corrupted, nothing else works. All other DBs reference `tenantId` and `userId` from here.

---

## Schema Files

| File | Lines | Purpose | Models |
|---|---:|---|---:|
| `_base.prisma` | 403 | Datasource + generator + all shared enums (UserStatus, TenantStatus, UserType, SubscriptionStatus, FeatureFlag, AuditAction, …) | 0 |
| `users.prisma` | 680 | Users, roles, permissions, tenants, delegation, OTP | 19 |
| `config.prisma` | 423 | Tenant config, branding, security policy, menu, credentials | 11 |
| `audit.prisma` | 239 | Audit log, retention policy, credential access log, portal log | 7 |
| `licensing.prisma` | 145 | Plans, subscriptions, invoices, usage, limits | 6 |

---

## Full Model List

### users.prisma (19 models)

`User`, `CustomerProfile`, `ReferralPartner`, `Department`, `Designation`, `Role`, `Permission`, `RolePermission`, `RoleMenuPermission`, `PermissionTemplate`, `UserCapacity`, `DelegationRecord`, `UserPermissionOverride`, `Tenant`, `SuperAdmin`, `TenantProfile`, `VerificationOtp`, `CustomerUser`

### config.prisma (11 models)

`Menu`, `TenantConfig`, `TenantCredential`, `GlobalDefaultCredential`, `TenantBranding`, `SecurityPolicy`, `IpAccessRule`, `DataRetentionPolicy`, `TerminologyOverride`, `TenantVersion`, `VersionBackup`, `CustomerMenuCategory`

### audit.prisma (7 models)

`AuditLog`, `AuditFieldChange`, `AuditRetentionPolicy`, `CredentialAccessLog`, `TenantAuditSession`, `TenantAuditLog`, `CustomerPortalLog`

### licensing.prisma (6 models)

`Plan`, `Subscription`, `TenantInvoice`, `TenantUsage`, `PlanLimit`, `PlanModuleAccess`

---

## Key Models (Deep Detail)

### `Tenant`

The root entity — every other business record in the system is tenant-scoped via `tenantId`.

- **Purpose:** Represents one customer account (B2B/B2C organization or individual).
- **Lifecycle:** `TRIAL` → `ACTIVE` → (`SUSPENDED` | `CANCELLED`) per `TenantStatus` enum.
- **`DEMO` status** routes reads/writes to DemoDB instead of WorkingDB.
- **`dbStrategy`** (`SHARED` | `DEDICATED`) controls whether the tenant shares the common WorkingDB or gets a dedicated database provisioned.
- **Cross-DB:** Every record in Working/Demo/Marketplace/Platform references `tenantId`.

### `User`

- **Purpose:** A physical human with login credentials. May belong to multiple tenants via `UserCapacity` / tenant-scoped roles.
- **`userType`:** `ADMIN`, `EMPLOYEE`, `CUSTOMER`, `REFERRAL_PARTNER` (distinct from the 7 CORE business types — user type is about how they use the SaaS, not their business).
- **Cross-DB:** Referenced from Working/Marketplace as `createdById`, `assignedToId`, `ownerId`, etc.

### `Role` / `Permission` / `RolePermission`

Standard RBAC triangle. Permissions are granular action codes (`CONTACT_CREATE`, `LEAD_DELETE`, `INVOICE_APPROVE`). `PermissionTemplate` provides preset bundles.

### `UserPermissionOverride`

Per-user grants or revokes on top of role permissions. Used for exceptions.

### `Subscription` + `Plan` + `PlanLimit` + `PlanModuleAccess`

- **`Plan`** — Defines a subscription tier (name, price, interval).
- **`PlanLimit`** — Per-plan per-entity caps (max contacts, users, emails/month, etc.) using `EntityLimitType` enum.
- **`PlanModuleAccess`** — Which modules are enabled under a plan (`MOD_DISABLED` | `MOD_READONLY` | `MOD_FULL`).
- **`Subscription`** — Active link between a `Tenant` and a `Plan`, with billing cycle tracking.

### `AuditLog` + `AuditFieldChange`

- Every domain action lands here with `AuditAction` enum (CREATE/UPDATE/DELETE/STATUS_CHANGE/…).
- `AuditFieldChange` stores before/after per changed field for full-row diff.
- `AuditRetentionPolicy` drives automated pruning per `RetentionAction` (ARCHIVE/SOFT_DELETE/HARD_DELETE/ANONYMIZE).

### `TenantCredential` + `GlobalDefaultCredential`

Encrypted third-party credentials per tenant (Gmail, WhatsApp Business API, Razorpay, AWS S3, Anthropic Claude, OpenAI, …). See `CredentialProvider` enum in `_base.prisma` for the full list of 23 supported providers. `CredentialStatus` tracks health.

### `VerificationOtp`

OTP lifecycle for email/mobile verification, password reset, login OTP, transaction OTP. Uses `OtpPurpose` and `OtpStatus` enums.

### `SecurityPolicy` + `IpAccessRule`

Per-tenant security posture — password rules, session timeouts, allowlist/denylist IPs.

### `TenantBranding`

Logo, colors, terminology overrides. Used by the frontend theme engine and by `TerminologyOverride` for per-tenant UI text.

### `Menu` + `RoleMenuPermission` + `CustomerMenuCategory`

Menu visibility is tenant + role + customer-type scoped. `CustomerMenuCategory` allows brand/vertical-specific menu grouping.

---

## Key Enums (from `_base.prisma`)

- `UserStatus`, `UserType`, `TenantStatus`, `RegistrationType`, `VerificationStatus`
- `SubscriptionStatus`, `PlanInterval`, `PaymentStatus`, `OnboardingStep`
- `FeatureFlag` (20 flags — WHATSAPP_INTEGRATION, BULK_IMPORT, WORKFLOWS, AI_FEATURES, …)
- `AuditAction`, `AuditEntityType` (26 entity types), `RetentionAction`
- `CredentialProvider` (23 providers including AI: Anthropic Claude, OpenAI GPT, Google Gemini, Groq)
- `CredentialStatus`, `SyncWarningLevel`
- `DbStrategy` (SHARED | DEDICATED)
- `EntityLimitType` (17 limit types)

---

## Cross-DB Touchpoints

IdentityDB is the **authoritative source** for:

| Consumer DB | References from Identity |
|---|---|
| WorkingDB | `tenantId`, `userId`, `roleId`, `departmentId`, `designationId` on most rows |
| DemoDB | Same as WorkingDB (DEMO-status tenants) |
| MarketplaceDB | `userId` (post authors), `tenantId` (listing owners) |
| PlatformDB | `tenantId` on subscriptions, usage, wallet, audit |
| PlatformConsoleDB | `tenantId` (alert rules, health snapshots) |
| WhiteLabelDB | `partnerId` → Tenant (partner is a special Tenant row) |

No DB is allowed to `include:` these fields via Prisma — see [`09_CROSS_DB_PATTERNS.md`](./09_CROSS_DB_PATTERNS.md) for the two-step resolver pattern.

---

## Indexes & Constraints (high-signal)

- `User.email` is globally unique (one human, one login).
- `Tenant.slug` is globally unique (used for subdomain routing).
- `RolePermission` has composite unique `(roleId, permissionId)`.
- `VerificationOtp` has TTL index on `expiresAt` for automated expiry.
- `AuditLog` is partitioned/indexed by `(tenantId, createdAt)` for fast tenant timeline queries.

---

## V5 Dynamic Field Integration

- `Tenant.verticalId` → PlatformDB `GvCfgVertical` registry (cross-DB).
- `Tenant.brandId` → PlatformDB brand registry (cross-DB).
- `User.customBusinessTypeId` (if present) → PlatformDB `BusinessTypeRegistry` (for CRMSoft-curated extensions beyond the 7 core types).
- `TerminologyOverride` is the hook for vertical-specific UI labels.
