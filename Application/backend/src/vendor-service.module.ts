/**
 * VENDOR SERVICE MODULE — TEST ONLY
 *
 * This file is NOT used in production. It proves that the Vendor service
 * boundary can boot independently (DI graph resolves) with stub providers
 * replacing cross-service dependencies.
 *
 * Vendor boundary contains:
 *   - src/modules/softwarevendor/**  (20 modules)
 *   - src/modules/core/platform/**   (2 modules: lookups, help)
 *   - src/modules/marketplace/**     (1 module)
 *   - src/modules/plugins/**         (1 module)
 *
 * Cross-service deps requiring stubs (→ Work boundary):
 *   - WorkflowEngineService    — used by WorkflowsModule handlers (initialize/execute/rollback)
 *   - ConditionEvaluatorService — used by WorkflowsModule workflow logic
 *   - MakerCheckerEngine       — used by WorkflowsModule approval handlers
 *
 * ⚠️  CronEngineModule note:
 *   CronEngineModule directly imports CalendarModule + NotificationsModule (Work boundary).
 *   Those modules are included here only for the bootstrap test.
 *   When extracting Vendor as a microservice, CronEngineModule must be refactored to
 *   replace these imports with event subscriptions or HTTP calls.
 */

import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';

// ─── Prisma ──────────────────────────────────────────────────────────────────
import { PrismaModule } from './core/prisma/prisma.module';

// ─── Vendor boundary: softwarevendor ─────────────────────────────────────────
import { UserOverridesModule } from './modules/softwarevendor/user-overrides/user-overrides.module';
import { DepartmentsModule } from './modules/softwarevendor/departments/departments.module';
import { DesignationsModule } from './modules/softwarevendor/designations/designations.module';
import { BusinessLocationsModule } from './modules/softwarevendor/business-locations/business-locations.module';
import { WorkflowsModule } from './modules/softwarevendor/workflows/workflows.module';
import { OfflineSyncModule } from './modules/softwarevendor/offline-sync/offline-sync.module';
import { TenantConfigModule } from './modules/softwarevendor/tenant-config/tenant-config.module';
import { CronEngineModule } from './modules/softwarevendor/cron-engine/cron-engine.module';
import { ApiGatewayModule } from './modules/softwarevendor/api-gateway/api-gateway.module';
import { TableConfigModule } from './modules/softwarevendor/table-config/table-config.module';
import { PackagesModule } from './modules/softwarevendor/packages/packages.module';
import { GoogleModule } from './modules/softwarevendor/google/google.module';
import { AiModule } from './modules/softwarevendor/ai/ai.module';
import { BusinessTypeModule } from './modules/softwarevendor/business-type/business-type.module';
import { ModuleManagerModule } from './modules/softwarevendor/module-manager/module-manager.module';
import { SubscriptionPackageModule } from './modules/softwarevendor/subscription-package/subscription-package.module';
import { VerificationModule } from './modules/softwarevendor/verification/verification.module';
import { KeyboardShortcutsModule } from './modules/softwarevendor/keyboard-shortcuts/keyboard-shortcuts.module';
import { SelfHostedAiModule } from './modules/softwarevendor/self-hosted-ai/self-hosted-ai.module';
import { ControlRoomModule } from './modules/softwarevendor/control-room/control-room.module';

// ─── Vendor boundary: core/platform ──────────────────────────────────────────
import { LookupsModule } from './modules/core/platform/lookups/lookups.module';
import { HelpModule } from './modules/core/platform/help/help.module';

// ─── Vendor boundary: marketplace + plugins ───────────────────────────────────
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { PluginsModule } from './modules/plugins/plugins.module';

// ─── Common/shared (will become shared-lib at extraction) ─────────────────────
import { ErrorsModule } from './common/errors/errors.module';

// ─── TEST ONLY: Work-boundary modules transitively required by CronEngineModule ──
// CronEngineModule imports CalendarModule → CalendarModule imports NotificationsModule
// These must be replaced with event subscriptions/HTTP calls at extraction time.
import { NotificationsModule } from './modules/core/work/notifications/notifications.module';
import { CalendarModule } from './modules/customer/calendar/calendar.module';
import { TasksModule } from './modules/customer/tasks/tasks.module';
import { TaskLogicModule } from './modules/customer/task-logic/task-logic.module';

// ─── @Global stub module — mirrors how WorkflowCoreModule + PermissionsCoreModule
//     work in the monolith. Must be @Global so nested modules (WorkflowsModule)
//     can resolve these providers without explicitly importing WorkflowCoreModule.
//
//     At extraction time, replace each stub with an HTTP/gRPC client or event handler.
import { WorkflowEngineService } from './core/workflow/workflow-engine.service';
import { ConditionEvaluatorService } from './core/workflow/condition-evaluator.service';
import { MakerCheckerEngine } from './core/permissions/engines/maker-checker.engine';
import { UbacEngine } from './core/permissions/engines/ubac.engine';
import { RbacEngine } from './core/permissions/engines/rbac.engine';

@Global()
@Module({
  providers: [
    { provide: WorkflowEngineService,    useValue: { execute: async () => ({}), initialize: async () => ({}), rollback: async () => ({}), getActiveInstances: async () => [] } },
    { provide: ConditionEvaluatorService, useValue: { evaluate: async () => true, evaluateAll: async () => true } },
    { provide: MakerCheckerEngine,       useValue: { approve: async () => ({}), reject: async () => ({}), submit: async () => ({}), getPending: async () => [] } },
    { provide: UbacEngine,               useValue: { hasPermission: async () => true, getUserAccessMap: async () => ({}) } },
    { provide: RbacEngine,               useValue: { hasPermission: async () => true, getRolePermissions: async () => [] } },
  ],
  exports: [WorkflowEngineService, ConditionEvaluatorService, MakerCheckerEngine, UbacEngine, RbacEngine],
})
class VendorCrossServiceStubsModule {}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,

    // ── Vendor boundary ──────────────────────────────────────────────────────
    UserOverridesModule,
    DepartmentsModule,
    DesignationsModule,
    BusinessLocationsModule,
    WorkflowsModule,
    OfflineSyncModule,
    TenantConfigModule,
    CronEngineModule,        // ⚠️ has cross-boundary module imports (see above)
    ApiGatewayModule,
    TableConfigModule,
    PackagesModule,
    GoogleModule,
    AiModule,
    BusinessTypeModule,
    ModuleManagerModule,
    SubscriptionPackageModule,
    VerificationModule,
    KeyboardShortcutsModule,
    SelfHostedAiModule,
    ControlRoomModule,
    LookupsModule,
    HelpModule,
    MarketplaceModule,
    PluginsModule,

    // ── Common shared module (shared-lib at extraction time) ──────────────────
    ErrorsModule,

    // ── @Global stubs for cross-service dependencies ──────────────────────────
    VendorCrossServiceStubsModule,

    // ── Work modules included ONLY to satisfy CronEngineModule transitive deps ─
    // ⚠️  Must be replaced at extraction time.
    NotificationsModule,
    CalendarModule,
    TasksModule,
    TaskLogicModule,
  ],
})
export class VendorServiceModule {}
