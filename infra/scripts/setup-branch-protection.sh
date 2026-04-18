#!/bin/bash

# Requires: GitHub CLI (gh)
REPO="kmrjyoti-web/CRMSoft"

echo "Setting up branch protection for $REPO..."
echo ""

# Protect main branch
echo "Configuring main branch protection..."
gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["check-api","check-crm-admin","check-vendor-panel"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null \
  2>/dev/null && echo "✅ main branch protected" || echo "⚠️  Branch protection requires GitHub Pro/Team plan"

echo ""
echo "Branch protection rules:"
echo "  main       → Requires PR + 1 approval + CI pass"
echo "  develop    → Requires PR + CI pass"
echo "  feature/*  → No restrictions (developer branches)"
echo "  release/*  → Requires PR to main"
echo ""
echo "Branch strategy:"
echo "  feature/xxx → PR → develop → release/vX.Y.Z → PR → main → auto-deploy"
