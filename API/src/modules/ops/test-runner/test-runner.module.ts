import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { TestRunnerController } from './presentation/test-runner.controller';
import { TestOrchestratorService } from './application/services/test-orchestrator.service';
import { TestRunProcessor, TEST_RUNNER_QUEUE } from './application/jobs/test-run.processor';
import { UnitTestRunner } from './infrastructure/runners/unit-test.runner';
import { FunctionalTestRunner } from './infrastructure/runners/functional-test.runner';
import { SmokeTestRunner } from './infrastructure/runners/smoke-test.runner';
import { ArchitectureTestRunner } from './infrastructure/runners/architecture-test.runner';
import { PenetrationTestRunner } from './infrastructure/runners/penetration-test.runner';
import { IntegrationTestRunner } from './infrastructure/runners/integration-test.runner';
import { PrismaTestRunRepository, TEST_RUN_REPOSITORY } from './infrastructure/repositories/test-run.repository';
import { CreateTestRunHandler } from './application/commands/create-test-run/create-test-run.handler';
import { RerunFailedTestsHandler } from './application/commands/rerun-failed-tests/rerun-failed-tests.handler';
import { CancelTestRunHandler } from './application/commands/cancel-test-run/cancel-test-run.handler';
import { ListTestRunsHandler } from './application/queries/list-test-runs/list-test-runs.handler';
import { GetTestRunHandler } from './application/queries/get-test-run/get-test-run.handler';
import { GetTestResultsHandler } from './application/queries/get-test-results/get-test-results.handler';
import { GetTestResultsTreeHandler } from './application/queries/get-test-results-tree/get-test-results-tree.handler';
import { CompareTestRunsHandler } from './application/queries/compare-test-runs/compare-test-runs.handler';

const CommandHandlers = [CreateTestRunHandler, RerunFailedTestsHandler, CancelTestRunHandler];
const QueryHandlers = [ListTestRunsHandler, GetTestRunHandler, GetTestResultsHandler, GetTestResultsTreeHandler, CompareTestRunsHandler];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: TEST_RUNNER_QUEUE }),
  ],
  controllers: [TestRunnerController],
  providers: [
    TestOrchestratorService,
    TestRunProcessor,
    UnitTestRunner,
    FunctionalTestRunner,
    SmokeTestRunner,
    ArchitectureTestRunner,
    PenetrationTestRunner,
    IntegrationTestRunner,
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: TEST_RUN_REPOSITORY, useClass: PrismaTestRunRepository },
  ],
  exports: [TestOrchestratorService],
})
export class TestRunnerModule {}
