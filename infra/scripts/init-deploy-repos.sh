#!/bin/bash
set -e

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║  INITIALIZING DEPLOY REPOS                                          ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"

# Requires: GitHub CLI (gh) installed and authenticated
# Install: brew install gh && gh auth login

GITHUB_USER="kmrjyoti-web"

REPOS=(
  "crmsoft-api:Application backend NestJS API (port 3001)"
  "crmsoft-crm-admin:Customer CRM Admin frontend (port 3005)"
  "crmsoft-vendor-panel:Vendor Panel frontend (port 3006)"
  "crmsoft-marketplace:Marketplace PWA frontend (port 3007)"
  "crmsoft-wl-api:White Label API backend (port 3010)"
  "crmsoft-wl-admin:White Label Admin frontend (port 3009)"
  "crmsoft-wl-partner:White Label Partner Portal frontend (port 3011)"
  "crmsoft-mobile:Mobile Flutter app"
  "crmsoft-shared:Shared SDK libraries"
)

for repo_info in "${REPOS[@]}"; do
  IFS=':' read -r name desc <<< "$repo_info"

  echo ""
  echo "Creating: $GITHUB_USER/$name"

  if gh repo view "$GITHUB_USER/$name" &>/dev/null; then
    echo "  ⏭️  Already exists — skipping"
  else
    gh repo create "$GITHUB_USER/$name" \
      --description "$desc" \
      --private \
      --confirm
    echo "  ✅ Created $name"
  fi
done

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║  ✅ ALL 9 DEPLOY REPOS CREATED                                      ║"
echo "╠═══════════════════════════════════════════════════════════════════════╣"
echo "║  Next steps:                                                         ║"
echo "║  1. Create a GitHub Personal Access Token (PAT) with repo scope     ║"
echo "║  2. Add it as secret DEPLOY_TOKEN in CRMSoft repo:                  ║"
echo "║     Settings → Secrets → New repository secret                      ║"
echo "║  3. Push to main → GitHub Actions auto-splits to deploy repos       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
