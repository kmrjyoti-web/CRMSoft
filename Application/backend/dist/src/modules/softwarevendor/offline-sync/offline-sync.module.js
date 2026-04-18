"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineSyncModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const entity_resolver_service_1 = require("./services/entity-resolver.service");
const sync_scope_resolver_service_1 = require("./services/sync-scope-resolver.service");
const pull_service_1 = require("./services/pull.service");
const push_service_1 = require("./services/push.service");
const conflict_resolver_service_1 = require("./services/conflict-resolver.service");
const warning_evaluator_service_1 = require("./services/warning-evaluator.service");
const flush_service_1 = require("./services/flush.service");
const sync_engine_service_1 = require("./services/sync-engine.service");
const sync_analytics_service_1 = require("./services/sync-analytics.service");
const sync_scheduler_service_1 = require("./services/sync-scheduler.service");
const sync_controller_1 = require("./presentation/sync.controller");
const sync_admin_controller_1 = require("./presentation/sync-admin.controller");
let OfflineSyncModule = class OfflineSyncModule {
};
exports.OfflineSyncModule = OfflineSyncModule;
exports.OfflineSyncModule = OfflineSyncModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule],
        controllers: [sync_controller_1.SyncController, sync_admin_controller_1.SyncAdminController],
        providers: [
            entity_resolver_service_1.EntityResolverService,
            sync_scope_resolver_service_1.SyncScopeResolverService,
            pull_service_1.PullService,
            push_service_1.PushService,
            conflict_resolver_service_1.ConflictResolverService,
            warning_evaluator_service_1.WarningEvaluatorService,
            flush_service_1.FlushService,
            sync_engine_service_1.SyncEngineService,
            sync_analytics_service_1.SyncAnalyticsService,
            sync_scheduler_service_1.SyncSchedulerService,
        ],
        exports: [sync_engine_service_1.SyncEngineService],
    })
], OfflineSyncModule);
//# sourceMappingURL=offline-sync.module.js.map