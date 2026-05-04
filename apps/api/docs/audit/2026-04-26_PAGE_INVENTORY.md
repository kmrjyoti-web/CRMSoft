# CRMSoft Page Inventory Audit
Date: 2026-04-26
Sprint: M0a (Pre-rebuild discovery)
Auditor: Claude Code (Sonnet 4.6)

---

## Executive Summary

- Total pages (page.tsx files): 402
- Total feature components: 668
- Total shared components: 153
- Modules identified: auth, dashboard, leads, contacts, organizations, raw-contacts, activities, tasks, quotations, sales, finance, accounts, inventory, procurement, products, campaigns, whatsapp, email, calendar, workflows, reports, analytics, marketplace, settings, admin, support, plugins, ai, api-gateway, approvals, documents, notifications, post-sales, performance, verification, onboarding, ops, master, puja, sync, offline-sync, export, import, help, demos, tour-plans, discount-master, pricing, promotions, recycle-bin, follow-ups, reminders, ownership, shortcuts, wallet
- Page type breakdown: FORM: 42, TXN: 18, RPT: 28, PAGE: 225, DASH: 15, COMP: 5, TAB: 0, POS: 1
- Hardcoded vertical references: 1 page file (company/[companyId]/dashboard/page.tsx — TRAVEL, RETAIL, SOFTWARE)
- Hardcoded brand references: 17 component files (all in src/components/brand-login/brands/travvellis/ + registry files + auth.service.ts + StageSubUserType.tsx)
- Deprecated/archived: 5 files (archived 2026-04-26)
- Demo-ready pages: 52 (all (main) modules in leads, quotations, contacts, dashboard, tasks, activities, calendar, workflows, sales, reports, whatsapp)

---

## Inventory by Module

### AUTH — 3 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| AUTH_PAGE_LOGIN_V1 | PAGE | /login | (auth)/login/page.tsx | |
| AUTH_PAGE_REGISTER_V1 | PAGE | /register | (auth)/register/page.tsx | |
| AUTH_PAGE_FORGOT_PASSWORD_V1 | PAGE | /forgot-password | (auth)/forgot-password/page.tsx | |

### ROOT / SPECIAL — 4 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| AUTH_PAGE_HOME_V1 | PAGE | / | page.tsx | |
| AUTH_PAGE_SELECT_COMPANY_V1 | PAGE | /select-company | select-company/page.tsx | |
| AUTH_PAGE_COMPANY_DASHBOARD_V1 | DASH | /company/:companyId/dashboard | company/[companyId]/dashboard/page.tsx | ✓ |
| AUTH_PAGE_VERIFY_V1 | PAGE | /verify/:token | verify/[token]/page.tsx | |

### DASHBOARD — 2 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| DASH_DASH_MAIN_V1 | DASH | /dashboard | (main)/dashboard/page.tsx | ✓ |
| DASH_DASH_MY_V1 | DASH | /dashboard/my | (main)/dashboard/my/page.tsx | ✓ |

### LEADS — 6 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| LEAD_PAGE_LIST_V1 | PAGE | /leads | (main)/leads/page.tsx | ✓ |
| LEAD_FORM_NEW_V1 | FORM | /leads/new | (main)/leads/new/page.tsx | ✓ |
| LEAD_PAGE_DETAIL_V1 | PAGE | /leads/:id | (main)/leads/[id]/page.tsx | ✓ |
| LEAD_FORM_EDIT_V1 | FORM | /leads/:id/edit | (main)/leads/[id]/edit/page.tsx | ✓ |
| LEAD_PAGE_MASS_DELETE_V1 | PAGE | /leads/mass-delete | (main)/leads/mass-delete/page.tsx | |
| LEAD_PAGE_MASS_UPDATE_V1 | PAGE | /leads/mass-update | (main)/leads/mass-update/page.tsx | |

### CONTACTS — 8 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| CUST_PAGE_LIST_V1 | PAGE | /contacts | (main)/contacts/page.tsx | ✓ |
| CUST_FORM_NEW_V1 | FORM | /contacts/new | (main)/contacts/new/page.tsx | ✓ |
| CUST_PAGE_DETAIL_V1 | PAGE | /contacts/:id | (main)/contacts/[id]/page.tsx | ✓ |
| CUST_FORM_EDIT_V1 | FORM | /contacts/:id/edit | (main)/contacts/[id]/edit/page.tsx | ✓ |
| CUST_DASH_DASHBOARD_V1 | DASH | /contacts/dashboard | (main)/contacts/dashboard/page.tsx | ✓ |
| CUST_PAGE_ALL_RECORDS_V1 | PAGE | /contacts/all-records | (main)/contacts/all-records/page.tsx | |
| CUST_PAGE_STATS_V1 | PAGE | /contacts/statistics | (main)/contacts/statistics/page.tsx | |
| CUST_PAGE_MASS_DELETE_V1 | PAGE | /contacts/mass-delete | (main)/contacts/mass-delete/page.tsx | |
| CUST_PAGE_MASS_UPDATE_V1 | PAGE | /contacts/mass-update | (main)/contacts/mass-update/page.tsx | |

### ORGANIZATIONS — 5 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| ORG_PAGE_LIST_V1 | PAGE | /organizations | (main)/organizations/page.tsx | ✓ |
| ORG_FORM_NEW_V1 | FORM | /organizations/new | (main)/organizations/new/page.tsx | ✓ |
| ORG_PAGE_DETAIL_V1 | PAGE | /organizations/:id | (main)/organizations/[id]/page.tsx | ✓ |
| ORG_FORM_EDIT_V1 | FORM | /organizations/:id/edit | (main)/organizations/[id]/edit/page.tsx | ✓ |
| ORG_PAGE_MASS_DELETE_V1 | PAGE | /organizations/mass-delete | (main)/organizations/mass-delete/page.tsx | |
| ORG_PAGE_MASS_UPDATE_V1 | PAGE | /organizations/mass-update | (main)/organizations/mass-update/page.tsx | |

### RAW CONTACTS — 6 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| RAWC_PAGE_LIST_V1 | PAGE | /raw-contacts | (main)/raw-contacts/page.tsx | |
| RAWC_FORM_NEW_V1 | FORM | /raw-contacts/new | (main)/raw-contacts/new/page.tsx | |
| RAWC_PAGE_DETAIL_V1 | PAGE | /raw-contacts/:id | (main)/raw-contacts/[id]/page.tsx | |
| RAWC_FORM_EDIT_V1 | FORM | /raw-contacts/:id/edit | (main)/raw-contacts/[id]/edit/page.tsx | |
| RAWC_PAGE_MASS_DELETE_V1 | PAGE | /raw-contacts/mass-delete | (main)/raw-contacts/mass-delete/page.tsx | |
| RAWC_PAGE_MASS_UPDATE_V1 | PAGE | /raw-contacts/mass-update | (main)/raw-contacts/mass-update/page.tsx | |

### ACTIVITIES — 6 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| ACT_PAGE_LIST_V1 | PAGE | /activities | (main)/activities/page.tsx | ✓ |
| ACT_FORM_NEW_V1 | FORM | /activities/new | (main)/activities/new/page.tsx | ✓ |
| ACT_PAGE_DETAIL_V1 | PAGE | /activities/:id | (main)/activities/[id]/page.tsx | ✓ |
| ACT_FORM_EDIT_V1 | FORM | /activities/:id/edit | (main)/activities/[id]/edit/page.tsx | ✓ |
| ACT_PAGE_MASS_DELETE_V1 | PAGE | /activities/mass-delete | (main)/activities/mass-delete/page.tsx | |
| ACT_PAGE_MASS_UPDATE_V1 | PAGE | /activities/mass-update | (main)/activities/mass-update/page.tsx | |

### TASKS — 3 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| TASK_PAGE_LIST_V1 | PAGE | /tasks | (main)/tasks/page.tsx | ✓ |
| TASK_FORM_NEW_V1 | FORM | /tasks/new | (main)/tasks/new/page.tsx | ✓ |
| TASK_PAGE_DETAIL_V1 | PAGE | /tasks/:id | (main)/tasks/[id]/page.tsx | ✓ |

