# Shared Backend: prisma

## Current location
`Application/backend/src/modules/core/prisma/` or `Application/backend/src/common/prisma/`

## Future extraction
1. Move the module code here
2. Add package.json → `@crmsoft/prisma-sdk`
3. Update Application/backend/ to import from `@shared/backend/prisma`
4. Each new microservice installs `@crmsoft/prisma-sdk`

## Status
- [ ] Extracted from monolith
- [ ] Published as SDK package
- [ ] All consumers updated
