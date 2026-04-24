import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { TestGroupsController } from './presentation/test-groups.controller';
import { TestGroupRunnerService } from './application/services/test-group-runner.service';
import { TestGroupProcessor, TEST_GROUP_QUEUE } from './application/jobs/test-group.processor';
import { PrismaTestGroupRepository, TEST_GROUP_REPOSITORY } from './infrastructure/repositories/test-group.repository';
import { CreateTestGroupHandler } from './application/commands/create-test-group/create-test-group.handler';
import { UpdateTestGroupHandler } from './application/commands/update-test-group/update-test-group.handler';
import { DeleteTestGroupHandler } from './application/commands/delete-test-group/delete-test-group.handler';
import { RunTestGroupHandler } from './application/commands/run-test-group/run-test-group.handler';
import { ListTestGroupsHandler } from './application/queries/list-test-groups/list-test-groups.handler';
import { GetTestGroupHandler } from './application/queries/get-test-group/get-test-group.handler';
import { ListGroupExecutionsHandler } from './application/queries/list-group-executions/list-group-executions.handler';
import { GetGroupExecutionHandler } from './application/queries/get-group-execution/get-group-execution.handler';

const CommandHandlers = [CreateTestGroupHandler, UpdateTestGroupHandler, DeleteTestGroupHandler, RunTestGroupHandler];
const QueryHandlers = [ListTestGroupsHandler, GetTestGroupHandler, ListGroupExecutionsHandler, GetGroupExecutionHandler];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    BullModule.registerQueue({ name: TEST_GROUP_QUEUE }),
  ],
  controllers: [TestGroupsController],
  providers: [
    TestGroupRunnerService,
    TestGroupProcessor,
    ...CommandHandlers,
    ...QueryHandlers,
    { provide: TEST_GROUP_REPOSITORY, useClass: PrismaTestGroupRepository },
  ],
  exports: [TestGroupRunnerService],
})
export class TestGroupsModule {}
