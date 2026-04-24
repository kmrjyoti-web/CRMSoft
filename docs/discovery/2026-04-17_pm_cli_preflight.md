# PM CLI Phase 1 — Pre-flight Audit

**Date:** 2026-04-17
**Sprint:** PM CLI Rollout — Phase 1 of 4
**Author:** Claude Code (auto-generated)

---

## Project

| Key | Value |
|-----|-------|
| Name | crm-soft |
| Package manager | pnpm 10.30.2 |
| Git branch | develop |
| Uncommitted files | 7 |

---

## CLI Tools

| Tool | Status | Path |
|------|--------|------|
| railway | ✅ installed | /opt/homebrew/bin/railway |
| vercel | ✅ installed | ~/.npm-global/bin/vercel |
| wrangler | ✅ installed | ~/.npm-global/bin/wrangler |
| gh | ✅ installed | /opt/homebrew/bin/gh |
| supabase | ❌ NOT installed | — |
| docker | ✅ installed | Docker.app |

---

## Existing `.claude/` Structure

```
.claude/
├── CLAUDE.md               ← project rules
├── settings.json
├── settings.local.json
├── skills/                 ← 7 skill .md files (audit-module, fix-test-failures, new-module, etc.)
└── sync/                   ← chat-context.md, session-log.md
```

**Note:** No `claude-implement/` directory exists (prompt referenced it, but it is not present).
Skills dir exists — will extend, not replace.

---

## Existing `scripts/` Structure

```
scripts/
├── architecture-guard.sh   ← DO NOT MODIFY
├── backup-to-r2.sh
├── weekly-health-check.sh
├── work-start.sh           ← exists (will create scripts/work/ alongside)
├── work-close.sh           ← exists
├── work-status.sh          ← exists
├── add-try-catch.js
├── npm-audit.js
└── work-*.js               ← JS equivalents

Application/backend/scripts/
├── audit/
├── cleanup/
├── lint/                   ← prisma-structure-lint.sh
├── microservice/
├── rollback/
├── sql/
└── several .py/.ts/.sh files
```

---

## Existing Husky Setup

| Hook | Status |
|------|--------|
| `.husky/pre-commit` | ✅ exists — runs `bash scripts/architecture-guard.sh` |
| `.husky/commit-msg` | ✅ exists — validates `type(scope): message` pattern |
| `.husky/pre-push` | ❌ not yet created |

---

## Existing devDependencies (relevant)

| Package | Version |
|---------|---------|
| husky | ^9.1.7 ✅ |
| @commitlint/cli | ^20.5.0 ✅ |
| @commitlint/config-conventional | ❌ NOT installed |

**Note:** commitlint.config.js does NOT exist at root yet.

---

## Existing Root package.json Scripts (relevant)

| Script | Command |
|--------|---------|
| `work:start` | `node scripts/work-start.js` |
| `work:close` | `node scripts/work-close.js` |
| `work:status` | `node scripts/work-status.js` |
| `guard` | `bash scripts/architecture-guard.sh` |

---

## Baseline Tool Verification (PASS/FAIL)

| Tool | Result |
|------|--------|
| `pnpm audit:db` | ✅ PASS — 0 findings |
| `pnpm lint:prisma` | ✅ PASS — 0 errors, 0 warnings |
| `pnpm typecheck` | ✅ PASS — no TS errors |

---

## Phase 1 Impact Assessment

### New items to create (safe):
- `.claude/working/{planned,in-progress,completed}/`
- `.claude/sessions/`, `.claude/backups/`, `.claude/context/`
- `.claude/skills/pm-cli/` etc. (alongside existing skills/)
- `.claude/config.json`, `.claude/operations.log`
- `scripts/lib/` (new subdir — does NOT conflict)
- `scripts/work/` (new subdir — does NOT conflict with `scripts/work-*.sh`)
- `scripts/cli/`
- `commitlint.config.js`
- `.husky/pre-push`

### Items to modify carefully (preserve existing):
- `.husky/pre-commit` — ADD prisma lint gate, keep existing guard
- Root `package.json` scripts — ADD new, preserve all existing
- `.gitignore` — ADD new entries only

### Items that MUST NOT change:
- `scripts/architecture-guard.sh`
- `Application/backend/scripts/lint/prisma-structure-lint.sh`
- `.github/workflows/pr-check.yml`
- `Application/backend/src/` (no code changes in Item 1-7)
