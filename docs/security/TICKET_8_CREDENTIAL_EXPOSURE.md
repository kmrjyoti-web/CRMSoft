# Security Ticket #8 — Credential Exposure in Git History

**Severity:** P1  
**Status:** PARTIALLY REMEDIATED (git rm done; history scrub pending; creds pending rotation)  
**Opened:** 2026-04-22  
**Remediated (partial):** 2026-04-22  
**Owner:** Kumar Jyoti

---

## What Was Exposed

`CRM_V1_DB_CONNECTIONS.txt` was committed to the repository on 2026-04-17 despite containing the header line:

```
# DO NOT COMMIT — contains connection info (this file is gitignored)
```

The `.gitignore` did not have a pattern matching `*_DB_CONNECTIONS.txt`, so `git add` tracked it without warning.

### Exposed Data

| Item | Value | Risk |
|---|---|---|
| Railway production host | `nozomi.proxy.rlwy.net:35324` | External attacker can probe open port |
| DB user | `postgres` | Combined with password = full DB access |
| Seeded admin email + password | `admin@crm.com` / `Admin@123` | Login to CRM as super admin |
| Seeded platform email + password | `platform@crm.com` / `SuperAdmin@123` | Login as platform super admin |

### Git History Commits

The file was present in 2 commits:

```
210170c5 feat: restructure project - rename CrmProjectDevlopment to CrmProject...
c3c6d980 feat: restructure project - rename CrmProjectDevlopment to CrmProject...
```

These commits are in the history of all branches, including `main` and `develop`.

---

## Immediate Remediation (Done — 2026-04-22)

1. **`git rm CRM_V1_DB_CONNECTIONS.txt`** — file removed from HEAD and staging. No longer present in the working tree. ✅
2. **`.gitignore` updated** — added `*_DB_CONNECTIONS.txt`, `*_CONNECTIONS.txt`, `*_CREDENTIALS.txt`, `*_CREDS.txt`, `*.credentials`, `*.secrets` patterns to prevent recurrence. Also added V5 path patterns for `apps-backend/api/.env` and `apps-frontend/**/.env`. ✅

---

## Pending Actions (Manual — Kumar)

### P1 — Rotate credentials on Railway

The exposed passwords may still be active. Until rotated, anyone who has cloned this repo or seen the git history can authenticate.

**Action items:**

1. **Railway PostgreSQL password**: Log into Railway dashboard → CRM_V1 project → each DB service → reset the `postgres` user password. Update `.env` files on all local dev machines and any deployed environments.

2. **Application admin accounts**: The seeded users (`admin@crm.com`, `platform@crm.com`) with passwords `Admin@123`/`SuperAdmin@123` exist in the Railway IdentityDB. These are seeded accounts — either:
   - Change their passwords via the CRM admin UI / direct DB UPDATE, OR
   - Note that these are dev-only seed credentials and the Railway instance is not customer-facing

3. **Verify Railway access**: Confirm whether `nozomi.proxy.rlwy.net:35324` is publicly accessible. If yes, rate-limit or restrict by IP until passwords are rotated.

### P2 — Scrub git history (coordinate with team)

The file content remains in git history. If the repo is or becomes public, or if any team member's local clone is compromised, the history is readable.

**Steps to scrub:**

```bash
# Install git-filter-repo if not present
pip install git-filter-repo

# Remove the file from all history
git filter-repo --path CRM_V1_DB_CONNECTIONS.txt --invert-paths

# Force-push all branches (COORDINATE WITH TEAM FIRST — rewrites history)
git push origin --force --all
git push origin --force --tags
```

**Impact:** All team members must re-clone or run `git fetch --all` + rebase their local branches. Coordinate before executing.

**Priority:** Execute after credential rotation. The history scrub is not urgent if the repo remains private and creds are rotated.

---

## Additional Findings from Credential Scan

Running `grep -r "Admin@123|SuperAdmin@123|nozomi.proxy.rlwy.net"` across the codebase found matches in 27 files. Breakdown:

### Expected / Acceptable

| File | Pattern | Verdict |
|---|---|---|
| `apps-backend/api/prisma/seed.ts` | `Admin@123`, `SuperAdmin@123` | Seed file — expected dev credentials for local seeding |
| `apps-backend/api/prisma/seeds/identity/seed-identity.ts` | Same | Same |
| `apps-backend/api/.env.example` | `platform@crm.com` email only, no password | Acceptable — email without password |
| `docs/**` audit/smoke-test docs | All patterns | Documentation — no functional risk |
| `apps-frontend/crm-admin/src/**/__tests__/**` | `admin@crm.com` | Test fixtures — expected |
| `apps-backend/api/src/**/__tests__/**` | `admin@crm.com` | Test fixtures — expected |

### Requires Follow-up

| File | Pattern | Issue | Action |
|---|---|---|---|
| `WhiteLabel/wl-api/src/modules/auth/auth.service.ts:19,26` | `SuperAdmin@123` | **Hardcoded default password in production code** — `this.config.get('ADMIN_PASSWORD', 'SuperAdmin@123')`. If `ADMIN_PASSWORD` env var is missing, the literal password is used. | Replace default with `undefined` (no fallback); add startup assertion that `ADMIN_PASSWORD` is set |
| `apps-backend/api/src/core/auth/platform-bootstrap.service.ts:48` | `platform@crm.com` | Email-only fallback, no password | Low risk; acceptable with documented env var requirement |

### `wl-api/auth.service.ts` — Recommended Fix

```typescript
// Before (risky default):
const raw = this.config.get('ADMIN_PASSWORD', 'SuperAdmin@123');

// After (fail-fast with no default):
const raw = this.config.get<string>('ADMIN_PASSWORD');
if (!raw) throw new Error('ADMIN_PASSWORD env var is required');
```

This fix is tracked as a follow-up item — not included in this PR to keep scope focused.

---

## Recurrence Prevention

1. `.gitignore` patterns added (this PR) cover `*_DB_CONNECTIONS.txt`, `*_CONNECTIONS.txt`, `*_CREDENTIALS.txt`, `*_CREDS.txt`, `*.credentials`, `*.secrets`.
2. **Team guidance**: Never commit any file containing plaintext connection strings, passwords, or API keys. Use `.env` files (already gitignored) or a secrets manager.
3. **Pre-commit hook** (recommended future work): Add a secret-scanning hook (e.g., `gitleaks` or `git-secrets`) to the repo so that committed credential patterns are caught at commit time rather than discovered in audit.

---

## Timeline

| Date | Event |
|---|---|
| 2026-04-17 | `CRM_V1_DB_CONNECTIONS.txt` committed with Railway creds |
| 2026-04-22 | Exposure discovered during V5 baseline audit (BASELINE_GATE.md ticket #8) |
| 2026-04-22 | `git rm` executed; `.gitignore` updated; this document created |
| TBD | Credential rotation on Railway (Kumar action) |
| TBD | Git history scrub (coordinate with team) |
