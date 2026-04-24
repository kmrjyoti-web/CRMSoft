# CRMSoft Governance Guide
> Developer handbook — architecture rules, workflow, CI, testing, and operations

**Last updated:** 2026-04-04 | **Version:** 1.0

---

## Table of Contents
1. [Quick Start — Daily Commands](#1-quick-start--daily-commands)
2. [Architecture Rules — CAN / CANNOT](#2-architecture-rules--can--cannot)
3. [Git Workflow (GitFlow)](#3-git-workflow-gitflow)
4. [Pre-Commit Guard (12 Rules)](#4-pre-commit-guard-12-rules)
5. [CI Pipeline](#5-ci-pipeline)
6. [Weekly Architecture Audit](#6-weekly-architecture-audit)
7. [Testing Rules](#7-testing-rules)
8. [Adding a New Vertical (Trade Extension)](#8-adding-a-new-vertical-trade-extension)
9. [Multi-Machine Workflow](#9-multi-machine-workflow)
10. [Troubleshooting](#10-troubleshooting)
11. [Cloudflare R2 — Storage & Backups](#11-cloudflare-r2--storage--backups)

---

## 1. Quick Start — Daily Commands

### First-time setup (new machine)
```bash
git clone git@github.com:kmrjyoti-web/CrmProject.git
cd CrmProject
npm install                        # root workspace deps
npm run dev:api                    # start NestJS backend
npm run dev:admin                  # start CRM Admin (port 3005)
```

### Daily workflow
```bash
npm run work:start                 # pull, install if needed, show last session
npm run guard                      # run architecture check manually (<10s)
npm run test:backend               # run all backend tests
npm run health                     # full weekly health report (slow)
npm run work:close                 # WIP commit + push + save session state
npm run work:status                # show machine, branch, uncommitted files
```

### Emergency shortcuts
```bash
npm run guard                      # check architecture before committing
cd Application/backend && npx jest --testPathPattern="module-name" --no-coverage
bash scripts/backup-to-r2.sh      # manual backup to Cloudflare R2
```

---

## 2. Architecture Rules — CAN / CANNOT

### Vertical Extension Pattern
| ✅ CAN                                                       | ❌ CANNOT                                               |
|--------------------------------------------------------------|---------------------------------------------------------|
| Add `verticalData JSONB` fields to common entities           | Create `pharma_contacts` or `sw_leads` tables           |
| Put trade logic in `modules/vertical/{trade}/`               | Put trade logic in `modules/core/`                      |
| Import from `core/` inside `vertical/` modules               | Import from `vertical/` inside `core/` modules          |
| Use `getVerticalSchema('PHARMA', 'CONTACT')` helper          | Hardcode trade-specific fields in core models           |

### Module Structure
| ✅ CAN                                                       | ❌ CANNOT                                               |
|--------------------------------------------------------------|---------------------------------------------------------|
| Import NestJS decorators in `application/` and `presentation/` | Import `@nestjs/*` in `domain/` folder               |
| Import Prisma types in `infrastructure/`                     | Import `@prisma/client` in `domain/` folder             |
| Throw domain errors from `domain/errors/`                    | Throw `BadRequestException` from `domain/entities/`    |
| Use `Result<T>` pattern in handlers                          | Use bare `throw` in CQRS handlers without try-catch     |

### Frontend Rules
| ✅ CAN                                                       | ❌ CANNOT                                               |
|--------------------------------------------------------------|---------------------------------------------------------|
| Use `AICTable`, `AICDrawer`, `AICForm`, `AICToolbar`         | Create raw `<table>` for tabular data                   |
| Add a new tab/section to existing `ContactForm.tsx`          | Create `PharmaContactForm.tsx` duplicate                |
| Share components via `Shared/frontend/components/aic/`       | Copy components from crm-admin into vendor-panel        |

### Database Rules
| ✅ CAN                                                       | ❌ CANNOT                                               |
|--------------------------------------------------------------|---------------------------------------------------------|
| Add new nullable columns via migration                       | DROP columns that have data                             |
| Rename via v2 column + deprecation notice                    | Rename a column directly (breaking change)              |
| Use `verticalData Json?` in Prisma for JSONB                 | Add `pharmaData`, `swData` columns to common tables     |

---

## 3. Git Workflow (GitFlow)

```
main ─────────────────────────────────────────────► PRODUCTION
  ↑ PR + 1 approval + full CI (7 test types)
  │
release/v1.x.x ──────────────────────────────────► QA + version bump
  ↑ merge when QA passes
  │
develop ──────────────────────────────────────────► STAGING (auto-deploy)
  ↑ PR only (pr-check.yml passes)
  │
feature/xxx  hotfix/xxx  fix/xxx
```

### Branch naming (enforced by Rule 9)
```
feature/leads-kanban         ✅
fix/token-refresh            ✅
hotfix/gst-calculation       ✅
release/v1.2.0               ✅
chore/update-deps            ✅
my-branch                    ❌  (no type prefix)
Feature/leads                ❌  (uppercase)
feature/Leads Kanban         ❌  (spaces)
```

### Commit format (enforced by `.husky/commit-msg`)
```
type(scope): subject in lower-case

feat(leads): add pipeline kanban view
fix(auth): token refresh race condition
test(contacts): add tenant isolation spec
docs(governance): update r2 backup guide
refactor(billing): extract invoice calculation
perf(dashboard): cache revenue analytics
chore(ci): update nightly test schedule
wip(marketplace): partial feed implementation
```
Types: `feat` `fix` `test` `docs` `refactor` `perf` `chore` `ci` `style` `wip`
Max length: 100 characters. Scope required.

### Release flow
```bash
git checkout -b release/v1.2.0 develop
# bump versions, update CHANGELOG, QA
git checkout main && git merge release/v1.2.0
git tag v1.2.0
git checkout develop && git merge release/v1.2.0
```

### Hotfix flow
```bash
git checkout -b hotfix/gst-rounding main
# fix, test
git checkout main && git merge hotfix/gst-rounding
git checkout develop && git merge hotfix/gst-rounding
```

---

## 4. Pre-Commit Guard (12 Rules)

Run manually: `npm run guard` (or `bash scripts/architecture-guard.sh`)
Runs automatically: on every `git commit`

| # | Rule | Severity | What it checks |
|---|------|----------|----------------|
| 1 | No trade tables for common entities | **BLOCKED** | Staged `.prisma` files for `pharma_`, `sw_`, `travel_` prefixed models on common entities |
| 2 | core/ → vertical/ imports | **BLOCKED** | `import` statements in `src/modules/core/` referencing `modules/vertical/` |
| 3 | domain/ framework-free | **BLOCKED** | `@nestjs`, `@prisma/client` imports inside any `domain/` folder |
| 4 | verticalData on common entities | WARNING | Common entity Prisma models without `verticalData Json?` field |
| 5 | No component duplication | WARNING | Same component filename staged in >1 portal simultaneously |
| 6 | Handlers have try-catch | WARNING | Staged `.handler.ts` files without `try {` block |
| 7 | No credentials in code | **BLOCKED** | Hardcoded passwords, API keys, tokens in staged files |
| 8 | No direct commits to main | **BLOCKED** | Current branch is `main` |
| 9 | Branch naming convention | WARNING | Branch doesn't match `(feature\|fix\|hotfix\|release\|chore\|test\|docs\|refactor\|perf\|wip)/` |
| 10 | New module has tests | WARNING | New `module.ts` staged without any `spec.ts` in same directory tree |
| 11 | Handler has matching spec | WARNING | Staged `*.handler.ts` without a corresponding `*.handler.spec.ts` |
| 12 | Vertical module has schema test | WARNING | Staged file in `modules/vertical/` without `*schema*.spec.ts` or `*validation*.spec.ts` |

**BLOCKED** = commit rejected (exit 1). WARNING = logged, commit proceeds.

To temporarily skip (emergencies only):
```bash
git commit --no-verify -m "wip(emergency): hotfix in progress"
# NOTE: CI will still catch violations on PR
```

---

## 5. CI Pipeline

### PR → develop (pr-check.yml)
```
lint → typecheck → test (changed modules) → build check → architecture-lint
```
- Architecture-lint job: runs guard script + checks folder structure + commit format + branch naming
- Tests run only for changed modules (faster)
- Must pass before merge to develop

### PR → main (release-gate.yml)
7 jobs must ALL pass:

| Job | What it does | Approx time |
|-----|-------------|-------------|
| 1. unit-tests | `jest --silent` all backend tests | ~3 min |
| 2. api-tests | `jest --testPathPattern="e2e\|integration"` | ~2 min |
| 3. functional-tests | `jest --testPathPattern="functional"` | ~2 min |
| 4. smoke-tests | build + start API + curl `/health` | ~4 min |
| 5. performance-tests | build time assertion (<120s) | ~2 min |
| 6. accessibility-check | aria-label + alt text scan on frontends | ~1 min |
| 7. visual-check | all 3 frontends `npm run build` clean | ~5 min |

### Automated deployments
| Trigger | Workflow | Target |
|---------|----------|--------|
| push → develop | deploy-staging.yml | Staging server |
| push → main | deploy-split.yml | 9 deploy repos |
| Manual | deploy-production.yml | Production + version tag |
| Nightly 2AM IST | nightly-tests.yml | Full suite + coverage artifact |
| Sunday 6AM IST | weekly-health.yml | Health report → docs/health-reports/ |

---

## 6. Weekly Architecture Audit

**Runs:** Every Sunday at 6 AM IST (`weekly-health.yml`)
**Command:** `npm run health` (manual run)
**Output:** `docs/health-reports/YYYY-MM-DD.md`

### What's measured (score out of 100)

| Metric | Target | Points |
|--------|--------|--------|
| Architecture violations | 0 | 30 pts |
| TypeScript `any` types | < 2200 | 20 pts |
| Test file coverage | > 60% modules | 20 pts |
| Handler try-catch coverage | > 80% | 15 pts |
| Barrel export completeness | 0 missing | 15 pts |

### Reading a health report
```
docs/health-reports/2026-04-04.md

## Module stats          ← total modules, vertical modules, spec count
## Architecture violations ← must be 0 (any non-zero = critical)
## Potential duplication  ← components appearing >2x across portals
## Missing barrel exports ← modules without index.ts
## Handlers without try-catch ← list of handlers to fix
## Weekly trends          ← score vs last 4 weeks
```

---

## 7. Testing Rules

### Test pyramid (targets)
```
          ┌─────────────┐
          │  E2E / API  │ < 10% — Playwright, integration
          ├─────────────┤
          │  Component  │ ~ 20% — React Testing Library
          ├─────────────┤
          │    Unit     │ > 70% — Jest, fast, isolated
          └─────────────┘
```

### Mandatory tests for every new module

```typescript
describe('XxxHandler', () => {
  // 1. Happy path (required)
  it('should create successfully', async () => { ... });

  // 2. Error cases (required)
  it('should fail when tenant not found', async () => { ... });
  it('should fail with invalid input', async () => { ... });

  // 3. Tenant isolation (required for common modules)
  it('should not return data from other tenants', async () => { ... });

  // 4. Vertical data (required for common entity modules)
  it('should validate verticalData for SOFTWARE_VENDOR', async () => { ... });
  it('should accept empty verticalData for GENERAL', async () => { ... });
});
```

### Rules
- **Every new module** → at least 1 `.spec.ts` file (Rule 10 blocks commit otherwise)
- **Every handler** → matching `.spec.ts` (Rule 11 warns)
- **Vertical modules** → schema validation test (Rule 12 warns)
- Use `createMockPrismaService()` — never mock the real DB connection
- Use `test/factories/*` for consistent test data
- Target: **0 failing tests** at all times
- Coverage: **60% minimum**, targeting 80%
- Run after each step: `npm run test:backend`

### Running tests
```bash
# All backend tests
npm run test:backend

# Specific module
cd Application/backend && npx jest --testPathPattern="leads" --no-coverage

# With coverage
cd Application/backend && npx jest --coverage

# WhiteLabel API
cd WhiteLabel/wl-api && npx jest --no-coverage

# Watch mode (dev)
cd Application/backend && npx jest --watch
```

---

## 8. Adding a New Vertical (Trade Extension)

**Example:** Adding `BAKERY` vertical

### Step 1 — Register the vertical
```typescript
// Application/backend/src/common/vertical-registry/vertical-registry.ts
BAKERY: {
  CONTACT: {
    fields: [
      { key: 'supplierType', type: 'select', labelHi: 'आपूर्तिकर्ता प्रकार', options: [...] },
      { key: 'flourType', type: 'string', labelHi: 'आटे का प्रकार' },
    ]
  },
  PRODUCT: {
    fields: [
      { key: 'shelfLifeHours', type: 'number', labelHi: 'शेल्फ जीवन (घंटे)' },
    ]
  }
}
```

### Step 2 — Create the vertical module
```
Application/backend/src/modules/vertical/bakery/
├── domain/
│   ├── entities/
│   └── interfaces/
├── application/
│   ├── commands/
│   ├── queries/
│   └── handlers/      ← MUST have try-catch + Logger
├── infrastructure/
│   └── repositories/
└── presentation/
    └── controllers/
```

### Step 3 — Create vertical migration
```sql
-- migrations/vertical/bakery/001_bakery_setup.sql
-- Runs ONLY for tenants with businessType = 'BAKERY'
-- Add chart of accounts template, default lookups, etc.
-- NEVER creates separate tables for contacts/leads/products
```

### Step 4 — Add tests
```typescript
// vertical/bakery/*.spec.ts
it('should validate bakery verticalData', async () => {
  const result = validateVerticalData('BAKERY', 'PRODUCT', { shelfLifeHours: 24 });
  expect(result.isValid).toBe(true);
});
```

### Step 5 — Frontend
```tsx
// In ContactForm.tsx — add VerticalFields section
{tenant.businessType === 'BAKERY' && <BakeryContactFields />}
// No new form component — extend existing
```

---

## 9. Multi-Machine Workflow

Used when switching between Mac, Windows, home/office machines.

### Ending a session
```bash
npm run work:close
# → WIP commit: "wip(session): [task description]"
# → git push origin {branch}
# → saves .work-session.json with: task, machine, test status, build status
# → pushes session file
```

### Starting on another machine
```bash
npm run work:start
# → git pull --rebase
# → npm ci if package-lock.json changed
# → npx prisma generate if schema.prisma changed
# → shows last session: task, previous machine, test status
# → quick health check
```

### Checking current state
```bash
npm run work:status
# → shows: machine name, OS, branch, uncommitted files, last 5 commits
# → shows: current task from .work-session.json
```

### Session file location
`.work-session.json` — committed to git, tracks last session context.
```json
{
  "task": "Feature: WhiteLabel Phase 4",
  "machine": "Kmrjyotis-MacBook-Pro.local",
  "branch": "develop",
  "timestamp": "2026-04-04T10:30:00.000Z",
  "testStatus": "2734/2734 passing",
  "buildStatus": "clean"
}
```

---

## 10. Troubleshooting

### Pre-commit hook blocked my commit

```bash
# See exactly what was blocked
bash scripts/architecture-guard.sh

# Common fixes:
# Rule 2 (core→vertical import): remove import, use dependency injection
# Rule 3 (domain framework): replace @nestjs/common with plain Error class
# Rule 7 (credentials): move to .env, add to .gitignore
# Rule 8 (main branch): switch branch → git checkout -b hotfix/xxx

# Emergency bypass (use sparingly)
git commit --no-verify -m "wip(emergency): reason here"
```

### Tests failing after pulling

```bash
# Step 1: reinstall deps
cd Application/backend && npm ci

# Step 2: regenerate Prisma clients
cd Application/backend && npx prisma generate
npx prisma generate --schema=prisma/platform.prisma
npx prisma generate --schema=prisma/marketplace.prisma
npx prisma generate --schema=prisma/whitelabel.prisma

# Step 3: run tests
npm run test:backend
```

### Architecture validator warning on startup

```
[ArchitectureValidator] WARNING: vertical/bakery missing from registry
```
→ Add the vertical to `vertical-registry.ts` (see Section 8, Step 1)

### Build failing on CI but passing locally

Common causes:
- Missing barrel export → add `index.ts` to module
- Circular dependency → check `tsconfig.json` `paths`
- Env vars missing in CI → add to GitHub Actions secrets

### Health report score dropped

```bash
npm run health    # generate fresh report
# Read docs/health-reports/YYYY-MM-DD.md
# Check: "Handlers without try-catch" section
# Fix handlers: wrap execute() body in try { } catch(e) { Logger.error(e) }
```

### wrangler CLI not found

```bash
npm install -g wrangler
wrangler login
wrangler whoami    # verify auth
```

---

## 11. Cloudflare R2 — Storage & Backups

### Bucket structure

| Bucket | Purpose | Access | Lifecycle |
|--------|---------|--------|-----------|
| `crmsoft-uploads-prod` | Tenant file uploads (invoices, attachments) | Private + signed URLs | 1 year |
| `crmsoft-backups-prod` | Database pg_dump backups | Private | 30 days |
| `crmsoft-public-prod` | Partner logos, avatars, public assets | Public CDN | Never expire |

Dev equivalents: `crmsoft-uploads-dev`, `crmsoft-backups-dev`, `crmsoft-public-dev`

### wrangler CLI commands
```bash
# List all R2 buckets
wrangler r2 bucket list

# Upload a file
wrangler r2 object put crmsoft-uploads-prod/tenant-abc/file.pdf --file ./file.pdf

# Download a file
wrangler r2 object get crmsoft-uploads-prod/tenant-abc/file.pdf --file ./downloaded.pdf

# Delete a file
wrangler r2 object delete crmsoft-uploads-prod/tenant-abc/file.pdf

# List objects in bucket
wrangler r2 object list crmsoft-uploads-prod --prefix tenant-abc/
```

### Using StorageService in code
```typescript
// ✅ Correct — always inject StorageService
constructor(private storage: StorageService) {}

async uploadInvoice(file: Buffer, tenantId: string): Promise<string> {
  const key = `${tenantId}/invoices/${Date.now()}.pdf`;
  return this.storage.upload(key, file, 'application/pdf');
}

async getDownloadUrl(key: string): Promise<string> {
  return this.storage.getSignedUrl(key, 3600); // 1 hour expiry
}

// ❌ Never do this in modules
import { S3Client } from '@aws-sdk/client-s3';  // wrong SDK
const r2 = new R2Bucket();                       // direct instantiation
```

### Manual backup
```bash
# Back up all 4 database schemas to R2
bash scripts/backup-to-r2.sh

# Required env vars:
# POSTGRES_URL=postgresql://...
# CLOUDFLARE_ACCOUNT_ID=abc123
# R2_ACCESS_KEY_ID=xxx
# R2_SECRET_ACCESS_KEY=yyy
```

### Environment variables for R2
```env
# Add to Application/backend/.env (never commit!)
CLOUDFLARE_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_UPLOADS=crmsoft-uploads-prod
R2_BUCKET_BACKUPS=crmsoft-backups-prod
R2_BUCKET_PUBLIC=crmsoft-public-prod
R2_PUBLIC_URL=https://pub.r2.dev  # or custom domain
```

### Backup lifecycle (automated)
- **Nightly 1 AM IST** → `BackupCron` in `OpsModule` runs pg_dump → uploads to `crmsoft-backups-prod`
- **Weekly Sunday 2 AM IST** → Retention cleanup removes backups older than 30 days
- **Manual** → `bash scripts/backup-to-r2.sh` (uploads with timestamp + SHA-256 checksum)

---

*Generated by Claude Code | CRMSoft Governance v1.0 | 2026-04-04*
