# Master Registration Flow & Backbone Field Integrity Audit — 2026-04-26

## 1. Executive Summary

Three distinct registration/onboarding flows exist in CRMSoft. They serve different user types and entry points — there is no code duplication. However, **backbone field coverage is incomplete**: the onboarding wall only saves `categoryCode` and `verticalCode` (out of 4 backbone fields), and two critical config tables (`gv_cfg_vertical`, `gv_cfg_brands`) have no TRAVEL/Travvellis data seeded. The recommended priority order for Apr 28 demo readiness is (1) seed the TRAVEL vertical, (2) seed the Travvellis brand, (3) patch onboarding `completeProfile()` to save `subcategoryCode` and `brandCode`.

---

## 2. Backbone Fields — Model Coverage

All 4 backbone fields exist on the `gv_usr_users` table (confirmed in Prisma identity schema):

| Prisma field | DB column | Type | Present |
|---|---|---|---|
| `categoryCode` | `category_code` | String? | YES |
| `subcategoryCode` | `subcategory_code` | String? | YES |
| `brandCode` | `brand_code` | String? | YES |
| `verticalCode` | `vertical_code` | String? | YES |

**No DB migration needed** — the columns exist and are nullable.

---

## 3. Live DB State — kmrjyoti@gmail.com

Snapshot taken 2026-04-26 (post-TravvellisRegister flow):

| Field | Value |
|---|---|
| `category_code` | `B2B` |
| `subcategory_code` | `DMC_PROVIDER` |
| `brand_code` | `travvellis` |
| `vertical_code` | `TRAVEL` |
| `onboarding_complete` | `false` |
| `onboarding_stage` | `vertical_profile` |
| `role` | `ADMIN` (patched for demo) |

The `registerVertical()` endpoint correctly saved all 4 fields. Onboarding has NOT yet run to completion for this user.

---

## 4. Flow 1 — TravvellisRegister (New User Signup)

**Entry point:** `/brand-login?brand=travvellis&mode=register` (or equivalent URL param)  
**Source:** `src/components/brand-login/brands/travvellis/register/TravvellisRegister.tsx`  
**Backend:** `POST /api/v1/auth/:vertical/register` → `AuthService.registerVertical()`

### Backbone Field Coverage

| Backbone Field | Captured | Persisted | Notes |
|---|---|---|---|
| `categoryCode` | YES — Step 1 (from `pc_user_category`) | YES | Saved as `categoryCode` |
| `subcategoryCode` | YES — Step 2 (from `pc_subcategory`) | YES | Saved as `subcategoryCode` |
| `brandCode` | YES — from URL param / hook | YES | Passed as `brandCode` |
| `verticalCode` | YES — hardcoded `TRAVEL` in hook | YES | Passed as `verticalCode` |

**Result: 4/4 backbone fields captured and persisted. COMPLETE.**

### `registerVertical()` Additional Data Saved

- `registrationFields` (dynamic form data from subcategory config)
- `registrationStatus` (`PENDING_APPROVAL` or `APPROVED`)
- `talentId` (UUID generated)
- `permissionsJson` (default empty `{}`)
- `userType` = `'CUSTOMER'` (always — backbone fields carry the real classification)

### Registration Field Config in DB (pc_subcategory)

`DMC_PROVIDER` (parent: COMPANY_B2B) — 9 registration fields:
`company_name`, `license_number`, `gst_number`, `pan_number`, `tour_types`, `countries_covered`, `contact_person`, `phone`, `address`

`AGENT` (parent: COMPANY_B2C) — fields populated  
`TOUR_GUIDE` (parent: INDIVIDUAL_SP) — fields populated  
`TRAVELER` (parent: CUSTOMER) — minimal fields (no approval required)

### Known Gap

`TravvellisRegister` hardcodes `'TRAVEL'` as the vertical code in `useSubcategories()`. If Travvellis eventually supports multiple verticals, the vertical selection step would need to be added.

---

## 5. Flow 2 — Onboarding Wall (Post-Login Profile Completion)

