import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateTestPlanItemCommand } from './update-test-plan-item.command';
import { ITestPlanRepository } from '../../../infrastructure/repositories/test-plan.repository';
export declare class UpdateTestPlanItemHandler implements ICommandHandler<UpdateTestPlanItemCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestPlanRepository);
    execute(cmd: UpdateTestPlanItemCommand): Promise<Record<string, unknown>>;
}
