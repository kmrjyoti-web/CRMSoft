import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '@core/prisma/prisma.service';
import { RerunFailedTestsCommand } from './rerun-failed-tests.command';
import { TEST_RUN_REPOSITORY, ITestRunRepository } from '../../../infrastructure/repositories/test-run.repository';
import { TEST_RUNNER_QUEUE } from '../../jobs/test-run.processor';

@CommandHandler(RerunFailedTestsCommand)
export class RerunFailedTestsHandler implements ICommandHandler<RerunFailedTestsCommand> {
  private readonly logger = new Logger(RerunFailedTestsHandler.name);

  constructor(
    @Inject(TEST_RUN_REPOSITORY)
    private readonly repo: ITestRunRepository,
    @InjectQueue(TEST_RUNNER_QUEUE)
    private readonly queue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async execute(cmd: RerunFailedTestsCommand): Promise<{ id: string; status: string }> {
    try {
      const { tenantId, userId, sourceRunId } = cmd;

      const sourceRun = await this.repo.findById(sourceRunId);
      if (!sourceRun) throw new NotFoundException(`TestRun not found: ${sourceRunId}`);

      // Find modules that had failures in the source run
      const failedResults = await this.prisma.platform.testResult.findMany({
        where: { testRunId: sourceRunId, status: { in: ['FAIL', 'ERROR'] } },
        select: { module: true, testType: true },
      });

      const failedModules = [...new Set(failedResults.map(r => r.module).filter(Boolean))] as string[];
      const failedTypes = [...new Set(failedResults.map(r => r.testType as string))];

      const newRun = await this.repo.create({
        tenantId,
        testEnvId: sourceRun.testEnvId,
        runType: 'RERUN',
        testTypes: failedTypes.length > 0 ? failedTypes : (sourceRun.testTypes as string[]),
        targetModules: failedModules,
        createdById: userId,
      });

      await this.queue.add(
        'RUN_TESTS',
        { testRunId: newRun.id },
        { attempts: 1, removeOnComplete: 20, removeOnFail: 20 },
      );

      this.logger.log(`TestRun re-queued: ${newRun.id} (source=${sourceRunId}, modules=${failedModules.join(',')})`);
      return { id: newRun.id, status: 'QUEUED' };
    } catch (error) {
      this.logger.error(`RerunFailedTestsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
