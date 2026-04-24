# Git workflow — CRMSoft Foundation Audit Sprint

## Branching

One branch per track, cut from `develop` (not `main`).

| Track | Branch                                     |
| :---: | :----------------------------------------- |
| 1     | `sprint-audit/track-1-code`                |
| 2     | `sprint-audit/track-2-architecture`        |
| 3     | `sprint-audit/track-3-database`            |
| 4     | `sprint-audit/track-4-notion`              |
| 5     | `sprint-audit/track-5-coordination`        |

```sh
git checkout develop && git pull --ff-only
git checkout -b sprint-audit/track-<N>-<slug>
```

## Commit message style

Match the existing repo style (scope + terse summary):

- `docs(sprint): track-1 folder structure audit - initial pass`
- `docs(sprint): track-3 per-db schema docs, 7/7 DBs`
- `chore(sprint): add audit script for layer compliance`

Do **not** use `feat:` — the sprint produces docs, not features.

## What can / cannot be committed

**Can:**
- Markdown reports in `sprint-findings/` and `/tmp/v2/` outputs copied in
- Audit scripts in `sprint-findings/scripts/` (executable, `set -e`)
- Screenshots / diagrams if genuinely useful (PNG in `sprint-findings/assets/`)

**Cannot:**
- Source code changes (exception: Track 5 may fix typos in existing docs if trivial)
- `.env` files, credentials, Slack links, customer names
- Generated files (node_modules, build output, .next, dist)

## PR process

- Open PR to `develop` at **Hour 20**, not the end. Gives 2 hours for review/merge.
- PR title: `sprint-audit: Track N — <deliverable>`
- Reviewer: Kumar on every PR. No self-merge.
- Merge order: Track 4 (V2 skeleton) → Track 3 (DB) → Track 2 (Arch) → Track 1 (Code) → Track 5 (synthesis last). Reduces conflict on shared docs.

## Conflict handling

- Tracks 1 and 2 both inspect `Application/backend/` — coordinate via SPRINT_TRACKER.md to avoid overlap.
- Tracks 2 and 3 both touch architecture/DB boundaries — Track 2 owns patterns, Track 3 owns schemas. If unsure, ask in Slack.

## Zero-code-change rule

No `Application/` or `Customer/` or `Vendor/` source edits in this sprint. Audits report findings; fixes come later. If a dev notices a must-fix bug, log it in the Tech Debt Register (Internal Notion section), do not fix it mid-sprint.
