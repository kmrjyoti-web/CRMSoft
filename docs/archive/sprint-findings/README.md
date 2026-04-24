# sprint-findings/

Outputs of the CRMSoft Foundation Audit Sprint (2026-04-19 22:30 IST → 2026-04-20 22:30 IST).

## What's in here

| File / Folder                     | Purpose                                                                 | Owner        |
| :-------------------------------- | :---------------------------------------------------------------------- | :----------- |
| `01-SPRINT_KICKOFF_BRIEF.md`      | The brief walked through in kickoff — goals, tracks, timeline, rules   | Kumar        |
| `02-TRACK_EXECUTION_BRIEFS.md`    | Per-track execution detail — scope, steps, outputs, definition of done | Kumar        |
| `03-V2_NOTION_WORKSPACE_TEMPLATE.md` | Structure + content template for the V2 Notion workspace             | Track 4      |
| `BRANCHES.md`                     | Git branch naming, workflow rules, PR process                          | All tracks   |
| `STANDUP_TEMPLATE.md`             | The 4-hourly written standup format                                    | All tracks   |
| `SPRINT_TRACKER.md`               | Live grid — track × checkpoint, updated every 4h                       | Kumar        |
| `scripts/`                        | Bash helpers for Tracks 1 + 2 (folder/module/layer/dep audits)         | T1/T2 owners |

## During sprint

- Every track pushes its outputs into this folder on its own branch (see `BRANCHES.md`).
- `/tmp/v2/` holds working output files (`01-code-audit.md` … `05-sprint-summary.md`). Final versions land here via PR by Hour 22.
- Scripts in `scripts/` log to `/tmp/v2/` by default — override with `OUT_DIR=/path` if needed.

## After sprint

- Final V2 docs are customer-facing; do not commit secrets, internal Slack links, or draft notes here.
- Sprint retrospective notes go in `05-sprint-summary.md` (Track 5).

## Input reports (read before starting your track)

Located in `/tmp/` (not this repo):

- `db-audit-2026-04-19.md` → Track 3
- `crm-admin-errors-audit-2026-04-19.md` → Track 1
- `strategic-analysis-2026-04-19.md` → Track 5 + Track 2
- `smoke-test-2026-04-19.md` → Track 2
- `legacy-migration-plan-2026-04-19.md` → Track 3
- `walkthrough-notes-2026-04-19.md` → general context

Each of these has a "Sprint Handoff" section appended that points to the track and lists key findings.
