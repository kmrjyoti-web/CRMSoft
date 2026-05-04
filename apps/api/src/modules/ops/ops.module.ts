import { Module } from '@nestjs/common';
import { TestEnvironmentModule } from './test-environment/test-environment.module';
import { TestRunnerModule } from './test-runner/test-runner.module';
import { TestGroupsModule } from './test-groups/test-groups.module';
import { ManualTestingModule } from './manual-testing/manual-testing.module';
import { ScheduledTestModule } from './scheduled-test/scheduled-test.module';
import { DbMaintenanceModule } from './db-maintenance/db-maintenance.module';
import { BackupOpsModule } from './backup/backup.module';

/**
 * OPS Module — Operations tooling for CRMSoft admins.
 *
 * Sub-modules:
 *   OPS-1: TestEnvironmentModule — on-demand isolated test DBs
 *   OPS-2: TestRunnerModule      — automated test runner (6 types, BullMQ)
 *   OPS-3: TestGroupsModule      — predefined cross-module test flows
 *          ManualTestingModule   — manual test log with R2 screenshot storage
 *   OPS-3: ScheduledTestModule   — cron-based scheduled tests + backup safety protocol
 *   OPS-4: DbMaintenanceModule   — pg_stat index/table stats, VACUUM/ANALYZE/REINDEX, log cleanup
 *   OPS-5: BackupOpsModule       — pg_dump → R2, pg_restore, backup retention cron
 */
@Module({
  imports: [
    TestEnvironmentModule,
    TestRunnerModule,
    TestGroupsModule,
    ManualTestingModule,
    ScheduledTestModule,
    DbMaintenanceModule,
    BackupOpsModule,
  ],
  exports: [
    TestEnvironmentModule,
    TestRunnerModule,
    TestGroupsModule,
    ManualTestingModule,
    ScheduledTestModule,
    DbMaintenanceModule,
    BackupOpsModule,
  ],
})
export class OpsModule {}
