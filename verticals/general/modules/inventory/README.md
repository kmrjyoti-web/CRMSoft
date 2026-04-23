# Inventory Module

**Status:** Re-export gateway (physical migration pending)  
**Source:** `apps-backend/api/src/modules/customer/inventory/`  
**Migration:** See `docs/v6-restructure/01-audit/08_GV_VERTICAL_AUDIT.md`

## What Lives Here

- Inventory tracking (stock in/out, adjustments)
- Bill of Materials (BOM, formulas, calculations, production runs)
- Serial/batch tracking
- Inventory labels
- Scrap management

## Physical Migration Note

The code currently lives at `apps-backend/api/src/modules/customer/inventory/`.
Physical relocation requires monorepo workspace tooling (pnpm workspace packages)
so that `@nestjs/common` and other deps resolve correctly from outside `apps-backend/api/`.
That is scheduled for the next architecture sprint.
