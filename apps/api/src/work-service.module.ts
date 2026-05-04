/**
 * WORK SERVICE MODULE — TEST ONLY
 *
 * This file is NOT used in production. It proves that the Work service
 * boundary can boot independently (DI graph resolves) with stub providers
 * replacing cross-service injectable dependencies.
 *
 * Work boundary contains:
 *   - src/core/workflow/**             (WorkflowCoreModule)
 *   - src/modules/core/work/**         (CustomFieldsModule, NotificationsModule, SmartSearchModule)
 *   - src/modules/customer/**          (47 modules)
 *
 * Cross-service deps requiring stubs (→ Identity boundary):
 *   - MakerCheckerEngine    — injected by ApprovalRequestsModule handlers
 *
 * ⚠️  Cross-boundary module imports (need refactoring before extraction):
 *   - EmailModule         → imports TenantConfigModule  (Vendor boundary)
 *   - RawContactsModule   → imports ControlRoomModule   (Vendor boundary)
 *   - PaymentModule       → imports SettingsModule      (Identity boundary)
 *   - contacts/leads/orgs/activities → import TableConfigModule (Vendor boundary)
 *   These vendor/identity modules are included in this test module ONLY.
 *   At extraction time, replace their imports with API calls or shared-lib abstractions.
 *
 * Note: CredentialService (Vendor) is available via TenantConfigModule (included above).
 *       AutoNumberService + CompanyProfileService (Identity) are available via SettingsModule.
 */

import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

// ─── Prisma ──────────────────────────────────────────────────────────────────
import { PrismaModule } from './core/prisma/prisma.module';

// ─── Common/shared (will become shared-lib at extraction) ─────────────────────
import { ErrorsModule } from './common/errors/errors.module';

// ─── Work boundary: core/workflow ────────────────────────────────────────────
import { WorkflowCoreModule } from './core/workflow/workflow-core.module';

// ─── Work boundary: core/work ────────────────────────────────────────────────
import { CustomFieldsModule } from './modules/core/work/custom-fields/custom-fields.module';
import { NotificationsModule } from './modules/core/work/notifications/notifications.module';
import { SmartSearchModule } from './modules/core/work/search/smart-search.module';

// ─── Work boundary: customer (47 modules) ────────────────────────────────────
import { ContactsModule } from './modules/customer/contacts/contacts.module';
import { RawContactsModule } from './modules/customer/raw-contacts/raw-contacts.module';
import { OrganizationsModule } from './modules/customer/organizations/organizations.module';
import { LeadsModule } from './modules/customer/leads/leads.module';
import { CommunicationsModule } from './modules/customer/communications/communications.module';
import { ContactOrganizationsModule } from './modules/customer/contact-organizations/contact-organizations.module';
import { ApprovalRequestsModule } from './modules/customer/approval-requests/approval-requests.module';
import { ApprovalRulesModule } from './modules/customer/approval-rules/approval-rules.module';
import { BrandsModule } from './modules/customer/brands/brands.module';
import { ManufacturersModule } from './modules/customer/manufacturers/manufacturers.module';
import { ProductsModule } from './modules/customer/products/products.module';
import { ProductPricingModule } from './modules/customer/product-pricing/product-pricing.module';
import { CustomerPriceGroupsModule } from './modules/customer/customer-price-groups/customer-price-groups.module';
import { ProductTaxModule } from './modules/customer/product-tax/product-tax.module';
import { ProductUnitsModule } from './modules/customer/product-units/product-units.module';
import { ActivitiesModule } from './modules/customer/activities/activities.module';
import { DemosModule } from './modules/customer/demos/demos.module';
import { TourPlansModule } from './modules/customer/tour-plans/tour-plans.module';
import { FollowUpsModule } from './modules/customer/follow-ups/follow-ups.module';
import { RemindersModule } from './modules/customer/reminders/reminders.module';
import { RecurrenceModule } from './modules/customer/recurrence/recurrence.module';
import { CalendarModule } from './modules/customer/calendar/calendar.module';
import { CalendarHighlightsModule } from './modules/customer/calendar-highlights/calendar-highlights.module';
import { QuotationsModule } from './modules/customer/quotations/quotations.module';
import { OwnershipModule } from './modules/customer/ownership/ownership.module';
import { DashboardModule } from './modules/customer/dashboard/dashboard.module';
import { BulkImportModule } from './modules/customer/bulk-import/bulk-import.module';
import { BulkExportModule } from './modules/customer/bulk-export/bulk-export.module';
import { DocumentsModule } from './modules/customer/documents/documents.module';
import { EmailModule } from './modules/customer/email/email.module';       // ⚠️ imports TenantConfigModule
import { WhatsAppModule } from './modules/customer/whatsapp/whatsapp.module';
import { MisReportsModule } from './modules/customer/mis-reports/mis-reports.module';
import { RecycleBinModule } from './modules/customer/recycle-bin/recycle-bin.module';
import { PaymentModule } from './modules/customer/payment/payment.module'; // ⚠️ imports SettingsModule
import { TasksModule } from './modules/customer/tasks/tasks.module';
import { CommentsModule } from './modules/customer/comments/comments.module';
import { TaskLogicModule } from './modules/customer/task-logic/task-logic.module';
import { WalletModule } from './modules/customer/wallet/wallet.module';
import { DocumentTemplatesModule } from './modules/customer/document-templates/document-templates.module';
import { SupportModule } from './modules/customer/support/support.module';
import { InventoryModule } from './modules/customer/inventory/inventory.module';
import { ProcurementModule } from './modules/customer/procurement/procurement.module';
import { AccountsModule } from './modules/customer/accounts/accounts.module';
import { SalesModule } from './modules/customer/sales/sales.module';
import { EntityVerificationModule } from './modules/customer/entity-verification/entity-verification.module';
import { AmcWarrantyModule } from './modules/customer/amc-warranty/amc-warranty.module';

