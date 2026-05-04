# Onboarding Audit — 2026-04-26

> Sprint 1 Discovery-First audit for forced 5-stage onboarding wall.
> Read-only. No code changed. All findings below are source-of-truth for Sprint 2 planning.

---

## 1. Executive Summary

The CRMSoft `crm-admin` frontend has **no onboarding wall**. After login, users land directly on `/self-care` or a company dashboard with zero verification gates. The goal is to insert a **5-stage forced onboarding** (Language → Email OTP → Mobile OTP → User Type → Vertical + Profile) in 3 languages (en / hi / mr) before any company access.

**Verdict:** About 60% of the infrastructure already exists or can be reused. The remaining 40% is new work — primarily i18n setup, onboarding state tracking on the User model, a dedicated onboarding module/controller, and 3 missing UI components.

---

## 2. What Exists — REUSE

### 2.1 Theme & Styling

| Item | Status | Location |
|------|--------|----------|
| CSS variable system (`--brand-*`) | ✅ Exists | `globals.css` + `BrandThemeProvider` |
| Inter + Playfair Display fonts | ✅ Exists | `layout.tsx` via `next/font/google` |
| Neutral Premium dark theme | ✅ Exists | `styles/themes/neutral-premium.ts` |
| Golden Hour (Travvellis) theme | ✅ Exists | `lib/brand/registry.tsx` |
| `useActiveCompany()` hook | ✅ Exists | returns 30+ theme tokens |
| Tailwind config | ✅ Minimal | `tailwind.config.ts` — content paths only, no custom palette |

**Onboarding implication:** Use Neutral Premium theme for the onboarding wall (no active company yet). Inline styles + CSS vars pattern already established.

### 2.2 AICShared UI Components

Library root: `lib/coreui/packages/ui-react/src/components/` (76 components)
Wrapped/exported from: `src/components/ui/` ← **ONLY import source**

Components available for onboarding:

| Component | Wrapper | Use |
|-----------|---------|-----|
| `AICDialog` | `ui/AICDialog` | Fullscreen onboarding modal overlay |
| `AICOTPInput` | `ui/AICOTPInput` | 6-digit OTP entry (Stage 2 + Stage 3) |
| `AICRadioGroup` | `ui/AICRadioGroup` | User type selection (Stage 4) |
| `AICSegmentedControl` | `ui/AICSegmentedControl` | Language switcher (Stage 1) |
| `AICMobileInput` | `ui/AICMobileInput` | Phone number entry with country code |
| `AICButton` | `ui/AICButton` | CTA buttons throughout |
| `AICInput` | `ui/AICInput` | Text inputs (profile stage) |
| `AICSelect` | `ui/AICSelect` | Vertical selector (Stage 5) |
| `AICBadge` | `ui/AICBadge` | Step indicators |
| `AICToast` / `AICAlert` | `ui/AICToast`, `ui/AICAlert` | Error/success feedback |

**Missing (must build):**

| Component | Why Needed | Build Approach |
|-----------|-----------|----------------|
| `AICStepper` | Step progress indicator (1 of 5) | New `src/components/onboarding/OnboardingStepper.tsx` — inline styled, no AIC dep |
| `AICProgressBar` | Visual step fill | Part of OnboardingStepper or CSS-only |
| `AICLanguageSelector` | Flagged language cards | New `src/components/onboarding/LanguageCard.tsx` — wraps `AICSegmentedControl` or custom |

### 2.3 Backend — OTP Infrastructure

| Item | Status | Location |
|------|--------|----------|
| `VerificationOtp` Prisma model | ✅ Exists | `prisma/identity/v1/_base.prisma` |
| `OtpPurpose` enum | ✅ Exists | EMAIL_VERIFICATION, MOBILE_VERIFICATION, PASSWORD_RESET, LOGIN_OTP, TRANSACTION |
| `OtpStatus` enum | ✅ Exists | OTP_PENDING / OTP_VERIFIED / OTP_EXPIRED / OTP_FAILED |
| `OtpService` (sendOtp + verifyOtp) | ✅ Exists | `src/modules/softwarevendor/verification/services/otp.service.ts` |
| Cooldown enforcement (60s) | ✅ Exists | In `OtpService.sendOtp()` |
| Expiry (10 min) | ✅ Exists | In `OtpService.verifyOtp()` |
| Max attempts (3) | ✅ Exists | In `OtpService.verifyOtp()` |
| Email transport (nodemailer) | ✅ Installed | `package.json` dep confirmed |

**OtpService is in the wrong module** — currently lives under `softwarevendor`. Must be extracted to a shared `identity` or `verification` module for onboarding use.

### 2.4 User Model — Existing Fields