### QUOTATIONS — 6 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| QUOT_PAGE_LIST_V1 | PAGE | /quotations | (main)/quotations/page.tsx | ✓ |
| QUOT_TXN_NEW_V1 | TXN | /quotations/new | (main)/quotations/new/page.tsx | ✓ |
| QUOT_PAGE_DETAIL_V1 | PAGE | /quotations/:id | (main)/quotations/[id]/page.tsx | ✓ |
| QUOT_TXN_EDIT_V1 | TXN | /quotations/:id/edit | (main)/quotations/[id]/edit/page.tsx | ✓ |
| QUOT_RPT_ANALYTICS_V1 | RPT | /quotations/analytics | (main)/quotations/analytics/page.tsx | |
| QUOT_PAGE_TEMPLATES_V1 | PAGE | /quotations/templates | (main)/quotations/templates/page.tsx | |
| QUOT_FORM_TEMPLATE_NEW_V1 | FORM | /quotations/templates/new | (main)/quotations/templates/new/page.tsx | |

### SALES — 12 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| SALE_DASH_DASHBOARD_V1 | DASH | /sales/dashboard | (main)/sales/dashboard/page.tsx | ✓ |
| SALE_PAGE_ORDERS_V1 | PAGE | /sales/orders | (main)/sales/orders/page.tsx | ✓ |
| SALE_TXN_ORDER_NEW_V1 | TXN | /sales/orders/new | (main)/sales/orders/new/page.tsx | ✓ |
| SALE_PAGE_ORDER_DETAIL_V1 | PAGE | /sales/orders/:id | (main)/sales/orders/[id]/page.tsx | ✓ |
| SALE_PAGE_DELIVERY_CHALLANS_V1 | PAGE | /sales/delivery-challans | (main)/sales/delivery-challans/page.tsx | |
| SALE_TXN_DC_NEW_V1 | TXN | /sales/delivery-challans/new | (main)/sales/delivery-challans/new/page.tsx | |
| SALE_PAGE_DC_DETAIL_V1 | PAGE | /sales/delivery-challans/:id | (main)/sales/delivery-challans/[id]/page.tsx | |
| SALE_PAGE_RETURNS_V1 | PAGE | /sales/returns | (main)/sales/returns/page.tsx | |
| SALE_TXN_RETURN_NEW_V1 | TXN | /sales/returns/new | (main)/sales/returns/new/page.tsx | |
| SALE_PAGE_RETURN_DETAIL_V1 | PAGE | /sales/returns/:id | (main)/sales/returns/[id]/page.tsx | |
| SALE_PAGE_CREDIT_NOTES_V1 | PAGE | /sales/credit-notes | (main)/sales/credit-notes/page.tsx | |
| SALE_PAGE_CN_DETAIL_V1 | PAGE | /sales/credit-notes/:id | (main)/sales/credit-notes/[id]/page.tsx | |
| SALE_PAGE_DEBIT_NOTES_V1 | PAGE | /sales/debit-notes | (main)/sales/debit-notes/page.tsx | |
| SALE_PAGE_DN_DETAIL_V1 | PAGE | /sales/debit-notes/:id | (main)/sales/debit-notes/[id]/page.tsx | |
| SALE_PAGE_PROFORMA_V1 | PAGE | /sales/proforma | (main)/sales/proforma/page.tsx | |

### FINANCE — 10 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| FIN_PAGE_INVOICES_V1 | PAGE | /finance/invoices | (main)/finance/invoices/page.tsx | ✓ |
| FIN_TXN_INVOICE_NEW_V1 | TXN | /finance/invoices/new | (main)/finance/invoices/new/page.tsx | ✓ |
| FIN_PAGE_INVOICE_DETAIL_V1 | PAGE | /finance/invoices/:id | (main)/finance/invoices/[id]/page.tsx | ✓ |
| FIN_TXN_INVOICE_EDIT_V1 | TXN | /finance/invoices/:id/edit | (main)/finance/invoices/[id]/edit/page.tsx | ✓ |
| FIN_PAGE_PAYMENTS_V1 | PAGE | /finance/payments | (main)/finance/payments/page.tsx | |
| FIN_PAGE_PAYMENT_DETAIL_V1 | PAGE | /finance/payments/:id | (main)/finance/payments/[id]/page.tsx | |
| FIN_PAGE_PROFORMA_INV_V1 | PAGE | /finance/proforma-invoices | (main)/finance/proforma-invoices/page.tsx | |
| FIN_TXN_PI_NEW_V1 | TXN | /finance/proforma-invoices/new | (main)/finance/proforma-invoices/new/page.tsx | |
| FIN_PAGE_PI_DETAIL_V1 | PAGE | /finance/proforma-invoices/:id | (main)/finance/proforma-invoices/[id]/page.tsx | |
| FIN_TXN_PI_EDIT_V1 | TXN | /finance/proforma-invoices/:id/edit | (main)/finance/proforma-invoices/[id]/edit/page.tsx | |
| FIN_PAGE_RECEIPTS_V1 | PAGE | /finance/receipts | (main)/finance/receipts/page.tsx | |
| FIN_PAGE_RECEIPT_DETAIL_V1 | PAGE | /finance/receipts/:id | (main)/finance/receipts/[id]/page.tsx | |

### ACCOUNTS — 31 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| ACC_DASH_MAIN_V1 | DASH | /accounts | (main)/accounts/page.tsx | |
| ACC_PAGE_BANKS_V1 | PAGE | /accounts/banks | (main)/accounts/banks/page.tsx | |
| ACC_FORM_BULK_IMPORT_V1 | FORM | /accounts/bulk-import | (main)/accounts/bulk-import/page.tsx | |
| ACC_PAGE_CONTRA_V1 | PAGE | /accounts/contra | (main)/accounts/contra/page.tsx | |
| ACC_PAGE_GROUPS_V1 | PAGE | /accounts/groups | (main)/accounts/groups/page.tsx | |
| ACC_PAGE_GST_V1 | PAGE | /accounts/gst | (main)/accounts/gst/page.tsx | |
| ACC_PAGE_GST_DETAIL_V1 | PAGE | /accounts/gst/:id | (main)/accounts/gst/[id]/page.tsx | |
| ACC_PAGE_JOURNALS_V1 | PAGE | /accounts/journal-entries | (main)/accounts/journal-entries/page.tsx | |
| ACC_PAGE_LEDGER_MAPPINGS_V1 | PAGE | /accounts/ledger-mappings | (main)/accounts/ledger-mappings/page.tsx | |
| ACC_PAGE_LEDGER_V1 | PAGE | /accounts/ledger | (main)/accounts/ledger/page.tsx | |
| ACC_PAGE_LEDGERS_V1 | PAGE | /accounts/ledgers | (main)/accounts/ledgers/page.tsx | |
| ACC_PAGE_OPENING_BAL_V1 | PAGE | /accounts/opening-balance | (main)/accounts/opening-balance/page.tsx | |
| ACC_PAGE_PAYMENTS_V1 | PAGE | /accounts/payments | (main)/accounts/payments/page.tsx | |
| ACC_PAGE_PAYMENT_DETAIL_V1 | PAGE | /accounts/payments/:id | (main)/accounts/payments/[id]/page.tsx | |
| ACC_FORM_PAYMENT_NEW_V1 | FORM | /accounts/payments/new | (main)/accounts/payments/new/page.tsx | |
| ACC_PAGE_PURCHASE_V1 | PAGE | /accounts/purchase | (main)/accounts/purchase/page.tsx | |
| ACC_PAGE_RECONCILIATION_V1 | PAGE | /accounts/reconciliation | (main)/accounts/reconciliation/page.tsx | |
| ACC_PAGE_REPORTS_V1 | PAGE | /accounts/reports | (main)/accounts/reports/page.tsx | |
| ACC_RPT_BALANCE_SHEET_V1 | RPT | /accounts/reports/balance-sheet | (main)/accounts/reports/balance-sheet/page.tsx | |
| ACC_RPT_CASH_FLOW_V1 | RPT | /accounts/reports/cash-flow | (main)/accounts/reports/cash-flow/page.tsx | |
| ACC_RPT_DAY_BOOK_V1 | RPT | /accounts/reports/day-book | (main)/accounts/reports/day-book/page.tsx | |
| ACC_RPT_PAYABLE_AGING_V1 | RPT | /accounts/reports/payable-aging | (main)/accounts/reports/payable-aging/page.tsx | |
| ACC_RPT_PROFIT_LOSS_V1 | RPT | /accounts/reports/profit-loss | (main)/accounts/reports/profit-loss/page.tsx | |
| ACC_RPT_RECEIVABLE_AGING_V1 | RPT | /accounts/reports/receivable-aging | (main)/accounts/reports/receivable-aging/page.tsx | |
| ACC_RPT_TRIAL_BALANCE_V1 | RPT | /accounts/reports/trial-balance | (main)/accounts/reports/trial-balance/page.tsx | |
| ACC_PAGE_SALE_V1 | PAGE | /accounts/sale | (main)/accounts/sale/page.tsx | |
| ACC_PAGE_TDS_V1 | PAGE | /accounts/tds | (main)/accounts/tds/page.tsx | |
| ACC_PAGE_TRANSACTIONS_V1 | PAGE | /accounts/transactions | (main)/accounts/transactions/page.tsx | |

