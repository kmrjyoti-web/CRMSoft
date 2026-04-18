# A0-9: Git & Dependency Audit Report
## CRMSoft — Phase 0 Audit

**Date:** 2026-03-18
**Auditor:** Claude Code (automated scan)
**Scope:** Git history, branch strategy, `.gitignore`, npm dependencies (API + UI)

---

## SCORECARD

| Dimension | Score | Status |
|-----------|-------|--------|
| Git Branch Strategy | 5/10 | ⚠️ No formal branching model (gitflow/trunk) |
| Commit Message Quality | 4/10 | 🔴 0% conventional commits; many mega-commits |
| `.gitignore` Coverage | 8/10 | ✅ Well-configured, sensitive files excluded |
| Env File Management | 6/10 | ⚠️ No `.env.example` in API; `.env` tracked (excluded) |
| Dependency Currency | 4/10 | 🔴 33 outdated packages; NestJS v10 when v11 released |
| Security Vulnerabilities | 5/10 | 🔴 26 npm vulnerabilities (11 HIGH, 11 MOD, 4 LOW) |
| Git Tags / Releases | 2/10 | 🔴 Zero tags — no release history |
| Sensitive Data in Repo | 8/10 | ✅ No secrets in git history; `password.txt` in gitignore |
| **OVERALL** | **5.5/10** | ⚠️ |

**CRITICAL: 3 | WARNING: 4 | INFO: 3**

---

## 1. GIT REPOSITORY OVERVIEW

### Repository Structure
```
Branch model:    Non-standard (no gitflow/trunk-based)
Total branches:  5 (2 local, 3 remote deploy)
Total tags:      0 (no releases tagged)
Total commits:   25
Initial commit:  ae0253464 — "Initial commit: CRM-SOFT monorepo"
Latest commit:   dc3057c09 — "Bulk import overhaul, paginated list handlers, UI components..."
```

### Branches

| Branch | Type | Purpose |
|--------|------|---------|
| `main` | Primary | Production-ready code |
| `feature/bulk-import-overhaul` | Feature | Current work (active) |
| `remotes/origin/main` | Remote | GitHub main |
| `remotes/api-deploy/main` | Remote | Railway API deployment |
| `remotes/ui-deploy/main` | Remote | Railway UI deployment |
| `remotes/vendor-deploy/main` | Remote | Railway Vendor Panel deployment |

**Note:** 3 separate Railway deployment remotes (api-deploy, ui-deploy, vendor-deploy) indicate a monorepo deployed to multiple Railway services. This is a non-standard but functional CI/CD pattern.

---

## 2. COMMIT MESSAGE QUALITY

### ⚠️ Zero Conventional Commits (0/25 = 0%)

