"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkServiceModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cqrs_1 = require("@nestjs/cqrs");
const prisma_module_1 = require("./core/prisma/prisma.module");
const errors_module_1 = require("./common/errors/errors.module");
const workflow_core_module_1 = require("./core/workflow/workflow-core.module");
const custom_fields_module_1 = require("./modules/core/work/custom-fields/custom-fields.module");
const notifications_module_1 = require("./modules/core/work/notifications/notifications.module");
const smart_search_module_1 = require("./modules/core/work/search/smart-search.module");
const contacts_module_1 = require("./modules/customer/contacts/contacts.module");
const raw_contacts_module_1 = require("./modules/customer/raw-contacts/raw-contacts.module");
const organizations_module_1 = require("./modules/customer/organizations/organizations.module");
const leads_module_1 = require("./modules/customer/leads/leads.module");
const communications_module_1 = require("./modules/customer/communications/communications.module");
const contact_organizations_module_1 = require("./modules/customer/contact-organizations/contact-organizations.module");
const approval_requests_module_1 = require("./modules/customer/approval-requests/approval-requests.module");
const approval_rules_module_1 = require("./modules/customer/approval-rules/approval-rules.module");
const brands_module_1 = require("./modules/customer/brands/brands.module");
const manufacturers_module_1 = require("./modules/customer/manufacturers/manufacturers.module");
const products_module_1 = require("./modules/customer/products/products.module");
const product_pricing_module_1 = require("./modules/customer/product-pricing/product-pricing.module");
const customer_price_groups_module_1 = require("./modules/customer/customer-price-groups/customer-price-groups.module");
const product_tax_module_1 = require("./modules/customer/product-tax/product-tax.module");
const product_units_module_1 = require("./modules/customer/product-units/product-units.module");
const activities_module_1 = require("./modules/customer/activities/activities.module");
const demos_module_1 = require("./modules/customer/demos/demos.module");
const tour_plans_module_1 = require("./modules/customer/tour-plans/tour-plans.module");
const follow_ups_module_1 = require("./modules/customer/follow-ups/follow-ups.module");
const reminders_module_1 = require("./modules/customer/reminders/reminders.module");
const recurrence_module_1 = require("./modules/customer/recurrence/recurrence.module");
const calendar_module_1 = require("./modules/customer/calendar/calendar.module");
const calendar_highlights_module_1 = require("./modules/customer/calendar-highlights/calendar-highlights.module");
const quotations_module_1 = require("./modules/customer/quotations/quotations.module");
const ownership_module_1 = require("./modules/customer/ownership/ownership.module");
const dashboard_module_1 = require("./modules/customer/dashboard/dashboard.module");
const bulk_import_module_1 = require("./modules/customer/bulk-import/bulk-import.module");
const bulk_export_module_1 = require("./modules/customer/bulk-export/bulk-export.module");
const documents_module_1 = require("./modules/customer/documents/documents.module");
const email_module_1 = require("./modules/customer/email/email.module");
const whatsapp_module_1 = require("./modules/customer/whatsapp/whatsapp.module");
const mis_reports_module_1 = require("./modules/customer/mis-reports/mis-reports.module");
const recycle_bin_module_1 = require("./modules/customer/recycle-bin/recycle-bin.module");
const payment_module_1 = require("./modules/customer/payment/payment.module");
const tasks_module_1 = require("./modules/customer/tasks/tasks.module");
const comments_module_1 = require("./modules/customer/comments/comments.module");
const task_logic_module_1 = require("./modules/customer/task-logic/task-logic.module");
const wallet_module_1 = require("./modules/customer/wallet/wallet.module");
const document_templates_module_1 = require("./modules/customer/document-templates/document-templates.module");
const support_module_1 = require("./modules/customer/support/support.module");
const inventory_module_1 = require("./modules/customer/inventory/inventory.module");
const procurement_module_1 = require("./modules/customer/procurement/procurement.module");
const accounts_module_1 = require("./modules/customer/accounts/accounts.module");
const sales_module_1 = require("./modules/customer/sales/sales.module");
const entity_verification_module_1 = require("./modules/customer/entity-verification/entity-verification.module");
const amc_warranty_module_1 = require("./modules/customer/amc-warranty/amc-warranty.module");
const table_config_module_1 = require("./modules/softwarevendor/table-config/table-config.module");
const tenant_config_module_1 = require("./modules/softwarevendor/tenant-config/tenant-config.module");
const control_room_module_1 = require("./modules/softwarevendor/control-room/control-room.module");
const settings_module_1 = require("./modules/core/identity/settings/settings.module");
const maker_checker_engine_1 = require("./core/permissions/engines/maker-checker.engine");
let WorkCrossServiceStubsModule = class WorkCrossServiceStubsModule {
};
WorkCrossServiceStubsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            { provide: maker_checker_engine_1.MakerCheckerEngine, useValue: { approve: async () => ({}), reject: async () => ({}), submit: async () => ({}), getPending: async () => [] } },
        ],
        exports: [maker_checker_engine_1.MakerCheckerEngine],
    })
], WorkCrossServiceStubsModule);
let WorkServiceModule = class WorkServiceModule {
};
exports.WorkServiceModule = WorkServiceModule;
exports.WorkServiceModule = WorkServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cqrs_1.CqrsModule.forRoot(),
            prisma_module_1.PrismaModule,
            errors_module_1.ErrorsModule,
            WorkCrossServiceStubsModule,
            workflow_core_module_1.WorkflowCoreModule,
            custom_fields_module_1.CustomFieldsModule,
            notifications_module_1.NotificationsModule,
            smart_search_module_1.SmartSearchModule,
            contacts_module_1.ContactsModule,
            raw_contacts_module_1.RawContactsModule,
            organizations_module_1.OrganizationsModule,
            leads_module_1.LeadsModule,
            communications_module_1.CommunicationsModule,
            contact_organizations_module_1.ContactOrganizationsModule,
            approval_requests_module_1.ApprovalRequestsModule,
            approval_rules_module_1.ApprovalRulesModule,
            brands_module_1.BrandsModule,
            manufacturers_module_1.ManufacturersModule,
            products_module_1.ProductsModule,
            product_pricing_module_1.ProductPricingModule,
            customer_price_groups_module_1.CustomerPriceGroupsModule,
            product_tax_module_1.ProductTaxModule,
            product_units_module_1.ProductUnitsModule,
            activities_module_1.ActivitiesModule,
            demos_module_1.DemosModule,
            tour_plans_module_1.TourPlansModule,
            follow_ups_module_1.FollowUpsModule,
            reminders_module_1.RemindersModule,
            recurrence_module_1.RecurrenceModule,
            calendar_module_1.CalendarModule,
            calendar_highlights_module_1.CalendarHighlightsModule,
            quotations_module_1.QuotationsModule,
            ownership_module_1.OwnershipModule,
            dashboard_module_1.DashboardModule,
            bulk_import_module_1.BulkImportModule,
            bulk_export_module_1.BulkExportModule,
            documents_module_1.DocumentsModule,
            email_module_1.EmailModule,
            whatsapp_module_1.WhatsAppModule,
            mis_reports_module_1.MisReportsModule,
            recycle_bin_module_1.RecycleBinModule,
            payment_module_1.PaymentModule,
            tasks_module_1.TasksModule,
            comments_module_1.CommentsModule,
            task_logic_module_1.TaskLogicModule,
            wallet_module_1.WalletModule,
            document_templates_module_1.DocumentTemplatesModule,
            support_module_1.SupportModule,
            inventory_module_1.InventoryModule,
            procurement_module_1.ProcurementModule,
            accounts_module_1.AccountsModule,
            sales_module_1.SalesModule,
            entity_verification_module_1.EntityVerificationModule,
            amc_warranty_module_1.AmcWarrantyModule,
            table_config_module_1.TableConfigModule,
            tenant_config_module_1.TenantConfigModule,
            control_room_module_1.ControlRoomModule,
            settings_module_1.SettingsModule,
        ],
    })
], WorkServiceModule);
//# sourceMappingURL=work-service.module.js.map