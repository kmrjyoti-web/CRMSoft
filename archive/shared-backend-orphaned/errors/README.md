# Shared Backend: errors

## Current location
`Application/backend/src/modules/core/errors/` or `Application/backend/src/common/errors/`

## Future extraction
1. Move the module code here
2. Add package.json → `@crmsoft/errors-sdk`
3. Update Application/backend/ to import from `@shared/backend/errors`
4. Each new microservice installs `@crmsoft/errors-sdk`

## Status
- [ ] Extracted from monolith
- [ ] Published as SDK package
- [ ] All consumers updated
