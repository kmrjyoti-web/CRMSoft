# .env Cleanup Scan — CRM_V1 Alignment

**Date:** 2026-04-16

---

## Current .env DATABASE URL state

| Line | Variable | Host | DB Name | Status |
|------|----------|------|---------|--------|
| 6 | `DATABASE_URL` | nozomi.proxy.rlwy.net:35324 | workingdb | ✅ CRM_V1 |
| 9 | `IDENTITY_DATABASE_URL` | nozomi.proxy.rlwy.net:35324 | identitydb | ✅ CRM_V1 |
| 10 | `PLATFORM_DATABASE_URL` | nozomi.proxy.rlwy.net:35324 | platformdb | ✅ CRM_V1 |
| 11 | *(inline comment)* | junction.proxy.rlwy.net:34932 | railway | ✅ Already commented |
| 12 | `GLOBAL_WORKING_DATABASE_URL` | nozomi.proxy.rlwy.net:35324 | workingdb | ✅ CRM_V1 |
| 44 | `MARKETPLACE_DATABASE_URL` | nozomi.proxy.rlwy.net:35324 | marketplacedb | ✅ CRM_V1 |
| 53 | `GLOBAL_REFERENCE_DATABASE_URL` | junction.proxy.rlwy.net:31603 | railway | ❌ OLD RAILWAY — fix required |
| 56 | `PLATFORM_CONSOLE_DATABASE_URL` | nozomi.proxy.rlwy.net:35324 | platformconsoledb | ✅ CRM_V1 |

## Non-Postgres services (not touched)

| Variable | Value | Action |
|----------|-------|--------|
| `REDIS_URL` | redis://localhost:6379 | Leave — local dev Redis |
| `R2_ENDPOINT` | placeholder | Leave — Cloudflare R2, not Railway |
| `GEMINI_KEY`, `SARVAN_KEY` | API keys | Leave — not DB URLs |

## Summary

- CRM_V1 (nozomi.proxy.rlwy.net) active URLs: **6**
- Old Railway (junction.proxy.rlwy.net) active URLs: **1** (`GLOBAL_REFERENCE_DATABASE_URL`)
- Already commented old Railway: **1** (inline note on line 11)
- Non-Postgres left untouched: **6**

## Action taken

- `GLOBAL_REFERENCE_DATABASE_URL` updated to CRM_V1 (globalreferencedb)
- Old value preserved as `# OLD_RAILWAY (reverted 2026-04-16):` comment
