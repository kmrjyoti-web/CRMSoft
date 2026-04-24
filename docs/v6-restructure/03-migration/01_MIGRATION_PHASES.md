# V6 Migration Execution Phases

**Target:** 72-hour skeleton + 3-week full migration
**Status:** Phase 1 in progress (tonight)
**Customer X Launch:** Apr 28 — fully protected, parallel work

## Phase 1: Skeleton + Audit (Tonight, 4-5 hours) ✅ IN PROGRESS

### Owner: Evening Dev (Auto-accept)

Tasks:
- [x] Create sprint branch `sprint/v6-skeleton-2026-04-23`
- [x] Backup tag `backup/pre-war-sprint-2026-04-23`
- [x] Skeleton folders created (core/, verticals/, brands/, apps/)
- [x] README in each major folder
- [x] Complete CRMSoft audit (6 docs)
- [x] External projects query doc
- [x] Target architecture document
- [x] Migration phases document (this file)
- [ ] Team task matrix
- [ ] Migration scripts
- [ ] Kumar presentation doc
- [ ] Commit + PR draft

### Deliverables
- 15+ documents in docs/v6-restructure/
- Skeleton folder structure (56+ dirs)
- Migration scripts ready to run
- Ready for team review at 9:30 AM standup

### Risk: ZERO (no code moves — skeleton and docs only)

---

## Phase 2: Team Alignment (Tomorrow 9:30 AM, 2 hours)

### Owner: Kumar + 5 devs

Tasks:
- [ ] Review evening dev's audit + architecture (start with 02_KUMAR_PRESENTATION.md)
- [ ] Assign ownership per dev (see team matrix)
- [ ] Clarify external projects access (07_EXTERNAL_PROJECTS_QUERY.md)
- [ ] Final go/no-go for Phase 3

### Dev Allocation

| Dev | Primary Scope | Day 2-3 Focus |
|---|---|---|
| Dev 1 (Backend) | core/platform/ + core/base-modules/ | Backend module migration |
| Dev 2 (Frontend 1) | apps/frontend/crm-admin-new/ + vendor-panel-new/ | Frontend migration |
| Dev 3 (Frontend 2) | apps/frontend/customer-portal-new/ + marketplace-new/ | Frontend migration |
| Dev 4 (Integration) | verticals/travel/ | Travel project merge |
| Dev 5 (QA/DevOps) | CI/CD rules + testing | Gating + deployment |
| Kumar | core/ai-engine/ + architecture reviews | Reviews + AI |

---

## Phase 3: Parallel Migration Start (Day 2, 8-16 hours)

### Owner: Full team parallel
### Duration: 9 AM to 6 PM

Tasks:
- [ ] Each dev creates their feature branch from sprint/v6-skeleton-2026-04-23
- [ ] Works in assigned scope only
- [ ] Daily sync at 2 PM
- [ ] PR reviews continuously

### Safety Rules
- NO breaking changes to existing develop
- Customer X release branch UNTOUCHED
- All work in sprint branches and child branches
- Merge to develop ONLY after full testing

---

## Phase 4: Travel Project Merge (Day 2-3, 16-24 hours)

### Owner: Dev 4 + Kumar
### Requires: Travel project Git URL from Kumar

Tasks:
- [ ] Get Travel project access (Kumar provides morning of Day 2)
- [ ] Run `scripts/v6-migration/import-travel-project.sh`
- [ ] Reorganize into `verticals/travel/modules/`
- [ ] Extract data models → `verticals/travel/data-models/`
- [ ] Integration tests
- [ ] PR: `feat/verticals-travel-merge`

### Commands (Template — Kumar fills URL)

```bash
# Option A: Git subtree (preserves history — preferred)
git subtree add --prefix=verticals/travel \
  <TRAVEL_REPO_URL> main --squash

# Option B: Copy + remove (if subtree not possible)
cp -r /path/to/travel-project/* verticals/travel/
```

---

## Phase 5: Electronic Project Merge (Day 3, 24-32 hours)

### Owner: Dev 4 + Kumar

Same process as Phase 4 for Electronic project.

---

## Phase 6: Brand + Partner Panel Demo (Day 3, 32-48 hours)

### Owner: Dev 2 + Dev 5 + Kumar

Tasks:
- [ ] Implement brand theme injection proof of concept
- [ ] Partner panel prototype in `partner-customizations/`
- [ ] Demo: 2 brands deployable from same codebase
- [ ] Demo: 1 partner customization working

---

## Phase 7: Testing + Demo Ready (Day 3-4, 48-72 hours)

### Owner: Dev 5 (QA lead)

Tasks:
- [ ] Integration testing
- [ ] E2E smoke tests
- [ ] Performance benchmarks
- [ ] Customer demo preparation
- [ ] Documentation polish

---

## Phase 8: Customer Demo (Day 4)

### Owner: Kumar
### Audience: Customer + Customer's financer

Show:
1. New folder structure (organized, professional)
2. 1 working vertical (Travel or Electronic)
3. Brand inheritance (2 brands, same code)
4. Architecture documentation (trust signal)
5. Migration roadmap (shows planning rigor)

---

## Phase 9: Full Feature Migration (Week 2-3)

Post-demo, remaining modules migrate incrementally:
- Week 2: Remaining backend modules → core/
- Week 3: Frontend finalization + CI/CD boundary rules
- Week 4: Production deployment of V6

---

## Customer X Protection Throughout All Phases

- `release/customer-x-2026-04-28` branch UNTOUCHED
- Apr 28 launch proceeds from release branch
- V6 develop work is parallel — zero impact on launch
- Post-launch Week 4: Customer X migrates to V6

---

## Success Criteria

### 72 Hours (Skeleton + Demo)
- [x] Folder structure visible in repo
- [x] Complete documentation
- [ ] Migration scripts tested
- [ ] 1 vertical working demo
- [ ] Brand inheritance proof
- [ ] Customer sees progress

### Full Migration (Week 2-3)
- [ ] All modules migrated
- [ ] All tests passing
- [ ] CI/CD boundary rules active
- [ ] Production deployable
- [ ] Full documentation

---

## Rollback Plan

At any point:
```bash
git checkout backup/pre-war-sprint-2026-04-23
```

Or to undo a specific migration step:
```bash
git reset --hard <commit-before-step>
```

Customer X is always safe because it's on a separate release branch.
