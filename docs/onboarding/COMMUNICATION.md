# Team Communication

## Daily Standup

**Time:** 9:30 AM IST (15 min hard limit)  
**Format:** Yesterday / Today / Blockers (2 min per person)

If you're blocked after standup, Slack Kumar directly — don't wait until the next day.

## Slack

- **#crmsoft-team** — general discussion, questions
- **#crmsoft-security** — security findings (never paste credentials here)
- **#crmsoft-deployments** — deployment events (automated + manual)

## PR Conventions

### Title format

```
<type>(<scope>): <short description>

feat(crm-admin): add bulk export to quotations list
fix(backend): null pointer in lead assignment service
docs(onboarding): add first-day setup guide
chore(deps): upgrade Next.js to 15.5.15
test(backend): add unit tests for auth service
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Review SLA

| PR size | Expected review |
|---|---|
| < 100 lines | 2 hours |
| 100–500 lines | 4 hours |
| 500+ lines | Same day |

### Branches

- All work branches off `develop`
- Branch naming: `feat/short-description` or `fix/ticket-name`
- Never commit directly to `develop` or `main`

## Escalation Path

1. Stuck for 30 min → try `docs/` first
2. Still stuck → post in `#crmsoft-team`
3. Still stuck (1 hour) → direct ping Kumar on Slack
4. Production issue or security finding → immediate Slack to Kumar, no waiting

## Apr 28 Customer X Launch Context

We are 5 days from Customer X going live. The team is in **stabilization mode**:
- Bug fixes and polish only
- No new features or architectural changes until after Apr 28
- All PRs need faster-than-normal review
- Any blocking issue goes directly to Kumar

After Apr 28, the pace opens up for new feature work.

## Task Tracking

- Notion: log task status (Todo → In Progress → In Review → Done)
- Git: commit message is the primary record of what changed and why
- Don't rely on Slack for decisions — put it in Notion or as a PR comment
