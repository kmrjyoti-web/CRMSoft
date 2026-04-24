# Discovery Report — Vertical Registry Scan
**Date:** 2026-04-13  
**Sprint:** Week 1 Task 1 — `gv_cfg_vertical` Registry Table  
**Target DB:** PlatformDB (`platform.prisma`)

---

## 1. Existing Models Named "vertical*"

### PlatformConsoleDB (`platform-console.prisma`) — 5 models found

| Model | Table | Lines | Purpose |
|---|---|---|---|
| **GvCfgVertical** | `gv_cfg_vertical` | 504–519 | Config registry (code, dbPrefix, isActive, isSystem). Created in prior VERTICAL_REGISTRY sprint. |
| VerticalRegistry | `vertical_registry` | 258–270 | Operational tracking (business type definitions) |
| VerticalVersion | `vertical_versions` | 155–165 | Version tracking per vertical |
| VerticalHealth | `vertical_health` | 285–297 | Health monitoring |
| VerticalAudit | `vertical_audits` | 272–283 | Audit records |

### PlatformDB (`platform.prisma`) — **0 models found** ✅

No vertical-related models exist in PlatformDB. Safe to create.

### Other schemas — 0 vertical models

---

## 2. Existing Code References

### Seed Data (`platform-console/vertical-registry/seed-vertical-registry.ts`)
```
gv   → dbPrefix: gv   (isSystem: true)
soft → dbPrefix: sv   (isSystem: false)
rest → dbPrefix: rst  (isSystem: false)
tour → dbPrefix: tr   (isSystem: false)
ret  → dbPrefix: rt   (isSystem: false)
heal → dbPrefix: hl   (isSystem: false)
edu  → dbPrefix: ed   (isSystem: false)
```

### Common Vertical Schema Registry (`src/common/vertical-registry/vertical-registry.ts`)
- Defines `VERTICAL_SCHEMAS` for CONTACT, LEAD, PRODUCT entities
- Supports: SOFTWARE_VENDOR, PHARMA, TOURISM, RESTAURANT, RETAIL, GENERAL
- Hardcoded TypeScript object — candidate for future DB-backed refactor

### Backend Modules
| Path | Type |
|---|---|
| `src/modules/platform-console/vertical-registry/` | Full CRUD module (PlatformConsoleDB) — 7 seed rows, guards, tests |
| `src/modules/platform-console/vertical-manager/` | Operational manager — health cron, audit |

---

## 3. Existing `vertical_id` / `vertical_code` Columns

**None found** in any `.prisma` file. No existing FK dependencies.

---

## 4. Decision: Proceed or Stop?

**Existing `GvCfgVertical` is in PlatformConsoleDB (ops tooling), NOT in PlatformDB (app config).**

The task targets PlatformDB — a different database with zero vertical models. The PlatformConsoleDB version serves the DevOps Console (port 3012); the PlatformDB version will serve the app module loader, auditor, and CI hooks.

**Decision: PROCEED** — Create canonical `GvCfgVertical` + `GvCfgVerticalModule` in PlatformDB. The PlatformConsoleDB version will be refactored to read from PlatformDB in a later sprint (or deprecated).

**Not a duplicate:** Different DB, different audience, different schema (PlatformDB version adds `isBuilt`, `sortOrder`, `metadata`, `GvCfgVerticalModule` relation).