### INVENTORY — 22 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| INV_DASH_MAIN_V1 | DASH | /inventory | (main)/inventory/page.tsx | |
| INV_PAGE_ADJUSTMENTS_V1 | PAGE | /inventory/adjustments | (main)/inventory/adjustments/page.tsx | |
| INV_PAGE_COMPANIES_V1 | PAGE | /inventory/companies | (main)/inventory/companies/page.tsx | |
| INV_PAGE_GROUPS_V1 | PAGE | /inventory/groups | (main)/inventory/groups/page.tsx | |
| INV_PAGE_ITEMS_V1 | PAGE | /inventory/items | (main)/inventory/items/page.tsx | |
| INV_PAGE_LOCATIONS_V1 | PAGE | /inventory/locations | (main)/inventory/locations/page.tsx | |
| INV_PAGE_MANUFACTURERS_V1 | PAGE | /inventory/manufacturers | (main)/inventory/manufacturers/page.tsx | |
| INV_PAGE_PRODUCTION_V1 | PAGE | /inventory/production | (main)/inventory/production/page.tsx | |
| INV_TXN_PRODUCTION_NEW_V1 | TXN | /inventory/production/new | (main)/inventory/production/new/page.tsx | |
| INV_PAGE_PRODUCTION_DETAIL_V1 | PAGE | /inventory/production/:id | (main)/inventory/production/[id]/page.tsx | |
| INV_PAGE_RECIPES_V1 | PAGE | /inventory/recipes | (main)/inventory/recipes/page.tsx | |
| INV_FORM_RECIPE_NEW_V1 | FORM | /inventory/recipes/new | (main)/inventory/recipes/new/page.tsx | |
| INV_PAGE_RECIPE_DETAIL_V1 | PAGE | /inventory/recipes/:id | (main)/inventory/recipes/[id]/page.tsx | |
| INV_RPT_EXPIRY_V1 | RPT | /inventory/reports/expiry | (main)/inventory/reports/expiry/page.tsx | |
| INV_RPT_LEDGER_V1 | RPT | /inventory/reports/ledger | (main)/inventory/reports/ledger/page.tsx | |
| INV_RPT_INDEX_V1 | RPT | /inventory/reports | (main)/inventory/reports/page.tsx | |
| INV_RPT_PRODUCTION_V1 | RPT | /inventory/reports/production | (main)/inventory/reports/production/page.tsx | |
| INV_RPT_SERIAL_TRACKING_V1 | RPT | /inventory/reports/serial-tracking | (main)/inventory/reports/serial-tracking/page.tsx | |
| INV_RPT_VALUATION_V1 | RPT | /inventory/reports/valuation | (main)/inventory/reports/valuation/page.tsx | |
| INV_PAGE_SCRAP_V1 | PAGE | /inventory/scrap | (main)/inventory/scrap/page.tsx | |
| INV_PAGE_SERIALS_V1 | PAGE | /inventory/serials | (main)/inventory/serials/page.tsx | |
| INV_FORM_SERIAL_NEW_V1 | FORM | /inventory/serials/new | (main)/inventory/serials/new/page.tsx | |
| INV_PAGE_SERIAL_DETAIL_V1 | PAGE | /inventory/serials/:id | (main)/inventory/serials/[id]/page.tsx | |
| INV_FORM_SERIAL_BULK_V1 | FORM | /inventory/serials/bulk-import | (main)/inventory/serials/bulk-import/page.tsx | |
| INV_PAGE_STORES_V1 | PAGE | /inventory/stores | (main)/inventory/stores/page.tsx | |
| INV_TXN_TRANSACTION_NEW_V1 | TXN | /inventory/transactions/new | (main)/inventory/transactions/new/page.tsx | |
| INV_PAGE_TRANSACTIONS_V1 | PAGE | /inventory/transactions | (main)/inventory/transactions/page.tsx | |
| INV_PAGE_UNITS_V1 | PAGE | /inventory/units | (main)/inventory/units/page.tsx | |

### PROCUREMENT — 7 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| PROC_DASH_MAIN_V1 | DASH | /procurement | (main)/procurement/page.tsx | |
| PROC_PAGE_COMPARE_V1 | PAGE | /procurement/compare | (main)/procurement/compare/page.tsx | |
| PROC_PAGE_GR_V1 | PAGE | /procurement/goods-receipts | (main)/procurement/goods-receipts/page.tsx | |
| PROC_PAGE_INVOICES_V1 | PAGE | /procurement/invoices | (main)/procurement/invoices/page.tsx | |
| PROC_PAGE_PO_V1 | PAGE | /procurement/purchase-orders | (main)/procurement/purchase-orders/page.tsx | |
| PROC_PAGE_QUOTATIONS_V1 | PAGE | /procurement/quotations | (main)/procurement/quotations/page.tsx | |
| PROC_PAGE_RFQ_V1 | PAGE | /procurement/rfq | (main)/procurement/rfq/page.tsx | |

### PRODUCTS — 13 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| PROD_PAGE_BRANDS_V1 | PAGE | /products/brands | (main)/products/brands/page.tsx | |
| PROD_PAGE_MANUFACTURERS_V1 | PAGE | /products/manufacturers | (main)/products/manufacturers/page.tsx | |
| PROD_PAGE_MFR_DETAIL_V1 | PAGE | /products/manufacturers/:id | (main)/products/manufacturers/[id]/page.tsx | |
| PROD_PAGE_PACKAGES_V1 | PAGE | /products/packages | (main)/products/packages/page.tsx | |
| PROD_FORM_PACKAGE_NEW_V1 | FORM | /products/packages/new | (main)/products/packages/new/page.tsx | |
| PROD_PAGE_PACKAGE_DETAIL_V1 | PAGE | /products/packages/:id | (main)/products/packages/[id]/page.tsx | |
| PROD_PAGE_PRICE_GROUPS_V1 | PAGE | /products/price-groups | (main)/products/price-groups/page.tsx | |
| PROD_PAGE_PG_DETAIL_V1 | PAGE | /products/price-groups/:id | (main)/products/price-groups/[id]/page.tsx | |
| PROD_PAGE_PRICE_LISTS_V1 | PAGE | /products/price-lists | (main)/products/price-lists/page.tsx | |
| PROD_PAGE_PRICING_V1 | PAGE | /products/pricing | (main)/products/pricing/page.tsx | |
| PROD_PAGE_PRODUCTS_V1 | PAGE | /products/products | (main)/products/products/page.tsx | |
| PROD_FORM_PRODUCT_NEW_V1 | FORM | /products/products/new | (main)/products/products/new/page.tsx | |
| PROD_PAGE_PRODUCT_DETAIL_V1 | PAGE | /products/products/:id | (main)/products/products/[id]/page.tsx | |
| PROD_PAGE_UNITS_V1 | PAGE | /products/units | (main)/products/units/page.tsx | |

### CAMPAIGNS — 4 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| CAMP_PAGE_LIST_V1 | PAGE | /campaigns | (main)/campaigns/page.tsx | |
| CAMP_TXN_NEW_V1 | TXN | /campaigns/new | (main)/campaigns/new/page.tsx | |
| CAMP_PAGE_DETAIL_V1 | PAGE | /campaigns/:id | (main)/campaigns/[id]/page.tsx | |
| CAMP_FORM_EDIT_V1 | FORM | /campaigns/:id/edit | (main)/campaigns/[id]/edit/page.tsx | |

