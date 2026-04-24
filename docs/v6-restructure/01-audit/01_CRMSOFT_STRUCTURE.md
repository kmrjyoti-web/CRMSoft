=== CRMSoft Structure ===

## Root Level
CLAUDE.md
Customer
Makefile
README.md
Shared
Vendor
WhiteLabel
apps-backend
apps-frontend
commitlint.config.js
docs
infra
mobile.html
node_modules
package.json
packages-backend
packages-frontend
packages-shared
pnpm-lock.yaml
pnpm-workspace.yaml
scripts
tools
tsconfig.base.json
wrangler.toml

## 2-Level Deep
.
./.git
./.github
./.github/workflows
./.husky
./.husky/_
./Customer
./Customer/backend
./Shared
./Shared/backend
./Shared/common
./Shared/frontend
./Shared/prisma-schemas
./Vendor
./Vendor/backend
./WhiteLabel
./WhiteLabel/provisioning
./WhiteLabel/scripts
./WhiteLabel/wl-api
./apps-backend
./apps-backend/api
./apps-frontend
./apps-frontend/crm-admin
./apps-frontend/customer-portal
./apps-frontend/marketplace
./apps-frontend/platform-console
./apps-frontend/vendor-panel
./apps-frontend/wl-admin
./apps-frontend/wl-partner
./docs
./docs/architecture
./docs/archive
./docs/audit
./docs/cleanup-sprint
./docs/compliance
./docs/costs
./docs/discovery
./docs/handover
./docs/health-reports
./docs/i18n
./docs/onboarding
./docs/performance
./docs/reference
./docs/security
./docs/smoke
./docs/smoke-tests
./docs/testing
./docs/v5
./docs/v6-restructure
./infra
./infra/docker
./infra/scripts
./node_modules
./packages-backend
./packages-backend/core-brand-theme
./packages-backend/core-business-types
./packages-backend/vertical-restaurant-backend
./packages-backend/vertical-retail-backend
./packages-backend/vertical-software-vendor-backend
./packages-backend/vertical-tourism-backend
./packages-frontend
./packages-frontend/core-brand-theme
./packages-frontend/ui-aic
./packages-frontend/vertical-restaurant-frontend
./packages-frontend/vertical-retail-frontend
./packages-frontend/vertical-software-vendor-frontend
./packages-frontend/vertical-tourism-frontend
./packages-shared
./packages-shared/constants
./packages-shared/enums
./packages-shared/types
./packages-shared/validators
./scripts
./scripts/cli
./scripts/governance
./scripts/lib
./scripts/skills
./scripts/work
./tools
./tools/cross-db-resolver-validator
./tools/db-schema-auditor
./tools/migration-helpers

=== Workspace Config ===
# CRMSoft V5 — pnpm workspace configuration
# Created: 2026-04-22 (Phase 4 of V5 restructure)
#
# Replaces the npm-style "workspaces" field in root package.json, which pnpm
# ignores. This file is what pnpm actually reads for workspace discovery.

packages:
  # Apps (executables)
  - 'apps-backend/*'
  - 'apps-frontend/*'

  # V5 reusable packages — glob patterns for future growth.
  # Currently only README placeholders; pnpm skips any folder without
  # a package.json so these are safe no-ops today.
  - 'packages-backend/*'
  - 'packages-frontend/*'
  - 'packages-shared/*'
  - 'tools/*'

  # Pre-V5 Shared/* packages (still used by the backend; keep until migrated)
  - 'Shared/common'
  - 'Shared/frontend'
  - 'Shared/prisma-schemas'
  - 'Shared/backend/audit'
  - 'Shared/backend/cache'
  - 'Shared/backend/encryption'
  - 'Shared/backend/errors'
  - 'Shared/backend/global-data'
  - 'Shared/backend/identity'
  - 'Shared/backend/notifications'
  - 'Shared/backend/prisma'
  - 'Shared/backend/queue'
  - 'Shared/backend/storage'
  - 'Shared/backend/tenant'

  # White Label API (separate Next.js service, stays per V5 plan)
  - 'WhiteLabel/wl-api'

=== Package.json Files ===
./Shared/backend/audit/package.json
./Shared/backend/cache/package.json
./Shared/backend/encryption/package.json
./Shared/backend/errors/package.json
./Shared/backend/global-data/package.json
./Shared/backend/identity/package.json
./Shared/backend/notifications/package.json
./Shared/backend/prisma/package.json
./Shared/backend/queue/package.json
./Shared/backend/storage/package.json
./Shared/backend/tenant/package.json
./Shared/common/package.json
./Shared/frontend/package.json
./Shared/prisma-schemas/package.json
./WhiteLabel/wl-api/package.json
./apps-backend/api/package.json
./apps-frontend/crm-admin/lib/coreui/package.json
./apps-frontend/crm-admin/lib/coreui/packages/config/package.json
./apps-frontend/crm-admin/lib/coreui/packages/layout/package.json
./apps-frontend/crm-admin/lib/coreui/packages/theme/package.json
./apps-frontend/crm-admin/lib/coreui/packages/ui-react/package.json
./apps-frontend/crm-admin/lib/coreui/packages/ui/package.json
./apps-frontend/crm-admin/package.json
./apps-frontend/customer-portal/.next/package.json
./apps-frontend/customer-portal/.next/types/package.json
./apps-frontend/customer-portal/package.json
./apps-frontend/marketplace/.next/package.json
./apps-frontend/marketplace/.next/types/package.json
./apps-frontend/marketplace/package.json
./apps-frontend/platform-console/.next/package.json
./apps-frontend/platform-console/.next/types/package.json
./apps-frontend/platform-console/package.json
./apps-frontend/vendor-panel/.next/package.json
./apps-frontend/vendor-panel/.next/types/package.json
./apps-frontend/vendor-panel/package.json
./apps-frontend/wl-admin/.next/package.json
./apps-frontend/wl-admin/.next/types/package.json
./apps-frontend/wl-admin/package.json
./apps-frontend/wl-partner/.next/package.json
./apps-frontend/wl-partner/.next/types/package.json
./apps-frontend/wl-partner/package.json
./package.json
