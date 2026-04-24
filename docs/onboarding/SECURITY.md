# Security Rules for Developers

## The Non-Negotiables

**Never commit:**
- `.env` files (gitignored, but verify before pushing)
- Passwords, API keys, or tokens in source code
- Database connection strings in docs or README
- Any file named like `*credentials*`, `*creds*`, `*secrets*`, `*connections*`

**Always:**
- Use environment variables for secrets (`process.env.X`)
- Store credentials in a password manager (1Password, Bitwarden)
- Use `.env` files locally (gitignored)
- Ask Kumar before committing anything that contains connection strings

## Getting Credentials

**Ask Kumar.** Don't ask teammates in public Slack channels — use a DM or a secure channel. Don't accept credentials pasted in a group chat.

Kumar will give you:
- Railway DB connection strings (for your `.env`)
- Admin login credentials (rotated on 2026-04-23)
- Any API keys you need for your work area

## The `.env` Pattern

```bash
# ✅ Correct — stored in .env (gitignored)
DATABASE_URL=postgresql://postgres:secret@host:port/db

# ❌ Wrong — never in source code
const db = new PrismaClient({ url: "postgresql://postgres:secret@..." });

# ❌ Wrong — never in README, doc comments, or test files
// connects to postgresql://postgres:secret@...
```

## Before Every Push

Run a quick mental check:
1. `git diff --cached` — anything that looks like a password?
2. Did you accidentally create a file with credentials in the repo?
3. Is your `.env` file showing as untracked? (`git status` should not list it)

## If You Find a Secret in Code

1. **Do not commit a "fix" immediately** — the fix might still be in the diff history
2. **Alert Kumar on Slack (#crmsoft-security)** with: what you found, which file, which commit
3. Let Kumar decide whether to rotate the credential first or commit the removal first

## Recent Security History

- **2026-04-22:** `CRM_V1_DB_CONNECTIONS.txt` removed from repo (had been committed with Railway host + plaintext admin credentials)
- **2026-04-23:** Admin credentials rotated in IdentityDB — `Admin@123` and `SuperAdmin@123` no longer work; new passwords are in env vars only
- **2026-04-23:** `apps-backend/api/.env` untracked (had been committed in V5 restructure PR with real Railway connection strings)
- **2026-04-23:** `apps-backend/api/pas` untracked (scratch file with Supabase credentials)

If you see old passwords (`Admin@123`, `SuperAdmin@123`) in git history — they are rotated and non-functional. Do not use them.

## Seed Credentials

The seed scripts (`prisma/seed.ts`, `prisma/seeds/identity/seed-identity.ts`) require env vars:

```bash
# In .env:
ADMIN_INITIAL_PASSWORD=<ask Kumar>
PLATFORM_INITIAL_PASSWORD=<ask Kumar>
```

The scripts will throw immediately if these are missing. This is intentional — prevents accidental seeding with blank passwords.

## Using Prisma Clients Correctly

```typescript
// ✅ Correct — per-DB client
import { PrismaClient } from '@prisma/identity-client';

// ❌ Wrong — bare stub, has no models
import { PrismaClient } from '@prisma/client';
```

The bare `@prisma/client` package in this repo is a stub and exports nothing useful. The tsc config explicitly excludes seed files from compilation specifically because many old seeds use this incorrect import.

## Questions

Post in `#crmsoft-security` on Slack or DM Kumar.
