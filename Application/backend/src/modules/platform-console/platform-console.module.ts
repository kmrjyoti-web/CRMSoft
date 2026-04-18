import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PlatformConsolePrismaService } from './prisma/platform-console-prisma.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { ErrorCenterController } from './error-center/error-center.controller';
import { ErrorCenterService } from './error-center/error-center.service';
import { EscalationService } from './error-center/escalation.service';
import { ErrorReportController } from './error-center/error-report.controller';
import { BrandErrorController } from './error-center/brand-error.controller';
import { DeveloperErrorController } from './error-center/developer-error.controller';
import { AlertRulesController } from './error-center/alert-rules.controller';
import { ErrorCaptureCron } from './error-center/error-capture.cron';
import { HealthMonitorController } from './health-monitor/health-monitor.controller';
import { HealthMonitorService } from './health-monitor/health-monitor.service';
import { seedDefaultAlertRules } from './error-center/seed-alert-rules';
import { VersionManagerService } from './version-manager/version-manager.service';
import { VersionManagerController } from './version-manager/version-manager.controller';
import { VerticalManagerService } from './vertical-manager/vertical-manager.service';
import { VerticalManagerController } from './vertical-manager/vertical-manager.controller';
import { VerticalHealthCron } from './vertical-manager/vertical-health.cron';
import { seedInitialVerticals } from './vertical-manager/seed-verticals';
import { TestCenterController } from './test-center/test-center.controller';
import { TestCenterService } from './test-center/test-center.service';
import { TestRunnerService } from './test-center/test-runner.service';
import { TestCoverageService } from './test-center/test-coverage.service';
import { TestScheduleCron } from './test-center/test-schedule.cron';
import { seedDefaultSchedules } from './test-center/seed-schedules';
import { BrandManagerService } from './brand-manager/brand-manager.service';
import { BrandManagerController } from './brand-manager/brand-manager.controller';
import { BrandErrorSummaryCron } from './brand-manager/brand-error-summary.cron';
import { MenuManagementService } from './menu-management/menu-management.service';
import { MenuManagementController } from './menu-management/menu-management.controller';
import { seedGlobalMenuItems } from './menu-management/seed-menus';
import { SecurityService } from './security/security.service';
import { SecurityController } from './security/security.controller';
import { HealthSnapshotCron } from './security/health-snapshot.cron';
import { seedDRPlans } from './security/seed-dr-plans';
import { CICDService } from './cicd/cicd.service';
import { CICDController } from './cicd/cicd.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [
    DashboardController,
    ErrorCenterController,
    ErrorReportController,
    BrandErrorController,
    DeveloperErrorController,
    AlertRulesController,
    HealthMonitorController,
    VersionManagerController,
    VerticalManagerController,
    TestCenterController,
    BrandManagerController,
    MenuManagementController,
    SecurityController,
    CICDController,
  ],
  providers: [
    PlatformConsolePrismaService,
    DashboardService,
    ErrorCenterService,
    EscalationService,
    ErrorCaptureCron,
    HealthMonitorService,
    VersionManagerService,
    VerticalManagerService,
    VerticalHealthCron,
    TestCenterService,
    TestRunnerService,
    TestCoverageService,
    TestScheduleCron,
    BrandManagerService,
    BrandErrorSummaryCron,
    MenuManagementService,
    SecurityService,
    HealthSnapshotCron,
    CICDService,
  ],
  exports: [PlatformConsolePrismaService, EscalationService, VersionManagerService, VerticalManagerService, TestRunnerService, BrandManagerService, MenuManagementService, SecurityService, CICDService],
})
export class PlatformConsoleModule implements OnModuleInit {
  constructor(
    private readonly db: PlatformConsolePrismaService,
  ) {}

  async onModuleInit() {
    try {
      await seedDefaultAlertRules(this.db);
    } catch {
      // Ignore seed errors (DB may not be ready yet in dev)
    }
    try {
      await seedInitialVerticals(this.db);
    } catch {
      // Ignore seed errors (DB may not be ready yet in dev)
    }
    try {
      await seedDefaultSchedules(this.db);
    } catch {
      // Ignore seed errors (DB may not be ready yet in dev)
    }
    try {
      await seedGlobalMenuItems(this.db);
    } catch {
      // Ignore seed errors (DB may not be ready yet in dev)
    }
    try {
      await seedDRPlans(this.db);
    } catch {
      // Ignore seed errors (DB may not be ready yet in dev)
    }
  }
}
