# Deploy Repos — Setup Guide

Each service in this monorepo deploys to its own private GitHub repo via `git subtree split`.
The `deploy-split.yml` workflow handles this automatically on every merge to `main`.

## 9 repos to create on GitHub (under `kmrjyoti-web`)

| # | Repo Name | Source Folder | Port | Used By |
|---|-----------|---------------|------|---------|
| 1 | `crmsoft-api` | `Application/backend/` | 3001 | Core CRM API (NestJS) |
| 2 | `crmsoft-crm-admin` | `Customer/frontend/crm-admin/` | 3005 | CRM Admin Panel (Next.js) |
| 3 | `crmsoft-vendor-panel` | `Vendor/frontend/vendor-panel/` | 3006 | Vendor Panel (Next.js) |
| 4 | `crmsoft-marketplace` | `Application/frontend/marketplace/` | 3007 | Marketplace Frontend |
| 5 | `crmsoft-wl-api` | `WhiteLabel/wl-api/` | 3010 | WhiteLabel API (NestJS) |
| 6 | `crmsoft-wl-admin` | `WhiteLabel/wl-admin/` | 3009 | WhiteLabel Admin Panel |
| 7 | `crmsoft-wl-partner` | `WhiteLabel/wl-partner/` | 3011 | WhiteLabel Partner Portal |
| 8 | `crmsoft-mobile` | `Mobile/` | — | Flutter App |
| 9 | `crmsoft-shared` | `Shared/` | — | Shared libs (npm packages) |

## Steps to create each repo

1. Go to [github.com/new](https://github.com/new)
2. Owner: `kmrjyoti-web`
3. Name: see table above (e.g., `crmsoft-api`)
4. Visibility: **Private**
5. **Do NOT** initialize with README, .gitignore, or license
6. Click **Create repository**
7. Repeat for all 9 repos

> The `deploy-split.yml` workflow will push code to each repo automatically on the first merge to `main` after the repo is created.

## GitHub PAT (DEPLOY_TOKEN)

The deploy workflow needs a Personal Access Token with write access to all deploy repos.

1. Go to [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta) (Fine-grained tokens)
2. Click **Generate new token**
3. Token name: `CRMSoft Deploy Token`
4. Expiration: 1 year (or no expiration)
5. Resource owner: `kmrjyoti-web`
6. Repository access: **Selected repositories** → select all 9 repos above
7. Permissions: **Contents** → Read and write
8. Click **Generate token** and copy it

### Add to monorepo secrets

1. Go to [github.com/kmrjyoti-web/CrmProject/settings/secrets/actions](https://github.com/kmrjyoti-web/CrmProject/settings/secrets/actions)
2. Click **New repository secret**
3. Name: `DEPLOY_TOKEN`
4. Value: paste the PAT
5. Click **Add secret**

## Branch protection rules

### `main` branch
1. Go to Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: **1**
   - ✅ Require status checks to pass before merging
   - Status checks: `API — Lint, Build & Test`, `commit-lint`, `Release gate summary`
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings
   - ✅ Restrict who can push to matching branches (only admins)

### `develop` branch
1. Add rule for `develop`
2. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: **0** (self-merge OK for solo dev)
   - ✅ Require status checks to pass before merging
   - Status checks: `API — Lint, Build & Test`, `commit-lint`
   - ✅ Do not allow force pushes
   - ✅ Do not allow deletions

## Workflow summary

```
feature/xxx  →  PR to develop  →  CI (pr-check.yml)  →  merge  →  staging auto-deploy
develop      →  PR to main     →  Release gate (release.yml)  →  merge  →  split to deploy repos
main         →  Production     →  Manual deploy (deploy-production.yml)
```

## Viewing deploy repo contents

After the first push from `deploy-split.yml`, each repo will contain only its own subfolder — no monorepo overhead, ready to deploy directly.

```bash
# Example: see what's in crmsoft-api
git clone https://github.com/kmrjyoti-web/crmsoft-api.git
ls  # → package.json, src/, prisma/, etc. (Application/backend contents)
```
