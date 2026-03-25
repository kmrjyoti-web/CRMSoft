import { Module } from '@nestjs/common';
import { TestEnvironmentModule } from './test-environment/test-environment.module';
import { TestRunnerModule } from './test-runner/test-runner.module';

/**
 * OPS Module — Operations tooling for CRMSoft admins.
 *
 * Sub-modules:
 *   OPS-1: TestEnvironmentModule — on-demand isolated test DBs
 *   OPS-2: TestRunnerModule      — automated test runner (6 types, BullMQ)
 *   OPS-3: (planned) Migration runner
 *   OPS-4: (planned) Tenant data seeder
 *   OPS-5: (planned) Backup snapshot store
 */
@Module({
  imports: [TestEnvironmentModule, TestRunnerModule],
  exports: [TestEnvironmentModule, TestRunnerModule],
})
export class OpsModule {}
