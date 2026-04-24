# Shared Backend: cache

## Current location
`Application/backend/src/modules/core/cache/` or `Application/backend/src/common/cache/`

## Future extraction
1. Move the module code here
2. Add package.json → `@crmsoft/cache-sdk`
3. Update Application/backend/ to import from `@shared/backend/cache`
4. Each new microservice installs `@crmsoft/cache-sdk`

## Status
- [ ] Extracted from monolith
- [ ] Published as SDK package
- [ ] All consumers updated