### WHATSAPP — 14 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| WA_DASH_MAIN_V1 | DASH | /whatsapp | (main)/whatsapp/page.tsx | ✓ |
| WA_PAGE_BROADCASTS_V1 | PAGE | /whatsapp/broadcasts | (main)/whatsapp/broadcasts/page.tsx | ✓ |
| WA_TXN_BROADCAST_NEW_V1 | TXN | /whatsapp/broadcasts/new | (main)/whatsapp/broadcasts/new/page.tsx | ✓ |
| WA_PAGE_BROADCAST_DETAIL_V1 | PAGE | /whatsapp/broadcasts/:id | (main)/whatsapp/broadcasts/[id]/page.tsx | ✓ |
| WA_PAGE_CHATBOT_V1 | PAGE | /whatsapp/chatbot | (main)/whatsapp/chatbot/page.tsx | |
| WA_TXN_CHATBOT_NEW_V1 | TXN | /whatsapp/chatbot/new | (main)/whatsapp/chatbot/new/page.tsx | |
| WA_PAGE_CHATBOT_DETAIL_V1 | PAGE | /whatsapp/chatbot/:id | (main)/whatsapp/chatbot/[id]/page.tsx | |
| WA_PAGE_CONVERSATIONS_V1 | PAGE | /whatsapp/conversations | (main)/whatsapp/conversations/page.tsx | ✓ |
| WA_PAGE_CONV_DETAIL_V1 | PAGE | /whatsapp/conversations/:id | (main)/whatsapp/conversations/[id]/page.tsx | ✓ |
| WA_PAGE_OPT_OUTS_V1 | PAGE | /whatsapp/opt-outs | (main)/whatsapp/opt-outs/page.tsx | |
| WA_PAGE_QUICK_REPLIES_V1 | PAGE | /whatsapp/quick-replies | (main)/whatsapp/quick-replies/page.tsx | |
| WA_PAGE_TEMPLATES_V1 | PAGE | /whatsapp/templates | (main)/whatsapp/templates/page.tsx | ✓ |
| WA_FORM_TEMPLATE_NEW_V1 | FORM | /whatsapp/templates/new | (main)/whatsapp/templates/new/page.tsx | |
| WA_PAGE_TEMPLATE_DETAIL_V1 | PAGE | /whatsapp/templates/:id | (main)/whatsapp/templates/[id]/page.tsx | |

### EMAIL — 6 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| EMAIL_PAGE_LIST_V1 | PAGE | /email | (main)/email/page.tsx | |
| EMAIL_FORM_COMPOSE_V1 | FORM | /email/compose | (main)/email/compose/page.tsx | |
| EMAIL_PAGE_DETAIL_V1 | PAGE | /email/:id | (main)/email/[id]/page.tsx | |
| EMAIL_RPT_ANALYTICS_V1 | RPT | /email/analytics | (main)/email/analytics/page.tsx | |
| EMAIL_PAGE_TRACKING_V1 | PAGE | /email/tracking | (main)/email/tracking/page.tsx | |
| EMAIL_PAGE_TRACKING_EVENTS_V1 | PAGE | /email/tracking/events | (main)/email/tracking/events/page.tsx | |

### CALENDAR — 5 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| CAL_PAGE_MAIN_V1 | PAGE | /calendar | (main)/calendar/page.tsx | ✓ |
| CAL_PAGE_ADMIN_V1 | PAGE | /calendar/admin | (main)/calendar/admin/page.tsx | |
| CAL_PAGE_AVAILABILITY_V1 | PAGE | /calendar/availability | (main)/calendar/availability/page.tsx | |
| CAL_PAGE_EVENTS_V1 | PAGE | /calendar/events | (main)/calendar/events/page.tsx | |
| CAL_PAGE_SYNC_V1 | PAGE | /calendar/sync | (main)/calendar/sync/page.tsx | |

### WORKFLOWS — 8 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| WF_PAGE_LIST_V1 | PAGE | /workflows | (main)/workflows/page.tsx | ✓ |
| WF_FORM_NEW_V1 | FORM | /workflows/new | (main)/workflows/new/page.tsx | ✓ |
| WF_PAGE_DETAIL_V1 | PAGE | /workflows/:id | (main)/workflows/[id]/page.tsx | ✓ |
| WF_FORM_EDIT_V1 | FORM | /workflows/:id/edit | (main)/workflows/[id]/edit/page.tsx | ✓ |
| WF_PAGE_VISUAL_V1 | PAGE | /workflows/:id/visual | (main)/workflows/[id]/visual/page.tsx | ✓ |
| WF_TXN_VISUAL_NEW_V1 | TXN | /workflows/visual/new | (main)/workflows/visual/new/page.tsx | |

### REPORTS — 8 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| RPT_PAGE_HOME_V1 | PAGE | /reports | (main)/reports/page.tsx | ✓ |
| RPT_PAGE_DYNAMIC_V1 | PAGE | /reports/:code | (main)/reports/[code]/page.tsx | ✓ |
| RPT_PAGE_DESIGNER_V1 | PAGE | /reports/designer | (main)/reports/designer/page.tsx | |
| RPT_PAGE_DESIGNER_DETAIL_V1 | PAGE | /reports/designer/:id | (main)/reports/designer/[id]/page.tsx | |
| RPT_PAGE_SAVED_V1 | PAGE | /reports/saved | (main)/reports/saved/page.tsx | |
| RPT_PAGE_SCHEDULED_V1 | PAGE | /reports/scheduled | (main)/reports/scheduled/page.tsx | |
| RPT_PAGE_VERIFICATION_V1 | PAGE | /reports/verification | (main)/reports/verification/page.tsx | |
| RPT_PAGE_VERF_CALENDAR_V1 | PAGE | /reports/verification/calendar | (main)/reports/verification/calendar/page.tsx | |

### ANALYTICS — 1 page

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| RPT_DASH_ANALYTICS_V1 | DASH | /analytics | (main)/analytics/page.tsx | |

### MARKETPLACE — 16 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| MKT_DASH_MAIN_V1 | DASH | /marketplace | (main)/marketplace/page.tsx | |
| MKT_RPT_ANALYTICS_V1 | RPT | /marketplace/analytics | (main)/marketplace/analytics/page.tsx | |
| MKT_PAGE_ENQUIRIES_V1 | PAGE | /marketplace/enquiries | (main)/marketplace/enquiries/page.tsx | |
| MKT_PAGE_FEED_V1 | PAGE | /marketplace/feed | (main)/marketplace/feed/page.tsx | |
| MKT_PAGE_INSTALLED_V1 | PAGE | /marketplace/installed | (main)/marketplace/installed/page.tsx | |
| MKT_PAGE_LISTINGS_V1 | PAGE | /marketplace/listings | (main)/marketplace/listings/page.tsx | |
| MKT_PAGE_MODULES_V1 | PAGE | /marketplace/modules | (main)/marketplace/modules/page.tsx | |
| MKT_PAGE_MY_APPS_V1 | PAGE | /marketplace/my-applications | (main)/marketplace/my-applications/page.tsx | |
| MKT_PAGE_MY_OFFERS_V1 | PAGE | /marketplace/my-offers | (main)/marketplace/my-offers/page.tsx | |
| MKT_PAGE_OFFERS_V1 | PAGE | /marketplace/offers | (main)/marketplace/offers/page.tsx | |
| MKT_FORM_OFFER_NEW_V1 | FORM | /marketplace/offers/new | (main)/marketplace/offers/new/page.tsx | |
| MKT_PAGE_ORDERS_V1 | PAGE | /marketplace/orders | (main)/marketplace/orders/page.tsx | |
| MKT_PAGE_POSTS_V1 | PAGE | /marketplace/posts | (main)/marketplace/posts/page.tsx | |
| MKT_PAGE_REQUIREMENTS_V1 | PAGE | /marketplace/requirements | (main)/marketplace/requirements/page.tsx | |
| MKT_PAGE_REVIEWS_V1 | PAGE | /marketplace/reviews | (main)/marketplace/reviews/page.tsx | |
| MKT_PAGE_SAVED_V1 | PAGE | /marketplace/saved | (main)/marketplace/saved/page.tsx | |
| MKT_PAGE_SETTINGS_V1 | PAGE | /marketplace/settings | (main)/marketplace/settings/page.tsx | |
| MKT_PAGE_VENDORS_V1 | PAGE | /marketplace/vendors | (main)/marketplace/vendors/page.tsx | |

