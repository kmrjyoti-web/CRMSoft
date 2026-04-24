# V2 Notion Workspace — Structure + Content Template

Track 4 owns the workspace build. Other tracks populate specific sections — see below.

## Admin arrangement (Kumar Decision 4)

- **Workspace owner:** Kumar. Kumar creates "CRM Version 2" workspace before or at Hour 0.
- **Track 4 owner (friend):** added as collaborator with editor permission. Full build rights: structure, pages, databases, content.
- **Customer share links:** drafted by friend, APPROVED by Kumar before publishing. No auto-publish.
- **Old workspace archival:** banner + permissions drafted by friend, APPLIED by Kumar at Hour 22-24 after final review.
- **Rule:** any externally-visible action (customer share, archive banner, permission downgrade) routes through Kumar. Internal structure + content work is friend-unblocked.

## Workspace skeleton

```
CRM Version 2 (Workspace root)
│
├── 📘 Getting Started  ← customer-facing, top priority
│   ├── Product Overview
│   ├── Quick Start Guide
│   └── Key Features
│
├── 🏗 Architecture  ← Track 2 populates
│   ├── System Design (mermaid diagram)
│   ├── 7 Databases (purposes + boundaries)
│   ├── API Patterns (Result<T>, CQRS, DDD)
│   ├── CI/CD Pipeline (3 workflows)
│   └── Security & Compliance
│
├── 💾 Database  ← Track 3 populates
│   ├── Database Architecture v2
│   ├── Per-DB Schema Documentation (7 pages)
│   ├── Naming Conventions
│   └── Migration Strategy (includes SAFE_DROP status)
│
├── 📦 Code Structure  ← Track 1 populates
│   ├── Folder Organization
│   ├── Module Directory (83 modules explained, number verified)
│   ├── Shared Controls (AIC components)
│   └── Coding Standards
│
├── 🎯 Vertical Strategy  ← Track 5 populates
│   ├── Core + Vertical Pattern
│   ├── Planned Verticals (5)
│   ├── Vertical Playbook
│   └── Current Status
│
├── 📋 Operations  ← Track 2 + Track 5 co-populate
│   ├── Development Workflow (Git, PRs, reviews)
│   ├── Testing Strategy       ← Track 1 input (test coverage audit)
│   ├── Deployment Process
│   └── Quality Gates (CI checks explained)
│
└── 🔒 Internal  ← team-only, NEVER customer-shared
    ├── Team Roster
    ├── Decision Log
    ├── Tech Debt Register (crm-admin 328, legacy DB, backend lint)
    ├── Sprint Logs (this sprint's retrospective lives here)
    └── Credentials Reference (links only, NO secrets)
```

## Permissions

| Section            | Customer      | Team  |
| :----------------- | :------------ | :---- |
| Getting Started    | ✅ full        | ✅    |
| Architecture       | ✅ full        | ✅    |
| Database           | ✅ full        | ✅    |
| Code Structure     | ✅ full        | ✅    |
| Vertical Strategy  | ✅ view        | ✅    |
| Operations         | ✅ view        | ✅    |
| 🔒 Internal         | ❌ NEVER       | ✅    |

Kumar signs off on Getting Started and Architecture before any customer share.

## Page-by-page content template

### 📘 Getting Started → Product Overview

```
# CRMSoft — Product Overview

CRMSoft is [1 paragraph: what it is, who it's for].

## What you can do
- [top 3-5 capabilities]

## Core concepts
- [3-5 terms customer will hit: tenant, vertical, workspace, etc.]

## How CRMSoft is structured
- [high level: portals, backend, DBs — one paragraph + diagram]

## Next steps
- [Quick Start Guide →]
- [Key Features →]
```

### 🏗 Architecture → System Design

```
# CRMSoft System Design

## High-level diagram
[mermaid]
  graph LR
    Customer[Customer Portal] --> API
    Vendor[Vendor Panel] --> API
    Admin[CRM Admin] --> API
    WL[WhiteLabel] --> API
    PC[Platform Console] --> API
    API[Backend API<br/>1950 routes] --> Identity[(identity DB)]
    API --> Working[(working DB)]
    API --> Platform[(platform DB)]
    API --> Marketplace[(marketplace DB)]
    API --> PConsoleDB[(platform-console DB)]
    API --> Global[(global DB)]
    API --> Demo[(demo DB)]
[/mermaid]

## Component responsibilities
- **Backend** — [role]
- **Customer Portal** — [role]
- [etc.]

## Trust boundaries
- [where authn happens, where authz happens]
```

### 💾 Database → Per-DB Schema Documentation

One page per DB. Each follows:

```
# [DB name] — Purpose + Schema

## Purpose
[What this DB exists for, what it is NOT for]

## Primary consumers
[Which modules/services read/write]

## Model naming convention
[e.g., identity uses PascalCase singular; marketplace uses camelCase plural — whatever is actual]

## Key models
- [top 5-10 models with 1-line purpose]

## Cross-DB references
[Where IDs from this DB appear in other DBs — document as "shared id", not FK]

## Operational notes
[Backup, migration, retention if any]
```

### 📦 Code Structure → Module Directory

```
# CRMSoft Module Directory

Total modules: [N verified, vs 83 claimed]

## By layer
| Module | Purpose | Owner | Test coverage | Tech debt notes |
| :----- | :------ | :---- | :------------ | :-------------- |
| [name] | [1 line]| [team]| [%]           | [any]           |
```

### 🔒 Internal → Tech Debt Register

```
# Tech Debt Register

## Active (needs action before Apr 30)
| Item | Severity | Owner | Target date |
| :--- | :------- | :---- | :---------- |
| crm-admin 328 tsc errors | medium | ___ | post-sprint |
| marketplace 10 tsc errors | medium | ___ | post-sprint |
| Legacy DB 192 SAFE_DROP | high | ___ | post-sprint |

## Parked (post-Apr 30)
| Item | Reason for parking |
| :--- | :----------------- |
| Backend lint 245/2588 | not blocking ship |
```

## Migration from old Notion

1. List every page in old workspace (Track 4 inventory)
2. Classify: Accurate / Stale / Missing / Wrong
3. Content marked Accurate → copy into V2
4. Content marked Stale → rewrite from code-as-source-of-truth, then copy
5. Content marked Missing → note gap, assign to a track
6. Content marked Wrong → fix it, then copy
7. Old workspace: add banner "Archive — Pre-V2. Canonical docs now in CRM Version 2 workspace." **(Kumar sign-off required before this step — archiving is user-visible and semi-reversible.)**
8. Old workspace: switch all page permissions to team-view-only **(Kumar sign-off required.)**

## Launch checklist (Hour 22)

- [ ] All 7 sections have at least one populated page
- [ ] Getting Started passes Kumar's "could a customer read this?" test
- [ ] Architecture system diagram loads correctly
- [ ] Per-DB pages all 7 present
- [ ] Internal section has Tech Debt Register populated
- [ ] Old workspace archived
- [ ] Permission audit done — no Internal content customer-accessible
