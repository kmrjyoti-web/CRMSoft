import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { CancelTestRunCommand } from './cancel-test-run.command';
import { TEST_RUN_REPOSITORY, ITestRunRepository } from '../../../infrastructure/repositories/test-run.repository';

@CommandHandler(CancelTestRunCommand)
export class CancelTestRunHandler implements ICommandHandler<CancelTestRunCommand> {
  constructor(
    @Inject(TEST_RUN_REPOSITORY)
    private readonly repo: ITestRunRepository,
  ) {}

  async execute(cmd: CancelTestRunCommand): Promise<{ id: string; status: string }> {
    const { testRunId } = cmd;

    const testRun = await this.repo.findById(testRunId);
    if (!testRun) throw new NotFoundException(`TestRun not found: ${testRunId}`);

    if (!['QUEUED', 'RUNNING'].includes(testRun.status)) {
      throw new BadRequestException(`Cannot cancel a run in status: ${testRun.status}`);
    }

    await this.repo.update(testRunId, {
      status: 'CANCELLED' as any,
      currentPhase: 'Cancelled by user',
      completedAt: new Date(),
    });

    return { id: testRunId, status: 'CANCELLED' };
  }
}