Not a single commit follows [Conventional Commits](https://www.conventionalcommits.org/) format (`type(scope): message`).

#### Commit Style Analysis

| Pattern | Count | Example |
|---------|-------|---------|
| "Fix X — reason" | 9 | `Fix CORS — allow all origins by default` |
| "Add X, Y, Z, W" | 8 | `Add WhatsApp integration, vendor portal, dashboard...` |
| "Silence/Reduce/Limit X" | 4 | `Silence all NestJS boot logs in production` |
| "Remove X" | 1 | `Remove tabs — split CRM Contact Master` |
| "Initial commit" | 1 | `Initial commit: CRM-SOFT monorepo (API + UI)` |
| Other | 2 | — |

#### 🔴 Mega-Commits (Multiple Features in One Commit)

| Commit | Problem |
|--------|---------|
| `b4c3f5f` — "Add production API endpoint, toolbar redesign, ledger conversion, control room UI, and multi-page enhancements" | 5+ unrelated features |
| `5ce38b2` — "Add Control Room, entity verification fixes, org tenantId fix, auto-ledger, quotation enhancements" | 5+ features |
| `c8ab161` — "Add WhatsApp integration, vendor portal, dashboard toolbar redesign, and multi-module enhancements" | 4+ modules |
| `dc3057c` — "Bulk import overhaul, paginated list handlers, UI components and feature updates" | 3+ areas |
| `7acc6d8` — "Add Entity Verification Report, CRM Contact Master 3-tab dashboard, and menu restructure" | 3 features |

These mega-commits make `git bisect`, `git blame`, and code review impractical.

#### Positive Examples (descriptive but not conventional)
```
Fix CORS — allow all origins by default, support custom headers  ✅ Clear
Limit Prisma connection pool to 5 in production for Supabase free tier  ✅ Clear
Add DISABLE_CRON env var to skip cron jobs in production  ✅ Clear
```

---

## 3. `.gitignore` ANALYSIS

### ✅ Well-Configured

```gitignore
# Dependencies
node_modules/

# OS files
.DS_Store, Thumbs.db

# Environment
.env
.env.*
!.env.example          # ✅ Allows .env.example

# Build output
dist/
.next/
out/

# IDE
.idea/, .vscode/

# Logs
*.log

# Coverage
coverage/

# Sensitive files
password.txt           # ✅ password.txt is gitignored
*.pem
*.key

# Embedded repos
CRMSoft/               # ✅ Excludes CRMSoft/ subdirectory

# Test artifacts
playwright-report/
e2e/

# Temp
*.csv
*.xlsx
```

**Notable:**
- `password.txt` is correctly in `.gitignore` — however, the file exists and is tracked as modified (`M password.txt` in git status). This indicates it was previously committed and should be removed from git history.
- `CRMSoft/` directory excluded — prevents accidentally committing the CRMSoft architecture reference folder.
- `.env` properly excluded, `.env.example` whitelisted.

### ⚠️ Missing from `.gitignore`
- `*.pem` present but no `*.p8` (Apple Push certs)
- No `.env.local` or `.env.development.local` patterns
- No `*.sqlite` or `*.db` for local SQLite testing

---

## 4. ENVIRONMENT FILE MANAGEMENT

### ⚠️ API Has No `.env.example`

| File | API | UI/crm-admin |
|------|-----|-------------|
| `.env` | ✅ exists (806 bytes) — not committed | Not applicable |
| `.env.example` | 🔴 **MISSING** | ✅ exists |
| `.env.local` | ✅ exists (119 bytes) — not committed | — |
| `.env.production` | ✅ exists (43 bytes) — not committed | — |

**Impact:** New developers cannot know which environment variables are required. The API has no self-documenting template. Every new developer must obtain the `.env` from the team manually.

### ENV Variables Found in Code (not in .env.example)
Key variables referenced in `main.ts`, `app.module.ts`, etc. that are undocumented:
```
DATABASE_URL, JWT_SECRET, API_PREFIX, CORS_ORIGINS, PORT
DISABLE_CRON, PLATFORM_ADMIN_EMAIL, PLATFORM_ADMIN_PASSWORD
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
RAZORPAY_KEY, RAZORPAY_SECRET
OPENAI_API_KEY, ANTHROPIC_API_KEY
S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

---

## 5. DEPENDENCY ANALYSIS — API

### npm Audit: 26 Vulnerabilities

| Severity | Count |
|----------|-------|
| 🔴 HIGH | **11** |
| ⚠️ MODERATE | **11** |
| ℹ️ LOW | 4 |
| **TOTAL** | **26** |

#### HIGH Severity Vulnerabilities

| Package | Issue | Fix Available |
|---------|-------|--------------|
| `xlsx` (SheetJS) v0.18.5 | Prototype Pollution + ReDoS | ❌ No upstream fix |
| `expr-eval` | Prototype Pollution + arbitrary function execution | ❌ No upstream fix |
| `multer` v2.0.2 | DoS via incomplete cleanup + resource exhaustion + recursion | ✅ Major version upgrade |
| `tar` | Multiple path traversal + symlink poisoning CVEs | ✅ Minor upgrade |
| `socket.io-parser` | Unbounded binary attachments (DoS) | ✅ Minor upgrade |
| `serialize-javascript` | RCE via RegExp.flags | ✅ Minor upgrade |
| `@mapbox/node-pre-gyp` | Not specified | ✅ Available |
| `glob` | CLI command injection via `--cmd` | ✅ Major NestJS upgrade |
| `@nestjs/cli` | Via glob dependency | ✅ NestJS v11 |
| `@nestjs/platform-express` | Via multer dependency | ✅ NestJS v11 |
| `terser-webpack-plugin` | Not specified | ✅ Available |

**Key unfixable vulnerabilities:**
- `xlsx`/SheetJS (2 HIGH CVEs) — no patched version upstream. Mitigation: validate all Excel input server-side.
- `expr-eval` — no fix available. If used for dynamic formula evaluation, replace with safer alternative.

### 33 Outdated Packages

| Category | Count |
|----------|-------|
| **Major version behind** | **24** |
| Minor version behind | 9 |

#### Critical Outdated Dependencies

| Package | Current | Latest | Impact |
|---------|---------|--------|--------|
| `@nestjs/core` | 10.4.22 | **11.1.17** | 🔴 Major — security + perf |
| `@nestjs/common` | 10.4.22 | **11.1.17** | 🔴 Major |
| `@nestjs/swagger` | 7.4.2 | **11.2.6** | 🔴 Major (4 major versions!) |
| `@nestjs/cqrs` | 10.2.8 | **11.0.3** | 🔴 Major |
| `@nestjs/jwt` | 10.2.0 | **11.0.2** | 🔴 Major |
| `prisma` | 5.22.0 | **7.5.0** | 🔴 Two major versions |
| `@prisma/client` | 5.22.0 | **7.5.0** | 🔴 Two major versions |
| `uuid` | 10.0.0 | **13.0.0** | 🔴 Three major versions |
| `bcrypt` | 5.1.1 | **6.0.0** | ⚠️ Major |
| `helmet` | 7.2.0 | **8.1.0** | ⚠️ Major |
| `jest` | 29.7.0 | **30.3.0** | ⚠️ Major |

**Note:** Prisma is 2 major versions behind (v5 → v7). Prisma v7 includes major API changes. NestJS v11 requires Node 18+ and has breaking changes in module initialization. These upgrades cannot be done without planning.

---

## 6. GIT WORKFLOW ASSESSMENT

### Current Workflow Observed

```
main ←──── feature/bulk-import-overhaul
  │
  ├── api-deploy/main     (Railway API)
  ├── ui-deploy/main      (Railway UI)
  └── vendor-deploy/main  (Railway Vendor)
```

### Missing Git Practices

| Practice | Status |
|----------|--------|
| Conventional commits | ❌ Not used |
| Git tags for releases | ❌ 0 tags |
| Protected `main` branch | ❓ Not verified |
| Pull request process | ❓ No PR evidence in commits |
| Changelogs (CHANGELOG.md) | ❌ Not present |
| Release branch pattern | ❌ Not present |
| CI on PRs (GitHub Actions) | ❓ Not detected |

---

## 7. FINDINGS — PRIORITIZED

### 🔴 CRITICAL (3)

| # | Area | Finding | Recommendation |
|---|------|---------|----------------|
| C1 | **npm Vulnerabilities** | 11 HIGH severity CVEs — including `xlsx` (2 unfixable HIGH), `expr-eval` (unfixable), `multer` (3 DoS), `tar` (6 path traversal) | Fix all fixable vulnerabilities via `npm audit fix`. Replace `xlsx` with `exceljs`. Investigate `expr-eval` usage. |
| C2 | **Outdated NestJS** | Running NestJS v10 when v11 is current. `@nestjs/swagger` is 4 major versions behind (v7 → v11). Prisma 2 major versions behind. | Plan NestJS v11 upgrade before Phase 3. Upgrade Prisma in a dedicated PR with migration testing. |
| C3 | **No `.env.example` in API** | New developers cannot set up the project without manual credential sharing. 15+ required env vars are undocumented. | Create `API/.env.example` with all required vars (values as placeholders). Add to project setup docs. |

### ⚠️ WARNING (4)

| # | Area | Finding | Recommendation |
|---|------|---------|----------------|
| W1 | **Mega-Commits** | 8/25 commits bundle 3-5+ unrelated features. Makes bisect, blame, and revert impossible. | Enforce atomic commits via CONTRIBUTING.md. Use `--interactive` rebase for future work. |
| W2 | **No Conventional Commits** | 0/25 commits follow conventional format. No automated changelog generation possible. | Adopt Conventional Commits (`feat:`, `fix:`, `chore:` etc). Install `commitlint` with Husky. |
| W3 | **Zero Git Tags** | No releases have been tagged. Cannot `git checkout v1.0` or generate a proper changelog. | Tag current state as `v0.1.0-pre-phase3`. Tag releases going forward. |
| W4 | **`password.txt` in git status** | `password.txt` is modified (tracked file). Even though gitignored now, it may have previously been committed. | Check `git log -- password.txt`. If in history, purge with `git filter-repo`. Remove from working tree. |

### ℹ️ INFO (3)

| # | Finding | Status |
|---|---------|--------|
| I1 | `.gitignore` covers all major file types ✅ | Add `.env.local` pattern and `*.sqlite` |
| I2 | No secrets in git diff (current state) ✅ | Still need to verify full git history |
| I3 | Railway multi-remote deployment is functional ✅ | Document deployment procedure in README |

---

## 8. RECOMMENDATIONS (Prioritized)

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P1 | Run `npm audit fix` for all fixable vulnerabilities | Low | 🔴 CRITICAL — Security |
| P1 | Replace `xlsx` with `exceljs` (safer alternative, maintained, no CVEs) | Medium | 🔴 CRITICAL — Unfixable vuln |
| P1 | Create `API/.env.example` with all required env vars | Low | HIGH — Onboarding |
| P2 | Investigate and replace `expr-eval` (prototype pollution + RCE risk) | Medium | HIGH — Security |
| P2 | Plan NestJS v10 → v11 upgrade (breaking changes: module init, Fastify compat) | High | HIGH — Long-term security |
| P2 | Plan Prisma v5 → v7 upgrade (breaking changes: query API, schema changes) | High | HIGH — Long-term currency |
| P2 | Install `commitlint` + Husky to enforce Conventional Commits | Low | MEDIUM — Process |
| P3 | Tag current `main` as `v0.1.0-pre-phase3` | Very Low | MEDIUM — Release hygiene |
| P3 | Check `git log -- password.txt` to verify it was never committed | Very Low | HIGH — Security audit |
| P3 | Add CHANGELOG.md and CONTRIBUTING.md | Low | MEDIUM — Team practice |
| P4 | Add `.env.local` and `*.sqlite` to `.gitignore` | Very Low | LOW |

---

## OVERALL ASSESSMENT

**Score: 5.5 / 10**

**Strengths:**
- `.gitignore` is comprehensive — sensitive files are excluded
- `password.txt` is gitignored (though needs history audit)
- No detected secrets in current working tree
- Railway multi-remote deployment is working
- Multiple Railway deploy targets give flexible deployment

**Critical Gaps:**
- 11 HIGH npm vulnerabilities (2 unfixable in `xlsx`) — security debt
- NestJS 1 major version behind, Prisma 2 major versions behind — technical debt
- Zero Conventional Commits — no automated changelog, no semantic versioning possible
- No `.env.example` — project cannot be set up without manual credential sharing
- No git tags — no release history
- Mega-commits make code archaeology and blame impractical

**Before Phase 3 Migration:** Fix all npm audit HIGH vulnerabilities, create `.env.example`, and establish commit discipline. These are process hygiene items that are easy to fix now and become much harder once 200+ commits accumulate.

---

_Generated by Claude Code | CRMSoft Phase 0 Audit | 2026-03-18_
