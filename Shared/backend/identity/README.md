# Shared Backend: identity

## Current location
`Application/backend/src/modules/core/identity/` or `Application/backend/src/common/identity/`

## Future extraction
1. Move the module code here
2. Add package.json → `@crmsoft/identity-sdk`
3. Update Application/backend/ to import from `@shared/backend/identity`
4. Each new microservice installs `@crmsoft/identity-sdk`

## Status
- [ ] Extracted from monolith
- [ ] Published as SDK package
- [ ] All consumers updated
