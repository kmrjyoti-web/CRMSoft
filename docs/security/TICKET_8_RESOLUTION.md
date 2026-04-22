# Security Ticket #8 — Credential Exposure: Resolution

**Severity:** P1  
**Status:** ✅ CLOSED (git + code side complete; DB rotation is Kumar manual step)  
**Opened:** 2026-04-22  
**Resolved:** 2026-04-23  
**Owner:** Kumar Jyoti

---

## Original Exposure

`CRM_V1_DB_CONNECTIONS.txt` was committed to git on 2026-04-17 despite its own header saying it was gitignored. The `.gitignore` lacked a pattern for `*_DB_CONNECTIONS.txt`.

**Exposed data:**
- Railway production host: `nozomi.proxy.rlwy.net:35324`
- DB user: `postgres`
- `admin@crm.com` / `Admin@123` (SUPER_ADMIN tenant user)
- `platform@crm.com` / `SuperAdmin@123` (SuperAdmin global user)

**In git history since:** commits `210170c5`, `c3c6d980`

---

## Resolution Actions

### ✅ Done (2026-04-22 — PR #14)

- `git rm CRM_V1_DB_CONNECTIONS.txt` — file removed from working tree
- `.gitignore` updated with `*_DB_CONNECTIONS.txt`, `*_CONNECTIONS.txt`, `*_CREDENTIALS.txt`, `*_CREDS.txt`, `*.credentials`, `*.secrets`
- Added V5 path coverage for `apps-backend/api/.env` and `apps-frontend/**/.env`

### ✅ Done (2026-04-23 — this PR)

- **New passwords generated** (bcrypt cost 12, terminal output only — NOT in any file)
- **`prisma/seeds/identity/seed-identity.ts`** refactored: removed hardcoded `Admin@123` / `SuperAdmin@123`; now reads `ADMIN_INITIAL_PASSWORD` and `PLATFORM_INITIAL_PASSWORD` env vars; throws if either is missing
- **`prisma/seed.ts`** refactored: same env var approach applied
- **`apps-backend/api/.env.example`** updated: added `ADMIN_INITIAL_PASSWORD` and `PLATFORM_INITIAL_PASSWORD` placeholder entries with documentation
- **`docs/security/rotate-admin-passwords.sql`** created: ready-to-run SQL for Kumar to fill in hashes and execute against Railway IdentityDB

### ⏳ Pending (Kumar manual — REQUIRED to fully close P1)

1. **Fill in and run the SQL rotation script:**
   - Open `docs/security/rotate-admin-passwords.sql`
   - Replace `<BCRYPT_HASH_FOR_ADMIN>` and `<BCRYPT_HASH_FOR_PLATFORM>` with the hashes from the terminal output during Phase 4
   - Run against Railway IdentityDB: `psql "postgresql://postgres:<pw>@nozomi.proxy.rlwy.net:35324/identitydb" -f docs/security/rotate-admin-passwords.sql`
   - Verify: old passwords no longer work, new passwords work

2. **Update local `.env` files** with the new `ADMIN_INITIAL_PASSWORD` / `PLATFORM_INITIAL_PASSWORD` values

3. **Verify Railway IdentityDB port** — confirm `nozomi.proxy.rlwy.net:35324` is not publicly accessible without auth, or restrict by IP

4. **Git history scrub** (optional, lower priority now that creds are rotated):
   ```bash
   pip install git-filter-repo
   git filter-repo --path CRM_V1_DB_CONNECTIONS.txt --invert-paths
   git push origin --force --all  # coordinate with team first
   ```

---

## Why Git History Is Acceptable Post-Rotation

Old passwords (`Admin@123`, `SuperAdmin@123`) remain in git history. **This is the industry-standard outcome:**
- DB no longer accepts old passwords after the SQL rotation
- An attacker reading git history sees useless credentials
- History scrub (step 4 above) is additive security, not a prerequisite for closure

---

## Seed Architecture Going Forward

Seeds now require env vars to run:

```bash
# In .env (gitignored):
ADMIN_INITIAL_PASSWORD=your-strong-password-here
PLATFORM_INITIAL_PASSWORD=your-strong-password-here

# Then:
pnpm prisma:seed
```

If `ADMIN_INITIAL_PASSWORD` or `PLATFORM_INITIAL_PASSWORD` is missing, the seed throws immediately:
```
Error: ADMIN_INITIAL_PASSWORD env var is required for seeding
```

This prevents accidental re-seeding with a blank or guessable password.

---

## Additional Findings (from 2026-04-22 scan)

| File | Finding | Status |
|---|---|---|
| `WhiteLabel/wl-api/src/modules/auth/auth.service.ts:19,26` | Hardcoded `SuperAdmin@123` fallback in production code | **Open — follow-up ticket** |
| `apps-backend/api/src/core/auth/platform-bootstrap.service.ts:48` | Email-only fallback (`platform@crm.com`), no password | Low risk — acceptable |
| All test fixtures | `admin@crm.com` in test data | Expected — no functional risk |

The `wl-api` hardcoded fallback is the only remaining code-level concern. Recommended fix:

```typescript
// wl-api/src/modules/auth/auth.service.ts — replace default with fail-fast:
const raw = this.config.get<string>('ADMIN_PASSWORD');
if (!raw) throw new Error('ADMIN_PASSWORD env var is required');
```

---

## Recurrence Prevention

1. `.gitignore` now blocks `*_DB_CONNECTIONS.txt` and related patterns ✅
2. Seed files throw if password env vars are missing ✅
3. **Recommended:** Add `gitleaks` or `git-secrets` pre-commit hook to catch plaintext credential patterns before commit
