"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const audit_controller_1 = require("./presentation/audit.controller");
const audit_admin_controller_1 = require("./presentation/audit-admin.controller");
const audit_core_service_1 = require("./services/audit-core.service");
const audit_diff_service_1 = require("./services/audit-diff.service");
const audit_snapshot_service_1 = require("./services/audit-snapshot.service");
const audit_entity_resolver_service_1 = require("./services/audit-entity-resolver.service");
const audit_summary_generator_service_1 = require("./services/audit-summary-generator.service");
const audit_sanitizer_service_1 = require("./services/audit-sanitizer.service");
const audit_export_service_1 = require("./services/audit-export.service");
const audit_cleanup_service_1 = require("./services/audit-cleanup.service");
const audit_interceptor_1 = require("./interceptors/audit.interceptor");
const create_audit_log_handler_1 = require("./application/commands/create-audit-log/create-audit-log.handler");
const create_bulk_audit_log_handler_1 = require("./application/commands/create-bulk-audit-log/create-bulk-audit-log.handler");
const update_retention_policy_handler_1 = require("./application/commands/update-retention-policy/update-retention-policy.handler");
const cleanup_old_logs_handler_1 = require("./application/commands/cleanup-old-logs/cleanup-old-logs.handler");
const get_entity_timeline_handler_1 = require("./application/queries/get-entity-timeline/get-entity-timeline.handler");
const get_global_feed_handler_1 = require("./application/queries/get-global-feed/get-global-feed.handler");
const get_user_activity_handler_1 = require("./application/queries/get-user-activity/get-user-activity.handler");
const get_field_history_handler_1 = require("./application/queries/get-field-history/get-field-history.handler");
const get_audit_log_detail_handler_1 = require("./application/queries/get-audit-log-detail/get-audit-log-detail.handler");
const get_diff_view_handler_1 = require("./application/queries/get-diff-view/get-diff-view.handler");
const get_audit_stats_handler_1 = require("./application/queries/get-audit-stats/get-audit-stats.handler");
const search_audit_logs_handler_1 = require("./application/queries/search-audit-logs/search-audit-logs.handler");
const get_retention_policies_handler_1 = require("./application/queries/get-retention-policies/get-retention-policies.handler");
const CommandHandlers = [
    create_audit_log_handler_1.CreateAuditLogHandler,
    create_bulk_audit_log_handler_1.CreateBulkAuditLogHandler,
    update_retention_policy_handler_1.UpdateRetentionPolicyHandler,
    cleanup_old_logs_handler_1.CleanupOldLogsHandler,
];
const QueryHandlers = [
    get_entity_timeline_handler_1.GetEntityTimelineHandler,
    get_global_feed_handler_1.GetGlobalFeedHandler,
    get_user_activity_handler_1.GetUserActivityHandler,
    get_field_history_handler_1.GetFieldHistoryHandler,
    get_audit_log_detail_handler_1.GetAuditLogDetailHandler,
    get_diff_view_handler_1.GetDiffViewHandler,
    get_audit_stats_handler_1.GetAuditStatsHandler,
    search_audit_logs_handler_1.SearchAuditLogsHandler,
    get_retention_policies_handler_1.GetRetentionPoliciesHandler,
];
let AuditModule = class AuditModule {
};
exports.AuditModule = AuditModule;
exports.AuditModule = AuditModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [audit_controller_1.AuditController, audit_admin_controller_1.AuditAdminController],
        providers: [
            audit_core_service_1.AuditCoreService,
            audit_diff_service_1.AuditDiffService,
            audit_snapshot_service_1.AuditSnapshotService,
            audit_entity_resolver_service_1.AuditEntityResolverService,
            audit_summary_generator_service_1.AuditSummaryGeneratorService,
            audit_sanitizer_service_1.AuditSanitizerService,
            audit_export_service_1.AuditExportService,
            audit_cleanup_service_1.AuditCleanupService,
            audit_interceptor_1.AuditInterceptor,
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [
            audit_core_service_1.AuditCoreService,
            audit_snapshot_service_1.AuditSnapshotService,
            audit_entity_resolver_service_1.AuditEntityResolverService,
            audit_interceptor_1.AuditInterceptor,
        ],
    })
], AuditModule);
//# sourceMappingURL=audit.module.js.map