**Entry point:** `OnboardingDialog` mounts on `(main)` layout; triggers when `onboardingComplete === false`  
**Source:** `src/features/onboarding/components/OnboardingDialog.tsx` + stage components  
**Backend:** `POST /api/v1/onboarding/*` → `OnboardingService`

### Backbone Field Coverage

| Backbone Field | Stage | Captured | Persisted | Method |
|---|---|---|---|---|
| `categoryCode` | 4 — StageUserType | YES (B2B/B2C/IND_SP/IND_EE) | YES | `selectUserType()` saves to `categoryCode` |
| `subcategoryCode` | — | **NO** | **NO** | No sub-type stage exists in onboarding wall |
| `brandCode` | — | **NO** | **NO** | Not collected or saved |
| `verticalCode` | 5 — StageVerticalProfile | YES (6 verticals) | YES | `completeProfile()` saves `verticalCode` |

**Result: 2/4 backbone fields persisted. INCOMPLETE.**

### Onboarding Stage Breakdown

| Stage | Component | What it saves |
|---|---|---|
| 1 | StageLanguage | `preferred_locale` (en/hi/mr) |
| 2 | StageEmailOtp | marks email verified |
| 3 | StageMobileOtp | marks mobile verified (skippable) |
| 4 | StageUserType | `categoryCode` = B2B/B2C/IND_SP/IND_EE |
| 5 | StageVerticalProfile | `verticalCode`, optional `companyName`, sets `onboardingComplete=true` |

### `selectUserType()` Terminology Gap

Onboarding uses simplified codes: `B2B`, `B2C`, `IND_SP`, `IND_EE`  
TravvellisRegister uses DB codes: `COMPANY_B2B`, `COMPANY_B2C`, `INDIVIDUAL_SP`, `EMPLOYEE`

Both write to `categoryCode` but with different values. A user who registers via TravvellisRegister (gets `B2B` from onboarding) would have their `categoryCode` OVERWRITTEN from `COMPANY_B2B` → `B2B` if they later hit the onboarding wall.

**This is the primary data corruption risk across flows.**

### `completeProfile()` Missing Fields

```typescript
// onboarding.service.ts — current state
async completeProfile(userId: string, dto: CompleteProfileDto) {
  await this.identity.user.update({
    where: { id: userId },
    data: {
      verticalCode: dto.verticalCode,
      // registrationFields: dto.profileFields,   ← saves profile fields
      onboardingComplete: true,
      onboardingStage: 'complete',
    },
  });
}
```

Missing from the update: `subcategoryCode`, `brandCode`. These remain at whatever value was set at registration (or null for migrated users).

---

## 6. Flow 3 — GenericRegister / RegisterForm (Tenant/Company Creation)

**Entry point:** `/register` (company brand picker) → `/register?brand=<code>` (form)  
**Source:**  
  - `src/components/auth/GenericRegister.tsx` — brand picker only, no form  
  - `src/features/registration/components/RegisterForm.tsx` — 5-step tenant wizard  
**Backend:** `POST /api/v1/auth/tenant/register`

### Backbone Field Coverage

| Backbone Field | Captured | Notes |
|---|---|---|
| `categoryCode` | **NO** | Not in any wizard step |
| `subcategoryCode` | **NO** | Not in any wizard step |
| `brandCode` | **NO** | Not saved on user (only on company/tenant) |
| `verticalCode` | **NO** (implicit via businessTypeCode) | `businessTypeCode` maps to industry, not `verticalCode` |

**Result: 0/4 backbone fields captured for the creating user. By design — this flow creates a TENANT, not a user registration.**

### What RegisterForm Captures (Tenant Fields)

- Step 1: Account — email, password, firstName, lastName
- Step 2: Industry — `businessTypeCode` (from 15 `gv_cfg_business_type_registry` entries)
- Step 3: Company — `companyName`, `slug`
- Step 4: Plan — `planId`
- Step 5: Review + submit

**This flow is for creating a new tenant/company, not for a user joining a vertical platform.** The creating user becomes OWNER of the new tenant. Their personal backbone fields are NOT set by this flow. If they need vertical-specific classification, they go through the onboarding wall post-login.