// ─── TEST ONLY: Vendor modules transitively required by work modules ──────────
// These modules must be replaced at extraction time.
import { TableConfigModule } from './modules/softwarevendor/table-config/table-config.module';    // contacts/leads/orgs/activities
import { TenantConfigModule } from './modules/softwarevendor/tenant-config/tenant-config.module'; // EmailModule
import { ControlRoomModule } from './modules/softwarevendor/control-room/control-room.module';    // RawContactsModule

// ─── TEST ONLY: Identity module transitively required by PaymentModule ─────────
// PaymentModule imports SettingsModule directly for AutoNumberService + CompanyProfileService.
// Must be replaced at extraction time with an API call to Identity service.
import { SettingsModule } from './modules/core/identity/settings/settings.module';

// ─── @Global stub module — mirrors how PermissionsCoreModule works in the monolith.
//     ApprovalRequestsModule handlers inject MakerCheckerEngine from PermissionsCoreModule
//     (@Global in Identity boundary). Must be @Global here so nested modules can resolve it.
//     At extraction time, replace stub with HTTP/gRPC client to Identity service.
import { MakerCheckerEngine } from './core/permissions/engines/maker-checker.engine';

@Global()
@Module({
  providers: [
    { provide: MakerCheckerEngine, useValue: { approve: async () => ({}), reject: async () => ({}), submit: async () => ({}), getPending: async () => [] } },
  ],
  exports: [MakerCheckerEngine],
})
class WorkCrossServiceStubsModule {}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),
    PrismaModule,

    // ── Common shared module (shared-lib at extraction time) ──────────────────
    ErrorsModule,

    // ── @Global stubs for cross-service dependencies ──────────────────────────
    WorkCrossServiceStubsModule,

    // ── Work boundary ─────────────────────────────────────────────────────────
    WorkflowCoreModule,
    CustomFieldsModule,
    NotificationsModule,
    SmartSearchModule,
    ContactsModule,
    RawContactsModule,
    OrganizationsModule,
    LeadsModule,
    CommunicationsModule,
    ContactOrganizationsModule,
    ApprovalRequestsModule,
    ApprovalRulesModule,
    BrandsModule,
    ManufacturersModule,
    ProductsModule,
    ProductPricingModule,
    CustomerPriceGroupsModule,
    ProductTaxModule,
    ProductUnitsModule,
    ActivitiesModule,
    DemosModule,
    TourPlansModule,
    FollowUpsModule,
    RemindersModule,
    RecurrenceModule,
    CalendarModule,
    CalendarHighlightsModule,
    QuotationsModule,
    OwnershipModule,
    DashboardModule,
    BulkImportModule,
    BulkExportModule,
    DocumentsModule,
    EmailModule,
    WhatsAppModule,
    MisReportsModule,
    RecycleBinModule,
    PaymentModule,
    TasksModule,
    CommentsModule,
    TaskLogicModule,
    WalletModule,
    DocumentTemplatesModule,
    SupportModule,
    InventoryModule,
    ProcurementModule,
    AccountsModule,
    SalesModule,
    EntityVerificationModule,
    AmcWarrantyModule,

    // ── Cross-boundary modules included for test only ─────────────────────────
    TableConfigModule,    // ⚠️ Vendor — needed by contacts/leads/orgs/activities
    TenantConfigModule,   // ⚠️ Vendor — needed by EmailModule (CredentialService)
    ControlRoomModule,    // ⚠️ Vendor — needed by RawContactsModule
    SettingsModule,       // ⚠️ Identity — needed by PaymentModule (AutoNumber + CompanyProfile)
  ],
})
export class WorkServiceModule {}
