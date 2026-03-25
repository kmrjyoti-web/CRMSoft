import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { ManualTestController } from './presentation/manual-test.controller';
import { R2StorageService } from './infrastructure/services/r2-storage.service';
import { PrismaManualTestLogRepository, MANUAL_TEST_LOG_REPOSITORY } from './infrastructure/repositories/manual-test-log.repository';
import { LogManualTestHandler } from './application/commands/log-manual-test/log-manual-test.handler';
import { GetScreenshotUploadUrlHandler } from './application/commands/get-screenshot-upload-url/get-screenshot-upload-url.handler';
import { UpdateManualTestLogHandler } from './application/commands/update-manual-test-log/update-manual-test-log.handler';
import { ListManualTestLogsHandler } from './application/queries/list-manual-test-logs/list-manual-test-logs.handler';
import { GetManualTestLogHandler } from './application/queries/get-manual-test-log/get-manual-test-log.handler';
import { GetManualTestSummaryHandler } from './application/queries/get-manual-test-summary/get-manual-test-summary.handler';

const CommandHandlers = [LogManualTestHandler, GetScreenshotUploadUrlHandler, UpdateManualTestLogHandler];
const QueryHandlers = [ListManualTestLogsHandler, GetManualTestLogHandler, GetManualTestSummaryHandler];

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [ManualTestController],
  providers: [
    R2StorageService,
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: MANUAL_TEST_LOG_REPOSITORY, useClass: PrismaManualTestLogRepository },
  ],
  exports: [R2StorageService],
})
export class ManualTestingModule {}