### SETTINGS — 48 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| SET_PAGE_HOME_V1 | PAGE | /settings | (main)/settings/page.tsx | |
| SET_PAGE_AI_V1 | PAGE | /settings/ai | (main)/settings/ai/page.tsx | |
| SET_PAGE_AUDIT_LOGS_V1 | PAGE | /settings/audit-logs | (main)/settings/audit-logs/page.tsx | |
| SET_PAGE_AUTO_NUMBERING_V1 | PAGE | /settings/auto-numbering | (main)/settings/auto-numbering/page.tsx | |
| SET_PAGE_BIZ_TYPES_V1 | PAGE | /settings/business-types | (main)/settings/business-types/page.tsx | |
| SET_FORM_COMPANY_V1 | FORM | /settings/company | (main)/settings/company/page.tsx | |
| SET_PAGE_CONTROL_ROOM_V1 | PAGE | /settings/control-room | (main)/settings/control-room/page.tsx | |
| SET_PAGE_COUPONS_V1 | PAGE | /settings/coupons | (main)/settings/coupons/page.tsx | |
| SET_PAGE_CRON_JOBS_V1 | PAGE | /settings/cron-jobs | (main)/settings/cron-jobs/page.tsx | |
| SET_PAGE_CUSTOM_FIELDS_V1 | PAGE | /settings/custom-fields | (main)/settings/custom-fields/page.tsx | |
| SET_PAGE_CPORTAL_V1 | PAGE | /settings/customer-portal | (main)/settings/customer-portal/page.tsx | |
| SET_PAGE_CPORTAL_ACTIVATION_V1 | PAGE | /settings/customer-portal/activation | (main)/settings/customer-portal/activation/page.tsx | |
| SET_PAGE_CPORTAL_MENUS_V1 | PAGE | /settings/customer-portal/menu-categories | (main)/settings/customer-portal/menu-categories/page.tsx | |
| SET_PAGE_CPORTAL_USERS_V1 | PAGE | /settings/customer-portal/users | (main)/settings/customer-portal/users/page.tsx | |
| SET_PAGE_DATA_MASKING_V1 | PAGE | /settings/data-masking | (main)/settings/data-masking/page.tsx | |
| SET_PAGE_DEPTS_V1 | PAGE | /settings/departments | (main)/settings/departments/page.tsx | |
| SET_FORM_DEPT_NEW_V1 | FORM | /settings/departments/new | (main)/settings/departments/new/page.tsx | |
| SET_FORM_DEPT_EDIT_V1 | FORM | /settings/departments/:id/edit | (main)/settings/departments/[id]/edit/page.tsx | |
| SET_PAGE_DESIGNATIONS_V1 | PAGE | /settings/designations | (main)/settings/designations/page.tsx | |
| SET_FORM_DESIGNATION_NEW_V1 | FORM | /settings/designations/new | (main)/settings/designations/new/page.tsx | |
| SET_FORM_DESIGNATION_EDIT_V1 | FORM | /settings/designations/:id/edit | (main)/settings/designations/[id]/edit/page.tsx | |
| SET_PAGE_DEVELOPER_V1 | PAGE | /settings/developer | (main)/settings/developer/page.tsx | |
| SET_PAGE_EMAIL_V1 | PAGE | /settings/email | (main)/settings/email/page.tsx | |
| SET_PAGE_EMAIL_OAUTH_V1 | PAGE | /settings/email/oauth-callback | (main)/settings/email/oauth-callback/page.tsx | |
| SET_PAGE_ERROR_LOGS_V1 | PAGE | /settings/error-logs | (main)/settings/error-logs/page.tsx | |
| SET_PAGE_GOOGLE_V1 | PAGE | /settings/google | (main)/settings/google/page.tsx | |
| SET_PAGE_GOOGLE_OAUTH_V1 | PAGE | /settings/google/oauth-callback | (main)/settings/google/oauth-callback/page.tsx | |
| SET_PAGE_INTEGRATIONS_V1 | PAGE | /settings/integrations | (main)/settings/integrations/page.tsx | |
| SET_PAGE_LOCATIONS_V1 | PAGE | /settings/locations | (main)/settings/locations/page.tsx | |
| SET_PAGE_LOOKUPS_V1 | PAGE | /settings/lookups | (main)/settings/lookups/page.tsx | |
| SET_FORM_LOOKUP_NEW_V1 | FORM | /settings/lookups/new | (main)/settings/lookups/new/page.tsx | |
| SET_PAGE_LOOKUP_DETAIL_V1 | PAGE | /settings/lookups/:id | (main)/settings/lookups/[id]/page.tsx | |
| SET_PAGE_MENUS_V1 | PAGE | /settings/menus | (main)/settings/menus/page.tsx | |
| SET_PAGE_MY_REPORTS_V1 | PAGE | /settings/my-reports | (main)/settings/my-reports/page.tsx | |
| SET_PAGE_MY_REPORT_DETAIL_V1 | PAGE | /settings/my-reports/:id | (main)/settings/my-reports/[id]/page.tsx | |
| SET_PAGE_NOTIF_CONFIG_V1 | PAGE | /settings/notification-config | (main)/settings/notification-config/page.tsx | |
| SET_PAGE_NOTION_V1 | PAGE | /settings/notion | (main)/settings/notion/page.tsx | |
| SET_PAGE_PERMISSIONS_V1 | PAGE | /settings/permissions | (main)/settings/permissions/page.tsx | |
| SET_PAGE_RECYCLE_BIN_V1 | PAGE | /settings/recycle-bin | (main)/settings/recycle-bin/page.tsx | |
| SET_PAGE_RELIGIOUS_MODE_V1 | PAGE | /settings/religious-mode | (main)/settings/religious-mode/page.tsx | |
| SET_PAGE_ROLES_V1 | PAGE | /settings/roles | (main)/settings/roles/page.tsx | |
| SET_FORM_ROLE_NEW_V1 | FORM | /settings/roles/new | (main)/settings/roles/new/page.tsx | |
| SET_FORM_ROLE_EDIT_V1 | FORM | /settings/roles/:id/edit | (main)/settings/roles/[id]/edit/page.tsx | |
| SET_PAGE_SECURITY_V1 | PAGE | /settings/security | (main)/settings/security/page.tsx | |
| SET_PAGE_SHORTCUTS_V1 | PAGE | /settings/shortcuts | (main)/settings/shortcuts/page.tsx | |
| SET_PAGE_SUBSCRIPTION_V1 | PAGE | /settings/subscription | (main)/settings/subscription/page.tsx | |
| SET_PAGE_TEMPLATES_V1 | PAGE | /settings/templates | (main)/settings/templates/page.tsx | |
| SET_PAGE_TEMPLATE_CUSTOMIZE_V1 | PAGE | /settings/templates/:id/customize | (main)/settings/templates/[id]/customize/page.tsx | |
| SET_PAGE_TEMPLATE_DESIGNER_V1 | PAGE | /settings/templates/:id/designer | (main)/settings/templates/[id]/designer/page.tsx | |
| SET_PAGE_UNIT_CONVERSIONS_V1 | PAGE | /settings/unit-conversions | (main)/settings/unit-conversions/page.tsx | |
| SET_PAGE_UNITS_V1 | PAGE | /settings/units | (main)/settings/units/page.tsx | |
| SET_PAGE_USER_OVERRIDES_V1 | PAGE | /settings/user-overrides | (main)/settings/user-overrides/page.tsx | |
| SET_PAGE_USERS_V1 | PAGE | /settings/users | (main)/settings/users/page.tsx | |
| SET_FORM_USER_NEW_V1 | FORM | /settings/users/new | (main)/settings/users/new/page.tsx | |
| SET_FORM_USER_EDIT_V1 | FORM | /settings/users/:id/edit | (main)/settings/users/[id]/edit/page.tsx | |
| SET_PAGE_USERS_MASS_DELETE_V1 | PAGE | /settings/users/mass-delete | (main)/settings/users/mass-delete/page.tsx | |
| SET_PAGE_VERIFICATIONS_V1 | PAGE | /settings/verifications | (main)/settings/verifications/page.tsx | |
| SET_PAGE_WALLET_V1 | PAGE | /settings/wallet | (main)/settings/wallet/page.tsx | |
| SET_PAGE_WHATSAPP_V1 | PAGE | /settings/whatsapp | (main)/settings/whatsapp/page.tsx | |

