# CRMSoft — Claude Code Instructions

## Model Selection Rules

**Default Model:** Sonnet 4.6

**Upgrade to Opus 4.7 ONLY for:**
- Architecture decisions (system design, database schema, API structure)
- Complex multi-file refactors (3+ files with interdependencies)
- Hard debugging (only after Sonnet 4.6 fails 2 attempts)
- Security-critical code review (auth, payments, PII handling)
- Performance optimization requiring deep analysis

**Downgrade to Haiku 4.5 for:**
- Documentation writing (README, API docs, comments)
- Simple CRUD operations (basic endpoints, forms)
- Test file generation (unit tests, mocks, fixtures)
- Commit messages and PR descriptions
- Boilerplate code (config files, scaffolding)
- Simple text transformations and formatting

**Rules of thumb:**
- Start every task with Sonnet 4.6 unless clearly in Opus category
- If task is repetitive or pattern-based, use Haiku 4.5
- Use /model command to switch mid-conversation when needed
- Run /cost periodically to track session usage
- When in doubt, downgrade — quality difference is minimal for most tasks
