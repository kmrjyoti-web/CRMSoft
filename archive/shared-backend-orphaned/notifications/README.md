# Shared Backend: notifications

## Current location
`Application/backend/src/modules/core/notifications/` or `Application/backend/src/common/notifications/`

## Future extraction
1. Move the module code here
2. Add package.json → `@crmsoft/notifications-sdk`
3. Update Application/backend/ to import from `@shared/backend/notifications`
4. Each new microservice installs `@crmsoft/notifications-sdk`

## Status
- [ ] Extracted from monolith
- [ ] Published as SDK package
- [ ] All consumers updated