### ADMIN — 11 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| ADM_PAGE_COUPONS_V1 | PAGE | /admin/coupons | (main)/admin/coupons/page.tsx | |
| ADM_PAGE_DISCOVERY_V1 | PAGE | /admin/discovery | (main)/admin/discovery/page.tsx | |
| ADM_PAGE_LICENSES_V1 | PAGE | /admin/licenses | (main)/admin/licenses/page.tsx | |
| ADM_PAGE_MODULES_V1 | PAGE | /admin/modules | (main)/admin/modules/page.tsx | |
| ADM_PAGE_OFFERS_V1 | PAGE | /admin/offers | (main)/admin/offers/page.tsx | |
| ADM_PAGE_PLANS_V1 | PAGE | /admin/plans | (main)/admin/plans/page.tsx | |
| ADM_PAGE_RECHARGE_PLANS_V1 | PAGE | /admin/recharge-plans | (main)/admin/recharge-plans/page.tsx | |
| ADM_PAGE_SERVICE_RATES_V1 | PAGE | /admin/service-rates | (main)/admin/service-rates/page.tsx | |
| ADM_PAGE_TENANTS_V1 | PAGE | /admin/tenants | (main)/admin/tenants/page.tsx | |
| ADM_PAGE_TENANT_DETAIL_V1 | PAGE | /admin/tenants/:id | (main)/admin/tenants/[id]/page.tsx | |
| ADM_PAGE_VENDOR_V1 | PAGE | /admin/vendor | (main)/admin/vendor/page.tsx | |
| ADM_PAGE_WALLET_V1 | PAGE | /admin/wallet | (main)/admin/wallet/page.tsx | |

### SUPPORT — 3 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| SUP_FORM_NEW_V1 | FORM | /support/new | (main)/support/new/page.tsx | |
| SUP_PAGE_TICKETS_V1 | PAGE | /support/tickets | (main)/support/tickets/page.tsx | |
| SUP_PAGE_TICKET_DETAIL_V1 | PAGE | /support/tickets/:id | (main)/support/tickets/[id]/page.tsx | |

### AI — 6 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| AI_PAGE_CHAT_V1 | PAGE | /ai/chat | (main)/ai/chat/page.tsx | |
| AI_PAGE_DATASET_DETAIL_V1 | PAGE | /ai/datasets/:id | (main)/ai/datasets/[id]/page.tsx | |
| AI_PAGE_PROMPTS_V1 | PAGE | /ai/prompts | (main)/ai/prompts/page.tsx | |
| AI_PAGE_SETTINGS_V1 | PAGE | /ai/settings | (main)/ai/settings/page.tsx | |
| AI_PAGE_TRAINING_V1 | PAGE | /ai/training | (main)/ai/training/page.tsx | |
| AI_PAGE_WIDGET_CONFIG_V1 | PAGE | /ai/widget-config | (main)/ai/widget-config/page.tsx | |

### API GATEWAY — 4 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| APIG_RPT_ANALYTICS_V1 | RPT | /api-gateway/analytics | (main)/api-gateway/analytics/page.tsx | |
| APIG_PAGE_KEYS_V1 | PAGE | /api-gateway/keys | (main)/api-gateway/keys/page.tsx | |
| APIG_PAGE_LOGS_V1 | PAGE | /api-gateway/logs | (main)/api-gateway/logs/page.tsx | |
| APIG_PAGE_WEBHOOKS_V1 | PAGE | /api-gateway/webhooks | (main)/api-gateway/webhooks/page.tsx | |

### APPROVALS — 3 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| APPR_PAGE_INBOX_V1 | PAGE | /approvals | (main)/approvals/page.tsx | |
| APPR_PAGE_RULES_V1 | PAGE | /approvals/rules | (main)/approvals/rules/page.tsx | |
| APPR_PAGE_WORKFLOWS_V1 | PAGE | /approvals/workflows | (main)/approvals/workflows/page.tsx | |

### DOCUMENTS — 4 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| DOC_PAGE_LIST_V1 | PAGE | /documents | (main)/documents/page.tsx | |
| DOC_FORM_NEW_V1 | FORM | /documents/new | (main)/documents/new/page.tsx | |
| DOC_PAGE_DETAIL_V1 | PAGE | /documents/:id | (main)/documents/[id]/page.tsx | |
| DOC_PAGE_EDITOR_V1 | PAGE | /documents/editor/:id | (main)/documents/editor/[id]/page.tsx | |

### NOTIFICATIONS — 2 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| NOTIF_PAGE_LIST_V1 | PAGE | /notifications | (main)/notifications/page.tsx | |
| NOTIF_PAGE_PREFS_V1 | PAGE | /notifications/preferences | (main)/notifications/preferences/page.tsx | |

### POST-SALES (AMC / WARRANTY / SERVICE) — 20 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| PS_DASH_AMC_V1 | DASH | /post-sales/amc | (main)/post-sales/amc/page.tsx | |
| PS_PAGE_AMC_CONTRACTS_V1 | PAGE | /post-sales/amc/contracts/:id | (main)/post-sales/amc/contracts/[id]/page.tsx | |
| PS_PAGE_AMC_PLANS_V1 | PAGE | /post-sales/amc/plans | (main)/post-sales/amc/plans/page.tsx | |
| PS_PAGE_AMC_SCHEDULE_V1 | PAGE | /post-sales/amc/schedule | (main)/post-sales/amc/schedule/page.tsx | |
| PS_PAGE_INSTALLATIONS_V1 | PAGE | /post-sales/installations | (main)/post-sales/installations/page.tsx | |
| PS_FORM_INSTALL_NEW_V1 | FORM | /post-sales/installations/new | (main)/post-sales/installations/new/page.tsx | |
| PS_PAGE_INSTALL_DETAIL_V1 | PAGE | /post-sales/installations/:id | (main)/post-sales/installations/[id]/page.tsx | |
| PS_FORM_INSTALL_EDIT_V1 | FORM | /post-sales/installations/:id/edit | (main)/post-sales/installations/[id]/edit/page.tsx | |
| PS_PAGE_RENEWALS_V1 | PAGE | /post-sales/renewals | (main)/post-sales/renewals/page.tsx | |
| PS_PAGE_SV_V1 | PAGE | /post-sales/service-visits | (main)/post-sales/service-visits/page.tsx | |
| PS_PAGE_SV_DETAIL_V1 | PAGE | /post-sales/service-visits/:id | (main)/post-sales/service-visits/[id]/page.tsx | |
| PS_PAGE_TICKETS_V1 | PAGE | /post-sales/tickets | (main)/post-sales/tickets/page.tsx | |
| PS_FORM_TICKET_NEW_V1 | FORM | /post-sales/tickets/new | (main)/post-sales/tickets/new/page.tsx | |
| PS_PAGE_TICKET_DETAIL_V1 | PAGE | /post-sales/tickets/:id | (main)/post-sales/tickets/[id]/page.tsx | |
| PS_FORM_TICKET_EDIT_V1 | FORM | /post-sales/tickets/:id/edit | (main)/post-sales/tickets/[id]/edit/page.tsx | |
| PS_PAGE_TRAININGS_V1 | PAGE | /post-sales/trainings | (main)/post-sales/trainings/page.tsx | |
| PS_FORM_TRAINING_NEW_V1 | FORM | /post-sales/trainings/new | (main)/post-sales/trainings/new/page.tsx | |
| PS_PAGE_TRAINING_DETAIL_V1 | PAGE | /post-sales/trainings/:id | (main)/post-sales/trainings/[id]/page.tsx | |
| PS_FORM_TRAINING_EDIT_V1 | FORM | /post-sales/trainings/:id/edit | (main)/post-sales/trainings/[id]/edit/page.tsx | |
| PS_PAGE_WARRANTY_V1 | PAGE | /post-sales/warranty | (main)/post-sales/warranty/page.tsx | |
| PS_FORM_WARRANTY_NEW_V1 | FORM | /post-sales/warranty/new | (main)/post-sales/warranty/new/page.tsx | |
| PS_PAGE_WARRANTY_DETAIL_V1 | PAGE | /post-sales/warranty/:id | (main)/post-sales/warranty/[id]/page.tsx | |
| PS_FORM_WARRANTY_EDIT_V1 | FORM | /post-sales/warranty/:id/edit | (main)/post-sales/warranty/[id]/edit/page.tsx | |
| PS_PAGE_WARRANTY_CLAIMS_V1 | PAGE | /post-sales/warranty/claims | (main)/post-sales/warranty/claims/page.tsx | |
| PS_PAGE_WARRANTY_TMPLS_V1 | PAGE | /post-sales/warranty/templates | (main)/post-sales/warranty/templates/page.tsx | |
| PS_FORM_WARRANTY_TMPL_IMPORT_V1 | FORM | /post-sales/warranty/templates/import | (main)/post-sales/warranty/templates/import/page.tsx | |

