# Shared Backend: global-data

## Current location
`Application/backend/src/modules/core/global-data/` or `Application/backend/src/common/global-data/`

## Future extraction
1. Move the module code here
2. Add package.json → `@crmsoft/global-data-sdk`
3. Update Application/backend/ to import from `@shared/backend/global-data`
4. Each new microservice installs `@crmsoft/global-data-sdk`

## Status
- [ ] Extracted from monolith
- [ ] Published as SDK package
- [ ] All consumers updated
