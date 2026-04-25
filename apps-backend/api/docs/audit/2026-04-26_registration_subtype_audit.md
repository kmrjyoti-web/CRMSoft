# Registration & Sub-User-Type Audit — 2026-04-26

## 1. Executive Summary

Two parallel user-classification systems exist and do NOT conflict — they serve different entry points. `TravvellisRegister.tsx` (Day 7 / PR #46) handles NEW user signup with full category+subcategory selection driven by live `pc_user_category` / `pc_subcategory` DB tables. The onboarding wall (Sprint 1-3) handles POST-LOGIN profile completion for already-created users and does NOT include sub-type selection. There is no duplication at the code level, but there IS a terminology mismatch (B2B vs COMPANY_B2B) and the User model stores no sub-type code after registration. The recommended path is **Option D (Hybrid)** — keep both flows, align terminology, and add `sub_type_code` storage.

---

## 2. DB State

### Sub-User-Type Storage

| Item | Finding |
|------|---------|
| Standalone `UserSubType` Prisma model | NOT FOUND |
| `BusinessTypeRegistry` model (platform DB) | EXISTS — `gv_cfg_business_type_registry`, 15 industry types (TRAVEL_TOURISM, IT_SERVICES, etc.) — this is tenant/company industry config, NOT user sub-types |
| `pc_user_category` table (platform-console DB) | EXISTS — 5 records, this is the "base category" for registration |
| `pc_subcategory` table (platform-console DB) | EXISTS — 4 records seeded for TRAVEL vertical |

### Live Data in `pc_user_category` (5 rows)

| code | name | can_offer_to_b2b |
|------|------|-----------------|
| COMPANY_B2B | Company (B2B) | true |
| COMPANY_B2C | Company (B2C) | false |
| INDIVIDUAL_SP | Individual Service Provider | false |
| CUSTOMER | Customer | false |
| EMPLOYEE | Employee | false |

### Live Data in `pc_subcategory` (4 rows, all TRAVEL vertical)

| code | name | parent_category | requires_approval |
|------|------|----------------|------------------|
| DMC_PROVIDER | DMC Provider | COMPANY_B2B | yes |
| AGENT | Travel Agent | COMPANY_B2C | yes |
| TOUR_GUIDE | Tour Guide | INDIVIDUAL_SP | yes |
| TRAVELER | Traveler | CUSTOMER | no |

**NOTE:** Electric sub-types (Manufacturer, Marketing, Stockist, Shop) documented but NOT seeded.

### User Model Sub-Type Fields (`gv_usr_users`)

| field | present | type |
|-------|---------|------|
| user_type | YES | USER-DEFINED enum |
| business_type | YES | text (free-form, not FK) |
| onboarding_complete | YES | boolean |
| onboarding_stage | YES | text |
| preferred_locale | YES | text |
| sub_type_code | **NOT FOUND** | — |
| sub_type_data JSONB | **NOT FOUND** | — |
| vertical_code | **NOT FOUND** | — |

**Critical gap:** `POST /api/v1/auth/travel/register` accepts `subcategoryCode` but there is nowhere to persist it on the User row. The code likely saves to a different table or discards it — needs verification in auth.service.ts `registerVertical` method.

---

## 3. Backend Code

### Registration Endpoints (existing)

| Endpoint | Status | Accepts |
|---------|--------|---------|
| `POST /api/v1/auth/:vertical/register` | EXISTS, ACTIVE | `categoryCode`, `subcategoryCode`, `brandCode`, `email`, `password`, `registrationFields` |
| `POST /api/v1/auth/customer/register` | EXISTS | customer-specific fields |
| `POST /api/v1/auth/partner/register` | EXISTS | partner fields |
| `POST /api/v1/auth/tenant/register` | EXISTS | tenant creation |
| `POST /api/v1/auth/register` (generic) | 404 — NOT REGISTERED | — |

### Onboarding Endpoints (Sprint 1-3)

| Endpoint | Accepts |
|---------|---------|
| `GET /api/v1/onboarding/status` | — |
| `POST /api/v1/onboarding/locale` | `locale` |
| `POST /api/v1/onboarding/otp/send` | `type` (email/mobile) |
| `POST /api/v1/onboarding/otp/verify` | `type`, `code` |
| `POST /api/v1/onboarding/otp/skip-mobile` | — |
| `POST /api/v1/onboarding/user-type` | `userType` (B2B/B2C/IND_SP/IND_EE) |
| `POST /api/v1/onboarding/complete-profile` | `verticalCode`, `profileFields?` |

### Supporting Services

- `BusinessTypeController` at `/api/v1/business-types/` — industry config for TENANTS (not user sub-types), 15 entries seeded
- `platform-console/creator/user-categories` — serves `pc_user_category` to TravvellisRegister
- `platform-console/creator/user-categories/subcategories?vertical_code=TRAVEL&category_code=B2B` — serves `pc_subcategory` to TravvellisRegister

### Known Issue: Separate Bug

`GET /api/v1/business-types/terminology/resolved` returns 404 — separate routing issue, out of scope.

---

## 4. Frontend Code

### Travvellis-Branded Components

| Component | Path | Status |
|-----------|------|--------|
| TravvellisLogin | `src/components/brand-login/brands/travvellis/TravvellisLogin.tsx` | EXISTS, functional |
| TravvellisRegister | `src/components/brand-login/brands/travvellis/register/TravvellisRegister.tsx` | EXISTS, functional |
| TravvellisDashboard | NOT FOUND | — |

### TravvellisRegister Flow (Day 7 / PR #46)

- **Step 0**: Animated background (same engine as TravvellisLogin)
- **Step 1**: Category select — renders `useCategories()` cards (COMPANY_B2B / COMPANY_B2C / INDIVIDUAL_SP / CUSTOMER / EMPLOYEE)
- **Step 2**: Subcategory select — renders `useSubcategories('TRAVEL', categoryCode)` (DMC / AGENT / TOUR_GUIDE / TRAVELER)
- **Step 3**: Dynamic field form — renders `selectedSub.registrationFields[]` (FieldDef array from DB)
- **Step 4**: Email + password form
- **Submit**: calls `POST /api/v1/auth/travel/register`
- On success (no approval required): stores token, redirects to `/dashboard`
- On approval required: shows confirmation message

Supporting hooks:
- `useCategories()` → `GET /api/v1/platform-console/creator/user-categories`
- `useSubcategories(verticalCode, categoryCode)` → `GET /api/v1/platform-console/creator/user-categories/subcategories`
- `useRegister()` → `POST /api/v1/auth/:verticalCode/register`

### Registration Route

No dedicated `/register` route page found in `src/app/`. `TravvellisRegister` is likely reached via `/brand-login?brand=travvellis&mode=register` or similar URL param on the brand-login page. NOT confirmed — needs visual test.

### Onboarding Wall (Sprint 1-3)

| Stage | Component | Selects |
|-------|-----------|---------|
| 1 | StageLanguage | Language (en/hi/mr) |
| 2 | StageEmailOtp | Email OTP verify |
| 3 | StageMobileOtp | Mobile OTP verify or skip |
| 4 | StageUserType | B2B / B2C / IND_SP / IND_EE (hardcoded) |
| 5 | StageVerticalProfile | Vertical (SOFTWARE/RESTAURANT/TRAVEL/RETAIL/HEALTHCARE/EDUCATION) + optional companyName |

**Sub-type selection in onboarding wall: NOT PRESENT.**

---

## 5. Live Test Results

| Test | Result |
|------|--------|
| `GET /api/v1/business-types/public/list` | 200 — returns 15 industry types |
| `POST /api/v1/auth/travel/register` (short pw) | 400 VALIDATION_ERROR (password too short) — endpoint ACTIVE |
| `POST /api/v1/auth/register` | 404 — not a registered route |
| `GET /api/v1/business-types/terminology/resolved` | 404 (known routing bug) |
| `pc_user_category` row count | 5 rows |
| `pc_subcategory` row count | 4 rows (TRAVEL only) |

---

## 6. Conflict Matrix

| Concern | Registration (TravvellisRegister) | Onboarding Wall (Sprint 1-3) |
|---------|----------------------------------|------------------------------|
| Sub-type selection | YES — DMC/AGENT/TOUR_GUIDE/TRAVELER from DB | NO |
| Industry/Vertical | Implicit (hardcoded TRAVEL in hook call) | YES — 6 verticals (Step 5) |
| Profile fields | YES — dynamic from `registrationFields[]` per sub-type | Minimal — company name only |
| Email OTP | NO (no OTP in registration flow) | YES — Step 2 |
| Mobile OTP | NO | YES — Step 3 (skippable) |
| Language pref | NO | YES — Step 1 |
| Company creation | Indirectly — `subcategoryCode` passed to register endpoint | NO |
| User type terminology | COMPANY_B2B / COMPANY_B2C / INDIVIDUAL_SP | B2B / B2C / IND_SP / IND_EE |
| Entry point | New user (no account) | Logged-in user (post-login) |
| Trigger | User clicks Register | OnboardingDialog on `(main)` layout |

**Terminology mismatch:** Registration uses `COMPANY_B2B`/`COMPANY_B2C` (DB values), onboarding uses `B2B`/`B2C` (simplified). These map to the same concept but are stored differently.

**No code duplication** — they call different endpoints and serve different users.

---

## 7. Resolution Options

### Option A — Keep Both (current state)
- Registration = new signup (category + sub-type + dynamic fields + email+pw)
- Onboarding wall = post-login completion (language + OTP + user-type + vertical)
- **Pros**: Clean separation, both functional today
- **Cons**: User type terminology diverges (B2B vs COMPANY_B2B), sub-type never stored on User row

### Option B — Merge into Registration only
- Remove onboarding wall, force complete registration upfront
- **Pros**: One flow, sub-type captured at signup
- **Cons**: Breaks migration path for existing users with incomplete profiles, loses language/OTP step

### Option C — Merge into Onboarding only
- Registration = email + password only
- Onboarding wall = sub-type + dynamic fields + OTP
- **Pros**: Lower signup friction
- **Cons**: Category/sub-type would need to be moved into onboarding (significant work), loses brand-aware sub-type UI

### Option D — Hybrid (RECOMMENDED)
- Registration: full flow as-is (category + sub-type + fields) — mark as complete in onboarding
- Onboarding wall: skip sub-type stage for users who came through full registration; only show for migrated/incomplete accounts
- Add sub-type storage: persist `subcategoryCode` to `gv_usr_users.user_type` or a new `sub_type_code` column
- Align terminology: map COMPANY_B2B → B2B etc. in one place

---

## 8. Recommendation: Option D

**Reasoning:**
- TravvellisRegister is 95% done, brand-polished, uses live DB data — throw nothing away
- Onboarding wall is needed for Apr 28 demo (existing seeded user has no sub-type)
- Real conflict to fix: sub-type is collected at registration but NOT saved on User model
- Terminology mismatch (B2B vs COMPANY_B2B) must be resolved in one canonicalization layer

**Minimum effort for Apr 28 demo (2 hours):**
1. In `auth.service.ts` `registerVertical()` — save `subcategoryCode` to `user.businessType` (already exists as free-text field)
2. In onboarding `StageUserType` — map B2B → COMPANY_B2B when checking if sub-type already set
3. In `OnboardingDialog` guard — if `user.businessType` populated, skip StageUserType stage

**Post-demo (proper implementation, ~1 day):**
1. Add `sub_type_code` column to `gv_usr_users`
2. Seed remaining verticals' subcategories (Electric: Manufacturer/Marketing/Stockist/Shop)
3. Make onboarding wall sub-type stage read from `pc_subcategory` (same as TravvellisRegister)
4. Canonicalize terminology to `pc_user_category.code` format

---

## 9. Effort Estimate

| Task | Effort |
|------|--------|
| Persist subcategoryCode in registerVertical() | 30 min |
| Skip onboarding sub-type stage if already set | 30 min |
| Terminology canonicalization | 1 hour |
| Add sub_type_code DB column + migration | 1 hour |
| Seed Electric/other sub-types | 1 hour |
| Full onboarding → sub-type from DB | 3 hours |
| **Demo minimum (tasks 1+2)** | **1 hour** |

---

## 10. Risks

| Risk | Severity | Notes |
|------|----------|-------|
| Registration flow untested end-to-end | HIGH | Sub-type collect works but save path unclear |
| User model missing sub_type_code field | MEDIUM | Data silently dropped post-registration |
| Terminology drift (B2B vs COMPANY_B2B) | MEDIUM | Two sources of truth for same concept |
| Electric sub-types not seeded | LOW | Travel is the only demo vertical |
| pc_subcategory only has TRAVEL | LOW | Other verticals show empty sub-type list |
