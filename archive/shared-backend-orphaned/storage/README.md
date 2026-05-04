# Shared Backend: storage

## Current location
`Application/backend/src/modules/core/storage/` or `Application/backend/src/common/storage/`

## Future extraction
1. Move the module code here
2. Add package.json → `@crmsoft/storage-sdk`
3. Update Application/backend/ to import from `@shared/backend/storage`
4. Each new microservice installs `@crmsoft/storage-sdk`

## Status
- [ ] Extracted from monolith
- [ ] Published as SDK package
- [ ] All consumers updated
