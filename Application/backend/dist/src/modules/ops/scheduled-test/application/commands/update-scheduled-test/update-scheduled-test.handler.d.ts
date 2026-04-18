import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateScheduledTestCommand } from './update-scheduled-test.command';
import { IScheduledTestRepository } from '../../../infrastructure/repositories/scheduled-test.repository';
export declare class UpdateScheduledTestHandler implements ICommandHandler<UpdateScheduledTestCommand> {
    private readonly repo;
    constructor(repo: IScheduledTestRepository);
    execute(cmd: UpdateScheduledTestCommand): Promise<Record<string, unknown>>;
    private computeNextRun;
}
