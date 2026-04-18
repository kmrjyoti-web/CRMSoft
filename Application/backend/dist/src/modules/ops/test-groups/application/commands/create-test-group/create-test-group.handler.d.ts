import { ICommandHandler } from '@nestjs/cqrs';
import { CreateTestGroupCommand } from './create-test-group.command';
import { ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';
export declare class CreateTestGroupHandler implements ICommandHandler<CreateTestGroupCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestGroupRepository);
    execute(cmd: CreateTestGroupCommand): Promise<Record<string, unknown>>;
}
