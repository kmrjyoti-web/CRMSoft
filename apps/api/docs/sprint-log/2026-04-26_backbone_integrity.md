# Backbone Integrity Fix — 2026-04-26

## Built

### DB
- Ran `seed-multi-brand.ts`: brands (default, travvellis) + verticals (SOFTWARE, TRAVEL, RETAIL) seeded into `gv_cfg_brands` / `gv_cfg_verticals`
- No schema migration needed: all 4 backbone fields already existed on `gv_usr_users`

### Backend
- `registerVertical()` now sets `preferredLocale: 'en'` and `onboardingStage: 'email_otp'` on user create — registration users skip language stage
- `onboarding.service.ts` rewritten:
  - New `STAGE_ORDER`: `language → email_otp → mobile_otp → user_type → sub_user_type → profile_redirect → complete`
  - `getStatus()`: dynamic smart-skip based on which backbone fields are populated; returns `categoryCode`, `subcategoryCode`, `verticalCode`, `brandCode` in response
  - `selectUserType()`: maps B2B→COMPANY_B2B, B2C→COMPANY_B2C, IND_SP→INDIVIDUAL_SP, IND_EE→EMPLOYEE; advances to `sub_user_type`
  - New `setSubType()`: saves `subcategoryCode`, advances to `profile_redirect`
  - `completeProfile()`: `verticalCode` now optional; marks `onboardingComplete = true`
  - Old stage value `'vertical_profile'` gracefully handled (treated as past mobile_otp)
- `onboarding.controller.ts`: added `POST /onboarding/sub-type`
- `onboarding.dto.ts`: added `SetSubTypeDto`; made `CompleteProfileDto.verticalCode` optional

### Frontend
- `user-onboarding.service.ts`: added `sub_user_type`, `profile_redirect` stages; added `getSubTypes()`, `setSubType()`; `OnboardingStatus` now includes backbone fields
- `user-onboarding.store.ts`: added `setSubType` action
- New `StageSubUserType.tsx`: loads subcategories from platform-console endpoint using status.verticalCode + status.categoryCode; shows 2-column card grid
- New `StageProfileRedirect.tsx`: redirects to `/profile/setup`
- `StageVerticalProfile.tsx`: archived to `.archive/2026-04-26/`
- `OnboardingDialog.tsx`: updated STAGE_ORDER and step definitions; wires `sub_user_type` → `StageSubUserType`, `profile_redirect` → `StageProfileRedirect`; removed `vertical_profile`
- `OnboardingStepper.tsx`: updated `OnboardingStageKey` union type
- New `app/(main)/profile/setup/page.tsx`: profile completion form; shows subcategory badge; calls `completeProfile`; redirects to `/dashboard`
- `messages/en.json`, `hi.json`, `mr.json`: replaced `verticalProfile` stage key with `subUserType` + `profileSetup`; added `subUserType` section

## Test Results — Apr 28 Demo Path

### PATH A (Travvellis registration → kmrjyoti-style user)
Smart skip logic verified by unit test:
- Post-registration user with backbone set → skips language, user_type, sub_user_type → lands at `profile_redirect` ✅

### PATH B (Existing onboarding user)
Smart skip logic verified:
- Fresh user → starts at `language` ✅
- Post-email-OTP → `mobile_otp` ✅
- Mobile skipped → skips user_type/sub_user_type if backbone set → `profile_redirect` ✅

### kmrjyoti DB state
- Old `onboardingStage = 'vertical_profile'` gracefully treated as past mobile_otp
- `categoryCode = 'B2B'`, `subcategoryCode = 'DMC_PROVIDER'` → both set → skips to `profile_redirect`
- Dialog will open once, redirect to `/profile/setup`, user fills name, marks complete → never shows again

## Apr 28 Demo Status
READY ✅ — run seed, restart backend, login as kmrjyoti, complete profile page once
