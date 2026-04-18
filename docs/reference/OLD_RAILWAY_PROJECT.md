# Old Railway Project — Reference (Archived)

## Status: ARCHIVED (2026-04-17)

All CRMSoft DBs migrated to CRM_V1 Railway project.
Old Railway project kept as backup until full app testing is complete.

## Backup location

```
Application/backend/.env.old-railway-backup
```

This file contains the original DB connection strings for the old Railway project.
It is gitignored and must never be committed.

## Recovery procedure

If CRM_V1 has critical issues:

```bash
cp Application/backend/.env.old-railway-backup Application/backend/.env
npx prisma generate
# App will reconnect to old Railway DBs
```

## Cleanup checklist (after full app test passes)

1. Verify all features work on CRM_V1 end-to-end
2. Delete old Railway project from the Railway dashboard
3. Delete `Application/backend/.env.old-railway-backup`
4. Delete this file

## What changed in CRM_V1

- All 7 DBs migrated: IdentityDB, PlatformDB, WorkingDB, MarketplaceDB, PlatformConsoleDB, GlobalReferenceDB, DemoDB
- GlobalReferenceDB: 12 tables (Sprint B.2 — GST, HSN, currency, timezone, industry, language, pincode)
- DemoDB: seeded and wired (Sprint B)
- IdentityDB: seeded with admin user, 12 roles, 220 permissions (2026-04-17)