---

## 7. Config Table State

### gv_cfg_vertical (Platform DB)

| vertical_code | name | Status |
|---|---|---|
| `gv` | General | EXISTS |
| `soft` | Software Vendor | EXISTS |
| `TRAVEL` | — | **NOT SEEDED** |
| `RETAIL` | — | **NOT SEEDED** |
| `HEALTHCARE` | — | **NOT SEEDED** |
| (others) | — | **NOT SEEDED** |

**Impact:** `POST /api/v1/auth/travel/register` and onboarding `StageVerticalProfile` both reference vertical config. If the service validates vertical codes against this table, TRAVEL registration and onboarding will fail config lookups.

### gv_cfg_brands (Platform DB)

| brand_code | name | Status |
|---|---|---|
| (all) | — | **0 ROWS — EMPTY TABLE** |

**Impact:** Brand resolution fails for all brand-aware endpoints. `CompanyHeader` brand theme switching, JWT brand claims, and any `brandCode`-gated logic will have no data to resolve against.

### pc_user_category (Platform Console DB)

| code | name | Status |
|---|---|---|
| COMPANY_B2B | Company (B2B) | EXISTS |
| COMPANY_B2C | Company (B2C) | EXISTS |
| INDIVIDUAL_SP | Individual Service Provider | EXISTS |
| CUSTOMER | Customer | EXISTS |
| EMPLOYEE | Employee | EXISTS |

**5 rows — complete for TRAVEL vertical demo.**

### pc_subcategory (Platform Console DB)

| code | parent | approval | registration_fields |
|---|---|---|---|
| DMC_PROVIDER | COMPANY_B2B | YES | 9 fields |
| AGENT | COMPANY_B2C | YES | populated |
| TOUR_GUIDE | INDIVIDUAL_SP | YES | populated |
| TRAVELER | CUSTOMER | NO | minimal |

**4 rows — complete for TRAVEL vertical demo.**

---

## 8. Cross-Flow Backbone Traceability Matrix

| Backbone Field | Flow 1 (TravvellisRegister) | Flow 2 (Onboarding Wall) | Flow 3 (RegisterForm) |
|---|---|---|---|
| `categoryCode` | COMPANY_B2B / COMPANY_B2C / INDIVIDUAL_SP / CUSTOMER / EMPLOYEE | B2B / B2C / IND_SP / IND_EE (different format!) | NOT CAPTURED |
| `subcategoryCode` | DMC_PROVIDER / AGENT / TOUR_GUIDE / TRAVELER | NOT CAPTURED | NOT CAPTURED |
| `brandCode` | travvellis (from URL param) | NOT CAPTURED | NOT CAPTURED |
| `verticalCode` | TRAVEL (hardcoded) | SOFTWARE / RESTAURANT / TRAVEL / RETAIL / HEALTHCARE / EDUCATION | NOT CAPTURED |

### Terminology Conflict

| Concept | Flow 1 code | Flow 2 code | DB canonical (pc_user_category) |
|---|---|---|---|
| Business-to-business company | `COMPANY_B2B` | `B2B` | `COMPANY_B2B` |
| Business-to-consumer company | `COMPANY_B2C` | `B2C` | `COMPANY_B2C` |
| Individual service provider | `INDIVIDUAL_SP` | `IND_SP` | `INDIVIDUAL_SP` |
| Employee | `EMPLOYEE` | `IND_EE` | `EMPLOYEE` |

Flow 1 uses the DB canonical codes. Flow 2 uses simplified codes that do not match.

---

## 9. Gap Analysis

### Critical Gaps (block demo)

| Gap | Severity | Impact |
|---|---|---|
| `gv_cfg_vertical` missing TRAVEL | CRITICAL | TRAVEL vertical config lookups fail |
| `gv_cfg_brands` empty | CRITICAL | Brand resolution fails for all brand-aware features |
| Onboarding `categoryCode` terminology mismatch | HIGH | Users who register via TravvellisRegister then hit onboarding wall get `categoryCode` overwritten with wrong format |

### High Gaps (affect data quality)

