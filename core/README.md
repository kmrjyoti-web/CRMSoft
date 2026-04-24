# Core — Kumar's Protected Domain

This folder contains the core platform code that only Kumar (founder)
and designated architects can modify.

## Subfolders

### platform/
Core platform services: authentication, multi-tenancy, RBAC, API gateway.

### ai-engine/
AI-first framework: LLM integration, prompt libraries, AI customization.

### base-modules/
Shared business modules: CRM core, Accounting core, Inventory core.

### shared-libraries/
Cross-cutting concerns: utils, types, validators, constants.

### governance/
CI rules, audit logs, compliance, policies.

## Access Control

- **Write:** Kumar + designated architects only
- **Read:** All developers
- **PR reviews:** Required from Kumar for any changes

## Migration Source

| Subfolder | From (current V5 path) |
|---|---|
| platform/auth/ | apps-backend/api/src/modules/core/identity/ |
| platform/tenant/ | apps-backend/api/src/modules/core/multiTenant/ |
| platform/rbac/ | apps-backend/api/src/modules/core/rbac/ |
| base-modules/crm-core/ | apps-backend/api/src/modules/customer/crm/ |
| base-modules/accounting-core/ | apps-backend/api/src/modules/accounting/ |
| base-modules/inventory-core/ | apps-backend/api/src/modules/inventory/ |
| shared-libraries/ | packages-shared/ |
