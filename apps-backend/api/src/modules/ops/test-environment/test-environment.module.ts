import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

import { TestEnvController } from './presentation/test-env.controller';
import { DbOperationsService } from './infrastructure/db-operations.service';
import { TestEnvProcessor } from './application/jobs/test-env.processor';
import { TestEnvCleanupCron } from './application/jobs/test-env-cleanup.cron';

import { CreateTestEnvHandler, TEST_ENV_QUEUE } from './application/commands/create-test-env/create-test-env.handler';
import { CleanupTestEnvHandler } from './application/commands/cleanup-test-env/cleanup-test-env.handler';
import { ExtendTestEnvTtlHandler } from './application/commands/extend-test-env-ttl/extend-test-env-ttl.handler';
import { ListTestEnvsHandler } from './application/queries/list-test-envs/list-test-envs.handler';
import { GetTestEnvHandler } from './application/queries/get-test-env/get-test-env.handler';

import {
  TEST_ENV_REPOSITORY,
  PrismaTestEnvRepository,
} from './infrastructure/repositories/test-env.repository';

const CommandHandlers = [CreateTestEnvHandler, CleanupTestEnvHandler, ExtendTestEnvTtlHandler];
const QueryHandlers = [ListTestEnvsHandler, GetTestEnvHandler];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({ name: TEST_ENV_QUEUE }),
  ],
  controllers: [TestEnvController],
  providers: [
    DbOperationsService,
    TestEnvProcessor,
    TestEnvCleanupCron,
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: TEST_ENV_REPOSITORY,
      useClass: PrismaTestEnvRepository,
    },
  ],
  exports: [DbOperationsService],
})
export class TestEnvironmentModule {}
