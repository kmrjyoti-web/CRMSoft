# Raw SQL Tenant Audit
Date: 2026-04-27 (M8a Phase 2)

All `$queryRaw`, `$queryRawUnsafe`, `$executeRaw`, `$executeRawUnsafe` usages audited
for tenant-isolation compliance.

---

## Summary

| Result | Count |
|--------|-------|
| ✅ SAFE | 8 |
| ⚠️ NEEDS REVIEW | 0 |
| ❌ FIXED | 0 |

**No tenant gaps found in raw SQL.**

---

## ✅ SAFE — Health checks (not tenant data)

**`src/modules/core/identity/tenant/services/system-health.service.ts`**
```sql
SELECT 1
```
Connectivity check. No tenant data.

**`src/modules/core/health/health.controller.ts`** (×2)
```sql
SELECT 1
```
Health probe. No tenant data. One on `prisma.working`, one on `prisma`.

---

## ✅ SAFE — Identity DB user hierarchy (not working DB, user IDs are cross-tenant)

**`src/modules/customer/comments/application/services/comment-visibility.service.ts`**
```sql
WITH RECURSIVE chain AS (
  SELECT id FROM users WHERE reporting_to_id = ${managerId} AND is_deleted = false
  UNION ALL
  SELECT u.id FROM users u INNER JOIN chain c ON u.reporting_to_id = c.id ...
)
SELECT id FROM chain
```
Queries `users` table in identity DB for org hierarchy. No tenant_id needed — user IDs
are tenant-scoped at the application layer by the calling service.

**`src/modules/customer/tasks/application/services/task-assignment.service.ts`** (×2)
Same recursive hierarchy pattern as above. Identity DB.

**`src/modules/customer/reminders/application/queries/get-manager-reminder-stats/get-manager-reminder-stats.handler.ts`**
Same recursive hierarchy pattern. Identity DB.

---

## ✅ SAFE — Explicit tenant_id bind parameter

**`src/modules/core/identity/settings/services/auto-number.service.ts`**
```sql
SELECT * FROM auto_number_sequences
WHERE tenant_id = $1 AND entity_name = $2
FOR UPDATE
```
Used inside a `$transaction` for auto-number sequence locking. Explicit `tenant_id`
bind parameter. Safe.

---

## ✅ SAFE — Schema-level admin audit (not tenant data)

**`src/modules/softwarevendor/db-auditor/checks/fk-orphan-check.service.ts`** (×3)
```sql
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
FROM information_schema.referential_constraints ...
```
Queries `information_schema` for FK constraints. Admin/DevOps use only.
No tenant data. DB-auditor module is SUPER_ADMIN only.

---

## Why $queryRaw Cannot Be Auto-Intercepted

Prisma `$extends` query extensions intercept typed model operations only.
`$queryRaw` and `$executeRaw` bypass the type system entirely — there is no
interception point. Auto-filtering is structurally impossible.

**Enforcement strategy:**
- Manual audit (this document) — run before each release
- Code review gate: raw SQL PRs require tenant isolation sign-off
- Prefer typed ORM operations; use raw SQL only when recursive CTEs or
  `FOR UPDATE` locking are genuinely needed

---

## Audit Checklist (re-run on new raw SQL)

```bash
grep -rn '\$queryRaw\|\$executeRaw' apps-backend/api/src --include="*.ts" \
  | grep -v "spec\|test\|// " \
  | sort
```

For each result, verify ONE of:
- [ ] Health/connectivity check (no business data)
- [ ] Operates on identity/platform DB (not working DB)
- [ ] Has explicit `tenant_id = $N` bind parameter
- [ ] Admin-only path (SUPER_ADMIN guard, no tenant data leakage)
