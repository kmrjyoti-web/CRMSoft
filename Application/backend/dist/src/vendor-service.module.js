"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorServiceModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cqrs_1 = require("@nestjs/cqrs");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./core/prisma/prisma.module");
const user_overrides_module_1 = require("./modules/softwarevendor/user-overrides/user-overrides.module");
const departments_module_1 = require("./modules/softwarevendor/departments/departments.module");
const designations_module_1 = require("./modules/softwarevendor/designations/designations.module");
const business_locations_module_1 = require("./modules/softwarevendor/business-locations/business-locations.module");
const workflows_module_1 = require("./modules/softwarevendor/workflows/workflows.module");
const offline_sync_module_1 = require("./modules/softwarevendor/offline-sync/offline-sync.module");
const tenant_config_module_1 = require("./modules/softwarevendor/tenant-config/tenant-config.module");
const cron_engine_module_1 = require("./modules/softwarevendor/cron-engine/cron-engine.module");
const api_gateway_module_1 = require("./modules/softwarevendor/api-gateway/api-gateway.module");
const table_config_module_1 = require("./modules/softwarevendor/table-config/table-config.module");
const packages_module_1 = require("./modules/softwarevendor/packages/packages.module");
const google_module_1 = require("./modules/softwarevendor/google/google.module");
const ai_module_1 = require("./modules/softwarevendor/ai/ai.module");
const business_type_module_1 = require("./modules/softwarevendor/business-type/business-type.module");
const module_manager_module_1 = require("./modules/softwarevendor/module-manager/module-manager.module");
const subscription_package_module_1 = require("./modules/softwarevendor/subscription-package/subscription-package.module");
const verification_module_1 = require("./modules/softwarevendor/verification/verification.module");
const keyboard_shortcuts_module_1 = require("./modules/softwarevendor/keyboard-shortcuts/keyboard-shortcuts.module");
const self_hosted_ai_module_1 = require("./modules/softwarevendor/self-hosted-ai/self-hosted-ai.module");
const control_room_module_1 = require("./modules/softwarevendor/control-room/control-room.module");
const lookups_module_1 = require("./modules/core/platform/lookups/lookups.module");
const help_module_1 = require("./modules/core/platform/help/help.module");
const marketplace_module_1 = require("./modules/marketplace/marketplace.module");
const plugins_module_1 = require("./modules/plugins/plugins.module");
const errors_module_1 = require("./common/errors/errors.module");
const notifications_module_1 = require("./modules/core/work/notifications/notifications.module");
const calendar_module_1 = require("./modules/customer/calendar/calendar.module");
const tasks_module_1 = require("./modules/customer/tasks/tasks.module");
const task_logic_module_1 = require("./modules/customer/task-logic/task-logic.module");
const workflow_engine_service_1 = require("./core/workflow/workflow-engine.service");
const condition_evaluator_service_1 = require("./core/workflow/condition-evaluator.service");
const maker_checker_engine_1 = require("./core/permissions/engines/maker-checker.engine");
const ubac_engine_1 = require("./core/permissions/engines/ubac.engine");
const rbac_engine_1 = require("./core/permissions/engines/rbac.engine");
let VendorCrossServiceStubsModule = class VendorCrossServiceStubsModule {
};
VendorCrossServiceStubsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            { provide: workflow_engine_service_1.WorkflowEngineService, useValue: { execute: async () => ({}), initialize: async () => ({}), rollback: async () => ({}), getActiveInstances: async () => [] } },
            { provide: condition_evaluator_service_1.ConditionEvaluatorService, useValue: { evaluate: async () => true, evaluateAll: async () => true } },
            { provide: maker_checker_engine_1.MakerCheckerEngine, useValue: { approve: async () => ({}), reject: async () => ({}), submit: async () => ({}), getPending: async () => [] } },
            { provide: ubac_engine_1.UbacEngine, useValue: { hasPermission: async () => true, getUserAccessMap: async () => ({}) } },
            { provide: rbac_engine_1.RbacEngine, useValue: { hasPermission: async () => true, getRolePermissions: async () => [] } },
        ],
        exports: [workflow_engine_service_1.WorkflowEngineService, condition_evaluator_service_1.ConditionEvaluatorService, maker_checker_engine_1.MakerCheckerEngine, ubac_engine_1.UbacEngine, rbac_engine_1.RbacEngine],
    })
], VendorCrossServiceStubsModule);
let VendorServiceModule = class VendorServiceModule {
};
exports.VendorServiceModule = VendorServiceModule;
exports.VendorServiceModule = VendorServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cqrs_1.CqrsModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            user_overrides_module_1.UserOverridesModule,
            departments_module_1.DepartmentsModule,
            designations_module_1.DesignationsModule,
            business_locations_module_1.BusinessLocationsModule,
            workflows_module_1.WorkflowsModule,
            offline_sync_module_1.OfflineSyncModule,
            tenant_config_module_1.TenantConfigModule,
            cron_engine_module_1.CronEngineModule,
            api_gateway_module_1.ApiGatewayModule,
            table_config_module_1.TableConfigModule,
            packages_module_1.PackagesModule,
            google_module_1.GoogleModule,
            ai_module_1.AiModule,
            business_type_module_1.BusinessTypeModule,
            module_manager_module_1.ModuleManagerModule,
            subscription_package_module_1.SubscriptionPackageModule,
            verification_module_1.VerificationModule,
            keyboard_shortcuts_module_1.KeyboardShortcutsModule,
            self_hosted_ai_module_1.SelfHostedAiModule,
            control_room_module_1.ControlRoomModule,
            lookups_module_1.LookupsModule,
            help_module_1.HelpModule,
            marketplace_module_1.MarketplaceModule,
            plugins_module_1.PluginsModule,
            errors_module_1.ErrorsModule,
            VendorCrossServiceStubsModule,
            notifications_module_1.NotificationsModule,
            calendar_module_1.CalendarModule,
            tasks_module_1.TasksModule,
            task_logic_module_1.TaskLogicModule,
        ],
    })
], VendorServiceModule);
//# sourceMappingURL=vendor-service.module.js.map