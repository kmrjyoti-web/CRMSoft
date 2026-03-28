import { Module } from '@nestjs/common';
import { TestEnvironmentModule } from './test-environment/test-environment.module';
import { TestRunnerModule } from './test-runner/test-runner.module';
import { TestGroupsModule } from './test-groups/test-groups.module';
import { ManualTestingModule } from './manual-testing/manual-testing.module';
import { ScheduledTestModule } from './scheduled-test/scheduled-test.module';

/**
 * OPS Module — Operations tooling for CRMSoft admins.
 *
 * Sub-modules:
 *   OPS-1: TestEnvironmentModule — on-demand isolated test DBs
 *   OPS-2: TestRunnerModule      — automated test runner (6 types, BullMQ)
 *   OPS-3: TestGroupsModule      — predefined cross-module test flows
 *          ManualTestingModule   — manual test log with R2 screenshot storage
 *   OPS-4: ScheduledTestModule   — cron-based scheduled tests + backup safety protocol
 */
@Module({
  imports: [TestEnvironmentModule, TestRunnerModule, TestGroupsModule, ManualTestingModule, ScheduledTestModule],
  exports: [TestEnvironmentModule, TestRunnerModule, TestGroupsModule, ManualTestingModule, ScheduledTestModule],
})
export class OpsModule {}
