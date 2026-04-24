# Import Dependency Hotspots

## Cross-workspace imports (@crmsoft/*, @shared-types/*)

### @crmsoft/ imports count by file

### @shared-types/ imports (to migrate)
./apps-frontend/crm-admin/src/features/customer-portal/types/customer-portal.types.ts
./apps-frontend/crm-admin/src/types/api-response.ts
./apps-frontend/vendor-panel/src/types/api.ts

### Cross-portal imports (apps-frontend/* importing from another portal)

### WhiteLabel imports into main apps

## Package.json Cross-workspace deps

### workspace: protocol usage
apps-frontend/crm-admin/lib/coreui/packages/ui/package.json:33:    "@coreui/config": "workspace:*",
apps-frontend/crm-admin/lib/coreui/packages/layout/package.json:35:    "@coreui/config": "workspace:*",
apps-frontend/crm-admin/lib/coreui/packages/ui-react/package.json:25:    "@coreui/ui": "workspace:^",
apps-frontend/crm-admin/lib/coreui/packages/ui-react/package.json:26:    "@coreui/theme": "workspace:^",
apps-frontend/crm-admin/lib/coreui/packages/ui-react/package.json:43:    "@coreui/config": "workspace:*",
apps-frontend/crm-admin/lib/coreui/packages/theme/package.json:36:    "@coreui/config": "workspace:*",