### PERFORMANCE — 3 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| PERF_PAGE_MAIN_V1 | PAGE | /performance | (main)/performance/page.tsx | |
| PERF_PAGE_LEADERBOARD_V1 | PAGE | /performance/leaderboard | (main)/performance/leaderboard/page.tsx | |
| PERF_PAGE_TARGETS_V1 | PAGE | /performance/targets | (main)/performance/targets/page.tsx | |

### VERIFICATION — 2 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| VERF_PAGE_ADMIN_V1 | PAGE | /verification/admin | (main)/verification/admin/page.tsx | |
| VERF_PAGE_STATUS_V1 | PAGE | /verification/status | (main)/verification/status/page.tsx | |

### ONBOARDING — 1 page

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| ONBD_PAGE_WIZARD_V1 | PAGE | /onboarding | (main)/onboarding/page.tsx | |

### OPS — 7 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| OPS_PAGE_MAIN_V1 | PAGE | /ops | (main)/ops/page.tsx | |
| OPS_PAGE_BACKUPS_V1 | PAGE | /ops/backups | (main)/ops/backups/page.tsx | |
| OPS_PAGE_BACKUP_DETAIL_V1 | PAGE | /ops/backups/:id | (main)/ops/backups/[id]/page.tsx | |
| OPS_PAGE_CRON_V1 | PAGE | /ops/cron | (main)/ops/cron/page.tsx | |
| OPS_PAGE_DB_MAINT_V1 | PAGE | /ops/db-maintenance | (main)/ops/db-maintenance/page.tsx | |
| OPS_PAGE_DB_CLEANUP_V1 | PAGE | /ops/db-maintenance/cleanup | (main)/ops/db-maintenance/cleanup/page.tsx | |
| OPS_PAGE_DB_INDEXES_V1 | PAGE | /ops/db-maintenance/indexes | (main)/ops/db-maintenance/indexes/page.tsx | |
| OPS_PAGE_HEALTH_V1 | PAGE | /ops/health | (main)/ops/health/page.tsx | |

### MASTER — 7 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| MSTR_PAGE_ACCOUNTS_V1 | PAGE | /master/accounts | (main)/master/accounts/page.tsx | |
| MSTR_PAGE_CURRENCY_V1 | PAGE | /master/currency | (main)/master/currency/page.tsx | |
| MSTR_PAGE_DISCOUNT_V1 | PAGE | /master/discount | (main)/master/discount/page.tsx | |
| MSTR_PAGE_INVENTORY_V1 | PAGE | /master/inventory | (main)/master/inventory/page.tsx | |
| MSTR_PAGE_OPENING_BAL_V1 | PAGE | /master/opening-balance | (main)/master/opening-balance/page.tsx | |
| MSTR_PAGE_OTHER_V1 | PAGE | /master/other | (main)/master/other/page.tsx | |
| MSTR_PAGE_RATE_V1 | PAGE | /master/rate | (main)/master/rate/page.tsx | |

### PLUGINS — 3 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| PLG_PAGE_CATALOG_V1 | PAGE | /plugins/catalog | (main)/plugins/catalog/page.tsx | |
| PLG_PAGE_INSTALLED_V1 | PAGE | /plugins/installed | (main)/plugins/installed/page.tsx | |
| PLG_PAGE_DETAIL_V1 | PAGE | /plugins/:code | (main)/plugins/[code]/page.tsx | |

### COMMUNICATION TEMPLATES — 5 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| COMM_PAGE_SIGNATURES_V1 | PAGE | /communication/signatures | (main)/communication/signatures/page.tsx | |
| COMM_PAGE_TEMPLATES_V1 | PAGE | /communication/templates | (main)/communication/templates/page.tsx | |
| COMM_FORM_TEMPLATE_NEW_V1 | FORM | /communication/templates/new | (main)/communication/templates/new/page.tsx | |
| COMM_PAGE_TMPL_DETAIL_V1 | PAGE | /communication/templates/:id | (main)/communication/templates/[id]/page.tsx | |
| COMM_FORM_TMPL_EDIT_V1 | FORM | /communication/templates/:id/edit | (main)/communication/templates/[id]/edit/page.tsx | |

### DEMOS — 4 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| DEMO_PAGE_LIST_V1 | PAGE | /demos | (main)/demos/page.tsx | |
| DEMO_FORM_NEW_V1 | FORM | /demos/new | (main)/demos/new/page.tsx | |
| DEMO_PAGE_DETAIL_V1 | PAGE | /demos/:id | (main)/demos/[id]/page.tsx | |
| DEMO_FORM_EDIT_V1 | FORM | /demos/:id/edit | (main)/demos/[id]/edit/page.tsx | |

### TOUR PLANS — 4 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| TOUR_PAGE_LIST_V1 | PAGE | /tour-plans | (main)/tour-plans/page.tsx | |
| TOUR_FORM_NEW_V1 | FORM | /tour-plans/new | (main)/tour-plans/new/page.tsx | |
| TOUR_PAGE_DETAIL_V1 | PAGE | /tour-plans/:id | (main)/tour-plans/[id]/page.tsx | |
| TOUR_FORM_EDIT_V1 | FORM | /tour-plans/:id/edit | (main)/tour-plans/[id]/edit/page.tsx | |

### MISC (SMALLER MODULES) — 22 pages

| Page Code | Type | Route | File | Demo Ready |
|-----------|------|-------|------|------------|
| SET_PAGE_PRICING_BATCH_V1 | PAGE | /pricing/batch | (main)/pricing/batch/page.tsx | |
| SET_PAGE_PRICING_LISTS_V1 | PAGE | /pricing/price-lists | (main)/pricing/price-lists/page.tsx | |
| SET_PAGE_PRICING_TIERS_V1 | PAGE | /pricing/tiers | (main)/pricing/tiers/page.tsx | |
| SET_PAGE_DISC_AGENCY_V1 | PAGE | /discount-master/agency | (main)/discount-master/agency/page.tsx | |
| SET_PAGE_DISC_ITEM_V1 | PAGE | /discount-master/item | (main)/discount-master/item/page.tsx | |
| NOTIF_PAGE_REMINDERS_V1 | PAGE | /reminders | (main)/reminders/page.tsx | |
| NOTIF_PAGE_FOLLOW_UPS_V1 | PAGE | /follow-ups | (main)/follow-ups/page.tsx | |
| SET_PAGE_OWNERSHIP_V1 | PAGE | /ownership | (main)/ownership/page.tsx | |
| SET_PAGE_OWNERSHIP_RULES_V1 | PAGE | /ownership/rules | (main)/ownership/rules/page.tsx | |
| ADM_PAGE_PROMOTIONS_V1 | PAGE | /promotions | (main)/promotions/page.tsx | |
| UTIL_PAGE_RECYCLE_BIN_V1 | PAGE | /recycle-bin | (main)/recycle-bin/page.tsx | |
| UTIL_PAGE_EXPORT_V1 | PAGE | /export | (main)/export/page.tsx | |
| UTIL_PAGE_EXPORT_HISTORY_V1 | PAGE | /export/history | (main)/export/history/page.tsx | |
| UTIL_FORM_IMPORT_V1 | FORM | /import | (main)/import/page.tsx | |
| UTIL_PAGE_IMPORT_HISTORY_V1 | PAGE | /import/history | (main)/import/history/page.tsx | |
| UTIL_PAGE_IMPORT_PROFILES_V1 | PAGE | /import/profiles | (main)/import/profiles/page.tsx | |
| SYNC_DASH_MAIN_V1 | DASH | /sync/dashboard | (main)/sync/dashboard/page.tsx | |
| SYNC_PAGE_CONFLICTS_V1 | PAGE | /sync/conflicts | (main)/sync/conflicts/page.tsx | |
| SYNC_PAGE_DEVICES_V1 | PAGE | /sync/devices | (main)/sync/devices/page.tsx | |
| SYNC_PAGE_POLICIES_V1 | PAGE | /sync/policies | (main)/sync/policies/page.tsx | |
| SYNC_PAGE_OFFLINE_V1 | PAGE | /offline-sync | (main)/offline-sync/page.tsx | |
| SYNC_PAGE_OFFLINE_CONF_V1 | PAGE | /offline-sync/conflicts | (main)/offline-sync/conflicts/page.tsx | |
| SYNC_PAGE_OFFLINE_DEV_V1 | PAGE | /offline-sync/devices | (main)/offline-sync/devices/page.tsx | |
| SYNC_PAGE_OFFLINE_POL_V1 | PAGE | /offline-sync/policies | (main)/offline-sync/policies/page.tsx | |
| HELP_FORM_ARTICLE_NEW_V1 | FORM | /help/articles/new | (main)/help/articles/new/page.tsx | |
| HELP_PAGE_ARTICLES_V1 | PAGE | /help/articles | (main)/help/articles/page.tsx | |
| PROF_PAGE_SETUP_V1 | PAGE | /profile/setup | (main)/profile/setup/page.tsx | |
| PUJA_PAGE_MAIN_V1 | PAGE | /puja | (main)/puja/page.tsx | |