| Gap | Severity | Impact |
|---|---|---|
| Onboarding wall missing sub-type stage | HIGH | Users who skip TravvellisRegister never get `subcategoryCode` set |
| Onboarding `completeProfile()` missing `subcategoryCode` + `brandCode` | HIGH | Even if sub-type was collected earlier (via registration), `completeProfile()` can't update it for onboarding users |
| Onboarding wall `brandCode` never set | MEDIUM | Brand theme and brand-gated features never know user's preferred brand |

### Low Gaps (post-demo)

| Gap | Severity | Impact |
|---|---|---|
| Electric sub-types not seeded in pc_subcategory | LOW | Only affects Electric vertical (not demo vertical) |
| Flow 3 (RegisterForm) no backbone fields | LOW | By design — tenant creation, not user classification |
| `gv_cfg_vertical` missing RETAIL, HEALTHCARE, etc. | LOW | Only TRAVEL needed for demo |

---

## 10. Recommended Fixes

### Immediate (before Apr 28 demo)

**Fix 1 — Seed TRAVEL vertical** (30 min)  
Add a seed script or direct INSERT into `gv_cfg_vertical`:
```sql
INSERT INTO gv_cfg_vertical (code, name, description, is_active)
VALUES ('TRAVEL', 'Travel & Tourism', 'Travel vertical for tour operators, agents, DMCs', true);
```

**Fix 2 — Seed Travvellis brand** (30 min)  
Add seed into `gv_cfg_brands`:
```sql
INSERT INTO gv_cfg_brands (code, name, theme_config, is_active)
VALUES ('travvellis', 'Travvellis', '{"primaryColor":"#0ea5e9","logoUrl":"/brands/travvellis/logo.png"}', true);
```

**Fix 3 — Fix terminology mismatch in OnboardingService** (30 min)  
In `onboarding.service.ts` `selectUserType()`, map simplified codes to canonical DB codes before saving:
```typescript
const CATEGORY_MAP: Record<OnboardingUserType, string> = {
  B2B:    'COMPANY_B2B',
  B2C:    'COMPANY_B2C',
  IND_SP: 'INDIVIDUAL_SP',
  IND_EE: 'EMPLOYEE',
};
const canonicalCode = CATEGORY_MAP[userType] ?? userType;
// save canonicalCode to categoryCode
```

**Fix 4 — Guard onboarding `selectUserType` if already set** (15 min)  
In `OnboardingService.selectUserType()` or `OnboardingDialog`, skip Stage 4 if `categoryCode` is already populated (user came through TravvellisRegister):
```typescript
if (user.categoryCode) {
  // skip stage, advance to next
  return { skipped: true, currentStage: 'vertical_profile' };
}
```

### Post-Demo

| Task | Effort |
|---|---|
| Add sub-type stage to onboarding wall | 2 hours |
| `completeProfile()` save `subcategoryCode` + `brandCode` | 1 hour |
| Seed remaining verticals (RETAIL, HEALTHCARE, etc.) | 1 hour |
| Seed all brand configs from brand-assets/ | 1 hour |
| Canonicalize onboarding user-type enum to DB codes | 1 hour |
| Update `PermissionChainService` to use company role from JWT | 3 hours |

---

## 11. Effort Summary for Apr 28 Demo

| Fix | Effort | Priority |
|---|---|---|
| Seed TRAVEL vertical | 30 min | P0 |
| Seed Travvellis brand | 30 min | P0 |
| Fix onboarding categoryCode terminology | 30 min | P1 |
| Guard onboarding sub-type stage if already set | 15 min | P1 |
| **Total** | **~2 hours** | |

---

## 12. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| gv_cfg_vertical missing TRAVEL blocks registration | HIGH | Seed script run before demo |
| Empty gv_cfg_brands breaks brand theme | HIGH | Seed script run before demo |
| categoryCode overwritten if user hits onboarding after registration | MEDIUM | Stage 4 guard (Fix 4) |
| kmrjyoti demo user has onboarding_stage=vertical_profile, will hit onboarding wall | LOW | Run through onboarding once to complete it, or manually set onboarding_complete=true |
