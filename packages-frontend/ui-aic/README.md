# @crmsoft/ui-aic

**Status:** PLACEHOLDER

## Purpose

AIC-prefixed shared UI component library — a single set of components used by all 7 frontend portals.

## Planned Components (extracted from `crm-admin/src/components/ui/`)

- `AICTable` — canonical table wrapper (replaces ad-hoc `<table>` markup)
- `AICDrawer` — slide-in panel for create/edit forms
- `AICToolbar` — page-level header with actions
- `AICForm` — form layout primitives
- `AICModal`, `AICButton`, `AICBadge`, `AICIcon`, `AICInput`, ... (TBD)

## Migration Approach

Existing component files in `Customer/frontend/crm-admin/src/components/ui/` will be extracted into this package over multiple PRs (not in the V5 restructure itself — this folder is just the destination).
