# Shared Backend: queue

## Current location
`Application/backend/src/modules/core/queue/` or `Application/backend/src/common/queue/`

## Future extraction
1. Move the module code here
2. Add package.json → `@crmsoft/queue-sdk`
3. Update Application/backend/ to import from `@shared/backend/queue`
4. Each new microservice installs `@crmsoft/queue-sdk`

## Status
- [ ] Extracted from monolith
- [ ] Published as SDK package
- [ ] All consumers updated
