import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteTestGroupCommand } from './delete-test-group.command';
import { ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';
export declare class DeleteTestGroupHandler implements ICommandHandler<DeleteTestGroupCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestGroupRepository);
    execute(cmd: DeleteTestGroupCommand): Promise<{
        success: boolean;
    }>;
}
