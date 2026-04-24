# Shared Backend: tenant

## Current location
`Application/backend/src/modules/core/tenant/` or `Application/backend/src/common/tenant/`

## Future extraction
1. Move the module code here
2. Add package.json → `@crmsoft/tenant-sdk`
3. Update Application/backend/ to import from `@shared/backend/tenant`
4. Each new microservice installs `@crmsoft/tenant-sdk`

## Status
- [ ] Extracted from monolith
- [ ] Published as SDK package
- [ ] All consumers updated
