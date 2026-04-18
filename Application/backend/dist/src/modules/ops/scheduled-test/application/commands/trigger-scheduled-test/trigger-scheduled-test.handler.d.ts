import { ICommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bull';
import { TriggerScheduledTestCommand } from './trigger-scheduled-test.command';
import { IScheduledTestRepository } from '../../../infrastructure/repositories/scheduled-test.repository';
import { IScheduledTestRunRepository } from '../../../infrastructure/repositories/scheduled-test-run.repository';
export declare class TriggerScheduledTestHandler implements ICommandHandler<TriggerScheduledTestCommand> {
    private readonly repo;
    private readonly runRepo;
    private readonly queue;
    private readonly logger;
    constructor(repo: IScheduledTestRepository, runRepo: IScheduledTestRunRepository, queue: Queue);
    execute(cmd: TriggerScheduledTestCommand): Promise<{
        runId: string;
    }>;
}