```prisma
model User {
  emailVerified      Boolean    @default(false)
  emailVerifiedAt    DateTime?
  mobileVerified     Boolean    @default(false)
  mobileVerifiedAt   DateTime?
  verificationStatus String?
  userType           String?    // ADMIN / STAFF / OWNER etc
  phone              String?
}
```

These fields map directly to Stages 2, 3, and 4 of the onboarding wall.

### 2.5 Auth & Layout Injection Points

| Item | Location |
|------|----------|
| Main protected layout | `src/app/(main)/layout.tsx` |
| Middleware (route guard) | `src/middleware.ts` |
| Company dashboard layout | `src/app/company/[companyId]/layout.tsx` |
| Auth store (Zustand) | `src/stores/auth.store.ts` |
| API client | `src/services/api-client.ts` |

**Best injection point:** `(main)/layout.tsx` — renders before all protected pages. An `OnboardingGate` component mounted here can intercept and redirect/block until onboarding is complete.

---

## 3. What's Missing — BUILD in Sprint 2

### 3.1 User Model — Missing Fields

```prisma
// Need to add via Prisma migration:
model User {
  onboardingComplete  Boolean   @default(false)
  onboardingStage     Int       @default(0)   // 0-5
  preferredLocale     String?   @default("en") // en | hi | mr
}
```

`OnboardingStep` enum in the schema is **TENANT-level** (CREATED / PROFILE_COMPLETED / USERS_INVITED / DATA_IMPORTED / COMPLETED) — not user-level. Cannot reuse for per-user onboarding progress.

### 3.2 i18n — Nothing Installed

```
next-intl          NOT installed
react-i18next      NOT installed
i18next            NOT installed
Translation files  NONE (no /locales or /messages dir)
```

Full i18n stack needed:
- Install `next-intl`
- Create `messages/en.json`, `messages/hi.json`, `messages/mr.json`
- Configure `i18n.ts` and middleware routing
- Onboarding strings: ~40 keys per language

### 3.3 Backend — Onboarding Module

No dedicated onboarding controller or service exists. Need:

```
src/modules/core/identity/onboarding/
  onboarding.module.ts
  onboarding.controller.ts   # POST /onboarding/:stage/complete
  onboarding.service.ts      # update user stage, validate step
  dto/
    complete-stage.dto.ts
```

Also need:
- **Extract `OtpService`** from `softwarevendor` → `core/identity/verification/`
- **`GET /auth/me/onboarding-status`** — return current stage + completion flags
- **Auth guard** that checks `onboardingComplete` before allowing company access

### 3.4 Frontend — Missing Components

| Component | Path | Notes |
|-----------|------|-------|
| `OnboardingGate` | `src/components/onboarding/OnboardingGate.tsx` | Mounted in `(main)/layout.tsx`, checks store, renders wall |
| `OnboardingWall` | `src/components/onboarding/OnboardingWall.tsx` | Full-screen overlay, manages stage state |
| `OnboardingStepper` | `src/components/onboarding/OnboardingStepper.tsx` | Step progress 1-of-5 visual |
| `Stage1Language` | `src/components/onboarding/stages/Stage1Language.tsx` | Language select with 3 cards |
| `Stage2EmailOtp` | `src/components/onboarding/stages/Stage2EmailOtp.tsx` | Send + verify email OTP |
| `Stage3MobileOtp` | `src/components/onboarding/stages/Stage3MobileOtp.tsx` | Phone input + verify mobile OTP |
| `Stage4UserType` | `src/components/onboarding/stages/Stage4UserType.tsx` | Radio: Owner / Admin / Staff |
| `Stage5Profile` | `src/components/onboarding/stages/Stage5Profile.tsx` | Vertical select + name + business name |
| `useOnboarding` | `src/hooks/useOnboarding.ts` | Stage machine: current, advance, back, error |

### 3.5 SMS Gateway — Stub Only

```typescript
// msg91 is a placeholder — not wired to real API
// Need either:
//   a) Wire msg91 properly (account SID + Flow ID)
//   b) Use Twilio as drop-in replacement
//   c) Console.log for dev, real gateway for prod
```

For Sprint 2 demo: console.log OTP is acceptable. Real SMS needed before production.

---

## 4. Recommendations for Sprint 2

### Backend (Priority Order)

1. **Migration**: Add `onboardingComplete`, `onboardingStage`, `preferredLocale` to `User` model
2. **Extract OtpService**: Move from `softwarevendor` → `core/identity/verification/`
3. **Create OnboardingModule**: 5 endpoints (one per stage completion)
4. **Auth guard update**: `TenantGuard` or `JwtAuthGuard` — check `onboardingComplete` before company access
5. **Endpoint**: `GET /auth/me/onboarding-status` — frontend polls this on login
6. **SMS stub**: Wire console OTP for dev, document real gateway swap path

