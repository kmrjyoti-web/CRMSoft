# CRMSoft Foundation Sprint — Kickoff Brief

**Date:** Sunday, April 19, 2026
**Kickoff meeting:** 10:30 PM IST (moved from 10:00 PM for completeness)
**Sprint start:** 10:30 PM Sunday (kickoff) → 12:30 AM Monday (work begins after kickoff)
**Sprint end:** 10:30 PM Monday (retrospective)
**Team:** 5 devs — Kumar (lead) + 3 full-time devs + 1 friend
**Location:** Remote, async + scheduled syncs

---

## 🎯 ONE-LINE GOAL

> **"CRMSoft foundation ko production-ready state mein le aao — complete audit + V2 Notion workspace from scratch, code-as-source-of-truth."**

## WHY THIS SPRINT, WHY NOW

**Business context:**
- April 30 tak 2 verticals production mein jaane hain (11 days)
- Customer Notion access lega — documentation product surface hai
- 5 parallel verticals future mein — foundation solid chahiye
- Customer commitment FINAL — zero-risk tolerance on foundation

**Technical context:**
- Application/backend 100% tsc-clean, 1950 routes, 7/7 DBs working
- Second backend (WhiteLabel/wl-api) present — now in audit scope (Decision 1)
- 11 Shared/backend packages are the foundation's foundation — deep audit (Decision 2)
- CI pipeline live for 3 of 9 apps (backend + crm-admin + vendor-panel workflows running)
- But: Notion mein stale info (Sprint A "Complete" but never done)
- Documentation drift identified — need fresh V2

**Kumar's 5 decisions confirmed pre-kickoff (see `brief-review-findings.md` for full rationale):**
1. wl-api IS in audit scope — Tracks 2, 3
2. Shared/backend 11 packages get a DEEP per-package audit — Tracks 1, 2
3. ts-prune will be installed at Track 1 start — replaces grep heuristic for dead code
4. Notion: Kumar is workspace OWNER, friend is EDITOR, customer shares need Kumar approval
5. "Demo in 2-3 days" urgency framing kept — the 11-day/2-vertical commitment is hard

**Why sprint not gradual:**
- Foundation issues compound — delay karne se verticals mein problems aayenge
- Parallel 5-dev execution 24 hours mein achievable
- Fresh workspace = clean slate, no confusion

---

## 📊 CURRENT STATE SNAPSHOT (5 min)

### ✅ What's working
- Backends: 2 — **Application/backend** (0 tsc errors, 1950 API routes) + **WhiteLabel/wl-api** (second backend, in sprint scope per Decision 1)
- Frontends: 7 — Application/frontend/{customer-portal, marketplace}, Customer/frontend/crm-admin, Vendor/frontend/vendor-panel, WhiteLabel/{wl-admin, wl-partner}, PlatformConsole/frontend/platform-console
- Shared packages: 11 in `Shared/backend/` (audit, cache, encryption, errors, global-data, identity, notifications, prisma, queue, storage, tenant) + Shared/common, Shared/frontend, Shared/prisma-schemas
- Databases: 7/7 reachable (identity, working, platform, marketplace, platform-console, global, demo)
- Portals tsc-clean: vendor-panel, customer-portal, wl-admin, wl-partner, platform-console (5/7)
- CI: 3 workflows live (backend, crm-admin, vendor-panel). Apps without CI: customer-portal, marketplace, wl-admin, wl-partner, wl-api, platform-console — Track 2 audits this gap
- Audits done today: DB audit, crm-admin errors, strategic analysis, smoke test, legacy migration plan, walkthrough notes

### ⚠️ Known debt
- crm-admin: 328 tsc errors (mostly WhatsApp feature + UI lib drift)
- marketplace: 10 tsc errors (jest-setup + dashboard limit param)
- Legacy DB cleanup pending (192 SAFE_DROP tables list blocker)
- Backend lint: 245 errors + 2588 warnings (parked for future sprint)

### 📁 Today's reports (read before starting your track)
- `/tmp/db-audit-2026-04-19.md`
- `/tmp/crm-admin-errors-audit-2026-04-19.md`
- `/tmp/strategic-analysis-2026-04-19.md`
- `/tmp/smoke-test-2026-04-19.md`
- `/tmp/legacy-migration-plan-2026-04-19.md`
- `/tmp/walkthrough-notes-2026-04-19.md`

Each has a **Sprint Handoff** section appended pointing to the consuming track.

---

## 🎬 SPRINT STRUCTURE — 5 PARALLEL TRACKS

Each dev owns ONE track. Pick by strength, not by pre-assignment.
See `02-TRACK_EXECUTION_BRIEFS.md` for scope + steps per track.

| # | Track                              | Output                              | Scope extensions from decisions |
|:-:|:-----------------------------------|:------------------------------------|:--------------------------------|
| 1 | Code Audit                         | `/tmp/v2/01-code-audit.md`          | 7 frontends + 2 backends + 11 Shared/backend pkgs; ts-prune install |
| 2 | Architecture Audit                 | `/tmp/v2/02-architecture-audit.md`  | wl-api CQRS/DDD + Shared/backend dep graph |
| 3 | Database Audit v2                  | `/tmp/v2/03-db-audit-v2.md`         | wl-api DB connections + WhiteLabelDB extension |
| 4 | Notion Audit + V2 Workspace build  | `/tmp/v2/04-notion-audit.md` + live WS | Kumar=owner, friend=editor, Kumar-approves shares |
| 5 | Coordination + Synthesis (Kumar)   | `/tmp/v2/05-sprint-summary.md`      | Apr 30 vertical roadmap |

