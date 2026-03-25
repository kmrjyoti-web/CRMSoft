import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '@core/prisma/prisma.service';
import { RunTestGroupCommand } from './run-test-group.command';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';
import { TEST_GROUP_QUEUE } from '../../jobs/test-group.processor';

@CommandHandler(RunTestGroupCommand)
export class RunTestGroupHandler implements ICommandHandler<RunTestGroupCommand> {
  private readonly logger = new Logger(RunTestGroupHandler.name);

  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
    @InjectQueue(TEST_GROUP_QUEUE)
    private readonly queue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async execute(cmd: RunTestGroupCommand): Promise<{ executionId: string; status: string }> {
    const { tenantId, userId, groupId, testEnvId } = cmd;

    const group = await this.repo.findById(groupId);
    if (!group) throw new NotFoundException(`TestGroup not found: ${groupId}`);

    const steps: any[] = group.steps ?? [];

    const execution = await this.prisma.platform.testGroupExecution.create({
      data: {
        testGroupId: groupId,
        testEnvId,
        tenantId,
        totalSteps: steps.length,
        executedById: userId,
      },
    });

    await this.queue.add(
      'RUN_TEST_GROUP',
      { executionId: execution.id },
      { attempts: 1, removeOnComplete: 20, removeOnFail: 20 },
    );

    this.logger.log(`TestGroup ${group.name} queued for execution: ${execution.id}`);
    return { executionId: execution.id, status: 'RUNNING' };
  }
}
