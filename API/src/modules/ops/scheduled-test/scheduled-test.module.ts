import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { ScheduledTestController } from './presentation/scheduled-test.controller';
import { BackupController } from './presentation/backup.controller';
import { CreateScheduledTestHandler } from './application/commands/create-scheduled-test/create-scheduled-test.handler';
import { UpdateScheduledTestHandler } from './application/commands/update-scheduled-test/update-scheduled-test.handler';
import { DeleteScheduledTestHandler } from './application/commands/delete-scheduled-test/delete-scheduled-test.handler';
import { TriggerScheduledTestHandler } from './application/commands/trigger-scheduled-test/trigger-scheduled-test.handler';
import { ListScheduledTestsHandler } from './application/queries/list-scheduled-tests/list-scheduled-tests.handler';
import { GetScheduledTestHandler } from './application/queries/get-scheduled-test/get-scheduled-test.handler';
import { ListScheduledTestRunsHandler } from './application/queries/list-scheduled-test-runs/list-scheduled-test-runs.handler';
import { ScheduledTestCron } from './application/jobs/scheduled-test.cron';
import { ScheduledTestProcessor, SCHEDULED_TEST_QUEUE } from './application/jobs/scheduled-test.processor';
import {
  PrismaScheduledTestRepository,
  SCHEDULED_TEST_REPOSITORY,
} from './infrastructure/repositories/scheduled-test.repository';
import {
  PrismaScheduledTestRunRepository,
  SCHEDULED_TEST_RUN_REPOSITORY,
} from './infrastructure/repositories/scheduled-test-run.repository';
import {
  PrismaBackupRecordRepository,
  BACKUP_RECORD_REPOSITORY,
} from './infrastructure/repositories/backup-record.repository';
import { BackupValidationService } from './infrastructure/services/backup-validation.service';
import { TestRunnerModule } from '../test-runner/test-runner.module';
import { DbOperationsService } from '../test-environment/infrastructure/db-operations.service';

const CommandHandlers = [
  CreateScheduledTestHandler,
  UpdateScheduledTestHandler,
  DeleteScheduledTestHandler,
  TriggerScheduledTestHandler,
];

const QueryHandlers = [
  ListScheduledTestsHandler,
  GetScheduledTestHandler,
  ListScheduledTestRunsHandler,
];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: SCHEDULED_TEST_QUEUE }),
    TestRunnerModule,
  ],
  controllers: [ScheduledTestController, BackupController],
  providers: [
    BackupValidationService,
    DbOperationsService,
    ScheduledTestCron,
    ScheduledTestProcessor,
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: SCHEDULED_TEST_REPOSITORY, useClass: PrismaScheduledTestRepository },
    { provide: SCHEDULED_TEST_RUN_REPOSITORY, useClass: PrismaScheduledTestRunRepository },
    { provide: BACKUP_RECORD_REPOSITORY, useClass: PrismaBackupRecordRepository },
  ],
  exports: [BackupValidationService],
})
export class ScheduledTestModule {}
