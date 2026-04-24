# Shared AIC Components

## Components to extract (used by ALL portals)
- AICTable / TableFull — list pages
- AICDrawer — side panels
- AICToolbar — action bars
- AICSelect, AICInput, AICDatePicker
- AICStatusBadge, ColorBadge

## Extraction: when a second portal needs the same component
1. Move component here
2. Update crm-admin to import from @shared/frontend/components/aic/
3. Update vendor-panel to import from @shared/frontend/components/aic/