### Frontend (Priority Order)

1. **Install next-intl**: Configure for en/hi/mr, create message files (40 keys each)
2. **OnboardingGate**: Mount in `(main)/layout.tsx` — blocks page render if not complete
3. **OnboardingWall**: Full-screen modal, Neutral Premium dark theme, step state machine
4. **Stage components 1-5**: Build in order, each uses existing `ui/` components where possible
5. **useOnboarding hook**: Centralize all stage logic, API calls, error handling
6. **Auth store update**: Add `onboardingComplete`, `onboardingStage`, `preferredLocale` to Zustand state

### Architecture Decision

**Option A — Dialog overlay** (Recommended): Mount `OnboardingWall` as full-screen overlay inside `(main)/layout.tsx`. No routing changes. Stage state lives in Zustand + synced with backend.

**Option B — Dedicated route**: `/onboarding/stage/[n]` as separate pages. Requires redirect logic in middleware. More work, harder to animate stage transitions.

→ **Go with Option A.** Simpler, consistent with existing `BrandThemeProvider` overlay pattern.

---

## 5. Sprint Estimates

### Sprint 2 — Backend (3–4 days)

| Task | Estimate |
|------|----------|
| Prisma migration (3 User fields) | 1h |
| Extract + refactor OtpService | 3h |
| OnboardingModule (5 endpoints) | 6h |
| Auth guard update | 2h |
| `GET /auth/me/onboarding-status` | 1h |
| Dev SMS stub + doc | 1h |
| **Total** | **~14h** |

### Sprint 2 — Frontend (4–5 days)

| Task | Estimate |
|------|----------|
| next-intl install + config + 3×40 message keys | 4h |
| OnboardingGate + OnboardingWall shell | 3h |
| OnboardingStepper component | 2h |
| Stage 1 — Language | 2h |
| Stage 2 — Email OTP | 3h |
| Stage 3 — Mobile OTP | 2h |
| Stage 4 — User Type | 2h |
| Stage 5 — Vertical + Profile | 3h |
| useOnboarding hook + Zustand wiring | 3h |
| E2E test + QA | 3h |
| **Total** | **~27h** |

### Sprint 3 — Polish & Production (2 days)

| Task | Estimate |
|------|----------|
| Real SMS gateway (msg91 / Twilio) | 4h |
| Email template (branded OTP email) | 3h |
| Onboarding skip/resume logic (returning users) | 2h |
| Animation polish (stage transitions) | 3h |
| **Total** | **~12h** |

---

## 6. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| OtpService extraction breaks softwarevendor module | Medium | Add barrel export; keep old path as re-export during transition |
| next-intl middleware conflicts with existing route guards | Medium | Test middleware chain order; next-intl middleware wraps, not replaces |
| Stage 5 Vertical — no enum parity between frontend and DB | Low | Backend has `verticalCode` on Tenant; User profile stage stores preference, not DB enum |
| SMS OTP blocked in dev (no real gateway) | Low | Console OTP stub + env flag `OTP_DEBUG_MODE=true` |
| User model migration on existing seed data | Low | Migration sets `onboardingComplete=true` for existing users (skip wall for existing accounts) |
| `OnboardingGate` flash (layout renders before check) | Low | Show skeleton/spinner during auth store hydration; gate renders null until store ready |
| Hindi/Marathi font rendering | Low | Inter supports Devanagari subsets — add `subsets: ['devanagari']` to font config |

---

## 7. Appendix — Key File Paths

```
# Backend
apps-backend/api/prisma/identity/v1/users.prisma                     User model
apps-backend/api/prisma/identity/v1/_base.prisma                      Enums (OtpPurpose, OtpStatus, OnboardingStep)
apps-backend/api/src/modules/softwarevendor/verification/             OtpService (extract from here)
apps-backend/api/src/modules/core/identity/                           Target location for OnboardingModule

# Frontend
apps-frontend/crm-admin/src/app/(main)/layout.tsx                     Injection point for OnboardingGate
apps-frontend/crm-admin/src/middleware.ts                             Route guard middleware
apps-frontend/crm-admin/src/stores/auth.store.ts                      Zustand auth store (add onboarding fields)
apps-frontend/crm-admin/src/components/ui/                            AIC wrappers — only import source
apps-frontend/crm-admin/src/app/globals.css                           CSS vars + Neutral Premium defaults
apps-frontend/crm-admin/src/lib/brand/registry.tsx                    Brand registry + ExtendedBrandTheme
apps-frontend/crm-admin/src/hooks/useActiveCompany.ts                 Theme hook
```

---

*Audit conducted: 2026-04-26 | Branch: feat/person-centric-multi-brand | Author: Kumar Jyoti*
