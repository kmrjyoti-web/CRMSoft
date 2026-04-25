# Apps — Executable Applications

Entry points for backend API and frontend portals.

## Structure

```
apps/
├── backend/
│   ├── api/           (NestJS monolith, port 3001) — migrating from apps-backend/api/
│   ├── jobs/          (background jobs)
│   └── scheduled/     (scheduled tasks)
└── frontend/
    ├── _shared/              (shared UI components across portals)
    ├── crm-admin-new/        (port 3002) — migrating from apps-frontend/crm-admin/
    ├── vendor-panel-new/     (port 3003)
    ├── customer-portal-new/  (port 3004)
    ├── marketplace-new/      (port 3005)
    ├── wl-admin-new/         (port 3006)
    ├── wl-partner-new/       (port 3007)
    └── platform-console-new/ (port 3008)
```

## Migration Status

During V6 migration:
- Existing `apps-backend/` and `apps-frontend/` remain **fully functional**
- New `apps/` folders are populated incrementally via git mv
- Both coexist until full migration completes
- Old dirs removed only after new dirs verified

## -new Suffix Convention

`crm-admin-new/` etc. exist alongside `apps-frontend/crm-admin/` during
migration. The `-new` suffix is temporary — removed once migration
is verified complete and old dirs deleted.
