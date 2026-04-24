# Discovery: `qa` Module Code Addition Scan

**Date:** 2026-04-13
**Purpose:** Locate every place where locked module codes are defined before adding `qa` as 19th code.

---

## Locations found

| # | File | Type | Current state |
|---|------|------|---------------|
| 1 | `src/modules/softwarevendor/db-auditor/checks/naming-check.service.ts:9` | `LOCKED_MODULE_CODES` Set (18 entries) | Hardcoded constant |
| 2 | `prisma/seeds/platform/2026-04-13_vertical_registry.seed.ts:3` | `LOCKED_MODULE_CODES` array (18 entries) | Used for seed validation |
| 3 | `prisma/schemas/platform.prisma:2737` | Schema comment: "one of 18 locked codes" | Comment only — field is `String @db.VarChar(6)`, no enum |
| 4 | `docs/discovery/2026-04-13_auditor_root_cause.md` | References "module code" in context | Diagnostic doc, no list |

## NOT found (confirmed safe)

- No enum constraint on `moduleCode` — plain `VarChar(6)`, no schema migration needed
- No hardcoded list in `scripts/architecture-guard.sh`
- No hardcoded list in CI workflows
- No hardcoded list in `.claude/CLAUDE.md`
- README mentions "valid module code" generically, no explicit list

## Changes needed

1. `naming-check.service.ts` — add `'qa'` to `LOCKED_MODULE_CODES` Set
2. Seed file — add `'qa'` to `LOCKED_MODULE_CODES` array + add to `gv` vertical modules
3. Schema comment — update "18" → "19"
4. Naming-check tests — add `gv_qa_*` acceptance test
