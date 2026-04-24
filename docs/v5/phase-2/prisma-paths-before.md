=== Prisma generator output paths BEFORE move ===

Layout: prisma/<db>/v1/_base.prisma carries the generator + datasource.
Schema files at: Application/backend/prisma/<db>/v1/*.prisma

- **demo** → `../../../node_modules/.prisma/demo-client` (env `DEMO_DATABASE_URL`)
- **global** → `../../../node_modules/.prisma/global-reference-client` (env `GLOBAL_REFERENCE_DATABASE_URL`)
- **identity** → `../../../node_modules/@prisma/identity-client` (env `IDENTITY_DATABASE_URL`)
- **marketplace** → `../../../node_modules/@prisma/marketplace-client` (env `MARKETPLACE_DATABASE_URL`)
- **platform-console** → `../../../node_modules/.prisma/platform-console-client` (env `PLATFORM_CONSOLE_DATABASE_URL`)
- **platform** → `../../../node_modules/@prisma/platform-client` (env `PLATFORM_DATABASE_URL`)
- **working** → `../../../node_modules/@prisma/working-client` (env `GLOBAL_WORKING_DATABASE_URL`)
