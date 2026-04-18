import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteScheduledTestCommand } from './delete-scheduled-test.command';
import { IScheduledTestRepository } from '../../../infrastructure/repositories/scheduled-test.repository';
export declare class DeleteScheduledTestHandler implements ICommandHandler<DeleteScheduledTestCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IScheduledTestRepository);
    execute(cmd: DeleteScheduledTestCommand): Promise<void>;
}
