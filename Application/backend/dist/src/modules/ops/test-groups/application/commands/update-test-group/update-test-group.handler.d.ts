import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateTestGroupCommand } from './update-test-group.command';
import { ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';
export declare class UpdateTestGroupHandler implements ICommandHandler<UpdateTestGroupCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestGroupRepository);
    execute(cmd: UpdateTestGroupCommand): Promise<Record<string, unknown>>;
}