---

## Shared Components

| Code | File | Purpose |
|------|------|---------|
| COMP_BRAND_LOGIN_RESOLVER | components/brand-login/BrandLoginResolver.tsx | Resolves brand-specific login UI |
| COMP_BRAND_LOGIN_DEFAULT | components/brand-login/DefaultLogin.tsx | Generic login form |
| COMP_BRAND_REGISTER_DEFAULT | components/brand-login/DefaultRegister.tsx | Generic register form |
| COMP_BRAND_TRAVVELLIS_LOGIN | components/brand-login/brands/travvellis/TravvellisLogin.tsx | Travvellis-branded login |
| COMP_BRAND_TRAVVELLIS_REGISTER | components/brand-login/brands/travvellis/register/TravvellisRegister.tsx | Travvellis-branded register |
| COMP_BRAND_THEME_PROVIDER | components/brand/BrandThemeProvider.tsx | Per-brand CSS theme injection |
| COMP_COMMON_DATA_TABLE | components/common/DataTable.tsx | Primary table with sort/filter/pagination |
| COMP_COMMON_PAGE_HEADER | components/common/PageHeader.tsx | Standard page header |
| COMP_COMMON_SIDE_PANEL | components/common/SidePanel/SidePanel.tsx | Right-side sliding panel |
| COMP_COMMON_FILTER_PANEL | components/common/FilterPanel.tsx | Shared filter drawer |
| COMP_COMMON_BULK_ACTIONS | components/common/BulkActionsBar.tsx | Bulk select actions bar |
| COMP_COMMON_MASS_DELETE | components/common/MassDeletePage.tsx | Generic mass delete page |
| COMP_COMMON_MASS_UPDATE | components/common/MassUpdatePage.tsx | Generic mass update page |
| COMP_COMMON_SMART_SEARCH | components/common/SmartSearch.tsx | Global search component |
| COMP_SHARED_AIC_DATE_PICKER | components/shared/AICDatePicker/AICDatePicker.tsx | Custom date picker |
| COMP_SHARED_SMART_AUTOCOMPLETE | components/shared/SmartAutoComplete/SmartAutoComplete.tsx | Smart autocomplete with entity search |
| COMP_SHARED_INLINE_EDIT | components/shared/InlineEdit/InlineEditField.tsx | Inline field editing |
| COMP_COMPANY_HEADER | components/company/CompanyHeader.tsx | Company-level top header with switcher |
| COMP_ONBOARDING_STEPPER | components/onboarding/OnboardingStepper.tsx | Multi-step onboarding flow |
| COMP_WORKSPACE_TAB_BAR | components/workspace/TabBar.tsx | Multi-tab workspace nav bar |
| COMP_WORKSPACE_POS_LAYOUT | components/workspace/POSFormLayout.tsx | POS transaction layout |
| COMP_CRITERIA_BUILDER | components/common/criteria/CriteriaBuilder.tsx | Visual filter criteria builder |

---

## Archived / Deprecated Files

| File | Reason |
|------|--------|
| src/.archive/2026-04-26/StageVerticalProfile.tsx | Replaced by person-centric onboarding; archived 2026-04-26 |
| src/.archive/2026-04-26/components-self-care/CompanyCard.tsx | Self-care panel refactor; archived 2026-04-26 |
| src/.archive/2026-04-26/components-self-care/ProfileSummaryCard.tsx | Self-care panel refactor; archived 2026-04-26 |
| src/.archive/2026-04-26/self-care/layout.tsx | Self-care route restructured; archived 2026-04-26 |
| src/.archive/2026-04-26/self-care/page.tsx | Self-care route restructured; archived 2026-04-26 |

---

## Hardcoding Analysis

### Files with hardcoded vertical names

- `apps-frontend/crm-admin/src/app/company/[companyId]/dashboard/page.tsx`: Contains `VERTICAL_TERMINOLOGY` constant with hardcoded vertical keys `TRAVEL`, `RETAIL`, `SOFTWARE` — must be replaced with API-driven terminology config in M3.
- `apps-frontend/crm-admin/src/components/common/IndustryBadge.tsx`: Contains industry-specific terminology (review needed).
- `apps-frontend/crm-admin/src/components/common/IndustryFields.tsx`: Contains industry-specific fields (review needed).

### Files with hardcoded brand names

- `apps-frontend/crm-admin/src/components/brand-login/registry.tsx`: References `travvellis` as a registered brand key
- `apps-frontend/crm-admin/src/components/brand-login/register-registry.tsx`: References `travvellis` in registration registry
- `apps-frontend/crm-admin/src/components/brand-login/brands/travvellis/TravvellisLogin.tsx`: Travvellis-specific login (intentional — brand component)
- `apps-frontend/crm-admin/src/components/brand-login/brands/travvellis/register/TravvellisRegister.tsx`: Travvellis-specific register (intentional — brand component)
- `apps-frontend/crm-admin/src/components/brand-login/brands/travvellis/scenes/*.tsx` (8 files): SVG/animation scenes for Travvellis login (intentional)
- `apps-frontend/crm-admin/src/features/auth/services/auth.service.ts`: References `travvellis` brand in auth service (review: should be config-driven)
- `apps-frontend/crm-admin/src/features/user-onboarding/stages/StageSubUserType.tsx`: Contains `TRAVVELLIS`/vertical sub-type logic (should be dynamic from brand config)

---

## Recommendations

### Sprint M1 seed priorities (PcPageRegistry initial seed)

Focus on demo-ready modules in this order:

1. **Leads** — `LEAD_PAGE_LIST_V1`, `LEAD_FORM_NEW_V1`, `LEAD_PAGE_DETAIL_V1`, `LEAD_FORM_EDIT_V1`
2. **Contacts** — `CUST_PAGE_LIST_V1`, `CUST_FORM_NEW_V1`, `CUST_PAGE_DETAIL_V1`, `CUST_DASH_DASHBOARD_V1`
3. **Quotations** — `QUOT_PAGE_LIST_V1`, `QUOT_TXN_NEW_V1`, `QUOT_PAGE_DETAIL_V1`
4. **Dashboard** — `DASH_DASH_MAIN_V1`, `DASH_DASH_MY_V1`
5. **Tasks** — `TASK_PAGE_LIST_V1`, `TASK_FORM_NEW_V1`, `TASK_PAGE_DETAIL_V1`
6. **Sales Orders** — `SALE_PAGE_ORDERS_V1`, `SALE_TXN_ORDER_NEW_V1`, `SALE_PAGE_ORDER_DETAIL_V1`
7. **Workflows** — `WF_PAGE_LIST_V1`, `WF_PAGE_DETAIL_V1`, `WF_PAGE_VISUAL_V1`
8. **WhatsApp** — `WA_DASH_MAIN_V1`, `WA_PAGE_BROADCASTS_V1`, `WA_PAGE_CONVERSATIONS_V1`
9. **Reports** — `RPT_PAGE_HOME_V1`, `RPT_PAGE_DYNAMIC_V1`
10. **Finance Invoices** — `FIN_PAGE_INVOICES_V1`, `FIN_TXN_INVOICE_NEW_V1`

### Refactor candidates (M3-M5)

- `company/[companyId]/dashboard/page.tsx` — hardcoded `VERTICAL_TERMINOLOGY` dict; replace with `useVerticalTerminology()` hook backed by brand config API
- `features/auth/services/auth.service.ts` — `travvellis` brand reference should come from `BrandLoginRegistry` config at runtime
- `features/user-onboarding/stages/StageSubUserType.tsx` — sub-user type logic tied to `TRAVVELLIS`; needs dynamic brand config
- `components/common/IndustryBadge.tsx` and `IndustryFields.tsx` — audit for hardcoded vertical terminology

### Future cleanup (M8+)

- Delete `src/.archive/2026-04-26/` directory entirely once M4 self-care refactor is verified stable
- Review `puja/page.tsx` — appears to be a religious-mode feature page; confirm if it should be gated by `FeatureGate`
- Consolidate duplicate inventory/accounts report pages that overlap with the main reports module
