import { ICommandHandler } from '@nestjs/cqrs';
import { CreateScheduledTestCommand } from './create-scheduled-test.command';
import { IScheduledTestRepository } from '../../../infrastructure/repositories/scheduled-test.repository';
export declare class CreateScheduledTestHandler implements ICommandHandler<CreateScheduledTestCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IScheduledTestRepository);
    execute(cmd: CreateScheduledTestCommand): Promise<Record<string, unknown>>;
    private computeNextRun;
}
