import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { ManualTestController } from './presentation/manual-test.controller';
import { DevQAController } from './presentation/dev-qa.controller';
import { DevQANotionService } from './services/dev-qa-notion.service';
import { R2StorageService } from './infrastructure/services/r2-storage.service';
import { PrismaManualTestLogRepository, MANUAL_TEST_LOG_REPOSITORY } from './infrastructure/repositories/manual-test-log.repository';
import { PrismaTestPlanRepository, TEST_PLAN_REPOSITORY } from './infrastructure/repositories/test-plan.repository';
import { LogManualTestHandler } from './application/commands/log-manual-test/log-manual-test.handler';
import { GetScreenshotUploadUrlHandler } from './application/commands/get-screenshot-upload-url/get-screenshot-upload-url.handler';
import { UpdateManualTestLogHandler } from './application/commands/update-manual-test-log/update-manual-test-log.handler';
import { CreateTestPlanHandler } from './application/commands/create-test-plan/create-test-plan.handler';
import { UpdateTestPlanHandler } from './application/commands/update-test-plan/update-test-plan.handler';
import { UpdateTestPlanItemHandler } from './application/commands/update-test-plan-item/update-test-plan-item.handler';
import { ListManualTestLogsHandler } from './application/queries/list-manual-test-logs/list-manual-test-logs.handler';
import { GetManualTestLogHandler } from './application/queries/get-manual-test-log/get-manual-test-log.handler';
import { GetManualTestSummaryHandler } from './application/queries/get-manual-test-summary/get-manual-test-summary.handler';
import { ListTestPlansHandler } from './application/queries/list-test-plans/list-test-plans.handler';
import { GetTestPlanHandler } from './application/queries/get-test-plan/get-test-plan.handler';

const CommandHandlers = [
  LogManualTestHandler,
  GetScreenshotUploadUrlHandler,
  UpdateManualTestLogHandler,
  CreateTestPlanHandler,
  UpdateTestPlanHandler,
  UpdateTestPlanItemHandler,
];
const QueryHandlers = [
  ListManualTestLogsHandler,
  GetManualTestLogHandler,
  GetManualTestSummaryHandler,
  ListTestPlansHandler,
  GetTestPlanHandler,
];

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [ManualTestController, DevQAController],
  providers: [
    R2StorageService,
    DevQANotionService,
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: MANUAL_TEST_LOG_REPOSITORY, useClass: PrismaManualTestLogRepository },
    { provide: TEST_PLAN_REPOSITORY, useClass: PrismaTestPlanRepository },
  ],
  exports: [R2StorageService],
})
export class ManualTestingModule {}
