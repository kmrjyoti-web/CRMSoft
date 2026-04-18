"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformConsoleModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const platform_console_prisma_service_1 = require("./prisma/platform-console-prisma.service");
const dashboard_controller_1 = require("./dashboard/dashboard.controller");
const dashboard_service_1 = require("./dashboard/dashboard.service");
const error_center_controller_1 = require("./error-center/error-center.controller");
const error_center_service_1 = require("./error-center/error-center.service");
const escalation_service_1 = require("./error-center/escalation.service");
const error_report_controller_1 = require("./error-center/error-report.controller");
const brand_error_controller_1 = require("./error-center/brand-error.controller");
const developer_error_controller_1 = require("./error-center/developer-error.controller");
const alert_rules_controller_1 = require("./error-center/alert-rules.controller");
const error_capture_cron_1 = require("./error-center/error-capture.cron");
const health_monitor_controller_1 = require("./health-monitor/health-monitor.controller");
const health_monitor_service_1 = require("./health-monitor/health-monitor.service");
const seed_alert_rules_1 = require("./error-center/seed-alert-rules");
const version_manager_service_1 = require("./version-manager/version-manager.service");
const version_manager_controller_1 = require("./version-manager/version-manager.controller");
const vertical_manager_service_1 = require("./vertical-manager/vertical-manager.service");
const vertical_manager_controller_1 = require("./vertical-manager/vertical-manager.controller");
const vertical_health_cron_1 = require("./vertical-manager/vertical-health.cron");
const seed_verticals_1 = require("./vertical-manager/seed-verticals");
const test_center_controller_1 = require("./test-center/test-center.controller");
const test_center_service_1 = require("./test-center/test-center.service");
const test_runner_service_1 = require("./test-center/test-runner.service");
const test_coverage_service_1 = require("./test-center/test-coverage.service");
const test_schedule_cron_1 = require("./test-center/test-schedule.cron");
const seed_schedules_1 = require("./test-center/seed-schedules");
const brand_manager_service_1 = require("./brand-manager/brand-manager.service");
const brand_manager_controller_1 = require("./brand-manager/brand-manager.controller");
const brand_error_summary_cron_1 = require("./brand-manager/brand-error-summary.cron");
const menu_management_service_1 = require("./menu-management/menu-management.service");
const menu_management_controller_1 = require("./menu-management/menu-management.controller");
const seed_menus_1 = require("./menu-management/seed-menus");
const security_service_1 = require("./security/security.service");
const security_controller_1 = require("./security/security.controller");
const health_snapshot_cron_1 = require("./security/health-snapshot.cron");
const seed_dr_plans_1 = require("./security/seed-dr-plans");
const cicd_service_1 = require("./cicd/cicd.service");
const cicd_controller_1 = require("./cicd/cicd.controller");
let PlatformConsoleModule = class PlatformConsoleModule {
    constructor(db) {
        this.db = db;
    }
    async onModuleInit() {
        try {
            await (0, seed_alert_rules_1.seedDefaultAlertRules)(this.db);
        }
        catch {
        }
        try {
            await (0, seed_verticals_1.seedInitialVerticals)(this.db);
        }
        catch {
        }
        try {
            await (0, seed_schedules_1.seedDefaultSchedules)(this.db);
        }
        catch {
        }
        try {
            await (0, seed_menus_1.seedGlobalMenuItems)(this.db);
        }
        catch {
        }
        try {
            await (0, seed_dr_plans_1.seedDRPlans)(this.db);
        }
        catch {
        }
    }
};
exports.PlatformConsoleModule = PlatformConsoleModule;
exports.PlatformConsoleModule = PlatformConsoleModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot()],
        controllers: [
            dashboard_controller_1.DashboardController,
            error_center_controller_1.ErrorCenterController,
            error_report_controller_1.ErrorReportController,
            brand_error_controller_1.BrandErrorController,
            developer_error_controller_1.DeveloperErrorController,
            alert_rules_controller_1.AlertRulesController,
            health_monitor_controller_1.HealthMonitorController,
            version_manager_controller_1.VersionManagerController,
            vertical_manager_controller_1.VerticalManagerController,
            test_center_controller_1.TestCenterController,
            brand_manager_controller_1.BrandManagerController,
            menu_management_controller_1.MenuManagementController,
            security_controller_1.SecurityController,
            cicd_controller_1.CICDController,
        ],
        providers: [
            platform_console_prisma_service_1.PlatformConsolePrismaService,
            dashboard_service_1.DashboardService,
            error_center_service_1.ErrorCenterService,
            escalation_service_1.EscalationService,
            error_capture_cron_1.ErrorCaptureCron,
            health_monitor_service_1.HealthMonitorService,
            version_manager_service_1.VersionManagerService,
            vertical_manager_service_1.VerticalManagerService,
            vertical_health_cron_1.VerticalHealthCron,
            test_center_service_1.TestCenterService,
            test_runner_service_1.TestRunnerService,
            test_coverage_service_1.TestCoverageService,
            test_schedule_cron_1.TestScheduleCron,
            brand_manager_service_1.BrandManagerService,
            brand_error_summary_cron_1.BrandErrorSummaryCron,
            menu_management_service_1.MenuManagementService,
            security_service_1.SecurityService,
            health_snapshot_cron_1.HealthSnapshotCron,
            cicd_service_1.CICDService,
        ],
        exports: [platform_console_prisma_service_1.PlatformConsolePrismaService, escalation_service_1.EscalationService, version_manager_service_1.VersionManagerService, vertical_manager_service_1.VerticalManagerService, test_runner_service_1.TestRunnerService, brand_manager_service_1.BrandManagerService, menu_management_service_1.MenuManagementService, security_service_1.SecurityService, cicd_service_1.CICDService],
    }),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], PlatformConsoleModule);
//# sourceMappingURL=platform-console.module.js.map