**8 audit categories** must all be covered across these 5 tracks:
project structure · architecture · folder organization · Notion docs · database · code · CI/CD · tests

See `02-TRACK_EXECUTION_BRIEFS.md` for the explicit mapping.

---

## 🏗 V2 NOTION WORKSPACE BLUEPRINT

Full structure in `03-V2_NOTION_WORKSPACE_TEMPLATE.md`. Summary:

```
CRM Version 2 (Workspace)
├── 📘 Getting Started (customer-facing top priority)
├── 🏗 Architecture               (Track 2 populates)
├── 💾 Database                   (Track 3 populates)
├── 📦 Code Structure             (Track 1 populates)
├── 🎯 Vertical Strategy
├── 📋 Operations                 (includes CI/CD + tests)
└── 🔒 Internal                   (team-only, NOT customer-shared)
```

**Customer access:** everything except 🔒 Internal. Permission decisions: Track 4 + Kumar approve.

---

## 📅 24-HOUR TIMELINE

```
22:30 Sun (HOUR 0) — KICKOFF MEETING (2 hours)
00:30 Mon (HOUR 2) — SPRINT BEGINS
04:30 Mon (HOUR 6) — STANDUP #1
08:30 Mon (HOUR 10) — STANDUP #2
12:30 Mon (HOUR 14) — STANDUP #3 + sync call if needed
16:30 Mon (HOUR 18) — STANDUP #4
20:30 Mon (HOUR 22) — CONVERGENCE (2 hours)
22:30 Mon (HOUR 24) — SPRINT END + RETROSPECTIVE
```

Hours counted from 22:30 kickoff. See STANDUP_TEMPLATE.md for format.

---

## ✅ SUCCESS CRITERIA

### 1. Audit reports complete
- [ ] `/tmp/v2/01-code-audit.md` (Track 1)
- [ ] `/tmp/v2/02-architecture-audit.md` (Track 2)
- [ ] `/tmp/v2/03-db-audit-v2.md` (Track 3)
- [ ] `/tmp/v2/04-notion-audit.md` (Track 4)
- [ ] `/tmp/v2/05-sprint-summary.md` (Track 5)

### 2. V2 Notion Workspace
- [ ] Workspace created, 7 top sections in place
- [ ] Getting Started customer-ready
- [ ] Architecture / Database / Code Structure / Vertical Strategy / Operations complete
- [ ] Internal section populated
- [ ] Old Notion archived with "Archive — Pre-V2" banner

### 3. Post-sprint clarity
- [ ] Day 25-30 plan for 2 verticals
- [ ] Customer access decisions documented
- [ ] Tech debt register updated

---

## 🔧 COMMUNICATION PROTOCOL

- **Primary:** Slack/Discord (decide in kickoff)
- **Urgent:** Phone (blockers only)
- **Async:** Written standups in single thread
- **Blocker 30+ min → ping Kumar**

Standup format lives in `STANDUP_TEMPLATE.md`.

---

## 🗂 GIT WORKFLOW

See `BRANCHES.md`. TL;DR: one branch per track from `develop`, PR at Hour 20, merge by Hour 24, no source code edits.

---

## 📋 PRE-SPRINT CHECKLIST (complete before 12:30 AM Mon)

- [ ] All 5 devs confirmed available for 24h with shift preferences
- [ ] Slack/Discord channel created
- [ ] V2 Notion workspace permissions decided (Track 4 + Kumar)
- [ ] Track assignments confirmed (fill `SPRINT_TRACKER.md`)
- [ ] Standup times agreed
- [ ] Emergency contact (Kumar) available throughout

---

## 🎤 KICKOFF MEETING AGENDA (22:30 - 00:30, 2h)

| Time    | Topic                                            |
| :------ | :----------------------------------------------- |
| 0-15    | Welcome + why this sprint (Kumar)                |
| 15-30   | Current state walkthrough (reports on screen)    |
| 30-50   | 5 tracks explanation + Q&A                       |
| 50-70   | Track assignments (pick by strength)             |
| 70-85   | Tooling + communication setup                    |
| 85-100  | Success criteria + timeline                      |
| 100-120 | Final questions + commitment                     |

---

## 🎯 IF WE FAIL TO COMPLETE IN 24 HOURS

Extend into Day 2. Drop lowest priority: Track 1 or Track 2 fine details.
Essential: V2 Notion + DB audit + Architecture audit. Do not defer those.

**Customer Notion access happens ONLY after Kumar review of V2.** Never premature.

---

## 💪 LET'S GO

Monday 22:30 IST — foundation solid, ready for verticals. 11 days. 2 verticals. Chaldo.

---
*Document created: 2026-04-19*
*Author: Kumar + Claude Code co-pilot*
*For: CRMSoft team internal use*
