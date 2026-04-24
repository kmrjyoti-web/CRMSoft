# Auditor False-Negative Root Cause — 2026-04-13

## Confirmed: Theory A — Silent skip on unknown prefix

### Buggy logic

**File:** `Application/backend/src/modules/softwarevendor/db-auditor/checks/naming-check.service.ts`
**Lines:** 148–169

```ts
// Line 148: Prefix + module code check (only for tables starting with a vertical prefix)
const firstSegment = tableName.split('_')[0];        // Line 148
if (SYSTEM_PREFIXES.has(firstSegment)) continue;      // Line 149 — skip system
                                                       //
// Line 152: Only validate module code when table starts with a registered vertical prefix
if (validPrefixes.has(firstSegment)) {                 // Line 152 — BUG HERE
  // ... checks module code ...                        // Lines 153-168
}
// Line 169: END — tables with unknown prefix fall through with ZERO findings
```

### What happens

1. `account_groups` → firstSegment = `account`
2. `account` not in `SYSTEM_PREFIXES` → not skipped
3. `account` not in `validPrefixes` (only `gv`, `soft`) → `if` block skipped
4. **No finding generated. Silent pass.**

This affects 371 of 377 tables (98.4%). Only 6 tables with `gv_` or `soft_` prefix
were actually being validated.

### SYSTEM_PREFIXES over-broad (secondary issue)

```ts
const SYSTEM_PREFIXES = new Set([
  'auth', '_prisma', '_deprecated', 'pg', 'sql',
]);
```

- `auth` — **No `auth_*` tables exist in any schema.** Grep confirmed zero matches.
  This is dead code. Removing it.
- `_deprecated` — Correct, Sprint A artifacts. Keep.
- `_prisma` — Correct, Prisma migrations internal table. Keep.
- `pg`, `sql` — Overly broad. `pg_*` and `sql_*` are PostgreSQL system catalog
  tables but those don't appear in Prisma schemas. Removing.

### auth_ decision

**Decision: Remove `auth` from SYSTEM_PREFIXES.** No auth_ tables exist. If NextAuth
tables are added in the future, they should go through the naming convention
(`gv_usr_*`) or be explicitly whitelisted with a comment at that time.

### Existing test encoded the bug

`naming-check.service.spec.ts` line 64:
```ts
it('should skip tables with unrecognized prefix (not a vertical)', ...
  expect(findings).toHaveLength(0); // unknown prefix is silently skipped
```

This test explicitly asserted the false-negative behavior as correct. It will be
replaced with the opposite assertion.

### Tables affected

| DB               | Non-conforming tables |
|------------------|-----------------------|
| IdentityDB       | ~43                   |
| PlatformDB       | ~62                   |
| PlatformConsoleDB| ~29                   |
| WorkingDB        | ~225                  |
| MarketplaceDB    | ~13                   |
| **Total**        | **~371**              |

### Fix plan

1. Remove `auth`, `pg`, `sql` from `SYSTEM_PREFIXES`
2. Add `else` branch after `if (validPrefixes.has(firstSegment))` that generates
   `must-start-with-allowed-prefix` error for ANY table not matching a known prefix
3. Promote `invalid-module-code` from `warn` to `error`
4. Add second-segment module code check for all prefixed tables
5. Replace the false-positive test with true-negative regression tests
