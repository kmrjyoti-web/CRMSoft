# Shared Backend: audit

## Current location
`Application/backend/src/modules/core/audit/` or `Application/backend/src/common/audit/`

## Future extraction
1. Move the module code here
2. Add package.json → `@crmsoft/audit-sdk`
3. Update Application/backend/ to import from `@shared/backend/audit`
4. Each new microservice installs `@crmsoft/audit-sdk`

## Status
- [ ] Extracted from monolith
- [ ] Published as SDK package
- [ ] All consumers updated
