import { Module } from '@nestjs/common';
import { TestEnvironmentModule } from './test-environment/test-environment.module';
import { TestRunnerModule } from './test-runner/test-runner.module';
import { TestGroupsModule } from './test-groups/test-groups.module';
import { ManualTestingModule } from './manual-testing/manual-testing.module';

/**
 * OPS Module — Operations tooling for CRMSoft admins.
 *
 * Sub-modules:
 *   OPS-1: TestEnvironmentModule — on-demand isolated test DBs
 *   OPS-2: TestRunnerModule      — automated test runner (6 types, BullMQ)
 *   OPS-3: TestGroupsModule      — predefined cross-module test flows
 *          ManualTestingModule   — manual test log with R2 screenshot storage
 */
@Module({
  imports: [TestEnvironmentModule, TestRunnerModule, TestGroupsModule, ManualTestingModule],
  exports: [TestEnvironmentModule, TestRunnerModule, TestGroupsModule, ManualTestingModule],
})
export class OpsModule {}
